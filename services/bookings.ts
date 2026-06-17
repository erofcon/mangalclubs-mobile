import {apiFetch, resolveApiAssetUrl} from "@/services/api";
import type {Booking, BookingCategory, BookingOrganization} from "@/types/booking";

type ApiBookingOrganization = {
    id: string;
    slug?: string | null;
    name: string;
    phone?: string | null;
};

type ApiBookingCategory = {
    id: string;
    organization_id: string;
    title: string;
    preview_url?: string | null;
    sort_order?: number | null;
    organization?: ApiBookingOrganization;
};

type ApiBookingImage = {
    id: string;
    url: string;
    orientation?: "horizontal" | "vertical" | null;
    alt_text?: string | null;
    sort_order?: number | null;
};

type ApiBooking = {
    id: string;
    organization_id: string;
    category_id: string;
    title: string;
    description: string;
    long_description?: string | null;
    preview_url?: string | null;
    images?: ApiBookingImage[];
    horizontal_images?: ApiBookingImage[];
    vertical_images?: ApiBookingImage[];
    sort_order?: number | null;
    organization?: ApiBookingOrganization;
    category?: ApiBookingCategory;
};

const normalizeBookingOrganization = (
    organization?: ApiBookingOrganization | null,
): BookingOrganization | undefined => {
    if (!organization) {
        return undefined;
    }

    return {
        id: organization.id,
        slug: organization.slug ?? undefined,
        name: organization.name,
        phone: organization.phone,
    };
};

export const normalizeBookingCategory = (
    category: ApiBookingCategory,
): BookingCategory => ({
    id: category.id,
    organizationId: category.organization_id,
    title: category.title,
    previewUrl: resolveApiAssetUrl(category.preview_url),
});

const normalizeBookingImages = (images?: ApiBookingImage[] | null) => (
    images ?? []
)
    .slice()
    .sort((left, right) => (left.sort_order ?? 0) - (right.sort_order ?? 0))
    .map((image) => resolveApiAssetUrl(image.url))
    .filter((url): url is string => Boolean(url));

export const normalizeBooking = (booking: ApiBooking): Booking => {
    const images = normalizeBookingImages(booking.images);
    const horizontalImages = normalizeBookingImages(booking.horizontal_images);
    const verticalImages = normalizeBookingImages(booking.vertical_images);
    const previewUrl = resolveApiAssetUrl(booking.preview_url);

    return {
        id: booking.id,
        organizationId: booking.organization_id,
        categoryId: booking.category_id,
        title: booking.title,
        description: booking.description,
        longDescription: booking.long_description,
        image: verticalImages[0] ?? previewUrl ?? images[0],
        images,
        horizontalImages,
        verticalImages,
        organization: normalizeBookingOrganization(booking.organization),
        category: booking.category ? normalizeBookingCategory(booking.category) : undefined,
    };
};

export const getBookingCategories = async (signal?: AbortSignal) => {
    const categories = await apiFetch<ApiBookingCategory[]>(
        "/api/v1/bookings/categories",
        {signal},
    );

    return categories.map(normalizeBookingCategory);
};

export const getBookings = async (signal?: AbortSignal) => {
    const bookings = await apiFetch<ApiBooking[]>("/api/v1/bookings", {signal});

    return bookings.map(normalizeBooking);
};
