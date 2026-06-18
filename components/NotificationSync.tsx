import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {useEffect} from "react";
import {AppState, Platform} from "react-native";

import {
    currentOrdersQueryKey,
    getUnreadNotifications,
    historyOrdersQueryKey,
    registerNotificationDevice,
    unreadNotificationsQueryKey,
} from "@/services/notifications";
import {getDeviceName, getStoredDeviceId, useProfileStore} from "@/store/profile-store";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

const getExpoProjectId = () => (
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId ??
    undefined
);

export function NotificationSync() {
    const queryClient = useQueryClient();
    const user = useProfileStore((state) => state.user);
    const hasHydrated = useProfileStore((state) => state.hasHydrated);
    const enabled = hasHydrated && Boolean(user);

    const unreadNotificationsQuery = useQuery({
        queryKey: unreadNotificationsQueryKey,
        queryFn: getUnreadNotifications,
        enabled,
        refetchInterval: 15000,
    });

    useEffect(() => {
        if (!enabled || !unreadNotificationsQuery.data) {
            return;
        }

        queryClient.invalidateQueries({queryKey: currentOrdersQueryKey}).catch(() => undefined);
        queryClient.invalidateQueries({queryKey: historyOrdersQueryKey}).catch(() => undefined);
    }, [enabled, queryClient, unreadNotificationsQuery.data?.count, unreadNotificationsQuery.data?.orderIds]);

    useEffect(() => {
        if (!enabled || Platform.OS === "web") {
            return;
        }

        let isMounted = true;

        const register = async () => {
            try {
                if (Platform.OS === "android") {
                    await Notifications.setNotificationChannelAsync("orders", {
                        name: "Orders",
                        importance: Notifications.AndroidImportance.HIGH,
                        vibrationPattern: [0, 250, 250, 250],
                        lightColor: "#ECAC18",
                    });
                }

                const existingPermission = await Notifications.getPermissionsAsync();
                const finalPermission = existingPermission.status === "granted"
                    ? existingPermission
                    : await Notifications.requestPermissionsAsync();

                if (!isMounted || finalPermission.status !== "granted") {
                    return;
                }

                const projectId = getExpoProjectId();
                const tokenResult = await Notifications.getExpoPushTokenAsync(
                    projectId ? {projectId} : undefined
                );
                const deviceId = await getStoredDeviceId();

                await registerNotificationDevice({
                    deviceId,
                    pushToken: tokenResult.data,
                    platform: Platform.OS,
                    deviceName: getDeviceName(),
                });
                await queryClient.invalidateQueries({queryKey: unreadNotificationsQueryKey});
                await queryClient.invalidateQueries({queryKey: currentOrdersQueryKey});
            } catch {
                // Push registration should never block the app shell.
            }
        };

        register();

        return () => {
            isMounted = false;
        };
    }, [enabled, queryClient]);

    useEffect(() => {
        if (!enabled || Platform.OS === "web") {
            return;
        }

        const refreshNotificationState = () => {
            queryClient.invalidateQueries({queryKey: unreadNotificationsQueryKey}).catch(() => undefined);
            queryClient.invalidateQueries({queryKey: currentOrdersQueryKey}).catch(() => undefined);
            queryClient.invalidateQueries({queryKey: historyOrdersQueryKey}).catch(() => undefined);
        };

        const receivedSubscription = Notifications.addNotificationReceivedListener(() => {
            refreshNotificationState();
        });
        const responseSubscription = Notifications.addNotificationResponseReceivedListener(() => {
            refreshNotificationState();
        });
        const appStateSubscription = AppState.addEventListener("change", (state) => {
            if (state === "active") {
                refreshNotificationState();
            }
        });

        return () => {
            receivedSubscription.remove();
            responseSubscription.remove();
            appStateSubscription.remove();
        };
    }, [enabled, queryClient]);

    return null;
}
