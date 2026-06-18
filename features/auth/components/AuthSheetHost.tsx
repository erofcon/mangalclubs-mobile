import {ElementRef, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
    ActivityIndicator,
    Keyboard,
    Linking,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import {
    AppBottomSheetModal,
    AppBottomSheetRef,
} from "@/components/ui/bottom-sheet/AppBottomSheetModal";
import {PrimaryBottomButton} from "@/components/ui/PrimaryBottomButton";
import {setAuthSheetListener} from "@/features/auth/AuthSheetController";
import {
    formatRuPhoneDisplay,
    formatRuPhoneInput,
    getRuPhoneE164,
    getRuPhonePlaceholder,
    isRuPhoneComplete,
} from "@/features/auth/utils/phone";
import {useProfileStore} from "@/store/profile-store";
import {themeColors} from "@/utils/theme-colors";

const OTP_LENGTH = 4;
const PERSONAL_DATA_POLICY_URL = "https://mangalclubs.ru/personal-data";

type AuthStep = "phone" | "code";

export function AuthSheetHost() {
    const bottomSheetRef = useRef<AppBottomSheetRef>(null);
    const codeInputRef = useRef<ElementRef<typeof BottomSheetTextInput>>(null);
    const successCallbackRef = useRef<(() => void) | null>(null);
    const cancelCallbackRef = useRef<(() => void) | null>(null);

    const [step, setStep] = useState<AuthStep>("phone");
    const [phoneInput, setPhoneInput] = useState("");
    const [submittedPhone, setSubmittedPhone] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [resendSecondsLeft, setResendSecondsLeft] = useState(0);

    const user = useProfileStore((state) => state.user);
    const isRequestingOtp = useProfileStore((state) => state.isRequestingOtp);
    const isVerifyingOtp = useProfileStore((state) => state.isVerifyingOtp);
    const errorMessage = useProfileStore((state) => state.errorMessage);
    const clearError = useProfileStore((state) => state.clearError);
    const requestOtp = useProfileStore((state) => state.requestOtp);
    const verifyOtp = useProfileStore((state) => state.verifyOtp);

    const phone = getRuPhoneE164(phoneInput);
    const canSubmitPhone = isRuPhoneComplete(phoneInput);
    const canVerifyCode = otpCode.length === OTP_LENGTH;

    const resetFlow = useCallback(() => {
        setStep("phone");
        setPhoneInput("");
        setSubmittedPhone("");
        setOtpCode("");
        setResendSecondsLeft(0);
        clearError();
    }, [clearError]);

    useEffect(() => {
        setAuthSheetListener((options) => {
            successCallbackRef.current = options?.onSuccess ?? null;
            cancelCallbackRef.current = options?.onCancel ?? null;
            resetFlow();
            bottomSheetRef.current?.open();
        });

        return () => setAuthSheetListener(null);
    }, [resetFlow]);

    useEffect(() => {
        if (resendSecondsLeft <= 0) {
            return;
        }

        const timer = setInterval(() => {
            setResendSecondsLeft((value) => Math.max(0, value - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [resendSecondsLeft]);

    useEffect(() => {
        if (!user) {
            return;
        }

        successCallbackRef.current?.();
        successCallbackRef.current = null;
        cancelCallbackRef.current = null;
        bottomSheetRef.current?.close();
    }, [user]);

    const handleDismiss = useCallback(() => {
        const onCancel = cancelCallbackRef.current;

        successCallbackRef.current = null;
        cancelCallbackRef.current = null;
        resetFlow();

        if (!useProfileStore.getState().user) {
            onCancel?.();
        }
    }, [resetFlow]);

    const snapPoints = useMemo(() => ["74%"], []);

    const handlePhoneChange = (value: string) => {
        clearError();
        setPhoneInput(formatRuPhoneInput(value));
    };

    const handleRequestOtp = async () => {
        if (!phone || !canSubmitPhone) {
            return;
        }

        Keyboard.dismiss();

        try {
            const retryAfter = await requestOtp(phone);

            setSubmittedPhone(phone);
            setStep("code");
            setOtpCode("");
            setResendSecondsLeft(retryAfter);
            setTimeout(() => codeInputRef.current?.focus(), 240);
        } catch {
            // Store already exposes the message.
        }
    };

    const handleResendOtp = async () => {
        if (!submittedPhone || resendSecondsLeft > 0) {
            return;
        }

        try {
            const retryAfter = await requestOtp(submittedPhone);

            setOtpCode("");
            setResendSecondsLeft(retryAfter);
            setTimeout(() => codeInputRef.current?.focus(), 160);
        } catch {
            // Store already exposes the message.
        }
    };

    const handleVerifyOtp = async () => {
        if (!submittedPhone || !canVerifyCode) {
            return;
        }

        Keyboard.dismiss();

        try {
            await verifyOtp(submittedPhone, otpCode);
        } catch {
            setOtpCode("");
            setTimeout(() => codeInputRef.current?.focus(), 160);
        }
    };

    const handleCodeChange = (value: string) => {
        clearError();
        setOtpCode(value.replace(/\D/g, "").slice(0, OTP_LENGTH));
    };

    const handleOpenConsent = () => {
        Linking.openURL(PERSONAL_DATA_POLICY_URL).catch(() => undefined);
    };

    const renderPhoneStep = () => (
        <View style={styles.content}>
            <Text style={styles.eyebrow}>Профиль</Text>
            <Text style={styles.title}>Войдите в профиль</Text>
            <Text style={styles.description}>
                Укажите телефон, и мы позвоним для подтверждения входа
            </Text>

            <BottomSheetTextInput
                value={phoneInput}
                onChangeText={handlePhoneChange}
                placeholder={getRuPhonePlaceholder()}
                placeholderTextColor="#77736D"
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                autoComplete="tel"
                style={styles.phoneInput}
                maxLength={18}
            />

            <Pressable
                accessibilityRole="link"
                onPress={handleOpenConsent}
                style={({pressed}) => [styles.consentNote, pressed && styles.pressed]}
            >
                <Text style={styles.consentText}>
                    Авторизуясь, вы соглашаетесь с обработкой персональных данных
                </Text>
            </Pressable>

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <PrimaryBottomButton
                text="Получить звонок"
                onPress={handleRequestOtp}
                disabled={!canSubmitPhone}
                loading={isRequestingOtp}
            />
        </View>
    );

    const renderCodeStep = () => (
        <View style={styles.content}>
            <Text style={styles.eyebrow}>Подтверждение</Text>
            <Text style={styles.title}>Введите код</Text>
            <Text style={styles.description}>
                Дождитесь звонка на {formatRuPhoneDisplay(submittedPhone)} и введите последние 4 цифры номера
            </Text>

            <Pressable style={styles.codeCells} onPress={() => codeInputRef.current?.focus()}>
                {Array.from({length: OTP_LENGTH}).map((_, index) => {
                    const digit = otpCode[index];
                    const isActive = index === otpCode.length;

                    return (
                        <View
                            key={index}
                            style={[
                                styles.codeCell,
                                isActive && styles.codeCellActive,
                            ]}
                        >
                            <Text style={styles.codeDigit}>{digit || "-"}</Text>
                        </View>
                    );
                })}
            </Pressable>

            <BottomSheetTextInput
                ref={codeInputRef}
                value={otpCode}
                onChangeText={handleCodeChange}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                maxLength={OTP_LENGTH}
                style={styles.hiddenInput}
            />

            {resendSecondsLeft > 0 ? (
                <Text style={styles.timerText}>
                    Повторный звонок будет доступен через {resendSecondsLeft} секунд
                </Text>
            ) : (
                <Pressable
                    disabled={isRequestingOtp}
                    onPress={handleResendOtp}
                    style={styles.resendButton}
                >
                    {isRequestingOtp ? (
                        <ActivityIndicator color={themeColors.primary} />
                    ) : (
                        <Text style={styles.resendText}>Позвонить еще раз</Text>
                    )}
                </Pressable>
            )}

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <PrimaryBottomButton
                text="Подтвердить"
                onPress={handleVerifyOtp}
                disabled={!canVerifyCode}
                loading={isVerifyingOtp}
            />
        </View>
    );

    return (
        <AppBottomSheetModal
            ref={bottomSheetRef}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            scrollable
            keyboardBehavior="interactive"
            keyboardShouldPersistTaps="handled"
            androidKeyboardInputMode="adjustResize"
            showCloseButton
            onDismiss={handleDismiss}
            contentContainerStyle={styles.sheetContent}
        >
            {step === "phone" ? renderPhoneStep() : renderCodeStep()}
        </AppBottomSheetModal>
    );
}

const styles = StyleSheet.create({
    sheetContent: {
        flexGrow: 1,
        paddingBottom: 24,
    },

    content: {
        flexGrow: 1,
        paddingTop: 4,
    },

    pressed: {
        opacity: 0.76,
    },

    eyebrow: {
        color: themeColors.primary,
        fontSize: 13,
        lineHeight: 18,
        letterSpacing: 0,
        textAlign: "center",
        textTransform: "uppercase",
        fontFamily: "Point-Bold",
    },

    title: {
        marginTop: 20,
        color: themeColors.text,
        fontSize: 31,
        lineHeight: 38,
        textAlign: "center",
        fontFamily: "Point-Regular",
    },

    description: {
        marginTop: 22,
        color: "#B7B0AA",
        fontSize: 18,
        lineHeight: 27,
        textAlign: "center",
        fontFamily: "Point-Regular",
    },

    phoneInput: {
        height: 60,
        marginTop: 56,
        paddingHorizontal: 18,
        color: themeColors.text,
        fontSize: 20,
        lineHeight: 24,
        fontFamily: "Point-Regular",
        borderWidth: 1,
        borderRadius: 8,
        borderColor: themeColors.border,
        backgroundColor: "#080909",
    },

    consentNote: {
        marginTop: 26,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 52,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(236,172,24,0.24)",
        backgroundColor: "rgba(236,172,24,0.08)",
    },

    consentText: {
        color: "#D5CCC2",
        fontSize: 15,
        lineHeight: 22,
        textAlign: "center",
        textDecorationLine: "underline",
        fontFamily: "Point-Regular",
    },

    codeCells: {
        marginTop: 50,
        flexDirection: "row",
        justifyContent: "center",
        gap: 10,
    },

    codeCell: {
        width: 64,
        height: 70,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: themeColors.border,
        backgroundColor: "#080909",
    },

    codeCellActive: {
        borderWidth: 2,
        borderColor: themeColors.primary,
    },

    codeDigit: {
        color: "#8D8882",
        fontSize: 34,
        lineHeight: 38,
        fontFamily: "Point-Bold",
    },

    hiddenInput: {
        position: "absolute",
        width: 1,
        height: 1,
        opacity: 0,
    },

    timerText: {
        marginTop: 40,
        color: "#B7B0AA",
        fontSize: 16,
        lineHeight: 22,
        textAlign: "center",
        fontFamily: "Point-Bold",
    },

    resendButton: {
        minHeight: 44,
        marginTop: 30,
        alignItems: "center",
        justifyContent: "center",
    },

    resendText: {
        color: themeColors.primary,
        fontSize: 16,
        lineHeight: 22,
        textAlign: "center",
        fontFamily: "Point-Bold",
    },

    errorText: {
        marginTop: 18,
        color: themeColors.notification,
        fontSize: 14,
        lineHeight: 20,
        textAlign: "center",
        fontFamily: "Point-Regular",
    },
});
