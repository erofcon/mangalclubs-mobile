import {Linking} from "react-native";

import type {Booking} from "@/types/booking";
import type {Organization} from "@/types/organization";

const DEFAULT_BOOKING_IMAGE_PATH =
    "@/assets/booking/609686908_18097555516907715_1890579568138563188_n..jpg";

const bookingImageMap: Record<string, number> = {
    "@/assets/booking/609686908_18097555516907715_1890579568138563188_n..jpg": require("@/assets/mocks/booking/609686908_18097555516907715_1890579568138563188_n..jpg"),
    "@/assets/booking/609720157_18097555507907715_5416527739075581508_n..jpg": require("@/assets/mocks/booking/609720157_18097555507907715_5416527739075581508_n..jpg"),
    "@/assets/booking/609982327_18097555342907715_1986147056012483252_n..jpg": require("@/assets/mocks/booking/609982327_18097555342907715_1986147056012483252_n..jpg"),
    "@/assets/booking/610002010_18097554682907715_6683000151825881101_n..jpg": require("@/assets/mocks/booking/610002010_18097554682907715_6683000151825881101_n..jpg"),
    "@/assets/booking/610633596_18097555435907715_5781624860738448425_n..jpg": require("@/assets/mocks/booking/610633596_18097555435907715_5781624860738448425_n..jpg"),
    "@/assets/booking/610683031_18097554145907715_1235544446749212874_n..jpg": require("@/assets/mocks/booking/610683031_18097554145907715_1235544446749212874_n..jpg"),
    "@/assets/booking/611264128_18097554673907715_2049357468313814860_n..jpg": require("@/assets/mocks/booking/611264128_18097554673907715_2049357468313814860_n..jpg"),
};

export function getBookingImageSource(path?: string) {
    if (!path) {
        return bookingImageMap[DEFAULT_BOOKING_IMAGE_PATH];
    }

    if (/^https?:\/\//i.test(path)) {
        return {uri: path};
    }

    return bookingImageMap[path] ?? bookingImageMap[DEFAULT_BOOKING_IMAGE_PATH];
}

export function getBookingImagePaths(booking: Booking | null) {
    if (!booking) {
        return [];
    }

    const preferredImages = booking.verticalImages?.length
        ? booking.verticalImages
        : [booking.image, ...(booking.images ?? [])];
    const paths = preferredImages.filter(Boolean) as string[];

    return Array.from(new Set(paths));
}

export function getBookingPrimaryImageSource(booking: Booking) {
    return getBookingImageSource(getBookingImagePaths(booking)[0]);
}

export function getBookingImages(booking: Booking | null) {
    return getBookingImagePaths(booking).map(getBookingImageSource);
}

export function getOrganization(
    organizations: Organization[],
    organizationId?: Organization["id"],
) {
    return organizations.find((organization) => organization.id === organizationId) ?? null;
}

export function getBookingOrganizationName(
    booking: Booking,
    organization?: Organization | null,
) {
    return organization?.name ?? booking.organization?.name ?? "Ресторан";
}

export function getBookingOrganizationPhone(
    booking: Booking,
    organization?: Organization | null,
) {
    return organization?.phone ?? booking.organization?.phone ?? "";
}

export function getCategoryTitle(booking: Booking) {
    return booking.category?.title ?? "Бронирование";
}

export function getPhoneDigits(phone: string) {
    return phone.replace(/\D/g, "");
}

export async function openExternalUrl(url: string, fallbackUrl?: string) {
    try {
        const canOpen = await Linking.canOpenURL(url);
        await Linking.openURL(canOpen ? url : fallbackUrl ?? url);
    } catch {
        if (fallbackUrl) {
            await Linking.openURL(fallbackUrl);
        }
    }
}
