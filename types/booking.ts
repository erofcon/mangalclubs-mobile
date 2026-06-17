import type {Organization} from "@/types/organization";

export type BookingOrganization = {
    id: Organization["id"];
    slug?: string;
    name: string;
    phone?: string | null;
};

export type BookingCategory = {
    id: string;
    organizationId?: Organization["id"];
    title: string;
    description?: string;
    previewUrl?: string | null;
};

export type Booking = {
    id: string;
    organizationId?: Organization["id"];
    categoryId?: string;
    title: string;
    description: string;
    longDescription?: string | null;
    image?: string;
    images?: string[];
    category?: BookingCategory;
    organization?: BookingOrganization;
};
