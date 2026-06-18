import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Keyboard, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import {useQueryClient} from "@tanstack/react-query";

import { OrderAvailabilityBar } from "@/components/OrderAvailabilityBar";
import { Screen } from "@/components/ui/Screen";
import {openAuthSheet} from "@/features/auth/AuthSheetController";
import { checkDeliveryZone } from "@/services/delivery-zones";
import { isOrganizationUnavailable } from "@/services/availability";
import { useAddressStore, type SavedAddress } from "@/store/address-store";
import { createOrder, getOrderStatus, LAST_ORDER_ID_STORAGE_KEY, type OrderCreatePayload } from "@/services/orders";
import {
    CART_UTENSILS_PRICE,
    getCartItemsCount,
    getCartSubtotal,
    getCartTotal,
    useCartStore,
} from "@/store/cart-store";
import { useDeliveryStore, type SelectedDeliveryType } from "@/store/delivery-store";
import {isProfileAuthenticated} from "@/store/profile-store";
import { SHADOW, themeColors } from "@/utils/theme-colors";
import { CartRow } from "@/features/screens/cart/CartRow";
import { formatPrice } from "@/utils/format_price";
import {useAppDataStore} from "@/store/app-data-store";
import {currentOrdersQueryKey, historyOrdersQueryKey, unreadNotificationsQueryKey} from "@/services/notifications";

const TAB_BAR_HEIGHT = 24;
const FIXED_HEADER_HEIGHT = 80;
const FOOTER_EXTRA_SPACE = 220;
const PAYMENT_RETURN_PATH = "order-payment";
const terminalPaidStatuses = new Set(["paid", "PaymentConfirmed", "Success"]);
const terminalFailedStatuses = new Set([
    "payment_failed",
    "payment_cancelled",
    "payment_expired",
    "PaymentFailed",
    "PaymentExpired",
]);

function getPaymentReturnUrl(result: "success" | "fail"): string {
    return Linking.createURL(`${PAYMENT_RETURN_PATH}/${result}`);
}

function getReturnResult(url?: string | null): "success" | "fail" | null {
    if (!url) {
        return null;
    }

    try {
        const path = Linking.parse(url).path ?? "";

        if (path.includes(`${PAYMENT_RETURN_PATH}/success`)) {
            return "success";
        }

        if (path.includes(`${PAYMENT_RETURN_PATH}/fail`)) {
            return "fail";
        }
    } catch {
        return null;
    }

    return null;
}

function getOrderStatusOutcome(status?: string | null): "paid" | "failed" | "pending" {
    if (status && terminalPaidStatuses.has(status)) {
        return "paid";
    }

    if (status && terminalFailedStatuses.has(status)) {
        return "failed";
    }

    return "pending";
}

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

function addDays(date: Date, days: number): Date {
    const nextDate = new Date(date);

    nextDate.setDate(nextDate.getDate() + days);

    return nextDate;
}

function buildCompleteBefore(
    deliveryTime: ReturnType<typeof useDeliveryStore.getState>["deliveryTime"]
): string {
    const now = new Date();

    if (deliveryTime.mode === "scheduled" && deliveryTime.selectedTime) {
        const {day, startMinutes} = deliveryTime.selectedTime;
        const dayOffset =
            day === "tomorrow"
                ? 1
                : day === "dayAfterTomorrow"
                    ? 2
                    : 0;
        const scheduledAt = addDays(now, dayOffset);

        scheduledAt.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);

        return scheduledAt.toISOString();
    }

    const asapDate = new Date(now);
    asapDate.setMinutes(asapDate.getMinutes() + 30, 0, 0);

    return asapDate.toISOString();
}

function splitAddressFallback(address: SavedAddress) {
    const parts = address.address
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);

    return {
        city: address.city || parts[0] || "Грозный",
        street: parts[0] || address.address || address.shortAddress,
        house: address.house || parts[1] || "",
    };
}

