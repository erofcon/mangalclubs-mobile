import Constants from "expo-constants";

const DEFAULT_API_URL = "http://localhost:8000";

const getConfiguredApiUrl = () => {
    const extra = Constants.expoConfig?.extra as {apiUrl?: string} | undefined;

    return (
        process.env.EXPO_PUBLIC_API_URL ??
        extra?.apiUrl ??
        DEFAULT_API_URL
    );
};

export const API_BASE_URL = getConfiguredApiUrl().replace(/\/+$/, "");

export const buildApiUrl = (
    path: string,
    params?: Record<string, string | null | undefined>
) => {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(normalizedPath, `${API_BASE_URL}/`);

    Object.entries(params ?? {}).forEach(([key, value]) => {
        if (value) {
            url.searchParams.set(key, value);
        }
    });

    return url.toString();
};

export const resolveApiAssetUrl = (path?: string | null) => {
    if (!path) {
        return undefined;
    }

    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    return buildApiUrl(path);
};

export class ApiError extends Error {
    status: number;
    payload: unknown;

    constructor(message: string, status: number, payload: unknown) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.payload = payload;
    }
}

let authTokenProvider: (() => string | null) | null = null;
let authRefreshHandler: (() => Promise<boolean>) | null = null;

export const setApiAuthTokenProvider = (provider: (() => string | null) | null) => {
    authTokenProvider = provider;
};

export const setApiAuthRefreshHandler = (handler: (() => Promise<boolean>) | null) => {
    authRefreshHandler = handler;
};

const parseJsonSafely = (text: string) => {
    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
};

export const apiFetch = async <T>(
    path: string,
    options: RequestInit & {
        params?: Record<string, string | null | undefined>;
        auth?: boolean;
        retryOnUnauthorized?: boolean;
    } = {}
) => {
    const {
        params,
        auth = true,
        retryOnUnauthorized = true,
        ...requestOptions
    } = options;
    const headers = new Headers(requestOptions.headers);
    const isFormDataBody =
        typeof FormData !== "undefined" &&
        requestOptions.body instanceof FormData;

    if (requestOptions.body && !isFormDataBody && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const token = auth ? authTokenProvider?.() : null;

    if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const url = buildApiUrl(path, params);
    let response = await fetch(url, {
        cache: "no-store",
        ...requestOptions,
        headers,
    });

    if (
        response.status === 401 &&
        auth &&
        retryOnUnauthorized &&
        authRefreshHandler &&
        await authRefreshHandler()
    ) {
        const retryHeaders = new Headers(requestOptions.headers);
        const retryToken = authTokenProvider?.();

        if (requestOptions.body && !isFormDataBody && !retryHeaders.has("Content-Type")) {
            retryHeaders.set("Content-Type", "application/json");
        }

        if (retryToken && !retryHeaders.has("Authorization")) {
            retryHeaders.set("Authorization", `Bearer ${retryToken}`);
        }

        response = await fetch(url, {
            cache: "no-store",
            ...requestOptions,
            headers: retryHeaders,
        });
    }

    if (!response.ok) {
        const error = parseJsonSafely(await response.text().catch(() => ""));
        const detail = Array.isArray(error?.detail)
            ? error.detail
                .map((item: {loc?: Array<string | number>; msg?: string}) => {
                    const field = item.loc?.filter((part) => part !== "body").join(".");

                    return field ? `${field}: ${item.msg}` : item.msg;
                })
                .filter(Boolean)
                .join(", ")
            : error?.detail;

        throw new ApiError(
            detail ||
            error?.message ||
            `Сервер ответил со статусом ${response.status}`,
            response.status,
            error
        );
    }

    if (response.status === 204) {
        return undefined as T;
    }

    const text = await response.text();

    if (!text) {
        return undefined as T;
    }

    return JSON.parse(text) as T;
};
