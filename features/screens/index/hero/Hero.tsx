import { Image } from "expo-image";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { themeColors } from "@/utils/theme-colors";
import {
    SCREEN_HERO_BOTTOM_GRADIENT_HEIGHT,
    SCREEN_HERO_CONTENT_BOTTOM,
    SCREEN_HERO_HEIGHT,
    SCREEN_HERO_HORIZONTAL_PADDING,
    SCREEN_HERO_TOP_GRADIENT_HEIGHT,
} from "@/features/screens/shared/hero-layout";

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
                <Text style={styles.title} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.9}>
                    Добро пожаловать!
                </Text>

                <Text style={styles.subtitle} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.9}>
                    Вкусная еда, отличное настроение!
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    hero: {
        height: SCREEN_HERO_HEIGHT,
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
        height: SCREEN_HERO_TOP_GRADIENT_HEIGHT,
    },

    bottomGradient: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: SCREEN_HERO_BOTTOM_GRADIENT_HEIGHT,
    },

    content: {
        position: "absolute",
        bottom: SCREEN_HERO_CONTENT_BOTTOM,
        left: SCREEN_HERO_HORIZONTAL_PADDING,
        right: SCREEN_HERO_HORIZONTAL_PADDING,
    },

    title: {
        color: themeColors.primary,
        fontSize: 20,
        lineHeight: 24,
        fontFamily: "Point-Black",
    },

    subtitle: {
        marginTop: 8,
        color: themeColors.text,
        fontSize: 22,
        lineHeight: 27,
        fontFamily: "Point-Regular",
        maxWidth: 360,
    },
});
