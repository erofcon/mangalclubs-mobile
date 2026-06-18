import AsyncStorage from "@react-native-async-storage/async-storage";
import {Platform} from "react-native";
import {create} from "zustand";
import {createJSONStorage, persist} from "zustand/middleware";

import {
    setApiAuthRefreshHandler,
    setApiAuthTokenProvider,
} from "@/services/api";
import {
    AuthSubject,
    logoutAuthSession,
    requestCustomerOtp,
    refreshAuthToken,
    TokenPair,
    verifyCustomerOtp,
} from "@/services/auth";

const DEVICE_ID_STORAGE_KEY = "profile-device-id";

type ProfileStore = {
    accessToken: string | null;
    refreshToken: string | null;
    expiresAt: number | null;
    user: AuthSubject | null;
    hasHydrated: boolean;
    isRequestingOtp: boolean;
    isVerifyingOtp: boolean;
    isRefreshing: boolean;
    errorMessage: string;
    otpRetryAfterSeconds: number;
    otpRetryStartedAt: number | null;
    setHasHydrated: (value: boolean) => void;
    syncUser: (user: Partial<AuthSubject>) => void;
    clearError: () => void;
    requestOtp: (phone: string) => Promise<number>;
    verifyOtp: (phone: string, code: string) => Promise<void>;
    refresh: () => Promise<boolean>;
    logout: () => Promise<void>;
};

export const getStoredDeviceId = async () => {
    const existing = await AsyncStorage.getItem(DEVICE_ID_STORAGE_KEY);

    if (existing) {
        return existing;
    }

    const fallbackRandom = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const deviceId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : fallbackRandom;

    await AsyncStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);

    return deviceId;
};

export const getDeviceName = () => {
    const platformName = Platform.OS === "ios"
        ? "iPhone"
        : Platform.OS === "android"
            ? "Android"
            : "Web";

    return `Mangal Clubs ${platformName}`;
};

const getExpiresAt = (expiresInSeconds: number) => (
    Date.now() + Math.max(0, expiresInSeconds - 30) * 1000
);

const toAuthState = (tokens: TokenPair) => ({
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: getExpiresAt(tokens.expires_in),
    user: {
        ...tokens.user,
        avatarUrl: tokens.user.avatarUrl ?? tokens.user.avatar_url ?? null,
    },
    errorMessage: "",
    otpRetryAfterSeconds: 0,
    otpRetryStartedAt: null,
});

const getCurrentRetryAfterSeconds = () => {
    const {otpRetryAfterSeconds, otpRetryStartedAt} = useProfileStore.getState();

    if (!otpRetryStartedAt || otpRetryAfterSeconds <= 0) {
        return 0;
    }

    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - otpRetryStartedAt) / 1000));

    return Math.max(0, otpRetryAfterSeconds - elapsedSeconds);
};

export const useProfileStore = create<ProfileStore>()(
    persist(
        (set, get) => ({
            accessToken: null,
            refreshToken: null,
            expiresAt: null,
            user: null,
            hasHydrated: false,
            isRequestingOtp: false,
            isVerifyingOtp: false,
            isRefreshing: false,
            errorMessage: "",
            otpRetryAfterSeconds: 0,
            otpRetryStartedAt: null,

            setHasHydrated: (value) => set({hasHydrated: value}),
            syncUser: (user) => set((state) => {
                const nextUser = state.user
                    ? {
                        ...state.user,
                        ...user,
                    }
                    : null;

                return {
                    user: nextUser
                        ? {
                            ...nextUser,
                            avatarUrl: nextUser.avatarUrl ?? nextUser.avatar_url ?? null,
                        }
                        : null,
                };
            }),
            clearError: () => set({errorMessage: ""}),

            requestOtp: async (phone) => {
                const retryAfterSeconds = getCurrentRetryAfterSeconds();

                if (retryAfterSeconds > 0) {
                    const message = `Повторный звонок можно запросить через ${retryAfterSeconds} секунд`;

                    set({errorMessage: message});
                    throw new Error(message);
                }

                set({isRequestingOtp: true, errorMessage: ""});

                try {
                    const deviceId = await getStoredDeviceId();
                    const response = await requestCustomerOtp({
                        phone,
                        device_id: deviceId,
                        device_name: getDeviceName(),
                    });
                    const retryAfter = response.retry_after_seconds ?? 0;

                    set({
                        isRequestingOtp: false,
                        otpRetryAfterSeconds: retryAfter,
                        otpRetryStartedAt: Date.now(),
                    });

                    return retryAfter;
                } catch (error) {
                    const message = error instanceof Error
                        ? error.message
                        : "Не удалось отправить код";

                    set({isRequestingOtp: false, errorMessage: message});
                    throw error;
                }
            },

            verifyOtp: async (phone, code) => {
                set({isVerifyingOtp: true, errorMessage: ""});

                try {
                    const deviceId = await getStoredDeviceId();
                    const tokens = await verifyCustomerOtp({
                        phone,
                        code,
                        device_id: deviceId,
                        device_name: getDeviceName(),
                    });

                    set({
                        ...toAuthState(tokens),
                        isVerifyingOtp: false,
                    });
                } catch (error) {
                    const message = error instanceof Error
                        ? error.message
                        : "Неверный или просроченный код";

                    set({isVerifyingOtp: false, errorMessage: message});
                    throw error;
                }
            },

            refresh: async () => {
                const {refreshToken, isRefreshing} = get();

                if (!refreshToken || isRefreshing) {
                    return Boolean(get().accessToken);
                }

                set({isRefreshing: true, errorMessage: ""});

                try {
                    const deviceId = await getStoredDeviceId();
                    const tokens = await refreshAuthToken({
                        refresh_token: refreshToken,
                        device_id: deviceId,
                        device_name: getDeviceName(),
                    });

                    set({
                        ...toAuthState(tokens),
                        isRefreshing: false,
                    });

                    return true;
                } catch {
                    set({
                        accessToken: null,
                        refreshToken: null,
                        expiresAt: null,
                        user: null,
                        isRefreshing: false,
                    });

                    return false;
                }
            },

            logout: async () => {
                const {refreshToken} = get();

                set({
                    accessToken: null,
                    refreshToken: null,
                    expiresAt: null,
                    user: null,
                    errorMessage: "",
                });

                if (!refreshToken) {
                    return;
                }

                try {
                    const deviceId = await getStoredDeviceId();

                    await logoutAuthSession({
                        refresh_token: refreshToken,
                        device_id: deviceId,
                    });
                } catch {
                    // Local logout should still complete when the session is already gone.
                }
            },
        }),
        {
            name: "profile-store",
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                expiresAt: state.expiresAt,
                user: state.user,
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);

export const isProfileAuthenticated = () => {
    const state = useProfileStore.getState();

    return Boolean(state.accessToken && state.user);
};

export const refreshProfileIfNeeded = async () => {
    const state = useProfileStore.getState();

    if (!state.refreshToken) {
        return false;
    }

    if (state.accessToken && state.expiresAt && state.expiresAt > Date.now()) {
        return true;
    }

    return state.refresh();
};

setApiAuthTokenProvider(() => useProfileStore.getState().accessToken);
setApiAuthRefreshHandler(refreshProfileIfNeeded);
