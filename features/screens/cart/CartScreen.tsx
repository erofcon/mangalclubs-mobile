import {Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import {router} from "expo-router";
import {useMemo, useState} from "react";
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";

import {Screen} from "@/components/ui/Screen";
import {Organizations} from "@/mocks/mocks-data";
import {useAddressStore} from "@/store/address-store";
import {
    CART_DELIVERY_FEE,
    CART_UTENSILS_PRICE,
    getCartItemsCount,
    getCartSubtotal,
    getCartTotal,
    useCartStore,
    type CartItem,
} from "@/store/cart-store";
import {useDeliveryStore, type SelectedDeliveryType} from "@/store/delivery-store";
import {SHADOW, themeColors} from "@/utils/theme-colors";

const TAB_BAR_HEIGHT = 64;
const FIXED_HEADER_HEIGHT = 94;
const DELIVERY_SLOT_STEP = 15;

const formatPrice = (price: number) => `${price.toLocaleString("ru-RU")} ₽`;

function padTime(value: number): string {
    return String(value).padStart(2, "0");
}

function formatTime(minutes: number): string {
    return `${padTime(Math.floor(minutes / 60))}:${padTime(minutes % 60)}`;
}

function formatOrderTime(deliveryTime: ReturnType<typeof useDeliveryStore.getState>["deliveryTime"]): string {
    if (deliveryTime.mode === "asap" || !deliveryTime.selectedTime) {
        return "как можно скорее";
    }

    const {day, startMinutes} = deliveryTime.selectedTime;
    const dayLabel = day === "today" ? "Сегодня" : "Завтра";

    return `${dayLabel} в ${formatTime(startMinutes)}-${formatTime(startMinutes + DELIVERY_SLOT_STEP)}`;
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
    const promoCode = useCartStore((state) => state.promoCode);
    const addUtensils = useCartStore((state) => state.addUtensils);
    const addBread = useCartStore((state) => state.addBread);
    const incrementItem = useCartStore((state) => state.incrementItem);
    const decrementItem = useCartStore((state) => state.decrementItem);
    const setItemComment = useCartStore((state) => state.setItemComment);
    const setPromoCode = useCartStore((state) => state.setPromoCode);
    const toggleUtensils = useCartStore((state) => state.toggleUtensils);
    const toggleBread = useCartStore((state) => state.toggleBread);
    const clearCart = useCartStore((state) => state.clearCart);
    const deliveryType = useDeliveryStore((state) => state.type);
    const deliveryTime = useDeliveryStore((state) => state.deliveryTime);
    const sourceRestaurantId = useDeliveryStore((state) => state.sourceRestaurantId);
    const addresses = useAddressStore((state) => state.addresses);
    const selectedAddressId = useAddressStore((state) => state.selectedAddressId);
    const [isPromoOpen, setIsPromoOpen] = useState(false);
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
            Organizations.find((organization) => organization.id === sourceRestaurantId) ??
            Organizations[0] ??
            null,
        [sourceRestaurantId]
    );

    const itemsCount = getCartItemsCount(items);
    const subtotal = getCartSubtotal(items);
    const total = getCartTotal(items, addUtensils);
    const orderHeader = getOrderHeaderText({
        deliveryType,
        orderTime: formatOrderTime(deliveryTime),
        deliveryTarget: selectedAddress?.shortAddress ?? null,
        takeawayTarget: sourceRestaurant?.address ?? null,
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
                        Добавьте любимые блюда из меню, и они появятся здесь перед оформлением.
                    </Text>

                    <Pressable
                        accessibilityRole="button"
                        style={({pressed}) => [styles.emptyButton, pressed && styles.pressed]}
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
                        style={({pressed}) => [styles.deliveryCard, pressed && styles.pressed]}
                        onPress={() =>
                            router.push({
                                pathname: "/order_type",
                                params: deliveryType ? {type: deliveryType} : undefined,
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
                            paddingBottom: insets.bottom + TAB_BAR_HEIGHT + 118,
                        },
                    ]}
                >
                    <View style={styles.listHeader}>
                        <Text style={styles.itemsCount}>{formatItemsCount(itemsCount)}</Text>

                        <Pressable
                            accessibilityRole="button"
                            onPress={clearCart}
                            hitSlop={10}
                        >
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
                                    setCommentItemId((current) =>
                                        current === item.id ? null : item.id
                                    )
                                }
                                onChangeComment={(comment) => setItemComment(item.id, comment)}
                                onIncrement={() => incrementItem(item.id)}
                                onDecrement={() => decrementItem(item.id)}
                            />
                        ))}
                    </View>

                    <View style={styles.section}>
                        <Pressable
                            accessibilityRole="button"
                            style={styles.actionRow}
                            onPress={() => setIsPromoOpen((current) => !current)}
                        >
                            <Text style={styles.actionText}>Ввести промокод</Text>
                            <MaterialCommunityIcons
                                name={isPromoOpen ? "chevron-up" : "chevron-right"}
                                size={24}
                                color={themeColors.text}
                            />
                        </Pressable>

                        {isPromoOpen ? (
                            <TextInput
                                value={promoCode}
                                onChangeText={setPromoCode}
                                placeholder="Промокод"
                                placeholderTextColor={themeColors.textMuted}
                                autoCapitalize="characters"
                                style={styles.promoInput}
                            />
                        ) : null}
                    </View>

                    <View style={styles.options}>
                        <CheckRow
                            title="Добавить приборы"
                            subtitle={`+${CART_UTENSILS_PRICE} ₽ к сумме заказа`}
                            checked={addUtensils}
                            onPress={toggleUtensils}
                        />

                        <CheckRow
                            title="Добавить хлеб"
                            checked={addBread}
                            onPress={toggleBread}
                        />
                    </View>

                    <View style={styles.summary}>
                        <SummaryRow label="Блюда в заказе" value={formatPrice(subtotal)} strong />
                        <SummaryRow label="Доставка" value={formatPrice(CART_DELIVERY_FEE)} />
                        {addUtensils ? (
                            <SummaryRow label="Приборы" value={formatPrice(CART_UTENSILS_PRICE)} />
                        ) : null}
                    </View>
                </ScrollView>

                <View
                    pointerEvents="box-none"
                    style={[
                        styles.footer,
                        {bottom: insets.bottom + TAB_BAR_HEIGHT},
                    ]}
                >
                    <Pressable
                        accessibilityRole="button"
                        style={({pressed}) => [styles.checkoutButton, pressed && styles.pressed]}
                        onPress={() => undefined}
                    >
                        <Text style={styles.checkoutText}>
                            Оформить заказ на {formatPrice(total)}
                        </Text>
                    </Pressable>
                </View>
            </View>
        </Screen>
    );
}

