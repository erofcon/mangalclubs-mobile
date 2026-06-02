import {ImageSourcePropType, Pressable, StyleSheet, Text, View} from "react-native";
import {Image} from "expo-image";
import {LinearGradient} from "expo-linear-gradient";

import {Organizations} from "@/mocks/mocks-data";
import type {Organization} from "@/types/organization";
import {themeColors} from "@/utils/theme-colors";
import React from "react";

type Restaurant = {
    id: string;
    title: string;
    address: string;
    hours: string;
    image: ImageSourcePropType;
};

const restaurantImages: Record<string, ImageSourcePropType> = {
    fazenda: require("@/assets/mocks/restaurant-images/fazenda/XXXL.webp"),
    "mangal-club": require("@/assets/mocks/restaurant-images/mangal-clubs/XXXL.webp"),
};

const restaurants: Restaurant[] = Organizations.map((organization: Organization) => ({
    id: organization.id,
    title: organization.name,
    address: `${organization.city}, ${organization.address}`,
    hours: organization.schedule,
    image: restaurantImages[organization.id] ?? restaurantImages.fazenda,
}));

export function RestaurantsList() {
    return (
        <View style={styles.section}>

            <Text style={styles.restaurantsTitle}
                  numberOfLines={1}
            >
                Наши рестораны
            </Text>

            {restaurants.map((restaurant) => (
                <Pressable
                    key={restaurant.id}
                    style={({pressed}) => [
                        styles.card,
                        pressed && styles.cardPressed,
                    ]}
                >
                    <View style={styles.imageWrap}>
                        <Image
                            source={restaurant.image}
                            style={styles.image}
                            contentFit="cover"
                            transition={180}
                            cachePolicy="memory-disk"
                        />

                        <LinearGradient
                            pointerEvents="none"
                            colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.78)"]}
                            style={styles.imageOverlay}
                        />

                        <View style={styles.restaurantPill}>
                            <View style={styles.restaurantDot}/>
                            <Text style={styles.restaurantPillText}>Открыто</Text>
                        </View>
                    </View>

                    <View style={styles.cardBody}>
                        <Text style={styles.title} numberOfLines={1}>
                            {restaurant.title}
                        </Text>

                        <Text style={styles.meta} numberOfLines={2}>
                            {restaurant.address} · {restaurant.hours}
                        </Text>
                    </View>
                </Pressable>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 28,
        gap: 14,
    },
    restaurantsTitle: {
        color: themeColors.text,
        fontSize: 20,
        lineHeight: 24,
        fontFamily: "Point-Bold",
        marginBottom: 2,
    },


    card: {
        width: "100%",
        overflow: "hidden",
        borderRadius: 22,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        backgroundColor: "#121210",
    },

    cardPressed: {
        opacity: 0.86,
        transform: [{scale: 0.99}],
    },

    title: {
        color: themeColors.text,
        fontSize: 18,
        lineHeight: 22,
        fontFamily: "Point-Bold",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },

    meta: {
        marginTop: 6,
        color: themeColors.textSecondary,
        fontSize: 13,
        lineHeight: 18,
        fontFamily: "Point-Regular",
    },

    imageWrap: {
        width: "100%",
        aspectRatio: 1.72,
        overflow: "hidden",
        backgroundColor: themeColors.card,
        position: "relative",
    },

    image: {
        width: "100%",
        height: "100%",
    },

    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
    },

    restaurantPill: {
        position: "absolute",
        left: 12,
        top: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 999,
        backgroundColor: "rgba(7,8,8,0.64)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
    },

    restaurantDot: {
        width: 7,
        height: 7,
        borderRadius: 999,
        backgroundColor: themeColors.success,
    },

    restaurantPillText: {
        color: themeColors.text,
        fontSize: 12,
        lineHeight: 14,
        fontFamily: "Point-SemiBold",
    },

    cardBody: {
        paddingHorizontal: 14,
        paddingTop: 12,
        paddingBottom: 15,
    },
});
