import { Pressable, Text, View, StyleSheet } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { themeColors } from "@/utils/theme-colors";
import { useDeliveryStore } from "@/store/delivery-store";
import { useMemo } from "react";
import { useAddressStore } from "@/store/address-store";
import { Organizations } from "@/mocks/mocks-data";

export function Header() {
    const deliveryType = useDeliveryStore((state) => state.type);
    const addresses = useAddressStore((state) => state.addresses);
    const selectedAddressId = useAddressStore((state) => state.selectedAddressId);
    const sourceRestaurantId = useDeliveryStore((state) => state.sourceRestaurantId);

    const sourceRestaurant = useMemo(
        () =>
            Organizations.find((org) => org.id === sourceRestaurantId) ??
            Organizations[0] ??
            null,
        [sourceRestaurantId]
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
                ? "Навынос"
                : "Способ заказа";

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                {/* Order selector */}
                <Pressable
                    style={styles.orderButton}
                    onPress={() =>
                        router.push({
                            pathname: "/order_type",
                            params: deliveryType ? { type: deliveryType } : undefined,
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

                {/* Profile circle */}
                <Pressable style={styles.profileButton}>
                    <View style={styles.avatar} />
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
        paddingVertical: 10,
        paddingHorizontal: 10,

        borderRadius: 16,
        backgroundColor: "rgba(255,255,255,0.04)"
    },

    iconWrap: {
        width: 34,
        height: 34,
        alignItems: "center",
        justifyContent: "center",
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
    },

    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.15)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.25)",
    },
});