function CartRow({
    item,
    isCommentOpen,
    onToggleComment,
    onChangeComment,
    onIncrement,
    onDecrement,
}: {
    item: CartItem;
    isCommentOpen: boolean;
    onToggleComment: () => void;
    onChangeComment: (comment: string) => void;
    onIncrement: () => void;
    onDecrement: () => void;
}) {
    return (
        <View style={styles.cartRowWrap}>
            <View style={styles.cartRow}>
                <View style={styles.itemImageWrap}>
                    {item.image ? (
                        <Image source={item.image} style={styles.itemImage} resizeMode="cover" />
                    ) : (
                        <MaterialCommunityIcons
                            name="food"
                            size={32}
                            color={themeColors.textSecondary}
                        />
                    )}
                </View>

                <View style={styles.itemBody}>
                    <Text style={styles.itemTitle} numberOfLines={2}>
                        {item.name}
                    </Text>

                    <View style={styles.itemControls}>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Комментарий к блюду"
                            style={[styles.noteButton, item.comment && styles.noteButtonActive]}
                            onPress={onToggleComment}
                            hitSlop={8}
                        >
                            <Ionicons
                                name="chatbubble-outline"
                                size={18}
                                color={item.comment ? themeColors.primary : themeColors.text}
                            />
                        </Pressable>

                        <View style={styles.quantityControl}>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Уменьшить количество"
                                style={styles.quantityButton}
                                onPress={onDecrement}
                                hitSlop={8}
                            >
                                <Ionicons name="remove" size={18} color={themeColors.text} />
                            </Pressable>

                            <Text style={styles.quantityText}>{item.quantity}</Text>

                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Увеличить количество"
                                style={styles.quantityButton}
                                onPress={onIncrement}
                                hitSlop={8}
                            >
                                <Ionicons name="add" size={19} color={themeColors.text} />
                            </Pressable>
                        </View>
                    </View>
                </View>

                <Text style={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</Text>
            </View>

            {isCommentOpen ? (
                <TextInput
                    value={item.comment}
                    onChangeText={onChangeComment}
                    placeholder="Комментарий к блюду"
                    placeholderTextColor={themeColors.textMuted}
                    multiline
                    style={styles.commentInput}
                />
            ) : null}
        </View>
    );
}

function CheckRow({
    title,
    subtitle,
    checked,
    onPress,
}: {
    title: string;
    subtitle?: string;
    checked: boolean;
    onPress: () => void;
}) {
    return (
        <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{checked}}
            style={({pressed}) => [styles.checkRow, pressed && styles.pressed]}
            onPress={onPress}
        >
            <View style={styles.checkTextWrap}>
                <Text style={styles.checkTitle}>{title}</Text>
                {subtitle ? <Text style={styles.checkSubtitle}>{subtitle}</Text> : null}
            </View>

            <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                {checked ? (
                    <Ionicons name="checkmark" size={16} color={themeColors.textOnPrimary} />
                ) : null}
            </View>
        </Pressable>
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
        backgroundColor: themeColors.card,
        borderWidth: 1,
        borderColor: themeColors.cardBorder,
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
        fontSize: 25,
        lineHeight: 30,
        textAlign: "center",
        fontFamily: "Point-Bold",
    },

    emptyText: {
        marginTop: 10,
        color: themeColors.textSecondary,
        fontSize: 15,
        lineHeight: 21,
        textAlign: "center",
        fontFamily: "Point-Regular",
    },

    emptyButton: {
        minHeight: 52,
        marginTop: 24,
        paddingHorizontal: 22,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderRadius: 14,
        backgroundColor: themeColors.primary,
    },

    emptyButtonText: {
        color: themeColors.textOnPrimary,
        fontSize: 16,
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
        paddingHorizontal: 16,
        paddingBottom: 10,
        backgroundColor: themeColors.background,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: themeColors.cardBorder,
    },

    deliveryCard: {
        minHeight: 68,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 17,
        backgroundColor: themeColors.card,
        borderWidth: 1,
        borderColor: themeColors.border,
        ...SHADOW,
    },

    deliveryTextWrap: {
        flex: 1,
        minWidth: 0,
    },

    deliveryLine: {
        color: themeColors.primary,
        fontSize: 13,
        fontFamily: "Point-Bold",
    },

    deliveryTarget: {
        marginTop: 3,
        color: themeColors.text,
        fontSize: 15,
        fontFamily: "Point-Bold",
    },

    listHeader: {
        marginTop: 26,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    itemsCount: {
        color: themeColors.text,
        fontSize: 18,
        fontFamily: "Point-SemiBold",
    },

    clearText: {
        color: themeColors.notification,
        fontSize: 15,
        fontFamily: "Point-Bold",
    },

    itemsBlock: {
        marginTop: 8,
        gap: 12,
    },

    cartRowWrap: {
        paddingVertical: 8,
    },

    cartRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },

    itemImageWrap: {
        width: 78,
        height: 78,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 15,
        overflow: "hidden",
        backgroundColor: themeColors.card,
        borderWidth: 1,
        borderColor: themeColors.cardBorder,
    },

    itemImage: {
        width: "100%",
        height: "100%",
    },

    itemBody: {
        flex: 1,
        minWidth: 0,
    },

    itemTitle: {
        color: themeColors.text,
        fontSize: 15,
        lineHeight: 19,
        fontFamily: "Point-Bold",
    },

    itemControls: {
        marginTop: 9,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },

    noteButton: {
        width: 34,
        height: 34,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 17,
        backgroundColor: themeColors.card,
        borderWidth: 1,
        borderColor: themeColors.cardBorder,
    },

    noteButtonActive: {
        borderColor: themeColors.primary,
    },

    quantityControl: {
        height: 34,
        minWidth: 92,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 8,
        borderRadius: 17,
        backgroundColor: themeColors.cardSecondary,
        borderWidth: 1,
        borderColor: themeColors.cardBorder,
    },

    quantityButton: {
        width: 26,
        height: 26,
        alignItems: "center",
        justifyContent: "center",
    },

    quantityText: {
        minWidth: 20,
        color: themeColors.text,
        fontSize: 15,
        textAlign: "center",
        fontFamily: "Point-Bold",
    },

    itemPrice: {
        minWidth: 70,
        color: themeColors.text,
        fontSize: 15,
        textAlign: "right",
        fontFamily: "Point-SemiBold",
    },

    commentInput: {
        minHeight: 72,
        marginTop: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        color: themeColors.text,
        fontSize: 15,
        lineHeight: 20,
        textAlignVertical: "top",
        fontFamily: "Point-Regular",
        borderRadius: 14,
        backgroundColor: themeColors.card,
        borderWidth: 1,
        borderColor: themeColors.cardBorder,
    },

    section: {
        marginTop: 4,
    },

    actionRow: {
        minHeight: 52,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    actionText: {
        color: themeColors.text,
        fontSize: 16,
        fontFamily: "Point-Regular",
    },

    promoInput: {
        height: 48,
        paddingHorizontal: 14,
        color: themeColors.text,
        fontSize: 15,
        fontFamily: "Point-SemiBold",
        borderRadius: 14,
        backgroundColor: themeColors.card,
        borderWidth: 1,
        borderColor: themeColors.cardBorder,
    },

    options: {
        marginTop: 10,
        gap: 12,
    },

    checkRow: {
        minHeight: 48,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
    },

    checkTextWrap: {
        flex: 1,
        minWidth: 0,
    },

    checkTitle: {
        color: themeColors.text,
        fontSize: 16,
        fontFamily: "Point-Bold",
    },

    checkSubtitle: {
        marginTop: 3,
        color: themeColors.textSecondary,
        fontSize: 15,
        fontFamily: "Point-SemiBold",
    },

    checkbox: {
        width: 24,
        height: 24,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 5,
        borderWidth: 2,
        borderColor: themeColors.textSecondary,
    },

    checkboxChecked: {
        borderColor: themeColors.primary,
        backgroundColor: themeColors.primary,
    },

    summary: {
        marginTop: 24,
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
        paddingBottom: 12,
        backgroundColor: themeColors.background,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: themeColors.cardBorder,
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
