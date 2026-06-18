import {useCallback, useEffect, useRef, useState} from "react";
import {
    Linking,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {Image} from "expo-image";
import {LinearGradient} from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import {SafeAreaView} from "react-native-safe-area-context";

import {
    AppBottomSheetModal,
    type AppBottomSheetRef,
} from "@/components/ui/bottom-sheet/AppBottomSheetModal";

import type {Organization} from "@/types/organization";
import {themeColors} from "@/utils/theme-colors";
import {resolveApiAssetUrl} from "@/services/api";
import {useAppDataStore} from "@/store/app-data-store";

type Restaurant = {
    id: string;
    title: string;
    address: string;
    hours: string;
    hoursLines?: string[];
    phone: string;
    whatsappPhone?: string | null;
    intro: string;
    image?: string;
};

const getPhoneUrl = (phone: string) =>
    `tel:${phone.replace(/[^\d+]/g, "")}`;

const getWhatsAppPhone = (phone: string) =>
    phone.replace(/\D/g, "");

export function RestaurantsList() {
    const organizations = useAppDataStore((state) => state.organizations);

    const restaurantSheetRef =
        useRef<AppBottomSheetRef>(null);

    const [selectedRestaurant,
        setSelectedRestaurant] =
        useState<Restaurant | null>(null);

    const restaurants = organizations.map((organization: Organization) => {
        const image = resolveApiAssetUrl(organization.photo_url);

        return {
            id: organization.id,
            title: organization.name,
            address: `${organization.city}, ${organization.address}`,
            hours: organization.schedule,
            hoursLines: organization.scheduleLines,
            phone: organization.phone,
            whatsappPhone: organization.whatsapp_phone,
            intro: organization.intro,
            image,
        };
    });

    useEffect(() => {

        if (selectedRestaurant) {
            restaurantSheetRef.current?.open();
        }

    }, [selectedRestaurant]);

    const handleCallPress =
        useCallback(() => {

            if (!selectedRestaurant) return;

            Linking.openURL(
                getPhoneUrl(
                    selectedRestaurant.phone,
                ),
            ).catch(() => {
            });

        }, [selectedRestaurant]);

    const handleWhatsAppPress =
        useCallback(async () => {

            if (!selectedRestaurant) return;

            const phone =
                getWhatsAppPhone(
                    selectedRestaurant.whatsappPhone ||
                    selectedRestaurant.phone,
                );

            if (!phone) return;

            const text =
                encodeURIComponent(
                    `Здравствуйте! Хочу уточнить информацию о ресторане ${selectedRestaurant.title}.`,
                );

            const appUrl =
                `whatsapp://send?phone=${phone}&text=${text}`;

            const webUrl =
                `https://wa.me/${phone}?text=${text}`;

            try {

                if (
                    await Linking.canOpenURL(
                        appUrl,
                    )
                ) {

                    await Linking.openURL(
                        appUrl,
                    );

                    return;

                }

                await Linking.openURL(
                    webUrl,
                );

            } catch {

                Linking.openURL(
                    webUrl,
                ).catch(() => {
                });

            }

        }, [selectedRestaurant]);

    return (

        <View style={styles.section}>

            <Text
                style={styles.restaurantsTitle}
            >
                Наши рестораны
            </Text>

            {restaurants.map((restaurant) => (
                <Pressable
                    key={restaurant.id}
                    onPress={() =>
                        setSelectedRestaurant(
                            restaurant,
                        )
                    }
                    style={({pressed}) => [
                        styles.card,
                        pressed &&
                        styles.cardPressed,
                    ]}
                >

                    <View style={styles.imageWrap}>

                        {restaurant.image ? (
                            <Image
                                source={restaurant.image}
                                style={styles.image}
                                contentFit="cover"
                            />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Ionicons
                                    name="restaurant-outline"
                                    size={32}
                                    color={themeColors.textSecondary}
                                />
                            </View>
                        )}

                        <LinearGradient
                            colors={[
                                "rgba(0,0,0,0.05)",
                                "rgba(0,0,0,0.78)",
                            ]}
                            style={
                                styles.imageOverlay
                            }
                        />

                    </View>

                    <View style={styles.cardBody}>

                        <Text
                            style={styles.title}
                        >
                            {restaurant.title}
                        </Text>

                        <Text
                            style={styles.meta}
                        >
                            {restaurant.address}
                        </Text>

                    </View>

                </Pressable>
            ))}

            <AppBottomSheetModal
                ref={restaurantSheetRef}
                title={selectedRestaurant?.title}
                scrollable
                snapPoints={["100%"]}
                onDismiss={() =>
                    setSelectedRestaurant(
                        null,
                    )
                }
            >

                {selectedRestaurant && (

                    <View
                        style={
                            styles.sheetContainer
                        }
                    >

                        <View
                            style={
                                styles.sheetScrollableContent
                            }
                        >

                            <View
                                style={
                                    styles.sheetImageWrap
                                }
                            >

                                {selectedRestaurant.image ? (
                                    <Image
                                        source={
                                            selectedRestaurant.image
                                        }
                                        style={
                                            styles.sheetImage
                                        }
                                        contentFit="cover"
                                    />
                                ) : (
                                    <View style={styles.sheetImagePlaceholder}>
                                        <Ionicons
                                            name="restaurant-outline"
                                            size={38}
                                            color={themeColors.textSecondary}
                                        />
                                    </View>
                                )}

                            </View>

                            <Text
                                style={
                                    styles.sheetSectionTitle
                                }
                            >
                                Описание
                            </Text>

                            <Text
                                style={
                                    styles.sheetDescription
                                }
                            >
                                {
                                    selectedRestaurant.intro
                                }
                            </Text>

                            <Text
                                style={
                                    styles.sheetSectionTitle
                                }
                            >
                                Контакты
                            </Text>

                            <View
                                style={
                                    styles.contacts
                                }
                            >

                                <ContactRow
                                    icon="location-outline"
                                    label="Адрес"
                                    value={
                                        selectedRestaurant.address
                                    }
                                />

                                <ContactRow
                                    icon="time-outline"
                                    label="График"
                                    value={
                                        selectedRestaurant.hoursLines?.length
                                            ? selectedRestaurant.hoursLines
                                            : selectedRestaurant.hours
                                    }
                                />

                                <ContactRow
                                    icon="call-outline"
                                    label="Телефон"
                                    value={
                                        selectedRestaurant.phone
                                    }
                                />

                            </View>

                        </View>

                        <SafeAreaView
                            edges={["bottom"]}
                            style={
                                styles.fixedFooter
                            }
                        >

                            <View
                                style={
                                    styles.sheetFooterActions
                                }
                            >

                                <Pressable
                                    onPress={
                                        handleCallPress
                                    }
                                    style={[
                                        styles.sheetActionButton,
                                        styles.callButton,
                                    ]}
                                >

                                    <Ionicons
                                        name="call"
                                        size={18}
                                        color={
                                            themeColors.textOnPrimary
                                        }
                                    />

                                    <Text
                                        style={
                                            styles.callButtonText
                                        }
                                    >
                                        Позвонить
                                    </Text>

                                </Pressable>

                                <Pressable
                                    onPress={
                                        handleWhatsAppPress
                                    }
                                    style={[
                                        styles.sheetActionButton,
                                        styles.whatsAppButton,
                                    ]}
                                >

                                    <Ionicons
                                        name="logo-whatsapp"
                                        size={18}
                                        color={
                                            themeColors.text
                                        }
                                    />

                                    <Text
                                        style={
                                            styles.whatsAppButtonText
                                        }
                                    >
                                        WhatsApp
                                    </Text>

                                </Pressable>

                            </View>

                        </SafeAreaView>

                    </View>

                )}

            </AppBottomSheetModal>

        </View>

    );

}

function ContactRow({
                        icon,
                        label,
                        value,
                    }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string | string[];
}) {
    const values = Array.isArray(value) ? value : [value];

    return (
        <View style={styles.contactRow}>
            <Text style={styles.contactLabel}>{label}</Text>
            {values.map((item) => (
                <Text key={item} style={styles.contactValue}>
                    {item}
                </Text>
            ))}
        </View>
    )

}

