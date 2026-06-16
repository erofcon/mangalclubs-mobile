import {apiFetch} from "@/services/api";

export type DeliveryCoordinates = {
    latitude: number;
    longitude: number;
};

export type DeliveryZone = {
    id: string;
    distance_from_km: number;
    distance_to_km: number | null;
    price: number;
};

export type DeliveryArea = {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
};

export type DeliverySettings = {
    deliveryArea: DeliveryArea;
    pricingZones: DeliveryZone[];
};

export type DeliveryCheckAddress = {
    formatted?: string | null;
    country?: string | null;
    countryCode?: string | null;
    region?: string | null;
    city?: string | null;
    district?: string | null;
    suburb?: string | null;
    street?: string | null;
    house?: string | null;
    postcode?: string | null;
    placeId?: string | null;
    source?: string | null;
};

export type DeliveryCheckResult = {
    available: boolean;
    reason: string | null;
    distanceKm: number;
    price: number | null;
    zone: DeliveryZone | null;
    address: DeliveryCheckAddress | null;
};

export type DeliveryCheckPayload = {
    coordinates: DeliveryCoordinates;
    organizationId?: string;
    organizationSlug?: string;
};

export const checkDeliveryZone = (
    payload: DeliveryCheckPayload,
    signal?: AbortSignal
) => (
    apiFetch<DeliveryCheckResult>("/api/v1/delivery-zones/check", {
        method: "POST",
        signal,
        body: JSON.stringify(payload),
    })
);

export const getDeliverySettings = (signal?: AbortSignal) => (
    apiFetch<DeliverySettings>("/api/v1/delivery-zones/settings", {signal})
);
