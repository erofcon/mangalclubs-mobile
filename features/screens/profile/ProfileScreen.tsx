import {Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {Image} from "expo-image";
import * as Linking from "expo-linking";
import {router} from "expo-router";
import {forwardRef, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
    ActivityIndicator,
    AppState,
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
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
    deleteCustomerAvatar,
    deleteCustomerProfile,
    getCurrentCustomerOrders,
    getCustomerOrderStatus,
    getCustomerProfile,
    getHistoryCustomerOrders,
    updateCustomerProfile,
    uploadCustomerAvatar,
} from "@/services/customer-profile";
import {useAddressStore} from "@/store/address-store";
import {useAppDataStore} from "@/store/app-data-store";
import {useCartStore} from "@/store/cart-store";
import {useDeliveryStore} from "@/store/delivery-store";
import {useProfileStore} from "@/store/profile-store";
import type {Organization} from "@/types/organization";
import type {MenuItem} from "@/types/products";
import {resolveApiAssetUrl} from "@/services/api";
import {
    currentOrdersQueryKey,
    getUnreadNotifications,
    historyOrdersQueryKey,
    markOrderNotificationsRead,
    unreadNotificationsQueryKey,
    type CustomerUnreadNotifications,
} from "@/services/notifications";
import {appVersion} from "@/utils/app-version";
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

type ProfileFieldFocusHandler = NonNullable<React.ComponentProps<typeof TextInput>["onFocus"]>;

const profileQueryKey = ["customer-profile"];
const avatarMaxSourceSizeBytes = 8 * 1024 * 1024;
const avatarTargetSize = 512;
const avatarUploadMimeType = "image/jpeg";
const avatarUploadFileName = "avatar.jpg";
const allowedAvatarMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const initialForm: ProfileForm = {
    name: "",
    email: "",
    birthday: "",
};

const profileLegalItems: Array<{
    key: "delivery" | "support" | "personal-data" | "cards" | "delete-account";
    label: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    danger?: boolean;
}> = [
    {key: "delivery", label: "Условия доставки", icon: "truck-delivery-outline"},
    {key: "support", label: "Поддержка", icon: "lifebuoy"},
    {key: "personal-data", label: "Обработка персональных данных", icon: "shield-account-outline"},
    {key: "cards", label: "Условия использования карт", icon: "map-marker-radius-outline"},
    {key: "delete-account", label: "Удалить аккаунт", icon: "account-remove-outline", danger: true},
];

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
    WaitCooking: {label: "Готовится", tone: "progress"},
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

const getPhoneUrl = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

const getWhatsAppPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, "");

    if (digits.length === 11 && digits.startsWith("8")) {
        return `7${digits.slice(1)}`;
    }

    return digits;
};

const openExternalUrl = async (url: string, fallbackUrl?: string) => {
    try {
        const canOpen = await Linking.canOpenURL(url);
        await Linking.openURL(canOpen ? url : fallbackUrl ?? url);
    } catch {
        if (fallbackUrl) {
            await Linking.openURL(fallbackUrl).catch(() => undefined);
        }
    }
};

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

const formatBirthdayInputValue = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    const parts = [
        digits.slice(0, 4),
        digits.slice(4, 6),
        digits.slice(6, 8),
    ].filter(Boolean);

    return parts.join("-");
};

