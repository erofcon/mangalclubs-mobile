import {Text, View} from "react-native";
import {Image} from "expo-image";
import {LinearGradient} from "expo-linear-gradient";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import Animated, {
    Extrapolation,
    interpolate,
    type SharedValue,
    useAnimatedStyle,
} from "react-native-reanimated";

import {themeColors} from "@/utils/theme-colors";
import type {Booking} from "@/types/booking";

import {HERO_HEIGHT} from "../booking.constants";
import styles from "../booking.styles";
import {getBookingPrimaryImageSource} from "../booking.utils";

type BookingHeroProps = {
    scrollY: SharedValue<number>;
    bookings: Booking[];
};

export function BookingHero({scrollY, bookings}: BookingHeroProps) {
    const heroImage = bookings
        .map(getBookingPrimaryImageSource)
        .find(Boolean);

    const imageStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [0, HERO_HEIGHT * 0.6, HERO_HEIGHT],
            [1, 0.5, 0],
            Extrapolation.CLAMP,
        );
        const scale = interpolate(scrollY.value, [0, HERO_HEIGHT], [1, 1.08], Extrapolation.CLAMP);

        return {
            opacity,
            transform: [{scale}],
        };
    });

    const contentStyle = useAnimatedStyle(() => {
        const opacity = interpolate(scrollY.value, [0, HERO_HEIGHT * 0.45], [1, 0], Extrapolation.CLAMP);
        const translateY = interpolate(scrollY.value, [0, HERO_HEIGHT], [0, -32], Extrapolation.CLAMP);

        return {
            opacity,
            transform: [{translateY}],
        };
    });

    return (
        <View style={styles.hero}>
            <Animated.View style={[styles.heroImageLayer, imageStyle]}>
                {heroImage ? (
                    <Image
                        source={heroImage}
                        style={styles.heroImage}
                        contentFit="cover"
                    />
                ) : null}

                <View style={styles.heroOverlay} />

                <LinearGradient
                    colors={[themeColors.background, "transparent"]}
                    style={styles.heroTopGradient}
                />

                <LinearGradient
                    colors={["transparent", "rgba(7,8,8,0.72)", themeColors.background]}
                    locations={[0, 0.52, 1]}
                    style={styles.heroBottomGradient}
                />
            </Animated.View>

            <Animated.View style={[styles.heroContent, contentStyle]}>
                <View style={styles.heroPill}>
                    <MaterialCommunityIcons name="calendar-clock" size={15} color={themeColors.primary} />
                    <Text style={styles.heroPillText}>Бронирование</Text>
                </View>

                <Text style={styles.heroTitle} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.9}>Приватные зоны Mangal Clubs</Text>

                <Text style={styles.heroSubtitle} numberOfLines={3} adjustsFontSizeToFit minimumFontScale={0.9}>
                    Выберите кабинку, сауну или столик и свяжитесь с рестораном удобным способом.
                </Text>
            </Animated.View>
        </View>
    );
}
