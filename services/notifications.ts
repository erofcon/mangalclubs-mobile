import {apiFetch} from "@/services/api";

export const unreadNotificationsQueryKey = ["notifications", "unread"] as const;
export const currentOrdersQueryKey = ["customer-orders", "current"] as const;
export const historyOrdersQueryKey = ["customer-orders", "history"] as const;

export type CustomerUnreadNotifications = {
    count: number;
    orderIds: string[];
    notifications: Array<{
        id: string;
        orderId: string;
        eventType: string;
        title: string;
        body: string;
        isRead: boolean;
        createdAt: string;
    }>;
};

export type CustomerDeviceRegistration = {
    deviceId: string;
    pushToken: string;
    platform?: string;
    deviceName?: string;
};

export const registerNotificationDevice = (payload: CustomerDeviceRegistration) => (
    apiFetch("/api/v1/notifications/devices", {
        method: "POST",
        body: JSON.stringify(payload),
    })
);

export const deactivateNotificationDevice = (deviceId: string) => (
    apiFetch<void>(`/api/v1/notifications/devices/${encodeURIComponent(deviceId)}`, {
        method: "DELETE",
    })
);

export const getUnreadNotifications = () => (
    apiFetch<CustomerUnreadNotifications>("/api/v1/notifications/me/unread")
);

export const markOrderNotificationsRead = (orderId: string) => (
    apiFetch<void>(`/api/v1/notifications/me/orders/${encodeURIComponent(orderId)}/read`, {
        method: "POST",
    })
);