const formatFileSize = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(0)} МБ`;

const getImageMimeType = (asset: ImagePicker.ImagePickerAsset) => {
    const source = asset.mimeType || asset.fileName || asset.uri;
    const normalized = source.toLowerCase().split("?")[0];

    if (normalized.endsWith(".jpg") || normalized.endsWith(".jpeg") || normalized === "image/jpeg") {
        return "image/jpeg";
    }

    if (normalized.endsWith(".png") || normalized === "image/png") {
        return "image/png";
    }

    if (normalized.endsWith(".webp") || normalized === "image/webp") {
        return "image/webp";
    }

    return asset.mimeType;
};

const prepareAvatarUpload = async (asset: ImagePicker.ImagePickerAsset) => {
    const mimeType = getImageMimeType(asset);

    if (!mimeType || !allowedAvatarMimeTypes.has(mimeType)) {
        throw new Error("Можно загрузить только JPEG, PNG или WebP.");
    }

    if (typeof asset.fileSize === "number" && asset.fileSize > avatarMaxSourceSizeBytes) {
        throw new Error(`Изображение должно быть до ${formatFileSize(avatarMaxSourceSizeBytes)}.`);
    }

    const resize =
        asset.width >= asset.height
            ? {width: avatarTargetSize}
            : {height: avatarTargetSize};

    const result = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{resize}],
        {
            compress: 0.85,
            format: ImageManipulator.SaveFormat.JPEG,
        }
    );

    return {
        uri: result.uri,
        name: avatarUploadFileName,
        type: avatarUploadMimeType,
    };
};

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

const markOrderReadInCache = (order: CustomerOrder): CustomerOrder => ({
    ...order,
    hasUnreadNotification: false,
});

export function ProfileScreen() {
    const queryClient = useQueryClient();
    const user = useProfileStore((state) => state.user);
    const hasHydrated = useProfileStore((state) => state.hasHydrated);
    const logout = useProfileStore((state) => state.logout);
    const syncUser = useProfileStore((state) => state.syncUser);
    const menu = useAppDataStore((state) => state.menu);
    const organizations = useAppDataStore((state) => state.organizations);
    const clearAddresses = useAddressStore((state) => state.clearAddresses);
    const clearCart = useCartStore((state) => state.clearCart);
    const clearDelivery = useDeliveryStore((state) => state.clearDelivery);

    const [activeTab, setActiveTab] = useState<ProfileTab>("profile");
    const [ordersTab, setOrdersTab] = useState<OrdersTab>("current");
    const [form, setForm] = useState<ProfileForm>(initialForm);
    const [message, setMessage] = useState("");
    const [refreshingOrderIds, setRefreshingOrderIds] = useState<string[]>([]);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isDeleteAccountModalVisible, setIsDeleteAccountModalVisible] = useState(false);
    const supportSheetRef = useRef<AppBottomSheetRef>(null);
    const scrollViewRef = useRef<ScrollView>(null);
    const keyboardHeightRef = useRef(0);

    const enabled = hasHydrated && Boolean(user);

    const syncProfile = useCallback((profile: CustomerProfile) => {
        queryClient.setQueryData(profileQueryKey, profile);
        syncUser({
            id: profile.id,
            phone: profile.phone,
            name: profile.name,
            email: profile.email,
            birthday: profile.birthday,
            avatarUrl: profile.avatarUrl ?? profile.avatar_url,
        });
    }, [queryClient, syncUser]);

    useEffect(() => {
        if (!hasHydrated || user) {
            return;
        }

        if (isLoggingOut) {
            setIsLoggingOut(false);
            return;
        }

        openAuthSheet();
    }, [hasHydrated, isLoggingOut, user]);

    useEffect(() => {
        const showSubscription = Keyboard.addListener(
            Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
            (event) => {
                keyboardHeightRef.current = event.endCoordinates.height;
            }
        );
        const hideSubscription = Keyboard.addListener(
            Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
            () => {
                keyboardHeightRef.current = 0;
            }
        );

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        const subscription = AppState.addEventListener("change", (state) => {
            if (state !== "active") {
                return;
            }

            queryClient.invalidateQueries({queryKey: unreadNotificationsQueryKey}).catch(() => undefined);
            queryClient.invalidateQueries({queryKey: currentOrdersQueryKey}).catch(() => undefined);
            queryClient.invalidateQueries({queryKey: historyOrdersQueryKey}).catch(() => undefined);
        });

        return () => subscription.remove();
    }, [enabled, queryClient]);

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

    const unreadNotificationsQuery = useQuery({
        queryKey: unreadNotificationsQueryKey,
        queryFn: getUnreadNotifications,
        enabled,
        refetchInterval: 15000,
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
        syncProfile(profile);
    }, [profileQuery.data, syncProfile]);

    const saveProfileMutation = useMutation({
        mutationFn: (payload: ProfileForm) => updateCustomerProfile({
            name: payload.name.trim() || null,
            email: payload.email.trim() || null,
            birthday: payload.birthday || null,
        }),
        onSuccess: (profile) => {
            syncProfile(profile);
            setMessage("Профиль обновлен.");
        },
    });

    const uploadAvatarMutation = useMutation({
        mutationFn: uploadCustomerAvatar,
        onSuccess: (profile) => {
            syncProfile(profile);
            setMessage("Аватар обновлен.");
        },
    });

    const deleteAvatarMutation = useMutation({
        mutationFn: deleteCustomerAvatar,
        onSuccess: () => {
            const currentProfile = queryClient.getQueryData<CustomerProfile>(profileQueryKey);

            if (currentProfile) {
                syncProfile({
                    ...currentProfile,
                    avatarUrl: null,
                    avatar_url: null,
                });
            } else {
                syncUser({
                    avatarUrl: null,
                    avatar_url: null,
                });
            }

            setMessage("Аватар удален.");
        },
    });

    const deleteAccountMutation = useMutation({
        mutationFn: deleteCustomerProfile,
        onSuccess: async () => {
            setIsLoggingOut(true);
            setIsDeleteAccountModalVisible(false);
            setMessage("");
            clearAddresses();
            clearCart();
            clearDelivery();
            queryClient.clear();
            router.replace("/");
            await logout();
        },
    });

    const menuItemLookup = useMemo(
        () => buildMenuItemLookup(menu.flatMap((category) => category.items)),
        [menu]
    );

    const unreadOrderIds = useMemo(
        () => new Set(unreadNotificationsQuery.data?.orderIds ?? []),
        [unreadNotificationsQuery.data?.orderIds]
    );
    const unreadOrdersCount = unreadNotificationsQuery.data?.count ?? 0;

    const withUnreadState = useCallback((order: CustomerOrder): CustomerOrder => ({
        ...order,
        hasUnreadNotification: Boolean(order.hasUnreadNotification || unreadOrderIds.has(order.id)),
    }), [unreadOrderIds]);

    const displayedCurrentOrders = useMemo(
        () => (currentOrdersQuery.data ?? [])
            .map(withUnreadState)
            .filter((order) => !shouldShowInHistory(order)),
        [currentOrdersQuery.data, withUnreadState]
    );

    const displayedHistoryOrders = useMemo(() => {
        const historyOrders = (historyOrdersQuery.data ?? []).map(withUnreadState);
        const historyIds = new Set(historyOrders.map((order) => order.id));
        const movedToHistory = (currentOrdersQuery.data ?? [])
            .map(withUnreadState)
            .filter((order) => shouldShowInHistory(order) && !historyIds.has(order.id));

        return [...movedToHistory, ...historyOrders];
    }, [currentOrdersQuery.data, historyOrdersQuery.data, withUnreadState]);

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
                            : uploadAvatarMutation.error instanceof Error
                                ? uploadAvatarMutation.error.message
                                : deleteAvatarMutation.error instanceof Error
                                    ? deleteAvatarMutation.error.message
                                    : deleteAccountMutation.error instanceof Error
                                        ? deleteAccountMutation.error.message
                                        : unreadNotificationsQuery.error instanceof Error
                                            ? unreadNotificationsQuery.error.message
                                        : "";

    const refreshAll = async () => {
        setMessage("");
        uploadAvatarMutation.reset();
        deleteAvatarMutation.reset();
        await Promise.all([
            queryClient.invalidateQueries({queryKey: profileQueryKey}),
            queryClient.invalidateQueries({queryKey: currentOrdersQueryKey}),
            queryClient.invalidateQueries({queryKey: historyOrdersQueryKey}),
            queryClient.invalidateQueries({queryKey: unreadNotificationsQueryKey}),
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

    const handleOpenOrder = useCallback((order: CustomerOrder) => {
        if (!order.hasUnreadNotification) {
            return;
        }

        queryClient.setQueryData<CustomerOrder[]>(currentOrdersQueryKey, (orders = []) => (
            orders.map((item) => item.id === order.id ? markOrderReadInCache(item) : item)
        ));
        queryClient.setQueryData<CustomerOrder[]>(historyOrdersQueryKey, (orders = []) => (
            orders.map((item) => item.id === order.id ? markOrderReadInCache(item) : item)
        ));
        queryClient.setQueryData<CustomerUnreadNotifications | undefined>(unreadNotificationsQueryKey, (data) => {
            if (!data) {
                return data;
            }

            const notifications = data.notifications.filter((item) => item.orderId !== order.id);

            return {
                ...data,
                count: notifications.length,
                orderIds: data.orderIds.filter((id) => id !== order.id),
                notifications,
            };
        });
        queryClient.invalidateQueries({queryKey: unreadNotificationsQueryKey}).catch(() => undefined);

        markOrderNotificationsRead(order.id)
            .then(() => queryClient.invalidateQueries({queryKey: unreadNotificationsQueryKey}))
            .catch(() => undefined);
    }, [queryClient]);

    const handlePickAvatar = async () => {
        if (uploadAvatarMutation.isPending || deleteAvatarMutation.isPending) {
            return;
        }

        setMessage("");
        uploadAvatarMutation.reset();
        deleteAvatarMutation.reset();

        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync(false);

        if (!permission.granted) {
            setMessage("Разрешите доступ к фото, чтобы выбрать аватар.");
            return;
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
                selectionLimit: 1,
            });

            if (result.canceled || !result.assets[0]) {
                return;
            }

            const avatar = await prepareAvatarUpload(result.assets[0]);
            uploadAvatarMutation.mutate(avatar);
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Не удалось подготовить изображение.");
        }
    };

    const handleDeleteAvatar = () => {
        if (uploadAvatarMutation.isPending || deleteAvatarMutation.isPending) {
            return;
        }

        setMessage("");
        uploadAvatarMutation.reset();
        deleteAvatarMutation.reset();
        deleteAvatarMutation.mutate();
    };

    const handleLogout = () => {
        setIsLoggingOut(true);
        router.replace("/");
        void logout();
    };

    const handleOpenDeleteAccount = () => {
        setMessage("");
        deleteAccountMutation.reset();
        setIsDeleteAccountModalVisible(true);
    };

    const handleCloseDeleteAccount = () => {
        if (deleteAccountMutation.isPending) {
            return;
        }

        setIsDeleteAccountModalVisible(false);
    };

    const handleProfileFieldFocus: ProfileFieldFocusHandler = (event) => {
        const target = event.target;

        requestAnimationFrame(() => {
            const keyboardHeight = keyboardHeightRef.current || (Platform.OS === "android" ? 320 : 300);
            const visibleHeight = Dimensions.get("window").height - keyboardHeight - 92;

            target.measure((_x, _y, _width, height, _pageX, pageY) => {
                const fieldBottom = pageY + height;

                if (fieldBottom <= visibleHeight) {
                    return;
                }

                scrollViewRef.current?.scrollTo({
                    y: fieldBottom - visibleHeight + 36,
                    animated: true,
                });
            });
        });
    };

    if (hasHydrated && !user) {
        return <Screen withTopInset />;
    }

    return (
        <Screen withTopInset>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "position"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
                style={styles.root}
                contentContainerStyle={styles.keyboardAvoidingContent}
            >
                <ScrollView
                    ref={scrollViewRef}
                    showsVerticalScrollIndicator={false}
                    scrollIndicatorInsets={{bottom: 180}}
                    keyboardDismissMode="interactive"
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
                        isUpdatingAvatar={uploadAvatarMutation.isPending || deleteAvatarMutation.isPending}
                        onChangeAvatar={handlePickAvatar}
                        onDeleteAvatar={handleDeleteAvatar}
                        onLogout={handleLogout}
                    />

                    <SegmentedControl
                        value={activeTab}
                        options={[
                            {value: "profile", label: "Данные"},
                            {value: "orders", label: "Заказы", badgeCount: unreadOrdersCount},
                        ]}
                        onChange={setActiveTab}
                    />

                    {isInitialLoading ? (
                        <LoadingBlock />
                    ) : activeTab === "profile" ? (
                        <>
                            <ProfileDetails
                                profile={profile}
                                form={form}
                                message={message}
                                errorMessage={errorMessage}
                                isSaving={saveProfileMutation.isPending}
                                onChange={(field, value) => {
                                    setMessage("");
                                    saveProfileMutation.reset();
                                    setForm((prev) => ({...prev, [field]: value}));
                                }}
                                onFieldFocus={handleProfileFieldFocus}
                                onSave={() => saveProfileMutation.mutate(form)}
                            />
                            <ProfileLinks
                                isDeletingAccount={deleteAccountMutation.isPending}
                                onOpenSupport={() => supportSheetRef.current?.open()}
                                onDeleteAccount={handleOpenDeleteAccount}
                            />
                        </>
                    ) : (
                        <OrdersSection
                            activeTab={ordersTab}
                            currentOrders={displayedCurrentOrders}
                            historyOrders={displayedHistoryOrders}
                            menuItemLookup={menuItemLookup}
                            refreshingOrderIds={refreshingOrderIds}
                            onChangeTab={setOrdersTab}
                            onOpenOrder={handleOpenOrder}
                            onRefreshOrder={handleRefreshOrderStatus}
                            onContinuePayment={handleContinuePayment}
                        />
                    )}
                </ScrollView>
            </KeyboardAvoidingView>

            <DeleteAccountModal
                visible={isDeleteAccountModalVisible}
                isDeleting={deleteAccountMutation.isPending}
                onClose={handleCloseDeleteAccount}
                onConfirm={() => deleteAccountMutation.mutate()}
            />

            <SupportSheet
                ref={supportSheetRef}
                organizations={organizations}
            />
        </Screen>
    );
}

function ProfileLinks({
    onOpenSupport,
    onDeleteAccount,
    isDeletingAccount,
}: {
    onOpenSupport: () => void;
    onDeleteAccount: () => void;
    isDeletingAccount: boolean;
}) {
    return (
        <View style={styles.linksBlock}>
            {profileLegalItems.map((item) => (
                <Pressable
                    key={item.label}
                    accessibilityRole="button"
                    disabled={item.danger && isDeletingAccount}
                    style={({pressed}) => [
                        styles.linkRow,
                        item.danger && isDeletingAccount && styles.disabled,
                        pressed && styles.pressed,
                    ]}
                    onPress={
                        item.key === "support"
                            ? onOpenSupport
                            : item.danger
                                ? onDeleteAccount
                                : undefined
                    }
                >
                    <View style={[styles.linkIcon, item.danger && styles.linkIconDanger]}>
                        <MaterialCommunityIcons
                            name={item.icon}
                            size={19}
                            color={item.danger ? themeColors.notification : themeColors.primary}
                        />
                    </View>
                    <Text style={[styles.linkText, item.danger && styles.linkTextDanger]}>
                        {item.label}
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color={themeColors.textSecondary} />
                </Pressable>
            ))}

            <View style={styles.versionBadge}>
                <MaterialCommunityIcons
                    name="cellphone-check"
                    size={14}
                    color={themeColors.primary}
                />
                <Text style={styles.versionText}>Версия {appVersion}</Text>
            </View>
        </View>
    );
}

const SupportSheet = forwardRef<AppBottomSheetRef, {organizations: Organization[]}>(
    ({organizations}, ref) => {
        const restaurants = organizations.filter((organization) => (
            organization.name || organization.address || organization.phone
        ));

        return (
            <AppBottomSheetModal
                ref={ref}
                title="Поддержка"
                showCloseButton
                scrollable
                snapPoints={["72%"]}
                enableDynamicSizing={false}
                backgroundStyle={styles.supportSheetBackground}
                handleIndicatorStyle={styles.orderSheetHandle}
                containerStyle={styles.supportSheetContainer}
                contentContainerStyle={styles.supportSheetContent}
            >
                <View style={styles.supportIntro}>
                    <View style={styles.supportIntroIcon}>
                        <MaterialCommunityIcons
                            name="lifebuoy"
                            size={22}
                            color={themeColors.primary}
                        />
                    </View>
                    <View style={styles.supportIntroText}>
                        <Text style={styles.supportTitle}>Свяжитесь с рестораном</Text>
                        <Text style={styles.supportSubtitle}>
                            Выберите нужный адрес, позвоните или напишите нам в WhatsApp.
                        </Text>
                    </View>
                </View>

                {restaurants.length ? (
                    <View style={styles.supportRestaurantsList}>
                        {restaurants.map((restaurant) => (
                            <SupportRestaurantCard
                                key={restaurant.id}
                                restaurant={restaurant}
                            />
                        ))}
                    </View>
                ) : (
                    <View style={styles.supportEmpty}>
                        <MaterialCommunityIcons
                            name="store-clock-outline"
                            size={30}
                            color={themeColors.primary}
                        />
                        <Text style={styles.supportEmptyTitle}>Контакты загружаются</Text>
                        <Text style={styles.supportEmptyText}>
                            Обновите экран профиля или попробуйте открыть поддержку чуть позже.
                        </Text>
                    </View>
                )}
            </AppBottomSheetModal>
        );
    }
);

SupportSheet.displayName = "SupportSheet";

function SupportRestaurantCard({restaurant}: {restaurant: Organization}) {
    const phone = restaurant.phone?.trim() ?? "";
    const address = restaurant.address?.trim() || "Адрес уточняйте по телефону";
    const scheduleLines = restaurant.scheduleLines?.length
        ? restaurant.scheduleLines
        : [restaurant.schedule || "График уточняйте по телефону"];
    const formattedPhone = phone ? formatRuPhoneDisplay(phone) : "Телефон уточняется";
    const canContact = Boolean(phone);

    const handleCall = () => {
        if (!phone) {
            return;
        }

        void openExternalUrl(getPhoneUrl(phone));
    };

    const handleWhatsApp = () => {
        if (!phone) {
            return;
        }

        const whatsappPhone = getWhatsAppPhone(phone);
        const text = encodeURIComponent(
            `Здравствуйте! Хочу уточнить информацию по ресторану ${restaurant.name}.`
        );

        void openExternalUrl(
            `whatsapp://send?phone=${whatsappPhone}&text=${text}`,
            `https://wa.me/${whatsappPhone}?text=${text}`
        );
    };

    return (
        <View style={styles.supportRestaurantCard}>
            <View style={styles.supportRestaurantHeader}>
                <View style={styles.supportRestaurantIcon}>
                    <MaterialCommunityIcons
                        name="storefront-outline"
                        size={22}
                        color={themeColors.primary}
                    />
                </View>
                <View style={styles.supportRestaurantTitleWrap}>
                    <Text style={styles.supportRestaurantName} numberOfLines={1}>
                        {restaurant.name || "Ресторан"}
                    </Text>
                    <Text style={styles.supportRestaurantAddress} numberOfLines={2}>
                        {address}
                    </Text>
                </View>
            </View>

            <View style={styles.supportInfoList}>
                <SupportInfoRow
                    icon="phone-outline"
                    label="Телефон"
                    value={formattedPhone}
                />
                <SupportInfoRow
                    icon="map-marker-outline"
                    label="Адрес"
                    value={address}
                />
                <View style={styles.supportInfoRow}>
                    <MaterialCommunityIcons
                        name="clock-outline"
                        size={18}
                        color={themeColors.primary}
                    />
                    <View style={styles.supportInfoTextWrap}>
                        <Text style={styles.supportInfoLabel}>График работы</Text>
                        {scheduleLines.map((line) => (
                            <Text
                                key={`${restaurant.id}-${line}`}
                                style={styles.supportInfoValue}
                            >
                                {line}
                            </Text>
                        ))}
                    </View>
                </View>
            </View>

            <View style={styles.supportActions}>
                <Pressable
                    accessibilityRole="button"
                    disabled={!canContact}
                    style={({pressed}) => [
                        styles.supportCallButton,
                        !canContact && styles.disabled,
                        pressed && styles.pressed,
                    ]}
                    onPress={handleCall}
                >
                    <Ionicons name="call" size={18} color={themeColors.textOnPrimary} />
                    <Text style={styles.supportCallButtonText} numberOfLines={1}>
                        Позвонить
                    </Text>
                </Pressable>

                <Pressable
                    accessibilityRole="button"
                    disabled={!canContact}
                    style={({pressed}) => [
                        styles.supportWhatsappButton,
                        !canContact && styles.disabled,
                        pressed && styles.pressed,
                    ]}
                    onPress={handleWhatsApp}
                >
                    <MaterialCommunityIcons
                        name="whatsapp"
                        size={20}
                        color={themeColors.text}
                    />
                    <Text style={styles.supportWhatsappButtonText} numberOfLines={1}>
                        WhatsApp
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

function SupportInfoRow({
    icon,
    label,
    value,
}: {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    label: string;
    value: string;
}) {
    return (
        <View style={styles.supportInfoRow}>
            <MaterialCommunityIcons name={icon} size={18} color={themeColors.primary} />
            <View style={styles.supportInfoTextWrap}>
                <Text style={styles.supportInfoLabel}>{label}</Text>
                <Text style={styles.supportInfoValue}>{value}</Text>
            </View>
        </View>
    );
}

function DeleteAccountModal({
    visible,
    isDeleting,
    onClose,
    onConfirm,
}: {
    visible: boolean;
    isDeleting: boolean;
    onClose: () => void;
    onConfirm: () => void;
}) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.modalBackdrop} onPress={onClose}>
                <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
                    <Text style={styles.modalTitle}>Удалить аккаунт?</Text>
                    <Text style={styles.modalText}>
                        РџСЂРѕС„РёР»СЊ Р±СѓРґРµС‚ СѓРґР°Р»РµРЅ Р±РµР· РІРѕР·РјРѕР¶РЅРѕСЃС‚Рё РІРѕСЃСЃС‚Р°РЅРѕРІР»РµРЅРёСЏ. РСЃС‚РѕСЂРёСЏ Р°РєРєР°СѓРЅС‚Р°
                        Р±РѕР»СЊС€Рµ РЅРµ Р±СѓРґРµС‚ РґРѕСЃС‚СѓРїРЅР°.
                    </Text>

                    <View style={styles.modalActions}>
                        <Pressable
                            accessibilityRole="button"
                            disabled={isDeleting}
                            style={({pressed}) => [
                                styles.modalCancel,
                                isDeleting && styles.disabled,
                                pressed && styles.pressed,
                            ]}
                            onPress={onClose}
                        >
                            <Text style={styles.modalCancelText}>Отмена</Text>
                        </Pressable>
                        <Pressable
                            accessibilityRole="button"
                            disabled={isDeleting}
                            style={({pressed}) => [
                                styles.modalDelete,
                                isDeleting && styles.disabled,
                                pressed && styles.pressed,
                            ]}
                            onPress={onConfirm}
                        >
                            {isDeleting ? (
                                <ActivityIndicator color={themeColors.textOnPrimary} />
                            ) : (
                                <Text style={styles.modalDeleteText}>Удалить</Text>
                            )}
                        </Pressable>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

