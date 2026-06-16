import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Screen } from "@/components/ui/Screen";
import { useAddressStore } from "@/store/address-store";
import {
    CART_DELIVERY_FEE,
    CART_UTENSILS_PRICE,
    getCartItemsCount,
    getCartSubtotal,
    getCartTotal,
    useCartStore,
} from "@/store/cart-store";
import { useDeliveryStore, type SelectedDeliveryType } from "@/store/delivery-store";
import { SHADOW, themeColors } from "@/utils/theme-colors";
import { CartRow } from "@/features/screens/cart/CartRow";
import { formatPrice } from "@/utils/format_price";
import {useAppDataStore} from "@/store/app-data-store";

const TAB_BAR_HEIGHT = 24;
const FIXED_HEADER_HEIGHT = 80;
const FOOTER_EXTRA_SPACE = 220;

function padTime(value: number): string {
    return String(value).padStart(2, "0");
}

function formatTime(minutes: number): string {
    return `${padTime(Math.floor(minutes / 60))}:${padTime(minutes % 60)}`;
}

function formatOrderTime(
    deliveryTime: ReturnType<typeof useDeliveryStore.getState>["deliveryTime"]
): string {
    if (deliveryTime.mode === "asap" || !deliveryTime.selectedTime) {
        return "как можно скорее";
    }

    const { day, startMinutes } = deliveryTime.selectedTime;
    const dayLabel =
        day === "today"
            ? "Сегодня"
            : day === "tomorrow"
                ? "Завтра"
                : "Послезавтра";

    return `${dayLabel} в ${formatTime(startMinutes)}`;
}

function formatItemsCount(count: number): string {
    const lastTwoDigits = count % 100;
    const lastDigit = count % 10;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return `${count} товаров`;
    }

    if (lastDigit === 1) {
        return `${count} товар`;
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
        return `${count} товара`;
    }

    return `${count} товаров`;
}

function getOrderHeaderText({
                                deliveryType,
                                orderTime,
                                deliveryTarget,
                                takeawayTarget,
                            }: {
    deliveryType: SelectedDeliveryType;
    orderTime: string;
    deliveryTarget: string | null;
    takeawayTarget: string | null;
}) {
    if (deliveryType === "delivery") {
        return {
            title: `Курьером ${orderTime}`,
            subtitle: deliveryTarget ?? "Указать адрес доставки",
        };
    }

    if (deliveryType === "takeaway") {
        return {
            title: `Самовывоз ${orderTime}`,
            subtitle: takeawayTarget ?? "Выберите ресторан",
        };
    }

    return {
        title: "Выберите способ заказа",
        subtitle: "Доставка курьером или самовывоз",
    };
}

