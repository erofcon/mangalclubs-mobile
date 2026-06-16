import {Pressable, Text, View} from "react-native";
import {Image} from "expo-image";
import {LinearGradient} from "expo-linear-gradient";
import {Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";

import type {Booking} from "@/types/booking";
import {themeColors} from "@/utils/theme-colors";

import styles from "../booking.styles";
import {getBookingImageSource, getCategoryTitle, getOrganization} from "../booking.utils";

type BookingCardProps = {
    booking: Booking;
    onPress: () => void;
};

export function BookingCard({booking, onPress}: BookingCardProps) {
    const organization = getOrganization(booking.organizationId);
    const categoryTitle = getCategoryTitle(booking.categoryId);

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={booking.title}
            style={styles.bookingCard}
            onPress={onPress}
        >
            <Image
                source={getBookingImageSource(booking.image)}
                style={styles.cardImage}
                contentFit="cover"
            />

            <LinearGradient
                colors={["rgba(0,0,0,0.42)", "rgba(0,0,0,0.38)", "rgba(0,0,0,0.92)"]}
                style={styles.cardGradient}
            />

            <View style={styles.cardContent}>
                <View style={styles.cardTopRow}>
                    <View style={styles.cardPill}>
                        <Text style={styles.cardPillText} numberOfLines={1}>
                            {categoryTitle}
                        </Text>
                    </View>

                    <View style={styles.cardPillMuted}>
                        <MaterialCommunityIcons
                            name="storefront-outline"
                            size={13}
                            color={themeColors.primary}
                        />
                        <Text style={styles.cardPillMutedText} numberOfLines={1}>
                            {organization.name}
                        </Text>
                    </View>
                </View>

                <Text style={styles.cardTitle} numberOfLines={1}>
                    {booking.title}
                </Text>

                <Text style={styles.cardDescription} numberOfLines={2}>
                    {booking.description}
                </Text>

                <View style={styles.cardFooter}>
                    <Text style={styles.cardFooterText}>Бронь по звонку</Text>
                    <Ionicons name="arrow-forward" size={17} color={themeColors.primary} />
                </View>
            </View>
        </Pressable>
    );
}
