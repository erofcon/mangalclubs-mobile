import {ImageSourcePropType, Pressable, StyleSheet, Text, View} from "react-native";
import {Image} from "expo-image";

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

                        <View style={styles.imageOverlay} pointerEvents="none" />
                    </View>

                    <Text style={styles.title} numberOfLines={1}>
                        {restaurant.title}
                    </Text>

                    <Text style={styles.meta} numberOfLines={1}>
                        {restaurant.address} · {restaurant.hours}
                    </Text>
                </Pressable>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 28,
        gap: 26,
    },
    restaurantsTitle: {
        color: themeColors.text,
        fontSize: 16,
        fontFamily: "Point-Bold",
    },


    card: {
        width: "100%",
    },

    cardPressed: {
        opacity: 0.86,
        transform: [{scale: 0.99}],
    },

    title: {
        marginTop: 8,
        color: themeColors.text,
        fontSize: 16,
        lineHeight: 26,
        fontFamily: "Point-Bold",
        textTransform: "uppercase",
        letterSpacing:0.5
    },

    meta: {
        marginTop: 1,
        color: themeColors.text,
        fontSize: 12,
        lineHeight: 16,
        fontFamily: "Point-Regular",
    },

    imageWrap: {
        width: "100%",
        aspectRatio: 1.9,
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: themeColors.card,
    },

    image: {
        width: "100%",
        height: "100%",
    },

    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.30)",
    },
});
