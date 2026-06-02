import {Pressable, Text, View, StyleSheet} from "react-native";
import {router} from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import {themeColors} from "@/utils/theme-colors";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {useDeliveryStore} from "@/store/delivery-store";
import {useMemo} from "react";
import {useAddressStore} from "@/store/address-store";
import {Organizations} from "@/mocks/mocks-data";


export function Header (){

    const deliveryType = useDeliveryStore((state) => state.type);
    const addresses = useAddressStore((state) => state.addresses);
    const selectedAddressId = useAddressStore((state) => state.selectedAddressId);
    const sourceRestaurantId = useDeliveryStore((state) => state.sourceRestaurantId);


    const sourceRestaurant = useMemo(
        () =>
            Organizations.find((organization) => organization.id === sourceRestaurantId) ??
            Organizations[0] ??
            null,
        [sourceRestaurantId]
    );

    const selectedAddress = useMemo(
        () =>
            addresses.find((address) => address.id === selectedAddressId) ??
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
        <>
            <View style={styles.stickyTop}>
                <View style={styles.heroTop}>
                    <Pressable
                        style={styles.orderButton}
                        onPress={() =>
                            router.push({
                                pathname: "/order_type",
                                params: deliveryType ? {type: deliveryType} : undefined,
                            })
                        }
                    >
                        <View style={styles.orderIcon}>
                            <Ionicons
                                name="location-outline"
                                size={21}
                                color={themeColors.primary}
                            />
                        </View>

                        <View style={styles.orderTextWrap}>
                            <Text style={styles.orderTitle} numberOfLines={1}>
                                {orderTitle}
                            </Text>
                            <Text style={styles.orderSubtitle} numberOfLines={1}>
                                {orderTypeLabel}
                            </Text>
                        </View>

                        <MaterialCommunityIcons
                            name="chevron-down"
                            size={20}
                            color="rgba(255,255,255,0.72)"
                        />
                    </Pressable>

                    <Pressable style={styles.profileButton}>
                        <MaterialCommunityIcons
                            name="account-outline"
                            size={23}
                            color={themeColors.text}
                        />
                    </Pressable>
                </View>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    stickyTop: {
        zIndex: 20,
        elevation: 20,
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: "rgba(7,8,8,0.94)",
    },
    heroTop: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        zIndex: 2,
    },
    orderButton: {
        flex: 1,
        minHeight: 54,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
        backgroundColor: "rgba(10,10,9,0.58)",
    },
    orderIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(236,172,24,0.13)",
    },
    orderTextWrap: {
        flex: 1,
        minWidth: 0,
    },
    profileButton: {
        width: 52,
        height: 52,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
        backgroundColor: "rgba(10,10,9,0.58)",
    },
    orderTitle: {
        color: themeColors.text,
        fontSize: 15,
        lineHeight: 18,
        fontFamily: "Point-Bold",
    },
    orderSubtitle: {
        marginTop: 2,
        color: "rgba(255,255,255,0.58)",
        fontSize: 12,
        lineHeight: 14,
        fontFamily: "Point-Regular",
    },
})