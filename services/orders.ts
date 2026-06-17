import {apiFetch} from "@/services/api";

export type OrderRequestType = "delivery" | "pickup";

export type OrderCreateItem = {
    productId: string;
    amount: number;
    price?: number;
    productSizeId?: string;
    comment?: string;
    modifiers?: Array<{
        productId: string;
        amount: number;
        productGroupId?: string;
        price?: number;
    }>;
};

export type OrderCreatePayload = {
    orderType: OrderRequestType;
    organizationId?: string;
    organizationSlug?: string;
    successUrl?: string;
    failUrl?: string;
    phone?: string;
    comment?: string;
    completeBefore?: string;
    deliveryPoint?: {
        address: {
            city: string;
            street: string;
            house: string;
            index?: string;
            building?: string;
            flat?: string;
            entrance?: string;
            floor?: string;
            doorphone?: string;
            regionId?: string;
        };
        coordinates: {
            latitude: number;
            longitude: number;
        };
        comment?: string;
        externalCartographyId?: string;
    };
    guestsCount: number;
    items: OrderCreateItem[];
};

export type PaymentStatus =
    | "payment_pending"
    | "payment_form_created"
    | "paid"
    | "payment_failed"
    | "payment_cancelled"
    | "payment_expired";

export type OrderPayment = {
    id?: string;
    status?: PaymentStatus | string | null;
    amount?: number | null;
    amountKopecks?: number | null;
    bankOrderId?: string | null;
    bankPaymentId?: string | null;
    paymentUrl?: string | null;
};

export type OrderCreateOut = {
    id: string;
    publicNumber: string;
    customerId?: string | null;
    organizationId: string;
    organizationSlug: string;
    iikoOrganizationId: string;
    terminalGroupId?: string | null;
    orderType: OrderRequestType;
    iikoOrderTypeId?: string | null;
    iikoOrderServiceType?: string | null;
    paymentStatus: PaymentStatus | string;
    totalSum: number;
    delivery?: Record<string, unknown> | null;
    payment: OrderPayment;
};

export type OrderStatusOut = {
    id?: string | null;
    publicNumber?: string | null;
    correlationId?: string | null;
    organizationId?: string;
    organizationSlug?: string;
    iikoOrganizationId?: string;
    orderType?: OrderRequestType;
    iikoOrderId?: string | null;
    creationStatus?: string | null;
    orderStatus?: string | null;
    paymentStatus?: PaymentStatus | string | null;
    paymentAmountKopecks?: number | null;
    number?: number;
    sum?: number | null;
    completeBefore?: string | null;
    comment?: string | null;
    notificationEvent?: string | null;
    shouldNotifyCustomer?: boolean;
    errorInfo?: Record<string, unknown> | null;
};

export const LAST_ORDER_ID_STORAGE_KEY = "mangalclubs-last-order-id";

export const createOrder = (payload: OrderCreatePayload) => (
    apiFetch<OrderCreateOut>("/api/v1/orders", {
        method: "POST",
        body: JSON.stringify(payload),
    })
);

export const getOrderStatus = (orderId: string) => (
    apiFetch<OrderStatusOut>(`/api/v1/orders/me/${encodeURIComponent(orderId)}/status`)
);
