import {MaterialCommunityIcons} from "@expo/vector-icons";
import {router} from "expo-router";
import {useMemo} from "react";
import {Pressable, StyleSheet, Text, View} from "react-native";
import Animated, {
    Extrapolation,
    interpolate,
    type SharedValue,
    useAnimatedStyle,
} from "react-native-reanimated";
import {SafeAreaView} from "react-native-safe-area-context";

import {useAddressStore} from "@/store/address-store";
import {useDeliveryStore} from "@/store/delivery-store";
import {useAppDataStore} from "@/store/app-data-store";
import {themeColors} from "@/utils/theme-colors";

const HEADER_COLLAPSE_DISTANCE = 270;

type Props = {
    scrollY: SharedValue<number>;
};

export function OrderType({scrollY}: Props) {
    const deliveryType = useDeliveryStore((state) => state.type);
    const sourceRestaurantId = useDeliveryStore((state) => state.sourceRestaurantId);
    const addresses = useAddressStore((state) => state.addresses);
    const selectedAddressId = useAddressStore((state) => state.selectedAddressId);
    const organizations = useAppDataStore((state) => state.organizations);
    const defaultDeliveryOrganization = useAppDataStore(
        (state) => state.defaultDeliveryOrganization
    );

    const selectedAddress = useMemo(
        () =>
            addresses.find((address) => address.id === selectedAddressId) ??
            addresses[0] ??
            null,
        [addresses, selectedAddressId]
    );

    const sourceRestaurant = useMemo(
        () =>
            organizations.find((organization) =>
                organization.id === sourceRestaurantId ||
                organization.slug === sourceRestaurantId
            ) ??
            defaultDeliveryOrganization ??
            organizations[0] ??
            null,
        [defaultDeliveryOrganization, organizations, sourceRestaurantId]
    );

    const orderTargetText =
        deliveryType === "delivery"
            ? selectedAddress?.shortAddress ?? "Указать адрес доставки"
            : deliveryType === "takeaway"
                ? sourceRestaurant?.name ?? "Выберите ресторан"
                : "Выберите способ заказа";

    const openOrderTypeScreen = (type?: "delivery" | "takeaway") => {
        router.push({
            pathname: "/order_type",
            params: type ? {type} : deliveryType ? {type: deliveryType} : undefined,
        });
    };

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
        <SafeAreaView>
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
                                <Pressable
                                    onPress={() => openOrderTypeScreen("delivery")}
                                    style={[
                                        styles.segmentButton,
                                        deliveryType === "delivery" && styles.segmentActive,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.segmentText,
                                            deliveryType === "delivery" && styles.segmentActiveText,
                                        ]}
                                    >
                                        Доставка
                                    </Text>
                                </Pressable>

                                <Pressable
                                    onPress={() => openOrderTypeScreen("takeaway")}
                                    style={[
                                        styles.segmentButton,
                                        deliveryType === "takeaway" && styles.segmentActive,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.segmentText,
                                            deliveryType === "takeaway" && styles.segmentActiveText,
                                        ]}
                                    >
                                        Самовывоз
                                    </Text>
                                </Pressable>
                            </View>
                        </Animated.View>
                    </Animated.View>

                    <Pressable style={styles.addressRow} onPress={() => openOrderTypeScreen()}>
                        <Text style={styles.addressText} numberOfLines={1}>
                            {orderTargetText}
                        </Text>

                        <MaterialCommunityIcons
                            name="chevron-right"
                            size={22}
                            color={themeColors.text}
                        />
                    </Pressable>
                </View>
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 12,
        backgroundColor: themeColors.background,
    },
    card: {
        padding: 7,
        borderRadius: 20,
        backgroundColor: "#11110f",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
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
        backgroundColor: themeColors.background,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.07)",
    },
    segmentButton: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
    },
    segmentActive: {
        backgroundColor: themeColors.primary,
    },
    segmentText: {
        color: themeColors.text,
        fontSize: 14,
        fontFamily: "Point-SemiBold",
        opacity: 0.82,
    },
    segmentActiveText: {
        color: themeColors.textOnPrimary,
        opacity: 1,
    },
    addressRow: {
        minHeight: 48,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        paddingHorizontal: 11,
    },
    addressText: {
        flex: 1,
        minWidth: 0,
        color: themeColors.text,
        fontSize: 14,
        lineHeight: 18,
        fontFamily: "Point-SemiBold",
    },
});
