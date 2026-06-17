import {apiFetch} from "@/services/api";

export type AuthSubject = {
    id: string;
    subject_type: "customer" | "staff";
    phone?: string | null;
    name?: string | null;
    email?: string | null;
    birthday?: string | null;
    avatarUrl?: string | null;
    avatar_url?: string | null;
    role?: string | null;
};

export type TokenPair = {
    access_token: string;
    refresh_token: string;
    token_type: "bearer";
    expires_in: number;
    user: AuthSubject;
};

export type OtpRequestResponse = {
    ok: boolean;
    message: string;
    retry_after_seconds: number;
    resend_available_at?: string | null;
};

export type DeviceInfo = {
    device_id: string;
    device_name?: string | null;
};

export const requestCustomerOtp = (phone: string) => (
    apiFetch<OtpRequestResponse>("/api/v1/auth/customer/otp/request", {
        method: "POST",
        auth: false,
        retryOnUnauthorized: false,
        body: JSON.stringify({phone}),
    })
);

export const verifyCustomerOtp = (
    payload: DeviceInfo & {
        phone: string;
        code: string;
    }
) => (
    apiFetch<TokenPair>("/api/v1/auth/customer/otp/verify", {
        method: "POST",
        auth: false,
        retryOnUnauthorized: false,
        body: JSON.stringify(payload),
    })
);

export const refreshAuthToken = (
    payload: DeviceInfo & {
        refresh_token: string;
    }
) => (
    apiFetch<TokenPair>("/api/v1/auth/refresh", {
        method: "POST",
        auth: false,
        retryOnUnauthorized: false,
        body: JSON.stringify(payload),
    })
);

export const logoutAuthSession = (
    payload: {
        device_id: string;
        refresh_token: string;
    }
) => (
    apiFetch<{ok: boolean}>("/api/v1/auth/logout", {
        method: "POST",
        auth: false,
        retryOnUnauthorized: false,
        body: JSON.stringify(payload),
    })
);