function ProfileHero({
    profile,
    fallbackUser,
    activeOrdersCount,
    historyOrdersCount,
    isUpdatingAvatar,
    onChangeAvatar,
    onDeleteAvatar,
    onLogout,
}: {
    profile?: CustomerProfile;
    fallbackUser: ReturnType<typeof useProfileStore.getState>["user"];
    activeOrdersCount: number;
    historyOrdersCount: number;
    isUpdatingAvatar: boolean;
    onChangeAvatar: () => void;
    onDeleteAvatar: () => void;
    onLogout: () => void;
}) {
    const name = profile?.name || fallbackUser?.name || "Гость Mangal Clubs";
    const phone = profile?.phone || fallbackUser?.phone || "";
    const avatarUrl = resolveApiAssetUrl(
        profile?.avatarUrl ||
        profile?.avatar_url ||
        fallbackUser?.avatarUrl ||
        fallbackUser?.avatar_url
    );

    return (
        <View style={styles.hero}>
            <View style={styles.heroTop}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={avatarUrl ? "Изменить аватар" : "Добавить аватар"}
                    disabled={isUpdatingAvatar}
                    style={({pressed}) => [
                        styles.avatar,
                        isUpdatingAvatar && styles.disabled,
                        pressed && styles.pressed,
                    ]}
                    onPress={onChangeAvatar}
                >
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
                    <View style={styles.avatarActionBadge}>
                        {isUpdatingAvatar ? (
                            <ActivityIndicator size="small" color={themeColors.textOnPrimary} />
                        ) : (
                            <MaterialCommunityIcons
                                name="camera-outline"
                                size={15}
                                color={themeColors.textOnPrimary}
                            />
                        )}
                    </View>
                </Pressable>

                <View style={styles.heroText}>
                    <Text style={styles.eyebrow}>Профиль</Text>
                    <Text style={styles.heroTitle} numberOfLines={1}>{name}</Text>
                    <Text style={styles.heroSubtitle} numberOfLines={1}>
                        {phone ? formatRuPhoneDisplay(phone) : "Телефон подтвержден"}
                    </Text>
                </View>

                {avatarUrl ? (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Удалить аватар"
                        disabled={isUpdatingAvatar}
                        hitSlop={10}
                        style={({pressed}) => [
                            styles.iconButton,
                            isUpdatingAvatar && styles.disabled,
                            pressed && styles.pressed,
                        ]}
                        onPress={onDeleteAvatar}
                    >
                        <MaterialCommunityIcons name="trash-can-outline" size={20} color={themeColors.text} />
                    </Pressable>
                ) : null}

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
    options: Array<{value: T; label: string; badgeCount?: number}>;
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
                        {option.badgeCount ? (
                            <View style={styles.segmentBadge}>
                                <Text style={styles.segmentBadgeText} numberOfLines={1}>
                                    {option.badgeCount > 99 ? "99+" : option.badgeCount}
                                </Text>
                            </View>
                        ) : null}
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
    onFieldFocus,
    onSave,
}: {
    profile?: CustomerProfile;
    form: ProfileForm;
    message: string;
    errorMessage: string;
    isSaving: boolean;
    onChange: (field: keyof ProfileForm, value: string) => void;
    onFieldFocus: ProfileFieldFocusHandler;
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
                    onFocus={onFieldFocus}
                    onChangeText={(value) => onChange("name", value)}
                />
                <FormField
                    label="Email"
                    value={form.email}
                    placeholder="name@example.com"
                    icon="email-outline"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={onFieldFocus}
                    onChangeText={(value) => onChange("email", value)}
                />
                <FormField
                    label="Дата рождения"
                    value={form.birthday}
                    placeholder="ГГГГ-ММ-ДД"
                    icon="calendar-month-outline"
                    keyboardType="numbers-and-punctuation"
                    maxLength={10}
                    onFocus={onFieldFocus}
                    onChangeText={(value) => onChange("birthday", formatBirthdayInputValue(value))}
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
    onOpenOrder,
    onRefreshOrder,
    onContinuePayment,
}: {
    activeTab: OrdersTab;
    currentOrders: CustomerOrder[];
    historyOrders: CustomerOrder[];
    menuItemLookup: Map<string, MenuItem>;
    refreshingOrderIds: string[];
    onChangeTab: (tab: OrdersTab) => void;
    onOpenOrder: (order: CustomerOrder) => void;
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
        onOpenOrder(order);
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
                    {order.hasUnreadNotification ? (
                        <View style={styles.orderUnreadBadge} />
                    ) : null}
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
