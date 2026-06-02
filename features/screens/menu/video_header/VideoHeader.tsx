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

const HEADER_HEIGHT = 286;

type Props = {
    scrollY: SharedValue<number>;
};

export function VideoHeader({scrollY}: Props) {
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
                    transition={180}
                    cachePolicy="memory-disk"
                />

                <LinearGradient
                    pointerEvents="none"
                    colors={["rgba(7,8,8,0.1)", "rgba(7,8,8,0.56)", "#070808"]}
                    locations={[0, 0.52, 1]}
                    style={StyleSheet.absoluteFillObject}
                />
            </Animated.View>

            <Animated.View style={[styles.content, contentAnimatedStyle]}>
                <View style={styles.pill}>
                    <MaterialCommunityIcons
                        name="fire"
                        size={15}
                        color={themeColors.primary}
                    />
                    <Text style={styles.pillText}>Меню Mangal Clubs</Text>
                </View>

                <Text style={styles.title}>Блюда на огне</Text>

                <Text style={styles.subtitle} numberOfLines={2}>
                    Стейки, мангал, свежие салаты и блюда для доставки без лишней суеты.
                </Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    hero: {
        height: HEADER_HEIGHT,
        overflow: "hidden",
        backgroundColor: "#070808",
    },
    imageLayer: {
        ...StyleSheet.absoluteFillObject,
    },
    image: {
        width: "100%",
        height: "100%",
    },
    content: {
        position: "absolute",
        left: 12,
        right: 12,
        bottom: 52,
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
        borderColor: "rgba(255,255,255,0.12)",
        backgroundColor: "rgba(7,8,8,0.58)",
    },
    pillText: {
        color: "rgba(255,255,255,0.78)",
        fontSize: 12,
        lineHeight: 14,
        fontFamily: "Point-SemiBold",
    },
    title: {
        marginTop: 14,
        color: themeColors.text,
        fontSize: 36,
        lineHeight: 39,
        fontFamily: "Point-Black",
    },
    subtitle: {
        marginTop: 9,
        maxWidth: 330,
        color: "rgba(255,255,255,0.72)",
        fontSize: 15,
        lineHeight: 21,
        fontFamily: "Point-Regular",
    },
});
