import {Image, Pressable, Text, View, StyleSheet} from "react-native";
import {router} from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {useMemo} from "react";

import {themeColors} from "@/utils/theme-colors";
import {resolveApiAssetUrl} from "@/services/api";
import {useDeliveryStore} from "@/store/delivery-store";
import {useAddressStore} from "@/store/address-store";
import {useAppDataStore} from "@/store/app-data-store";
import {openAuthSheet} from "@/features/auth/AuthSheetController";
import {isProfileAuthenticated, useProfileStore} from "@/store/profile-store";

export function Header() {
    const user = useProfileStore((state) => state.user);
    const deliveryType = useDeliveryStore((state) => state.type);
    const addresses = useAddressStore((state) => state.addresses);
    const selectedAddressId = useAddressStore((state) => state.selectedAddressId);
    const sourceRestaurantId = useDeliveryStore((state) => state.sourceRestaurantId);
    const organizations = useAppDataStore((state) => state.organizations);
    const defaultDeliveryOrganization = useAppDataStore(
        (state) => state.defaultDeliveryOrganization
    );
    const avatarUrl = resolveApiAssetUrl(user?.avatarUrl);

    const sourceRestaurant = useMemo(
        () =>
            organizations.find((org) =>
                org.id === sourceRestaurantId || org.slug === sourceRestaurantId
            ) ??
            defaultDeliveryOrganization ??
            organizations[0] ??
            null,
        [defaultDeliveryOrganization, organizations, sourceRestaurantId]
    );

    const selectedAddress = useMemo(
        () =>
            addresses.find((addr) => addr.id === selectedAddressId) ??
            addresses[0] ??
            null,
        [addresses, selectedAddressId]
    );

    const orderTitle =
        deliveryType === "delivery"
            ? selectedAddress?.shortAddress ?? "Указать адрес доставки"
            : deliveryType === "takeaway"
                ? sourceRestaurant?.name ?? "Выберите ресторан"
                : "Выберите способ заказа";

    const orderTypeLabel =
        deliveryType === "delivery"
            ? "Доставка"
            : deliveryType === "takeaway"
                ? "Самовывоз"
                : "Способ заказа";

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Pressable
                    style={styles.orderButton}
                    onPress={() =>
                        router.push({
                            pathname: "/order_type",
                            params: deliveryType ? {type: deliveryType} : undefined,
                        })
                    }
                >
                    <View style={styles.iconWrap}>
                        <Ionicons
                            name="location-outline"
                            size={20}
                            color={themeColors.text}
                        />
                    </View>

                    <View style={styles.textWrap}>
                        <Text style={styles.title} numberOfLines={1}>
                            {orderTitle}
                        </Text>
                        <Text style={styles.subtitle} numberOfLines={1}>
                            {orderTypeLabel}
                        </Text>
                    </View>

                    <MaterialCommunityIcons
                        name="chevron-down"
                        size={20}
                        color={themeColors.text}
                    />
                </Pressable>

                <Pressable
                    style={styles.profileButton}
                    onPress={() => {
                        if (isProfileAuthenticated()) {
                            router.push("/profile");
                            return;
                        }

                        openAuthSheet({
                            onSuccess: () => router.push("/profile"),
                        });
                    }}
                >
                    <View style={[styles.avatar, user && styles.avatarAuthenticated]}>
                        {avatarUrl ? (
                            <Image
                                source={{uri: avatarUrl}}
                                style={styles.avatarImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <MaterialCommunityIcons
                                name={user ? "account" : "account-outline"}
                                size={22}
                                color={user ? themeColors.textOnPrimary : themeColors.text}
                            />
                        )}
                    </View>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 12,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    orderButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 11,
        paddingHorizontal: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.09)",
        backgroundColor: "rgba(8,9,9,0.72)",
    },
    iconWrap: {
        width: 34,
        height: 34,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(236,172,24,0.22)",
        backgroundColor: "rgba(236,172,24,0.10)",
    },
    textWrap: {
        flex: 1,
        minWidth: 0,
    },
    title: {
        color: themeColors.text,
        fontSize: 15,
        lineHeight: 18,
        fontFamily: "Point-Bold",
    },
    subtitle: {
        marginTop: 2,
        color: themeColors.textSecondary,
        fontSize: 12,
        lineHeight: 14,
        fontFamily: "Point-Regular",
    },
    profileButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.16)",
        backgroundColor: "rgba(8,9,9,0.58)",
    },
    avatar: {
        width: 36,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.15)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.25)",
    },
    avatarAuthenticated: {
        backgroundColor: themeColors.primary,
        borderColor: "rgba(236,172,24,0.85)",
    },
    avatarImage: {
        width: "100%",
        height: "100%",
        borderRadius: 18,
    },
});