function buildDeliveryAddress(address: SavedAddress) {
    const fallback = splitAddressFallback(address);

    return {
        city: address.city || fallback.city,
        street: fallback.street,
        house: address.house || fallback.house,
    };
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
    const queryClient = useQueryClient();

    const items = useCartStore((state) => state.items);
    const addUtensils = useCartStore((state) => state.addUtensils);
    const orderComment = useCartStore((state) => state.orderComment);
    const incrementItem = useCartStore((state) => state.incrementItem);
    const decrementItem = useCartStore((state) => state.decrementItem);
    const setItemComment = useCartStore((state) => state.setItemComment);
    const setOrderComment = useCartStore((state) => state.setOrderComment);
    const clearCart = useCartStore((state) => state.clearCart);

    const deliveryType = useDeliveryStore((state) => state.type);
    const deliveryTime = useDeliveryStore((state) => state.deliveryTime);
    const sourceRestaurantId = useDeliveryStore((state) => state.sourceRestaurantId);
    const organizations = useAppDataStore((state) => state.organizations);
    const defaultDeliveryOrganization = useAppDataStore(
        (state) => state.defaultDeliveryOrganization
    );
    const availabilityByOrganizationId = useAppDataStore(
        (state) => state.availabilityByOrganizationId
    );

    const addresses = useAddressStore((state) => state.addresses);
    const selectedAddressId = useAddressStore((state) => state.selectedAddressId);

    const [commentItemId, setCommentItemId] = useState<string | null>(null);
    const [availabilityBarHeight, setAvailabilityBarHeight] = useState(0);
    const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
    const [isDeliveryFeeLoading, setIsDeliveryFeeLoading] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [checkoutError, setCheckoutError] = useState("");
    const [keyboardHeight, setKeyboardHeight] = useState(0);

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
    const isDeliveryOrder = deliveryType === "delivery";
    const deliveryFeeForTotal = isDeliveryOrder && deliveryFee !== null ? deliveryFee : 0;
    const total = getCartTotal(items, addUtensils, deliveryFeeForTotal);
    const topChromeHeight = availabilityBarHeight > 0 ? availabilityBarHeight : insets.top;
    const isCurrentOrderUnavailable = isOrganizationUnavailable(
        sourceRestaurant,
        availabilityByOrganizationId
    );
    const hasMissingDeliveryFee = isDeliveryOrder && deliveryFee === null;
    const isCheckoutDisabled =
        isCurrentOrderUnavailable || hasMissingDeliveryFee || !deliveryType || isCheckingOut;
    const checkoutText = isCurrentOrderUnavailable
        ? "Заказы сейчас недоступны"
        : isCheckingOut
            ? "Открываем оплату..."
        : !deliveryType
            ? "Выберите способ заказа"
        : hasMissingDeliveryFee
            ? "Уточните адрес доставки"
            : `Оформить заказ на ${formatPrice(total)}`;
    const deliveryFeeText =
        isDeliveryFeeLoading && deliveryFee === null
            ? "Уточняем"
            : deliveryFee !== null
                ? formatPrice(deliveryFee)
                : "Уточните адрес";
    const footerBottom =
        keyboardHeight > 0
            ? Math.max(8, keyboardHeight - insets.bottom + 8)
            : insets.bottom + TAB_BAR_HEIGHT;

    const orderHeader = getOrderHeaderText({
        deliveryType,
        orderTime: formatOrderTime(deliveryTime),
        deliveryTarget: selectedAddress?.shortAddress ?? null,
        takeawayTarget: sourceRestaurant
            ? `${sourceRestaurant.name}, ${sourceRestaurant.address}`
            : null,
    });

    const buildOrderPayload = (): OrderCreatePayload | null => {
        if (!deliveryType) {
            router.push("/order_type");
            return null;
        }

        if (isDeliveryOrder && !selectedAddress) {
            router.push({
                pathname: "/order_type",
                params: {type: "delivery"},
            });
            return null;
        }

        if (!sourceRestaurant) {
            router.push({
                pathname: "/order_type",
                params: {type: deliveryType},
            });
            return null;
        }

        const payload: OrderCreatePayload = {
            orderType: isDeliveryOrder ? "delivery" : "pickup",
            comment: orderComment.trim() || undefined,
            completeBefore: buildCompleteBefore(deliveryTime),
            guestsCount: 1,
            items: items.map((item) => ({
                productId: item.id,
                amount: item.quantity,
                price: item.price,
                productSizeId: item.size_id ?? undefined,
                comment: item.comment?.trim() || undefined,
                modifiers: [],
            })),
            successUrl: getPaymentReturnUrl("success"),
            failUrl: getPaymentReturnUrl("fail"),
        };

        if (isDeliveryOrder && selectedAddress) {
            const deliveryAddress = buildDeliveryAddress(selectedAddress);

            payload.deliveryPoint = {
                address: {
                    city: deliveryAddress.city,
                    street: deliveryAddress.street,
                    house: deliveryAddress.house,
                },
                coordinates: {
                    latitude: selectedAddress.latitude,
                    longitude: selectedAddress.longitude,
                },
            };
        } else {
            payload.organizationId = sourceRestaurant.id;
            payload.organizationSlug = sourceRestaurant.slug;
        }

        return payload;
    };

    const handleCheckout = async () => {
        setCheckoutError("");

        if (!isProfileAuthenticated()) {
            openAuthSheet({
                onSuccess: () => {
                    void handleCheckout();
                },
            });
            return;
        }

        if (isCheckoutDisabled) {
            return;
        }

        const payload = buildOrderPayload();

        if (!payload) {
            return;
        }

        setIsCheckingOut(true);

        try {
            if (payload.orderType === "delivery" && payload.deliveryPoint) {
                const deliveryCheck = await checkDeliveryZone({
                    coordinates: payload.deliveryPoint.coordinates,
                    organizationSlug: defaultDeliveryOrganization?.slug,
                });

                if (!deliveryCheck.available || deliveryCheck.price === null) {
                    throw new Error(
                        deliveryCheck.reason === "outside_delivery_area"
                            ? "Адрес вне зоны доставки."
                            : "Доставка по этому адресу недоступна."
                    );
                }

                setDeliveryFee(deliveryCheck.price);
            }

            const createdOrder = await createOrder(payload);
            const paymentUrl = createdOrder.payment?.paymentUrl;

            if (!paymentUrl) {
                throw new Error("Не удалось получить ссылку на оплату.");
            }

            await AsyncStorage.setItem(LAST_ORDER_ID_STORAGE_KEY, createdOrder.id);

            const result = await WebBrowser.openAuthSessionAsync(
                paymentUrl,
                getPaymentReturnUrl("success")
            );
            const returnResult = result.type === "success"
                ? getReturnResult(result.url)
                : null;

            if (returnResult === "fail") {
                throw new Error("Оплата не прошла. Продолжить оплату можно в профиле.");
            }

            if (returnResult !== "success") {
                Alert.alert(
                    "Заказ создан",
                    "Оплата еще не подтверждена. Продолжить оплату можно в профиле."
                );
                void queryClient.invalidateQueries({queryKey: currentOrdersQueryKey});
                void queryClient.invalidateQueries({queryKey: unreadNotificationsQueryKey});
                router.push("/profile");
                return;
            }

            const status = await getOrderStatus(createdOrder.id).catch(() => null);
            const statusOutcome = getOrderStatusOutcome(
                status?.paymentStatus ?? createdOrder.paymentStatus
            );

            if (statusOutcome === "failed") {
                throw new Error("Банк отклонил оплату. Попробуйте еще раз.");
            }

            clearCart();
            void queryClient.invalidateQueries({queryKey: currentOrdersQueryKey});
            void queryClient.invalidateQueries({queryKey: historyOrdersQueryKey});
            void queryClient.invalidateQueries({queryKey: unreadNotificationsQueryKey});
            Alert.alert(
                "Оплата принята",
                `Заказ ${createdOrder.publicNumber} создан. После подтверждения оплаты он автоматически уйдет в ресторан.`
            );
            router.push("/profile");
        } catch (error) {
            const message = error instanceof Error
                ? error.message
                : "Не удалось оформить заказ.";

            setCheckoutError(message);
            Alert.alert("Оформление заказа", message);
        } finally {
            setIsCheckingOut(false);
        }
    };

    useEffect(() => {
        if (!isDeliveryOrder) {
            setDeliveryFee(0);
            setIsDeliveryFeeLoading(false);
            return;
        }

        if (!selectedAddress) {
            setDeliveryFee(null);
            setIsDeliveryFeeLoading(false);
            return;
        }

        setDeliveryFee(selectedAddress.deliveryPrice ?? null);
        setIsDeliveryFeeLoading(true);

        const controller = new AbortController();

        checkDeliveryZone(
            {
                coordinates: {
                    latitude: selectedAddress.latitude,
                    longitude: selectedAddress.longitude,
                },
                organizationSlug: defaultDeliveryOrganization?.slug,
            },
            controller.signal
        )
            .then((deliveryCheck) => {
                if (!deliveryCheck.available || deliveryCheck.price === null) {
                    setDeliveryFee(null);
                    return;
                }

                setDeliveryFee(deliveryCheck.price);
            })
            .catch(() => {
                if (!controller.signal.aborted) {
                    setDeliveryFee(selectedAddress.deliveryPrice ?? null);
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setIsDeliveryFeeLoading(false);
                }
            });

        return () => {
            controller.abort();
        };
    }, [
        defaultDeliveryOrganization?.slug,
        isDeliveryOrder,
        selectedAddress?.deliveryPrice,
        selectedAddress?.id,
        selectedAddress?.latitude,
        selectedAddress?.longitude,
    ]);

    useEffect(() => {
        const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
        const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
        const showSubscription = Keyboard.addListener(showEvent, (event) => {
            setKeyboardHeight(event.endCoordinates.height);
        });
        const hideSubscription = Keyboard.addListener(hideEvent, () => {
            setKeyboardHeight(0);
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    if (items.length === 0) {
        return (
            <Screen>
                <View style={styles.root}>
                    {availabilityBarHeight === 0 && insets.top > 0 ? (
                        <View
                            pointerEvents="none"
                            style={[styles.topSafeAreaBackground, {height: insets.top}]}
                        />
                    ) : null}

                    <View style={styles.availabilityBarOverlay}>
                        <OrderAvailabilityBar
                            topInset={insets.top}
                            onHeightChange={setAvailabilityBarHeight}
                        />
                    </View>

                    <View style={[styles.emptyRoot, {paddingTop: topChromeHeight}]}>
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
                    </View>
                </View>
            </Screen>
        );
    }

    return (
        <Screen>
            <View style={styles.root}>
                {availabilityBarHeight === 0 && insets.top > 0 ? (
                    <View
                        pointerEvents="none"
                        style={[styles.topSafeAreaBackground, {height: insets.top}]}
                    />
                ) : null}

                <View style={styles.availabilityBarOverlay}>
                    <OrderAvailabilityBar
                        topInset={insets.top}
                        onHeightChange={setAvailabilityBarHeight}
                    />
                </View>

                <View style={[styles.fixedHeader, {top: topChromeHeight}]}>
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
                            paddingTop: topChromeHeight + FIXED_HEADER_HEIGHT + 14,
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
                            bottom: footerBottom,
                        },
                    ]}
                >
                    <View style={styles.orderCommentCard}>
                        <TextInput
                            value={orderComment}
                            onChangeText={setOrderComment}
                            placeholder="Комментарий к заказу"
                            placeholderTextColor={themeColors.textMuted}
                            multiline
                            maxLength={220}
                            style={styles.orderCommentInput}
                            textAlignVertical="top"
                        />
                    </View>

                    <View style={styles.summary}>
                        <SummaryRow label="Блюда в заказе" value={formatPrice(subtotal)} strong />
                        {isDeliveryOrder ? (
                            <SummaryRow label="Доставка" value={deliveryFeeText} />
                        ) : null}
                        {addUtensils ? (
                            <SummaryRow label="Приборы" value={formatPrice(CART_UTENSILS_PRICE)} />
                        ) : null}
                    </View>

                    {checkoutError ? (
                        <Text style={styles.checkoutError}>{checkoutError}</Text>
                    ) : null}

                    <Pressable
                        accessibilityRole="button"
                        disabled={isCheckoutDisabled}
                        style={({ pressed }) => [
                            styles.checkoutButton,
                            isCheckoutDisabled && styles.checkoutButtonDisabled,
                            pressed && !isCheckoutDisabled && styles.pressed,
                        ]}
                        onPress={handleCheckout}
                    >
                        {isCheckingOut ? (
                            <ActivityIndicator color={themeColors.textOnPrimary} />
                        ) : null}
                        <Text style={styles.checkoutText}>{checkoutText}</Text>
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
        flex: 1,
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

    availabilityBarOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        elevation: 1000,
    },

    topSafeAreaBackground: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: themeColors.background,
        zIndex: 998,
        elevation: 998,
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

    orderCommentCard: {
        minHeight: 58,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: themeColors.card,
        borderWidth: 1,
        borderColor: themeColors.cardBorder,
    },

    orderCommentInput: {
        minHeight: 38,
        maxHeight: 72,
        paddingTop: 0,
        paddingBottom: 0,
        paddingHorizontal: 0,
        color: themeColors.text,
        fontSize: 14,
        lineHeight: 19,
        fontFamily: "Point-Regular",
    },

    summary: {
        marginVertical: 18,
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
        paddingTop: 14,
        paddingBottom: 16,
        backgroundColor: themeColors.background,
        borderTopWidth: 1,
        borderTopColor: themeColors.cardBorder,
        zIndex: 100,
        elevation: 100,
    },

    checkoutButton: {
        minHeight: 54,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        borderRadius: 12,
        backgroundColor: themeColors.primary,
        ...SHADOW,
    },

    checkoutButtonDisabled: {
        opacity: 0.48,
    },

    checkoutText: {
        color: themeColors.textOnPrimary,
        fontSize: 16,
        fontFamily: "Point-Bold",
    },

    checkoutError: {
        marginBottom: 12,
        color: themeColors.notification,
        fontSize: 13,
        lineHeight: 18,
        fontFamily: "Point-Regular",
    },
});
