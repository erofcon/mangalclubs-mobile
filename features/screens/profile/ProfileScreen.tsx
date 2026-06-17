import {Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {Image} from "expo-image";
import * as Linking from "expo-linking";
import {router} from "expo-router";
import {useEffect, useMemo, useRef, useState} from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

import {Screen} from "@/components/ui/Screen";
import {
    AppBottomSheetModal,
    type AppBottomSheetRef,
} from "@/components/ui/bottom-sheet/AppBottomSheetModal";
import {openAuthSheet} from "@/features/auth/AuthSheetController";
import {formatRuPhoneDisplay} from "@/features/auth/utils/phone";
import {
    CustomerOrder,
    CustomerOrderItem,
    CustomerProfile,
    getCurrentCustomerOrders,
    getCustomerOrderStatus,
    getCustomerProfile,
    getHistoryCustomerOrders,
    updateCustomerProfile,
} from "@/services/customer-profile";
import {useAppDataStore} from "@/store/app-data-store";
import {useProfileStore} from "@/store/profile-store";
import type {MenuItem} from "@/types/products";
import {resolveApiAssetUrl} from "@/services/api";
import {formatPrice} from "@/utils/format_price";
import {themeColors} from "@/utils/theme-colors";

import {profileStyles as styles} from "./profile.styles";

type ProfileTab = "profile" | "orders";
type OrdersTab = "current" | "history";
type StatusTone = "success" | "progress" | "warning" | "danger" | "muted";

type ProfileForm = {
    name: string;
    email: string;
    birthday: string;
};

const profileQueryKey = ["customer-profile"];
const currentOrdersQueryKey = ["customer-orders", "current"];
const historyOrdersQueryKey = ["customer-orders", "history"];

const initialForm: ProfileForm = {
    name: "",
    email: "",
    birthday: "",
};

const fallbackStatus = {
    label: "Статус уточняется",
    tone: "muted" as StatusTone,
};

const paymentStatusMap: Record<string, {label: string; tone: StatusTone}> = {
    payment_pending: {label: "Ожидает оплаты", tone: "progress"},
    payment_form_created: {label: "Ссылка на оплату создана", tone: "progress"},
    paid: {label: "Оплачено", tone: "success"},
    payment_failed: {label: "Оплата не прошла", tone: "danger"},
    payment_cancelled: {label: "Оплата отменена", tone: "danger"},
    payment_expired: {label: "Время оплаты истекло", tone: "warning"},
};

const creationStatusMap: Record<string, {label: string; tone: StatusTone}> = {
    PaymentPending: {label: "Ожидает оплаты", tone: "progress"},
    PaymentConfirmed: {label: "Оплата подтверждена", tone: "progress"},
    IikoCreateInProgress: {label: "Передаем в ресторан", tone: "progress"},
    IikoCreateFailed: {label: "Ошибка передачи", tone: "warning"},
    InProgress: {label: "Создается", tone: "progress"},
    Success: {label: "Принят рестораном", tone: "success"},
    Error: {label: "Ошибка заказа", tone: "danger"},
};

const notificationStatusMap: Record<string, {label: string; tone: StatusTone}> = {
    pickup_ready: {label: "Готов к выдаче", tone: "success"},
    delivery_on_way: {label: "Курьер в пути", tone: "progress"},
    delivery_delivered: {label: "Доставлен", tone: "success"},
};

const orderStatusMap: Record<string, {label: string; tone: StatusTone}> = {
    New: {label: "Новый", tone: "progress"},
    Unconfirmed: {label: "Не подтвержден", tone: "warning"},
    WaitCooking: {label: "Ожидает кухни", tone: "progress"},
    ReadyForCooking: {label: "Передан на кухню", tone: "progress"},
    CookingStarted: {label: "Готовится", tone: "progress"},
    CookingCompleted: {label: "Приготовлен", tone: "success"},
    Waiting: {label: "Ожидает выдачи", tone: "progress"},
    OnWay: {label: "Курьер в пути", tone: "progress"},
    Delivered: {label: "Доставлен", tone: "success"},
    Closed: {label: "Завершен", tone: "success"},
    Cancelled: {label: "Отменен", tone: "danger"},
    Canceled: {label: "Отменен", tone: "danger"},
};

const terminalFailedPaymentStatuses = new Set([
    "payment_failed",
    "payment_cancelled",
    "payment_expired",
]);

const terminalOrderStatuses = new Set([
    "delivered",
    "closed",
    "cancelled",
    "canceled",
]);

const normalizeStatusKey = (value: string) => (
    value.replace(/[\s_-]+/g, "").toLowerCase()
);

const lowerCaseStatusMap: Record<string, {label: string; tone: StatusTone}> = {
    new: orderStatusMap.New,
    unconfirmed: orderStatusMap.Unconfirmed,
    waitcooking: orderStatusMap.WaitCooking,
    readyforcooking: orderStatusMap.ReadyForCooking,
    cookingstarted: orderStatusMap.CookingStarted,
    cookingcompleted: orderStatusMap.CookingCompleted,
    waiting: orderStatusMap.Waiting,
    onway: orderStatusMap.OnWay,
    delivered: orderStatusMap.Delivered,
    closed: orderStatusMap.Closed,
    cancelled: orderStatusMap.Cancelled,
    canceled: orderStatusMap.Canceled,
    completed: orderStatusMap.Closed,
    done: orderStatusMap.Closed,
    success: creationStatusMap.Success,
    error: creationStatusMap.Error,
    failed: {label: "Не выполнен", tone: "danger"},
};

const isRecord = (value: unknown): value is Record<string, unknown> => (
    typeof value === "object" && value !== null
);

const readString = (value: unknown) => (
    typeof value === "string" && value.trim() ? value.trim() : null
);

const formatDateTime = (value?: string | null) => {
    if (!value) {
        return "Дата уточняется";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const formatBirthday = (value?: string | null) => {
    if (!value) {
        return "Не указана";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
};

const getBirthdayInputValue = (value?: string | null) => (
    value ? value.slice(0, 10) : ""
);

const formatMoney = (value?: number | null) => (
    typeof value === "number"
        ? formatPrice(value)
        : "Сумма уточняется"
);

const getOrderTypeLabel = (orderType?: CustomerOrder["orderType"]) => {
    if (orderType === "delivery") {
        return "Доставка";
    }

    if (orderType === "pickup") {
        return "Самовывоз";
    }

    return "Заказ";
};

const getOrderNumber = (order: CustomerOrder) => (
    order.publicNumber || order.iikoExternalNumber || order.id
);

const getOrderItemsCount = (order: CustomerOrder) => (
    order.items?.reduce((sum, item) => sum + (item.amount ?? item.quantity ?? 1), 0) ?? 0
);

const pluralizeItems = (count: number) => {
    const lastTwoDigits = count % 100;
    const lastDigit = count % 10;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return "позиций";
    }

    if (lastDigit === 1) {
        return "позиция";
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
        return "позиции";
    }

    return "позиций";
};

const getItemsLabel = (order: CustomerOrder) => {
    const count = getOrderItemsCount(order);

    if (!count) {
        return "Состав уточняется";
    }

    return `${count} ${pluralizeItems(count)}`;
};

const getMappedStatus = (
    value: string | null | undefined,
    map: Record<string, {label: string; tone: StatusTone}>,
    fallbackTone: StatusTone = "muted"
) => {
    if (!value) {
        return fallbackStatus;
    }

    const mapped = map[value] ?? lowerCaseStatusMap[normalizeStatusKey(value)];

    if (mapped) {
        return mapped;
    }

    return {
        label: /[а-яё]/i.test(value) ? value : "Статус уточняется",
        tone: fallbackTone,
    };
};

const getOrderStatus = (order: CustomerOrder) => {
    if (order.paymentStatus && terminalFailedPaymentStatuses.has(order.paymentStatus)) {
        return getMappedStatus(order.paymentStatus, paymentStatusMap, "warning");
    }

    if (order.notificationEvent) {
        return getMappedStatus(order.notificationEvent, notificationStatusMap, "progress");
    }

    if (order.orderStatus) {
        return getMappedStatus(order.orderStatus, orderStatusMap, "progress");
    }

    if (order.creationStatus) {
        return getMappedStatus(order.creationStatus, creationStatusMap, "progress");
    }

    return getMappedStatus(order.paymentStatus, paymentStatusMap, "progress");
};

const shouldShowInHistory = (order: CustomerOrder) => (
    Boolean(order.paymentStatus && terminalFailedPaymentStatuses.has(order.paymentStatus)) ||
    order.creationStatus === "Error" ||
    Boolean(order.orderStatus && terminalOrderStatuses.has(normalizeStatusKey(order.orderStatus)))
);

const normalizeLookupKey = (value?: string | null) => value?.trim().toLowerCase();

const buildMenuItemLookup = (items: MenuItem[]) => {
    const lookup = new Map<string, MenuItem>();

    items.forEach((item) => {
        lookup.set(item.id, item);

        const nameKey = normalizeLookupKey(item.name);

        if (nameKey) {
            lookup.set(nameKey, item);
        }
    });

    return lookup;
};

const getRawOrderItemName = (item: CustomerOrderItem) => (
    item.name ||
    item.productName ||
    item.title ||
    item.product?.name ||
    item.product?.title
);

const getMenuItemForOrderItem = (
    item: CustomerOrderItem,
    lookup: Map<string, MenuItem>
) => {
    if (item.productId) {
        const byId = lookup.get(item.productId);

        if (byId) {
            return byId;
        }
    }

    const nameKey = normalizeLookupKey(getRawOrderItemName(item));

    return nameKey ? lookup.get(nameKey) : undefined;
};

const getOrderItemName = (item: CustomerOrderItem, menuItem?: MenuItem) => (
    getRawOrderItemName(item) || menuItem?.name || "Позиция заказа"
);

const getOrderItemImage = (item: CustomerOrderItem, menuItem?: MenuItem) => {
    const image =
        item.imageUrl ||
        item.image ||
        item.productImage ||
        item.product?.imageUrl ||
        item.product?.image ||
        menuItem?.image;

    return typeof image === "string" ? resolveApiAssetUrl(image) : image;
};

const getOrderItemQuantity = (item: CustomerOrderItem) => (
    item.amount ?? item.quantity ?? 1
);

const getOrderItemPrice = (item: CustomerOrderItem) => {
    const quantity = getOrderItemQuantity(item);

    if (typeof item.total === "number") {
        return item.total;
    }

    if (typeof item.sum === "number") {
        return item.sum;
    }

    if (typeof item.price === "number") {
        return item.price * quantity;
    }

    return null;
};

const getOrderPreviewText = (
    order: CustomerOrder,
    menuItemLookup: Map<string, MenuItem>
) => {
    const names = (order.items ?? []).slice(0, 3).map((item) => (
        getOrderItemName(item, getMenuItemForOrderItem(item, menuItemLookup))
    ));
    const hiddenCount = Math.max((order.items?.length ?? 0) - names.length, 0);

    if (!names.length) {
        return "Состав заказа будет доступен в деталях";
    }

    return hiddenCount > 0
        ? `${names.join(", ")} и еще ${hiddenCount}`
        : names.join(", ");
};

const getDeliveryAddressLabel = (order: CustomerOrder) => {
    if (order.orderType !== "delivery" || !isRecord(order.deliveryPoint)) {
        return null;
    }

    const address = isRecord(order.deliveryPoint.address)
        ? order.deliveryPoint.address
        : null;

    if (!address) {
        return null;
    }

    const streetValue = address.street;
    const street = isRecord(streetValue) ? readString(streetValue.name) : readString(streetValue);
    const city = readString(address.city);
    const house = readString(address.house);
    const building = readString(address.building);
    const flat = readString(address.flat);
    const mainAddress = [
        street,
        house ? `д. ${house}` : null,
        building ? `к. ${building}` : null,
    ].filter(Boolean).join(", ");
    const details = flat ? `кв. ${flat}` : null;

    return [city, mainAddress, details].filter(Boolean).join(", ") || null;
};

const getOrderPlaceLabel = (order: CustomerOrder) => {
    const deliveryAddress = getDeliveryAddressLabel(order);

    if (deliveryAddress) {
        return deliveryAddress;
    }

    if (order.orderType === "delivery") {
        return "Адрес доставки уточняется";
    }

    return order.organizationSlug
        ? `Ресторан ${order.organizationSlug}`
        : "Самовывоз из ресторана";
};

const mergeOrderStatus = (order: CustomerOrder, status: Partial<CustomerOrder>): CustomerOrder => ({
    ...order,
    ...status,
    id: order.id,
    publicNumber: status.publicNumber ?? order.publicNumber,
});

export function ProfileScreen() {
    const queryClient = useQueryClient();
    const user = useProfileStore((state) => state.user);
    const hasHydrated = useProfileStore((state) => state.hasHydrated);
    const logout = useProfileStore((state) => state.logout);
    const syncUser = useProfileStore((state) => state.syncUser);
    const menu = useAppDataStore((state) => state.menu);

    const [activeTab, setActiveTab] = useState<ProfileTab>("profile");
    const [ordersTab, setOrdersTab] = useState<OrdersTab>("current");
    const [form, setForm] = useState<ProfileForm>(initialForm);
    const [message, setMessage] = useState("");
    const [refreshingOrderIds, setRefreshingOrderIds] = useState<string[]>([]);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const enabled = hasHydrated && Boolean(user);

    useEffect(() => {
        if (!hasHydrated || user || isLoggingOut) {
            return;
        }

        openAuthSheet();
    }, [hasHydrated, isLoggingOut, user]);

    const profileQuery = useQuery({
        queryKey: profileQueryKey,
        queryFn: getCustomerProfile,
        enabled,
    });

    const currentOrdersQuery = useQuery({
        queryKey: currentOrdersQueryKey,
        queryFn: getCurrentCustomerOrders,
        enabled,
    });

    const historyOrdersQuery = useQuery({
        queryKey: historyOrdersQueryKey,
        queryFn: getHistoryCustomerOrders,
        enabled,
    });

    useEffect(() => {
        const profile = profileQuery.data;

        if (!profile) {
            return;
        }

        setForm({
            name: profile.name ?? "",
            email: profile.email ?? "",
            birthday: getBirthdayInputValue(profile.birthday),
        });
        syncUser({
            id: profile.id,
            phone: profile.phone,
            name: profile.name,
            email: profile.email,
            birthday: profile.birthday,
            avatarUrl: profile.avatarUrl,
        });
    }, [profileQuery.data, syncUser]);

    const saveProfileMutation = useMutation({
        mutationFn: (payload: ProfileForm) => updateCustomerProfile({
            name: payload.name.trim() || null,
            email: payload.email.trim() || null,
            birthday: payload.birthday || null,
        }),
        onSuccess: (profile) => {
            queryClient.setQueryData(profileQueryKey, profile);
            syncUser({
                id: profile.id,
                phone: profile.phone,
                name: profile.name,
                email: profile.email,
                birthday: profile.birthday,
                avatarUrl: profile.avatarUrl,
            });
            setMessage("Профиль обновлен.");
        },
    });

    const menuItemLookup = useMemo(
        () => buildMenuItemLookup(menu.flatMap((category) => category.items)),
        [menu]
    );

    const displayedCurrentOrders = useMemo(
        () => (currentOrdersQuery.data ?? []).filter((order) => !shouldShowInHistory(order)),
        [currentOrdersQuery.data]
    );

    const displayedHistoryOrders = useMemo(() => {
        const historyOrders = historyOrdersQuery.data ?? [];
        const historyIds = new Set(historyOrders.map((order) => order.id));
        const movedToHistory = (currentOrdersQuery.data ?? []).filter((order) => (
            shouldShowInHistory(order) && !historyIds.has(order.id)
        ));

        return [...movedToHistory, ...historyOrders];
    }, [currentOrdersQuery.data, historyOrdersQuery.data]);

    const profile = profileQuery.data;
    const isInitialLoading =
        enabled &&
        (profileQuery.isLoading || currentOrdersQuery.isLoading || historyOrdersQuery.isLoading);
    const errorMessage =
        profileQuery.error instanceof Error
            ? profileQuery.error.message
            : currentOrdersQuery.error instanceof Error
                ? currentOrdersQuery.error.message
                : historyOrdersQuery.error instanceof Error
                    ? historyOrdersQuery.error.message
                    : saveProfileMutation.error instanceof Error
                        ? saveProfileMutation.error.message
                        : "";

    const refreshAll = async () => {
        setMessage("");
        await Promise.all([
            queryClient.invalidateQueries({queryKey: profileQueryKey}),
            queryClient.invalidateQueries({queryKey: currentOrdersQueryKey}),
            queryClient.invalidateQueries({queryKey: historyOrdersQueryKey}),
        ]);
    };

    const handleRefreshOrderStatus = async (order: CustomerOrder) => {
        if (refreshingOrderIds.includes(order.id)) {
            return;
        }

        setRefreshingOrderIds((prev) => [...prev, order.id]);
        setMessage("");

        try {
            const status = await getCustomerOrderStatus(order.id);

            queryClient.setQueryData<CustomerOrder[]>(currentOrdersQueryKey, (orders = []) => (
                orders.map((item) => item.id === order.id ? mergeOrderStatus(item, status) : item)
            ));
            queryClient.setQueryData<CustomerOrder[]>(historyOrdersQueryKey, (orders = []) => (
                orders.map((item) => item.id === order.id ? mergeOrderStatus(item, status) : item)
            ));
            setMessage("Статус заказа обновлен.");
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Не удалось обновить статус.");
        } finally {
            setRefreshingOrderIds((prev) => prev.filter((id) => id !== order.id));
        }
    };

    const handleContinuePayment = (order: CustomerOrder) => {
        const paymentUrl = order.payment?.paymentUrl;

        if (paymentUrl) {
            Linking.openURL(paymentUrl).catch(() => {
                setMessage("Не удалось открыть оплату.");
            });
        }
    };

    const handleLogout = () => {
        setIsLoggingOut(true);
        router.replace("/");
        void logout();
    };

    if (hasHydrated && !user) {
        return <Screen withTopInset />;
    }

    return (
        <Screen withTopInset>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={styles.root}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    refreshControl={
                        <RefreshControl
                            refreshing={
                                profileQuery.isRefetching ||
                                currentOrdersQuery.isRefetching ||
                                historyOrdersQuery.isRefetching
                            }
                            onRefresh={refreshAll}
                            tintColor={themeColors.primary}
                            colors={[themeColors.primary]}
                        />
                    }
                    contentContainerStyle={styles.content}
                >
                    <ProfileHero
                        profile={profile}
                        fallbackUser={user}
                        activeOrdersCount={displayedCurrentOrders.length}
                        historyOrdersCount={displayedHistoryOrders.length}
                        onLogout={handleLogout}
                    />

                    <SegmentedControl
                        value={activeTab}
                        options={[
                            {value: "profile", label: "Данные"},
                            {value: "orders", label: "Заказы"},
                        ]}
                        onChange={setActiveTab}
                    />

                    {isInitialLoading ? (
                        <LoadingBlock />
                    ) : activeTab === "profile" ? (
                        <ProfileDetails
                            profile={profile}
                            form={form}
                            message={message}
                            errorMessage={errorMessage}
                            isSaving={saveProfileMutation.isPending}
                            onChange={(field, value) => {
                                setMessage("");
                                setForm((prev) => ({...prev, [field]: value}));
                            }}
                            onSave={() => saveProfileMutation.mutate(form)}
                        />
                    ) : (
                        <OrdersSection
                            activeTab={ordersTab}
                            currentOrders={displayedCurrentOrders}
                            historyOrders={displayedHistoryOrders}
                            menuItemLookup={menuItemLookup}
                            refreshingOrderIds={refreshingOrderIds}
                            onChangeTab={setOrdersTab}
                            onRefreshOrder={handleRefreshOrderStatus}
                            onContinuePayment={handleContinuePayment}
                        />
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </Screen>
    );
}

function ProfileHero({
    profile,
    fallbackUser,
    activeOrdersCount,
    historyOrdersCount,
    onLogout,
}: {
    profile?: CustomerProfile;
    fallbackUser: ReturnType<typeof useProfileStore.getState>["user"];
    activeOrdersCount: number;
    historyOrdersCount: number;
    onLogout: () => void;
}) {
    const name = profile?.name || fallbackUser?.name || "Гость Mangal Clubs";
    const phone = profile?.phone || fallbackUser?.phone || "";
    const avatarUrl = resolveApiAssetUrl(profile?.avatarUrl || fallbackUser?.avatarUrl);

    return (
        <View style={styles.hero}>
            <View style={styles.heroTop}>
                <View style={styles.avatar}>
                    {avatarUrl ? (
                        <Image
                            source={{uri: avatarUrl}}
                            style={styles.avatarImage}
                            contentFit="cover"
                        />
                    ) : (
                        <MaterialCommunityIcons
                            name="account-outline"
                            size={52}
                            color={themeColors.primary}
                        />
                    )}
                </View>

                <View style={styles.heroText}>
                    <Text style={styles.eyebrow}>Профиль</Text>
                    <Text style={styles.heroTitle} numberOfLines={1}>{name}</Text>
                    <Text style={styles.heroSubtitle} numberOfLines={1}>
                        {phone ? formatRuPhoneDisplay(phone) : "Телефон подтвержден"}
                    </Text>
                </View>

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Выйти из профиля"
                    hitSlop={10}
                    style={({pressed}) => [styles.iconButton, pressed && styles.pressed]}
                    onPress={onLogout}
                >
                    <MaterialCommunityIcons name="logout" size={20} color={themeColors.text} />
                </Pressable>
            </View>

            <View style={styles.statsRow}>
                <StatCell label="Активные" value={String(activeOrdersCount)} />
                <StatCell label="История" value={String(historyOrdersCount)} />
                <StatCell label="День рождения" value={formatBirthday(profile?.birthday)} compact />
            </View>
        </View>
    );
}

function StatCell({label, value, compact = false}: {label: string; value: string; compact?: boolean}) {
    return (
        <View style={styles.statCell}>
            <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
            <Text style={[styles.statValue, compact && styles.statValueCompact]} numberOfLines={1}>
                {value}
            </Text>
        </View>
    );
}

function SegmentedControl<T extends string>({
    value,
    options,
    onChange,
}: {
    value: T;
    options: Array<{value: T; label: string}>;
    onChange: (value: T) => void;
}) {
    return (
        <View style={styles.segmented}>
            {options.map((option) => {
                const selected = option.value === value;

                return (
                    <Pressable
                        key={option.value}
                        accessibilityRole="button"
                        style={({pressed}) => [
                            styles.segment,
                            selected && styles.segmentActive,
                            pressed && styles.pressed,
                        ]}
                        onPress={() => onChange(option.value)}
                    >
                        <Text style={[styles.segmentText, selected && styles.segmentTextActive]}>
                            {option.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

function LoadingBlock() {
    return (
        <View style={styles.stateBlock}>
            <ActivityIndicator color={themeColors.primary} />
            <Text style={styles.stateText}>Загружаем личный кабинет</Text>
        </View>
    );
}

function ProfileDetails({
    profile,
    form,
    message,
    errorMessage,
    isSaving,
    onChange,
    onSave,
}: {
    profile?: CustomerProfile;
    form: ProfileForm;
    message: string;
    errorMessage: string;
    isSaving: boolean;
    onChange: (field: keyof ProfileForm, value: string) => void;
    onSave: () => void;
}) {
    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionEyebrow}>Личные данные</Text>
                <Text style={styles.sectionTitle}>Контакты гостя</Text>
            </View>

            <View style={styles.infoGrid}>
                <InfoPill
                    icon="phone-outline"
                    label="Телефон"
                    value={profile?.phone ? formatRuPhoneDisplay(profile.phone) : "Не указан"}
                />
                <InfoPill
                    icon="cake-variant-outline"
                    label="Дата рождения"
                    value={formatBirthday(profile?.birthday)}
                />
            </View>

            <View style={styles.formBlock}>
                <FormField
                    label="Имя"
                    value={form.name}
                    placeholder="Как к вам обращаться"
                    icon="account-outline"
                    onChangeText={(value) => onChange("name", value)}
                />
                <FormField
                    label="Email"
                    value={form.email}
                    placeholder="name@example.com"
                    icon="email-outline"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onChangeText={(value) => onChange("email", value)}
                />
                <FormField
                    label="Дата рождения"
                    value={form.birthday}
                    placeholder="ГГГГ-ММ-ДД"
                    icon="calendar-month-outline"
                    keyboardType="numbers-and-punctuation"
                    onChangeText={(value) => onChange("birthday", value)}
                />
            </View>

            {message ? (
                <Text style={styles.successText}>{message}</Text>
            ) : null}
            {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            <Pressable
                accessibilityRole="button"
                disabled={isSaving}
                style={({pressed}) => [
                    styles.primaryButton,
                    isSaving && styles.disabled,
                    pressed && styles.pressed,
                ]}
                onPress={onSave}
            >
                {isSaving ? (
                    <ActivityIndicator color={themeColors.textOnPrimary} />
                ) : (
                    <>
                        <MaterialCommunityIcons
                            name="content-save-outline"
                            size={19}
                            color={themeColors.textOnPrimary}
                        />
                        <Text style={styles.primaryButtonText}>Сохранить</Text>
                    </>
                )}
            </Pressable>
        </View>
    );
}

function InfoPill({
    icon,
    label,
    value,
}: {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    label: string;
    value: string;
}) {
    return (
        <View style={styles.infoPill}>
            <MaterialCommunityIcons name={icon} size={18} color={themeColors.primary} />
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
        </View>
    );
}

function FormField({
    label,
    icon,
    ...inputProps
}: {
    label: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
} & React.ComponentProps<typeof TextInput>) {
    return (
        <View style={styles.field}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <View style={styles.inputWrap}>
                <MaterialCommunityIcons name={icon} size={18} color={themeColors.textSecondary} />
                <TextInput
                    {...inputProps}
                    placeholderTextColor="#5D554B"
                    selectionColor={themeColors.primary}
                    style={styles.input}
                />
            </View>
        </View>
    );
}

function OrdersSection({
    activeTab,
    currentOrders,
    historyOrders,
    menuItemLookup,
    refreshingOrderIds,
    onChangeTab,
    onRefreshOrder,
    onContinuePayment,
}: {
    activeTab: OrdersTab;
    currentOrders: CustomerOrder[];
    historyOrders: CustomerOrder[];
    menuItemLookup: Map<string, MenuItem>;
    refreshingOrderIds: string[];
    onChangeTab: (tab: OrdersTab) => void;
    onRefreshOrder: (order: CustomerOrder) => void;
    onContinuePayment: (order: CustomerOrder) => void;
}) {
    const orders = activeTab === "current" ? currentOrders : historyOrders;
    const orderDetailsSheetRef = useRef<AppBottomSheetRef>(null);
    const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
    const selectedOrderDetails = selectedOrder
        ? [...currentOrders, ...historyOrders].find((order) => order.id === selectedOrder.id) ?? selectedOrder
        : null;

    const handleOrderPress = (order: CustomerOrder) => {
        setSelectedOrder(order);
        requestAnimationFrame(() => orderDetailsSheetRef.current?.open());
    };

    return (
        <>
            <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                    <View>
                        <Text style={styles.sectionEyebrow}>Заказы</Text>
                        <Text style={styles.sectionTitle}>Активность</Text>
                    </View>

                    <Pressable
                        accessibilityRole="button"
                        style={({pressed}) => [styles.menuButton, pressed && styles.pressed]}
                        onPress={() => router.push("/menu")}
                    >
                        <MaterialCommunityIcons name="silverware-fork-knife" size={18} color={themeColors.textOnPrimary} />
                    </Pressable>
                </View>

                <SegmentedControl
                    value={activeTab}
                    options={[
                        {value: "current", label: `Активные ${currentOrders.length}`},
                        {value: "history", label: `История ${historyOrders.length}`},
                    ]}
                    onChange={onChangeTab}
                />

                {orders.length ? (
                    <View style={styles.ordersList}>
                        {orders.map((order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                menuItemLookup={menuItemLookup}
                                onPress={() => handleOrderPress(order)}
                            />
                        ))}
                    </View>
                ) : (
                    <EmptyOrders tab={activeTab} />
                )}
            </View>

            <AppBottomSheetModal
                ref={orderDetailsSheetRef}
                title={selectedOrderDetails ? `${getOrderTypeLabel(selectedOrderDetails.orderType)} №${getOrderNumber(selectedOrderDetails)}` : "Заказ"}
                showCloseButton
                scrollable
                snapPoints={["82%"]}
                enableDynamicSizing={false}
                backgroundStyle={styles.orderSheetBackground}
                handleIndicatorStyle={styles.orderSheetHandle}
                containerStyle={styles.orderSheetContainer}
                contentContainerStyle={styles.orderSheetContent}
                onDismiss={() => setSelectedOrder(null)}
            >
                {selectedOrderDetails ? (
                    <OrderDetailsSheetContent
                        order={selectedOrderDetails}
                        menuItemLookup={menuItemLookup}
                        isRefreshing={refreshingOrderIds.includes(selectedOrderDetails.id)}
                        onRefresh={() => onRefreshOrder(selectedOrderDetails)}
                        onContinuePayment={() => onContinuePayment(selectedOrderDetails)}
                    />
                ) : null}
            </AppBottomSheetModal>
        </>
    );
}

function EmptyOrders({tab}: {tab: OrdersTab}) {
    return (
        <View style={styles.emptyBlock}>
            <View style={styles.emptyIcon}>
                <MaterialCommunityIcons
                    name={tab === "current" ? "receipt-clock-outline" : "receipt-text-outline"}
                    size={30}
                    color={themeColors.primary}
                />
            </View>
            <Text style={styles.emptyTitle}>
                {tab === "current" ? "Активных заказов нет" : "История пока пустая"}
            </Text>
            <Text style={styles.emptyText}>
                {tab === "current"
                    ? "Когда заказ появится, его статус можно будет отслеживать здесь."
                    : "После завершения заказы будут храниться в этом разделе."}
            </Text>
            <Pressable
                accessibilityRole="button"
                style={({pressed}) => [styles.secondaryButton, pressed && styles.pressed]}
                onPress={() => router.push("/menu")}
            >
                <Text style={styles.secondaryButtonText}>Перейти в меню</Text>
                <Ionicons name="arrow-forward" size={18} color={themeColors.primary} />
            </Pressable>
        </View>
    );
}

function OrderCard({
    order,
    menuItemLookup,
    onPress,
}: {
    order: CustomerOrder;
    menuItemLookup: Map<string, MenuItem>;
    onPress: () => void;
}) {
    const status = getOrderStatus(order);

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Открыть заказ №${getOrderNumber(order)}`}
            style={({pressed}) => [styles.orderCard, pressed && styles.pressed]}
            onPress={onPress}
        >
            <View style={styles.orderTop}>
                <View style={styles.orderIcon}>
                    <MaterialCommunityIcons
                        name={order.orderType === "delivery" ? "bike-fast" : "shopping-outline"}
                        size={21}
                        color={themeColors.primary}
                    />
                </View>

                <View style={styles.orderTitleWrap}>
                    <Text style={styles.orderTitle} numberOfLines={1}>
                        {getOrderTypeLabel(order.orderType)} №{getOrderNumber(order)}
                    </Text>
                    <Text style={styles.orderDate} numberOfLines={1}>
                        {formatDateTime(order.createdAt)}
                    </Text>
                </View>

                <StatusBadge label={status.label} tone={status.tone} />
            </View>

            <View style={styles.orderSummaryRow}>
                <OrderMeta icon="cash" label={formatMoney(order.totalSum)} />
                <OrderMeta icon="format-list-bulleted" label={getItemsLabel(order)} />
            </View>

            <View style={styles.orderFooterRow}>
                <Text style={styles.orderPreview} numberOfLines={1}>
                    {getOrderPreviewText(order, menuItemLookup)}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={themeColors.textSecondary} />
            </View>
        </Pressable>
    );
}

function OrderDetailsSheetContent({
    order,
    menuItemLookup,
    isRefreshing,
    onRefresh,
    onContinuePayment,
}: {
    order: CustomerOrder;
    menuItemLookup: Map<string, MenuItem>;
    isRefreshing: boolean;
    onRefresh: () => void;
    onContinuePayment: () => void;
}) {
    const status = getOrderStatus(order);
    const canContinuePayment =
        (order.paymentStatus === "payment_pending" || order.paymentStatus === "payment_form_created") &&
        Boolean(order.payment?.paymentUrl);

    return (
        <View style={styles.detailsSheet}>
            <View style={styles.detailsHero}>
                <View style={styles.detailsHeroHeader}>
                    <View style={styles.orderIconLarge}>
                        <MaterialCommunityIcons
                            name={order.orderType === "delivery" ? "bike-fast" : "shopping-outline"}
                            size={24}
                            color={themeColors.primary}
                        />
                    </View>

                    <View style={styles.orderTitleWrap}>
                        <Text style={styles.detailsTitle} numberOfLines={1}>
                            {getOrderTypeLabel(order.orderType)} №{getOrderNumber(order)}
                        </Text>
                        <Text style={styles.orderDate} numberOfLines={1}>
                            {formatDateTime(order.createdAt)}
                        </Text>
                    </View>

                    <StatusBadge label={status.label} tone={status.tone} />
                </View>

                <View style={styles.orderMetaGrid}>
                    <OrderMeta icon="cash" label={formatMoney(order.totalSum)} />
                    <OrderMeta icon="clock-outline" label={formatDateTime(order.completeBefore)} />
                    <OrderMeta icon="map-marker-outline" label={getOrderPlaceLabel(order)} />
                    <OrderMeta icon="format-list-bulleted" label={getItemsLabel(order)} />
                </View>
            </View>

            <View style={styles.detailsBlock}>
                <Text style={styles.detailsBlockTitle}>Состав заказа</Text>

                {order.items?.length ? (
                    <View style={styles.orderItemsList}>
                        {order.items.map((item, index) => {
                            const menuItem = getMenuItemForOrderItem(item, menuItemLookup);
                            const image = getOrderItemImage(item, menuItem);
                            const quantity = getOrderItemQuantity(item);
                            const price = getOrderItemPrice(item);

                            return (
                                <View key={item.id ?? `${getOrderItemName(item, menuItem)}-${index}`} style={styles.orderItemRow}>
                                    <View style={styles.orderItemImageWrap}>
                                        {image ? (
                                            <Image
                                                source={typeof image === "string" ? {uri: image} : image}
                                                style={styles.orderItemImage}
                                                contentFit="cover"
                                            />
                                        ) : (
                                            <MaterialCommunityIcons
                                                name="silverware-fork-knife"
                                                size={22}
                                                color={themeColors.primary}
                                            />
                                        )}
                                    </View>

                                    <View style={styles.orderItemInfo}>
                                        <Text style={styles.orderItemName} numberOfLines={2}>
                                            {getOrderItemName(item, menuItem)}
                                        </Text>
                                        <Text style={styles.orderItemMeta} numberOfLines={1}>
                                            {quantity} шт.{item.sizeName ? ` · ${item.sizeName}` : ""}
                                        </Text>
                                        {item.comment ? (
                                            <Text style={styles.orderItemComment} numberOfLines={2}>
                                                {item.comment}
                                            </Text>
                                        ) : null}
                                    </View>

                                    <Text style={styles.orderItemPrice} numberOfLines={1}>
                                        {price === null ? "" : formatMoney(price)}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                ) : (
                    <Text style={styles.detailsMutedText}>Состав заказа уточняется.</Text>
                )}
            </View>

            {order.comment ? (
                <View style={styles.detailsBlock}>
                    <Text style={styles.detailsBlockTitle}>Комментарий</Text>
                    <Text style={styles.detailsText}>{order.comment}</Text>
                </View>
            ) : null}

            <View style={styles.orderActions}>
                {canContinuePayment ? (
                    <Pressable
                        accessibilityRole="button"
                        style={({pressed}) => [styles.payButton, pressed && styles.pressed]}
                        onPress={onContinuePayment}
                    >
                        <MaterialCommunityIcons
                            name="credit-card-outline"
                            size={17}
                            color={themeColors.textOnPrimary}
                        />
                        <Text style={styles.payButtonText}>Оплатить</Text>
                    </Pressable>
                ) : null}

                <Pressable
                    accessibilityRole="button"
                    disabled={isRefreshing}
                    style={({pressed}) => [
                        styles.refreshButton,
                        isRefreshing && styles.disabled,
                        pressed && styles.pressed,
                    ]}
                    onPress={onRefresh}
                >
                    {isRefreshing ? (
                        <ActivityIndicator size="small" color={themeColors.primary} />
                    ) : (
                        <MaterialCommunityIcons
                            name="refresh"
                            size={17}
                            color={themeColors.primary}
                        />
                    )}
                    <Text style={styles.refreshButtonText}>Обновить</Text>
                </Pressable>
            </View>
        </View>
    );
}

function StatusBadge({label, tone}: {label: string; tone: StatusTone}) {
    return (
        <View style={[styles.statusBadge, styles[`statusBadge_${tone}`]]}>
            <Text style={[styles.statusText, styles[`statusText_${tone}`]]} numberOfLines={1}>
                {label}
            </Text>
        </View>
    );
}

function OrderMeta({
    icon,
    label,
}: {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    label: string;
}) {
    return (
        <View style={styles.orderMeta}>
            <MaterialCommunityIcons name={icon} size={15} color={themeColors.primary} />
            <Text style={styles.orderMetaText} numberOfLines={1}>{label}</Text>
        </View>
    );
}
