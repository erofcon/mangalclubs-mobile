import {VideoView, useVideoPlayer} from "expo-video";
import {themeColors} from "@/utils/theme-colors";
import {StyleSheet, View} from "react-native";
import Animated, {
    Extrapolation,
    interpolate,
    type SharedValue,
    useAnimatedStyle,
} from "react-native-reanimated";

const HEADER_HEIGHT = 240;

type Props = {
    scrollY: SharedValue<number>;
};

export function VideoHeader({scrollY}: Props) {
    const player = useVideoPlayer(
        require("@/assets/mocks/restaurant-video/video_1.mp4"),
        (player) => {
            player.loop = true;
            player.muted = true;
            player.play();
        }
    );

    const videoAnimatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [0, HEADER_HEIGHT * 0.55, HEADER_HEIGHT],
            [1, 0.35, 0],
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

    const titleAnimatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [0, HEADER_HEIGHT * 0.45],
            [1, 0],
            Extrapolation.CLAMP
        );

        const translateY = interpolate(
            scrollY.value,
            [0, HEADER_HEIGHT],
            [0, -28],
            Extrapolation.CLAMP
        );

        return {
            opacity,
            transform: [{translateY}],
        };
    });

    return (
        <View style={styles.hero}>
            <Animated.View style={[styles.videoLayer, videoAnimatedStyle]}>
                <VideoView
                    player={player}
                    style={styles.video}
                    contentFit="cover"
                    nativeControls={false}
                    allowsFullscreen={false}
                    allowsPictureInPicture={false}
                />

                <View style={styles.heroShade} />

                <Animated.Text style={[styles.restaurantName, titleAnimatedStyle]}>
                    Mangal Clubs
                </Animated.Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    hero: {
        height: HEADER_HEIGHT,
        overflow: "hidden",
        backgroundColor: themeColors.card,
    },
    videoLayer: {
        flex: 1,
    },
    video: {
        width: "100%",
        height: "100%",
    },
    heroShade: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.42)",
    },
    restaurantName: {
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 56,
        color: themeColors.text,
        fontSize: 28,
        fontFamily: "Point-Bold",
    },
});