import {MaterialCommunityIcons} from "@expo/vector-icons";
import {StyleSheet, Text, View} from "react-native";
import Animated, {
    Extrapolation,
    interpolate,
    type SharedValue,
    useAnimatedStyle,
} from "react-native-reanimated";

import {themeColors} from "@/utils/theme-colors";

const HEADER_COLLAPSE_DISTANCE = 270;

type Props = {
    scrollY: SharedValue<number>;
};

export function OrderType({scrollY}: Props) {
    const segmentClipAnimatedStyle = useAnimatedStyle(() => {
        const height = interpolate(
            scrollY.value,
            [0, HEADER_COLLAPSE_DISTANCE * 0.72],
            [52, 0],
            Extrapolation.CLAMP
        );

        const opacity = interpolate(
            scrollY.value,
            [0, HEADER_COLLAPSE_DISTANCE * 0.42],
            [1, 0],
            Extrapolation.CLAMP
        );

        return {
            height,
            opacity,
        };
    });

    const segmentContentAnimatedStyle = useAnimatedStyle(() => {
        const translateY = interpolate(
            scrollY.value,
            [0, HEADER_COLLAPSE_DISTANCE * 0.72],
            [0, -16],
            Extrapolation.CLAMP
        );

        return {
            transform: [{translateY}],
        };
    });

    return (
        <Animated.View style={styles.container}>
            <View style={styles.card}>
                <Animated.View
                    pointerEvents="box-none"
                    style={[styles.segmentClip, segmentClipAnimatedStyle]}
                >
                    <Animated.View
                        style={[
                            styles.segmentAnimatedContent,
                            segmentContentAnimatedStyle,
                        ]}
                    >
                        <View style={styles.segment}>
                            <View style={styles.segmentActive}>
                                <Text style={styles.segmentActiveText}>
                                    Доставка
                                </Text>
                            </View>

                            <View style={styles.segmentInactive}>
                                <Text style={styles.segmentText}>
                                    Навынос
                                </Text>
                            </View>
                        </View>
                    </Animated.View>
                </Animated.View>

                <View style={styles.addressRow}>
                    <Text style={styles.addressText}>
                        Указать адрес доставки
                    </Text>

                    <MaterialCommunityIcons
                        name="chevron-right"
                        size={22}
                        color={themeColors.text}
                    />
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        paddingTop: 26,
        paddingBottom: 10,
        backgroundColor: themeColors.background,
    },

    card: {
        padding: 8,
        borderRadius: 22,
        backgroundColor: themeColors.card,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
    },

    segmentClip: {
        overflow: "hidden",
    },

    segmentAnimatedContent: {
        height: 52,
    },

    segment: {
        height: 42,
        flexDirection: "row",
        padding: 4,
        borderRadius: 14,
        backgroundColor: themeColors.cardSecondary,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
    },

    segmentActive: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        backgroundColor: "#F1F1F1",
    },

    segmentInactive: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
    },

    segmentActiveText: {
        color: "#111",
        fontSize: 14,
        fontFamily: "Point-SemiBold",
    },

    segmentText: {
        color: themeColors.text,
        fontSize: 14,
        fontFamily: "Point-SemiBold",
        opacity: 0.82,
    },

    addressRow: {
        minHeight: 46,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 10,
    },

    addressText: {
        color: themeColors.text,
        fontSize: 15,
        fontFamily: "Point-SemiBold",
    },
});