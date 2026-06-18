import {apiFetch} from "@/services/api";

export type CustomerProfile = {
    id: string;
    phone: string;
    name?: string | null;
    email?: string | null;
    birthday?: string | null;
    avatarUrl?: string | null;
    avatar_url?: string | null;
    createdAt?: string;
    updatedAt?: string;
};

export type CustomerProfilePatch = {
    name?: string | null;
    email?: string | null;
    birthday?: string | null;
};

export type CustomerAvatarUpload = {
    uri: string;
    name: string;
    type: string;
};

export type OrderPayment = {
    id?: string;
    status?: string | null;
    amount?: number | null;
    amountKopecks?: number | null;
    bankOrderId?: string | null;
    bankPaymentId?: string | null;
    paymentUrl?: string | null;
};

export type CustomerOrderItem = {
    id?: string;
    productId?: string;
    productSizeId?: string;
    name?: string;
    productName?: string;
    title?: string;
    image?: string;
    imageUrl?: string;
    productImage?: string;
    sizeName?: string | null;
    sku?: string | null;
    comment?: string | null;
    amount?: number;
    quantity?: number;
    price?: number;
    sum?: number;
    total?: number;
    modifiers?: CustomerOrderItem[];
    product?: {
        name?: string;
        title?: string;
        image?: string;
        imageUrl?: string;
    };
};

export type CustomerOrder = {
    id: string;
    publicNumber: string;
    organizationId: string;
    organizationSlug?: string;
    orderType?: "delivery" | "pickup";
    phone?: string;
    comment?: string | null;
    completeBefore?: string | null;
    guestsCount?: number;
    deliveryPoint?: Record<string, unknown> | null;
    items?: CustomerOrderItem[];
    paymentStatus?: string | null;
    paymentAmountKopecks?: number | null;
    payment?: OrderPayment | null;
    iikoOrderId?: string | null;
    iikoExternalNumber?: string | null;
    creationStatus?: string | null;
    orderStatus?: string | null;
    notificationEvent?: "pickup_ready" | "delivery_on_way" | "delivery_delivered" | null;
    hasUnreadNotification?: boolean;
    totalSum?: number | null;
    createdAt?: string;
    updatedAt?: string;
};

export type CustomerOrderStatus = Partial<CustomerOrder> & {
    shouldNotifyCustomer?: boolean;
    errorInfo?: Record<string, unknown>;
};

export const getCustomerProfile = () => (
    apiFetch<CustomerProfile>("/api/v1/customers/me")
);

export const updateCustomerProfile = (payload: CustomerProfilePatch) => (
    apiFetch<CustomerProfile>("/api/v1/customers/me", {
        method: "PATCH",
        body: JSON.stringify(payload),
    })
);

export const uploadCustomerAvatar = (avatar: CustomerAvatarUpload) => {
    const formData = new FormData();

    formData.append("avatar", avatar as unknown as Blob);

    return apiFetch<CustomerProfile>("/api/v1/customers/me/avatar", {
        method: "POST",
        body: formData,
    });
};

export const deleteCustomerAvatar = () => (
    apiFetch<void>("/api/v1/customers/me/avatar", {
        method: "DELETE",
    })
);

export const deleteCustomerProfile = () => (
    apiFetch<void>("/api/v1/customers/me", {
        method: "DELETE",
    })
);

export const getCurrentCustomerOrders = () => (
    apiFetch<CustomerOrder[]>("/api/v1/orders/me/current")
);

export const getHistoryCustomerOrders = () => (
    apiFetch<CustomerOrder[]>("/api/v1/orders/me/history")
);

export const getCustomerOrderStatus = (orderId: string) => (
    apiFetch<CustomerOrderStatus>(`/api/v1/orders/me/${encodeURIComponent(orderId)}/status`)
);
