import {StyleSheet, Text, View} from "react-native";

import {Screen} from "@/components/ui/Screen";
import {themeColors} from "@/utils/theme-colors";

export default function BookingScreen() {
    return (
        <Screen withTopInset contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.title}>Бронирование</Text>
                <Text style={styles.subtitle}>
                    Здесь можно будет выбрать дату, время и оформить бронь.
                </Text>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 96,
    },

    header: {
        gap: 8,
        paddingTop: 18,
    },

    title: {
        color: themeColors.text,
        fontFamily: "Point-Bold",
        fontSize: 28,
        lineHeight: 34,
    },

    subtitle: {
        color: themeColors.textSecondary,
        fontFamily: "Point-Regular",
        fontSize: 15,
        lineHeight: 21,
    },
});