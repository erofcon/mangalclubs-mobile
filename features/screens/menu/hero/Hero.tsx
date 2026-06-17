import {StyleSheet, Text, View} from "react-native";
import {Image} from "expo-image";
import {LinearGradient} from "expo-linear-gradient";
import Animated, {
    Extrapolation,
    interpolate,
    type SharedValue,
    useAnimatedStyle,
} from "react-native-reanimated";
import {MaterialCommunityIcons} from "@expo/vector-icons";

import {themeColors} from "@/utils/theme-colors";
import {
    SCREEN_HERO_BOTTOM_GRADIENT_HEIGHT,
    SCREEN_HERO_CONTENT_BOTTOM,
    SCREEN_HERO_HEIGHT,
    SCREEN_HERO_HORIZONTAL_PADDING,
    SCREEN_HERO_TOP_GRADIENT_HEIGHT,
} from "@/features/screens/shared/hero-layout";

const HEADER_HEIGHT = SCREEN_HERO_HEIGHT;

type Props = {
    scrollY: SharedValue<number>;
};

export function Hero({scrollY}: Props) {
    const heroAnimatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [0, HEADER_HEIGHT * 0.58, HEADER_HEIGHT],
            [1, 0.45, 0],
            Extrapolation.CLAMP
        );

        const scale = interpolate(
            scrollY.value,
            [0, HEADER_HEIGHT],
            [1, 1.08],
            Extrapolation.CLAMP
        );

        return {
            opacity,
            transform: [{scale}],
        };
    });

    const contentAnimatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [0, HEADER_HEIGHT * 0.45],
            [1, 0],
            Extrapolation.CLAMP
        );

        const translateY = interpolate(
            scrollY.value,
            [0, HEADER_HEIGHT],
            [0, -32],
            Extrapolation.CLAMP
        );

        return {
            opacity,
            transform: [{translateY}],
        };
    });

    return (
        <View style={styles.hero}>
            <Animated.View style={[styles.imageLayer, heroAnimatedStyle]}>
                <Image
                    source={require("@/assets/mocks/restaurant-images/mangal-clubs/XXXL.webp")}
                    style={styles.image}
                    contentFit="cover"
                />

                <View style={styles.overlay}/>

                <LinearGradient
                    colors={[
                        themeColors.background,
                        "transparent",
                    ]}
                    style={styles.topGradient}
                />

                <LinearGradient
                    colors={[
                        "transparent",
                        themeColors.background,
                    ]}
                    style={styles.bottomGradient}
                />

            </Animated.View>

            <Animated.View style={[styles.content, contentAnimatedStyle]}>
                <View style={styles.pill}>
                    <MaterialCommunityIcons
                        name="fire"
                        size={15}
                        color={themeColors.primary}
                    />
                    <Text style={styles.pillText}>Меню</Text>
                </View>

                <Text style={styles.title} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.9}>Блюда на огне</Text>

                <Text style={styles.subtitle} numberOfLines={3} adjustsFontSizeToFit minimumFontScale={0.9}>
                    Стейки, мангал, свежие салаты и блюда для доставки без лишней суеты.
                </Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    hero: {
        height: SCREEN_HERO_HEIGHT,
        position: "relative",
        backgroundColor: themeColors.background,
    },
    imageLayer: {
        ...StyleSheet.absoluteFillObject,
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
        left: SCREEN_HERO_HORIZONTAL_PADDING,
        right: SCREEN_HERO_HORIZONTAL_PADDING,
        bottom: SCREEN_HERO_CONTENT_BOTTOM,
    },
    pill: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
        paddingHorizontal: 11,
        paddingVertical: 7,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: themeColors.border,
        backgroundColor: "rgba(7,8,8,0.58)",
    },
    pillText: {
        color: themeColors.text,
        fontSize: 12,
        fontFamily: "Point-SemiBold",
    },
    title: {
        marginTop:8,
        color: themeColors.primary,
        fontSize: 20,
        lineHeight: 25,
        fontFamily: "Point-Black",
    },
    subtitle: {
        marginTop: 8,
        color: themeColors.text,
        fontSize: 14,
        lineHeight: 20,
        fontFamily: "Point-Regular",
        maxWidth: 360,
    },
});