const styles = StyleSheet.create({

    section: {
        paddingHorizontal: 12,
        gap: 14,
    },

    restaurantsTitle: {
        color: themeColors.text,
        fontSize: 18,
        lineHeight: 22,
        fontFamily: "Point-Bold",
    },

    card: {
        borderRadius: 22,
        overflow: "hidden",
    },

    cardPressed: {
        opacity: 0.9,
    },

    imageWrap: {
        aspectRatio: 1.72,
        backgroundColor: themeColors.cardSecondary,
    },

    image: {
        width: "100%",
        height: "100%",
    },

    imagePlaceholder: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: themeColors.cardSecondary,
    },

    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
    },

    cardBody: {
        padding: 14,
    },

    title: {
        color: themeColors.text,
        fontSize: 16,
        fontFamily: "Point-Bold",
        letterSpacing: 0.8,
    },

    meta: {
        color: themeColors.textSecondary,
        fontFamily: "Point-Regular"
    },
    sheetContainer: {
        position: "relative",
    },

    sheetScrollableContent: {
        paddingBottom: 130,
    },

    sheetImageWrap: {
        aspectRatio: 1.72,
        borderRadius: 18,
        overflow: "hidden",
        backgroundColor: themeColors.cardSecondary,
    },

    sheetImage: {
        width: "100%",
        height: "100%",
    },

    sheetImagePlaceholder: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: themeColors.cardSecondary,
    },

    sheetSectionTitle: {
        marginTop: 18,
        color: themeColors.text,
        fontSize: 14,
        fontFamily: "Point-Bold",
        letterSpacing: 0.8,
    },

    sheetDescription: {
        marginTop: 16,
        color: themeColors.textSecondary,
        fontSize: 14,
        fontFamily: "Point-Regular",
        lineHeight: 18,
    },

    contacts: {
        gap: 10,
        marginTop: 10,
    },
    contactRow: {
        padding: 14,
        borderRadius: 12,
        backgroundColor:
        themeColors.cardSecondary,
    },

    contactLabel: {
        marginBottom: 4,
        color: themeColors.textSecondary,
        fontFamily: "Point-Regular",
        fontSize: 12,
    },

    contactValue: {
        color: themeColors.text,
        fontFamily: "Point-SemiBold",
        fontSize: 14,
    },

    fixedFooter: {
        position: "absolute",

        left: -16,
        right: -16,
        bottom: 0,

        paddingHorizontal: 16,
        paddingTop: 12,

        backgroundColor: themeColors.card,

        borderTopWidth: 1,

        borderTopColor: themeColors.cardBorder,
    },

    sheetFooterActions: {
        flexDirection: "row",
        gap: 10,
    },

    sheetActionButton: {
        flex: 1,

        height: 54,

        borderRadius: 14,

        justifyContent: "center",
        alignItems: "center",

        flexDirection: "row",

        gap: 8,
    },

    callButton: {
        backgroundColor:
        themeColors.primary,
    },

    whatsAppButton: {
        backgroundColor:
            "rgba(51,172,113,.15)",
    },

    callButtonText: {
        color: themeColors.textOnPrimary,
        fontSize: 14,
        fontFamily: "Point-Bold",
    },

    whatsAppButtonText: {
        color: themeColors.text,
        fontSize: 14,
        fontFamily: "Point-Bold",
    },

});
