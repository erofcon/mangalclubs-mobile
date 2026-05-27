import {ActivityIndicator, Pressable, StyleSheet, Text} from "react-native";

import {themeColors} from "@/utils/theme-colors";

type PrimaryBottomButtonProps = {
    text: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
};

export function PrimaryBottomButton({
    text,
    onPress,
    disabled = false,
    loading = false,
}: PrimaryBottomButtonProps) {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled || loading}
            style={[styles.button, (disabled || loading) && styles.buttonDisabled]}
        >
            {loading ? (
                <ActivityIndicator color={themeColors.textOnPrimary}/>
            ) : (
                <Text style={styles.text}>{text}</Text>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        minHeight: 54,
        marginTop: 16,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: themeColors.primary,
    },

    buttonDisabled: {
        opacity: 0.5,
    },

    text: {
        color: themeColors.textOnPrimary,
        fontFamily: "Point-Bold",
        fontSize: 17,
    },
});
