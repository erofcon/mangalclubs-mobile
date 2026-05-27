import * as Location from "expo-location";
import {Platform} from "react-native";

import type { Coordinates } from "@/utils/location-config";

type DeviceLocationErrorCode =
    | "permission-denied"
    | "permission-blocked"
    | "services-disabled"
    | "unavailable";

export class DeviceLocationError extends Error {
    constructor(
        public readonly code: DeviceLocationErrorCode,
        message: string
    ) {
        super(message);
        this.name = "DeviceLocationError";
    }
}

export async function getCurrentDeviceCoordinates(): Promise<Coordinates> {
    let servicesEnabled = await Location.hasServicesEnabledAsync().catch(() => true);

    if (!servicesEnabled && Platform.OS === "android") {
        await Location.enableNetworkProviderAsync().catch(() => {
        });
        servicesEnabled = await Location.hasServicesEnabledAsync().catch(() => false);
    }

    if (!servicesEnabled) {
        throw new DeviceLocationError(
            "services-disabled",
            "Геолокация выключена на устройстве."
        );
    }

    const currentPermission = await Location.getForegroundPermissionsAsync();
    const permission = currentPermission.granted
        ? currentPermission
        : currentPermission.canAskAgain
            ? await Location.requestForegroundPermissionsAsync()
            : currentPermission;

    if (!permission.granted) {
        throw new DeviceLocationError(
            permission.canAskAgain ? "permission-denied" : "permission-blocked",
            permission.canAskAgain
                ? "Доступ к геолокации не разрешен."
                : "Доступ к геолокации запрещен в настройках приложения."
        );
    }

    const currentPosition = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        mayShowUserSettingsDialog: true,
    });

    if (!currentPosition) {
        throw new DeviceLocationError(
            "unavailable",
            "Не удалось получить текущие координаты."
        );
    }

    return {
        latitude: currentPosition.coords.latitude,
        longitude: currentPosition.coords.longitude,
        accuracy: currentPosition.coords.accuracy ?? null,
    };
}

export function getHumanLocationError(error: unknown): string {
    if (error instanceof DeviceLocationError) {
        switch (error.code) {
            case "permission-denied":
                return "Доступ к геолокации не разрешен.";
            case "permission-blocked":
                return "Доступ к геолокации запрещен в настройках приложения.";
            case "services-disabled":
                return "На устройстве выключена геолокация.";
            case "unavailable":
                return "Не удалось получить текущие координаты.";
        }
    }

    return "Не удалось определить геопозицию. Попробуйте еще раз.";
}
