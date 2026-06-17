import {router, useLocalSearchParams} from "expo-router";
import {useEffect} from "react";
import {ActivityIndicator, StyleSheet, Text, View} from "react-native";

import {Screen} from "@/components/ui/Screen";
import {themeColors} from "@/utils/theme-colors";

export default function OrderPaymentReturnScreen() {
    const {result} = useLocalSearchParams<{result?: string}>();

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.replace("/profile");
        }, 300);

        return () => clearTimeout(timeout);
    }, [result]);

    return (
        <Screen>
            <View style={styles.root}>
                <ActivityIndicator color={themeColors.primary} />
                <Text style={styles.text}>Возвращаемся к заказу...</Text>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        backgroundColor: themeColors.background,
    },
    text: {
        color: themeColors.text,
        fontSize: 16,
        fontFamily: "Point-Regular",
    },
});
