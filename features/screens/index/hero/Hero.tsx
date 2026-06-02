import { Image } from "expo-image";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { themeColors } from "@/utils/theme-colors";

export function Hero() {
    return (
        <View style={styles.hero}>
            {/* Background image */}
            <Image
                source={require("@/assets/mocks/restaurant-images/fazenda/XXXL.webp")}
                style={styles.image}
                contentFit="cover"
            />

            {/* Dark overlay */}
            <View style={styles.overlay} />

            {/* Top gradient */}
            <LinearGradient
                colors={[
                    themeColors.background,
                    "transparent",
                ]}
                style={styles.topGradient}
            />

            {/* Bottom gradient */}
            <LinearGradient
                colors={[
                    "transparent",
                    themeColors.background,
                ]}
                style={styles.bottomGradient}
            />

            {/* Text content */}
            <View style={styles.content}>
                <Text style={styles.title}>
                    Добро пожаловать!
                </Text>

                <Text style={styles.subtitle}>
                    Вкусная еда, отличное настроение!
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    hero: {
        height: 320,
        position: "relative",
        backgroundColor: themeColors.background,
    },

    image: {
        ...StyleSheet.absoluteFillObject,
    },

    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.35)",
    },

    topGradient: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 120,
    },

    bottomGradient: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 180,
    },

    content: {
        position: "absolute",
        bottom: 40,
        left: 16,
        right: 16,
    },

    title: {
        color: themeColors.primary,
        fontSize: 20,
        fontFamily: "Point-Black",
    },

    subtitle: {
        marginTop: 8,
        color: themeColors.text,
        fontSize: 24,
        fontFamily: "Point-Regular",
        maxWidth: 340,
    },
});