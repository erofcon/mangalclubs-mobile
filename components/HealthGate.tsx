import {PropsWithChildren, useCallback, useEffect, useRef, useState} from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";

import {apiFetch} from "@/services/api";
import {useAppDataStore} from "@/store/app-data-store";
import {themeColors} from "@/utils/theme-colors";

type HealthStatus = "checking" | "ready" | "error";

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
    const initializeAppData = useAppDataStore((state) => state.initialize);
    const activeCheckRef = useRef<AbortController | null>(null);

    const checkHealth = useCallback(async () => {
        activeCheckRef.current?.abort();

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);
        activeCheckRef.current = controller;

        setStatus("checking");
        setErrorMessage("");

        try {
            await requestHealth(controller.signal);

            if (activeCheckRef.current !== controller) {
                return;
            }

            setStatus("ready");

            await initializeAppData(controller.signal).catch(() => {
                // Ошибка данных будет показана внутри приложения, health gate не держим закрытым.
            });
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
    }, [initializeAppData]);

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
