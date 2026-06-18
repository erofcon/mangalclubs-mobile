import {PropsWithChildren, useCallback, useEffect, useRef, useState} from "react";
import {
    ActivityIndicator,
    Alert,
    Linking,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";

import {apiFetch} from "@/services/api";
import {
    evaluateMobileVersion,
    getMobileVersionConfig,
    type MobileVersionStatus,
} from "@/services/mobile-version";
import {useAppDataStore} from "@/store/app-data-store";
import {themeColors} from "@/utils/theme-colors";

type HealthStatus = "checking" | "ready" | "error" | "update-required";

type HealthResponse = {
    status?: string;
};

const requestHealth = async (signal: AbortSignal) => {
    const data = await apiFetch<HealthResponse>("/health", {signal});

    if (data?.status && data.status !== "ok") {
        throw new Error("Сервис временно недоступен");
    }
};

export function HealthGate({children}: PropsWithChildren) {
    const [status, setStatus] = useState<HealthStatus>("checking");
    const [errorMessage, setErrorMessage] = useState("");
    const [requiredUpdate, setRequiredUpdate] = useState<Extract<
        MobileVersionStatus,
        {status: "force-update"}
    > | null>(null);
    const initializeAppData = useAppDataStore((state) => state.initialize);
    const activeCheckRef = useRef<AbortController | null>(null);
    const shownSoftUpdateRef = useRef(false);

    const openStore = useCallback((url?: string | null) => {
        if (!url) {
            return;
        }

        Linking.openURL(url).catch(() => {
            Alert.alert("Не удалось открыть ссылку", "Попробуйте обновить приложение через магазин.");
        });
    }, []);

    const showSoftUpdate = useCallback((
        update: Extract<MobileVersionStatus, {status: "soft-update"}>
    ) => {
        if (shownSoftUpdateRef.current) {
            return;
        }

        shownSoftUpdateRef.current = true;
        Alert.alert(
            update.title,
            update.message,
            [
                {text: "Позже", style: "cancel"},
                ...(update.storeUrl
                    ? [{text: "Обновить", onPress: () => openStore(update.storeUrl)}]
                    : []),
            ],
        );
    }, [openStore]);

    const checkHealth = useCallback(async () => {
        activeCheckRef.current?.abort();

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);
        activeCheckRef.current = controller;

        setStatus("checking");
        setErrorMessage("");
        setRequiredUpdate(null);

        try {
            await requestHealth(controller.signal);

            if (activeCheckRef.current !== controller) {
                return;
            }

            const versionConfig = await getMobileVersionConfig(controller.signal);

            if (activeCheckRef.current !== controller) {
                return;
            }

            const versionStatus = evaluateMobileVersion(versionConfig);

            if (versionStatus?.status === "force-update") {
                setRequiredUpdate(versionStatus);
                setStatus("update-required");
                return;
            }

            await initializeAppData(controller.signal);

            if (activeCheckRef.current !== controller) {
                return;
            }

            setStatus("ready");

            if (versionStatus?.status === "soft-update") {
                showSoftUpdate(versionStatus);
            }
        } catch (error) {
            if (activeCheckRef.current !== controller) {
                return;
            }

            setStatus("error");
            setErrorMessage(
                error instanceof Error && error.name === "AbortError"
                    ? "Сервер не ответил вовремя"
                    : error instanceof Error
                        ? error.message
                        : "Не удалось проверить доступность сервиса"
            );
        } finally {
            clearTimeout(timeoutId);

            if (activeCheckRef.current === controller) {
                activeCheckRef.current = null;
            }
        }
    }, [initializeAppData, showSoftUpdate]);

    useEffect(() => {
        void checkHealth();

        return () => {
            activeCheckRef.current?.abort();
            activeCheckRef.current = null;
        };
    }, [checkHealth]);

    if (status === "ready") {
        return children;
    }

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                {status === "checking" ? (
                    <>
                        <ActivityIndicator size="large" color={themeColors.primary} />
                        <Text style={styles.title}>Проверяем сервис</Text>
                        <Text style={styles.subtitle}>
                            Подождите немного, приложение скоро откроется.
                        </Text>
                    </>
                ) : status === "update-required" ? (
                    <>
                        <Ionicons
                            name="download-outline"
                            size={42}
                            color={themeColors.primary}
                        />
                        <Text style={styles.title}>
                            {requiredUpdate?.title || "Обновите приложение"}
                        </Text>
                        <Text style={styles.subtitle}>
                            {requiredUpdate?.message ||
                                "Эта версия приложения больше не поддерживается."}
                        </Text>
                        {requiredUpdate?.storeUrl ? (
                            <Pressable
                                style={styles.retryButton}
                                onPress={() => openStore(requiredUpdate.storeUrl)}
                            >
                                <Ionicons
                                    name="open-outline"
                                    size={18}
                                    color={themeColors.textOnPrimary}
                                />
                                <Text style={styles.retryText}>Обновить</Text>
                            </Pressable>
                        ) : null}
                    </>
                ) : (
                    <>
                        <Ionicons
                            name="warning-outline"
                            size={42}
                            color={themeColors.primary}
                        />
                        <Text style={styles.title}>Не удалось открыть приложение</Text>
                        <Text style={styles.subtitle}>
                            {errorMessage || "Сервис временно недоступен"}
                        </Text>
                        <Pressable style={styles.retryButton} onPress={checkHealth}>
                            <Ionicons
                                name="refresh"
                                size={18}
                                color={themeColors.textOnPrimary}
                            />
                            <Text style={styles.retryText}>Повторить</Text>
                        </Pressable>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        backgroundColor: themeColors.background,
    },
    card: {
        width: "100%",
        maxWidth: 360,
        alignItems: "center",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: themeColors.cardBorder,
        backgroundColor: themeColors.card,
        paddingHorizontal: 22,
        paddingVertical: 28,
    },
    title: {
        marginTop: 16,
        color: themeColors.text,
        fontSize: 22,
        textAlign: "center",
        fontFamily: "Point-Bold",
    },
    subtitle: {
        marginTop: 10,
        color: themeColors.textSecondary,
        fontSize: 14,
        lineHeight: 20,
        textAlign: "center",
        fontFamily: "Point-Regular",
    },
    retryButton: {
        marginTop: 22,
        minHeight: 46,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderRadius: 14,
        backgroundColor: themeColors.primary,
        paddingHorizontal: 18,
    },
    retryText: {
        color: themeColors.textOnPrimary,
        fontSize: 15,
        fontFamily: "Point-Bold",
    },
});
