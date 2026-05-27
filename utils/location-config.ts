import {Linking, Platform} from "react-native";

export type Coordinates = {
    latitude: number;
    longitude: number;
    accuracy?: number | null;
};

export type PickupPoint = {
    name: string;
    city: string;
    address: string;
    schedule: string;
    phone: string;
    coordinates: Coordinates;
};

export const DEFAULT_MAP_POINT: Coordinates = {
    latitude: 55.7558,
    longitude: 37.6176,
    accuracy: null,
};

export const PICKUP_POINT: PickupPoint = {
    name: "Mangal Club",
    city: "г. Грозный",
    address: "ул. Светлая улица, 105А",
    schedule: "Ежедневно с 10:30 до 01:30",
    phone: "+7 (928) 340-50-50",
    coordinates: {
        latitude: 43.359307,
        longitude: 45.697802,
        accuracy: null,
    },
};

export const DEFAULT_REGION = {
    latitude: PICKUP_POINT.coordinates.latitude,
    longitude: PICKUP_POINT.coordinates.longitude,
    latitudeDelta: 0.028,
    longitudeDelta: 0.028,
};

export async function openRouteToPickupPoint() {
    const {latitude, longitude} = PICKUP_POINT.coordinates;
    const destinationLabel = encodeURIComponent(PICKUP_POINT.name);
    const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

    if (Platform.OS === "web") {
        await Linking.openURL(webUrl);
        return;
    }

    const yandexNavi = `yandexnavi://build_route_on_map?lat_to=${latitude}&lon_to=${longitude}`;
    if (await Linking.canOpenURL(yandexNavi)) {
        await Linking.openURL(yandexNavi);
        return;
    }

    if (Platform.OS === "ios") {
        const appleMaps = `http://maps.apple.com/?daddr=${latitude},${longitude}&q=${destinationLabel}`;
        if (await Linking.canOpenURL(appleMaps)) {
            await Linking.openURL(appleMaps);
            return;
        }
    }

    if (Platform.OS === "android") {
        const geoIntent = `geo:0,0?q=${latitude},${longitude}(${destinationLabel})`;
        if (await Linking.canOpenURL(geoIntent)) {
            await Linking.openURL(geoIntent);
            return;
        }
    }

    await Linking.openURL(webUrl);
}
