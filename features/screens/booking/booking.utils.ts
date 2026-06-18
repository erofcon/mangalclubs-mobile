import {Linking} from "react-native";

import type {Booking} from "@/types/booking";
import type {Organization} from "@/types/organization";

export function getBookingImageSource(path?: string) {
    if (!path) {
        return undefined;
    }

    if (/^https?:\/\//i.test(path)) {
        return {uri: path};
    }

    return undefined;
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
    return getBookingImagePaths(booking)
        .map(getBookingImageSource)
        .filter((image): image is {uri: string} => Boolean(image));
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

export function getBookingOrganizationWhatsAppPhone(
    booking: Booking,
    organization?: Organization | null,
) {
    return organization?.whatsapp_phone ?? booking.organization?.whatsappPhone ?? "";
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