export function CartScreen() {
    const insets = useSafeAreaInsets();

    const items = useCartStore((state) => state.items);
    const addUtensils = useCartStore((state) => state.addUtensils);
    const incrementItem = useCartStore((state) => state.incrementItem);
    const decrementItem = useCartStore((state) => state.decrementItem);
    const setItemComment = useCartStore((state) => state.setItemComment);
    const clearCart = useCartStore((state) => state.clearCart);

    const deliveryType = useDeliveryStore((state) => state.type);
    const deliveryTime = useDeliveryStore((state) => state.deliveryTime);
    const sourceRestaurantId = useDeliveryStore((state) => state.sourceRestaurantId);
    const organizations = useAppDataStore((state) => state.organizations);
    const defaultDeliveryOrganization = useAppDataStore(
        (state) => state.defaultDeliveryOrganization
    );

    const addresses = useAddressStore((state) => state.addresses);
    const selectedAddressId = useAddressStore((state) => state.selectedAddressId);

    const [commentItemId, setCommentItemId] = useState<string | null>(null);

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

    const itemsCount = getCartItemsCount(items);
    const subtotal = getCartSubtotal(items);
    const total = getCartTotal(items, addUtensils);

    const orderHeader = getOrderHeaderText({
        deliveryType,
        orderTime: formatOrderTime(deliveryTime),
        deliveryTarget: selectedAddress?.shortAddress ?? null,
        takeawayTarget: sourceRestaurant
            ? `${sourceRestaurant.name}, ${sourceRestaurant.address}`
            : null,
    });

    if (items.length === 0) {
        return (
            <Screen withTopInset contentContainerStyle={styles.emptyRoot}>
                <View style={styles.emptyCard}>
                    <View style={styles.emptyIconWrap}>
                        <MaterialCommunityIcons
                            name="shopping-outline"
                            size={46}
                            color={themeColors.primary}
                        />
                    </View>

                    <Text style={styles.emptyTitle}>Корзина пуста</Text>
                    <Text style={styles.emptyText}>
                        Добавьте блюда из меню, и они появятся здесь перед оформлением.
                    </Text>

                    <Pressable
                        accessibilityRole="button"
                        style={({ pressed }) => [styles.emptyButton, pressed && styles.pressed]}
                        onPress={() => router.push("/menu")}
                    >
                        <Text style={styles.emptyButtonText}>Перейти в меню</Text>
                        <Ionicons name="arrow-forward" size={19} color={themeColors.textOnPrimary} />
                    </Pressable>
                </View>
            </Screen>
        );
    }

    return (
        <Screen withTopInset>
            <View style={styles.root}>
                <View style={styles.fixedHeader}>
                    <Pressable
                        accessibilityRole="button"
                        style={({ pressed }) => [styles.deliveryCard, pressed && styles.pressed]}
                        onPress={() =>
                            router.push({
                                pathname: "/order_type",
                                params: deliveryType ? { type: deliveryType } : undefined,
                            })
                        }
                    >
                        <View style={styles.deliveryTextWrap}>
                            <Text style={styles.deliveryLine} numberOfLines={1}>
                                {orderHeader.title}
                            </Text>
                            <Text style={styles.deliveryTarget} numberOfLines={1}>
                                {orderHeader.subtitle}
                            </Text>
                        </View>

                        <MaterialCommunityIcons
                            name="chevron-right"
                            size={24}
                            color={themeColors.text}
                        />
                    </Pressable>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={[
                        styles.content,
                        {
                            paddingTop: FIXED_HEADER_HEIGHT + 14,
                            paddingBottom: insets.bottom + TAB_BAR_HEIGHT + FOOTER_EXTRA_SPACE,
                        },
                    ]}
                >
                    <View style={styles.listHeader}>
                        <Text style={styles.itemsCount}>{formatItemsCount(itemsCount)}</Text>

                        <Pressable accessibilityRole="button" onPress={clearCart} hitSlop={10}>
                            <Text style={styles.clearText}>Очистить</Text>
                        </Pressable>
                    </View>

                    <View style={styles.itemsBlock}>
                        {items.map((item) => (
                            <CartRow
                                key={item.id}
                                item={item}
                                isCommentOpen={commentItemId === item.id}
                                onToggleComment={() =>
                                    setCommentItemId((current) => (current === item.id ? null : item.id))
                                }
                                onChangeComment={(comment) => setItemComment(item.id, comment)}
                                onIncrement={() => incrementItem(item.id)}
                                onDecrement={() => decrementItem(item.id)}
                            />
                        ))}
                    </View>
                </ScrollView>

                <View
                    pointerEvents="box-none"
                    style={[
                        styles.footer,
                        {
                            bottom: insets.bottom + TAB_BAR_HEIGHT,
                        },
                    ]}
                >
                    <View style={styles.summary}>
                        <SummaryRow label="Блюда в заказе" value={formatPrice(subtotal)} strong />
                        <SummaryRow label="Доставка" value={formatPrice(CART_DELIVERY_FEE)} />
                        {addUtensils ? (
                            <SummaryRow label="Приборы" value={formatPrice(CART_UTENSILS_PRICE)} />
                        ) : null}
                    </View>

                    <Pressable
                        accessibilityRole="button"
                        style={({ pressed }) => [styles.checkoutButton, pressed && styles.pressed]}
                        onPress={() => undefined}
                    >
                        <Text style={styles.checkoutText}>Оформить заказ на {formatPrice(total)}</Text>
                    </Pressable>
                </View>
            </View>
        </Screen>
    );
}

function SummaryRow({
                        label,
                        value,
                        strong = false,
                    }: {
    label: string;
    value: string;
    strong?: boolean;
}) {
    return (
        <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, strong && styles.summaryStrong]}>{label}</Text>
            <Text style={[styles.summaryValue, strong && styles.summaryStrong]}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: themeColors.background,
    },

    content: {
        paddingHorizontal: 16,
    },

    pressed: {
        opacity: 0.78,
    },

    emptyRoot: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },

    emptyCard: {
        width: "100%",
        alignItems: "center",
        paddingHorizontal: 22,
        paddingVertical: 30,
        borderRadius: 24,
        borderWidth: 1,
        ...SHADOW,
    },

    emptyIconWrap: {
        width: 92,
        height: 92,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 28,
        backgroundColor: themeColors.cardSecondary,
        borderWidth: 1,
        borderColor: themeColors.border,
    },

    emptyTitle: {
        marginTop: 20,
        color: themeColors.text,
        fontSize: 22,
        letterSpacing: 0.8,
        textAlign: "center",
        fontFamily: "Point-Bold",
    },

    emptyText: {
        marginTop: 10,
        color: themeColors.textSecondary,
        fontSize: 14,
        textAlign: "center",
        fontFamily: "Point-Regular",
    },

    emptyButton: {
        minHeight: 42,
        marginTop: 24,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderRadius: 12,
        backgroundColor: themeColors.primary,
    },

    emptyButtonText: {
        color: themeColors.textOnPrimary,
        fontSize: 14,
        fontFamily: "Point-Bold",
    },

    fixedHeader: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        elevation: 20,
        height: FIXED_HEADER_HEIGHT,
        justifyContent: "center",
        paddingHorizontal: 12,
        backgroundColor: themeColors.background,
    },

    deliveryCard: {
        minHeight: 58,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: themeColors.cardBorder,
        ...SHADOW,
    },

    deliveryTextWrap: {
        flex: 1,
        minWidth: 0,
    },

    deliveryLine: {
        color: themeColors.textSecondary,
        fontSize: 12,
        fontFamily: "Point-Regular",
    },

    deliveryTarget: {
        marginTop: 3,
        color: themeColors.text,
        fontSize: 14,
        fontFamily: "Point-Regular",
        letterSpacing: 0.8,
    },

    listHeader: {
        marginTop: 26,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    itemsCount: {
        color: themeColors.text,
        fontSize: 16,
        fontFamily: "Point-Bold",
        letterSpacing: 0.8,
    },

    clearText: {
        color: themeColors.notification,
        fontSize: 14,
        fontFamily: "Point-Bold",
        letterSpacing: 0.8,
    },

    itemsBlock: {
        marginTop: 8,
        gap: 12,
    },

    summary: {
        marginVertical: 24,
        gap: 8,
    },

    summaryRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },

    summaryLabel: {
        color: themeColors.textSecondary,
        fontSize: 16,
        fontFamily: "Point-Regular",
    },

    summaryValue: {
        color: themeColors.text,
        fontSize: 16,
        fontFamily: "Point-SemiBold",
    },

    summaryStrong: {
        color: themeColors.text,
        fontFamily: "Point-Bold",
    },

    footer: {
        position: "absolute",
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 16,
        backgroundColor: themeColors.background,
        borderTopWidth: 1,
        borderTopColor: themeColors.cardBorder,
        zIndex: 100,
        elevation: 100,
    },

    checkoutButton: {
        minHeight: 54,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        backgroundColor: themeColors.primary,
        ...SHADOW,
    },

    checkoutText: {
        color: themeColors.textOnPrimary,
        fontSize: 16,
        fontFamily: "Point-Bold",
    },
});
