import type {Organization} from "@/types/organization";

export type Booking = {
    id: string | number;
    organizationId?: Organization["id"];
    categoryId?: string;
    title?: string;
    description?: string;
    longDescription?: string;
    image?: string;
    images?: string[];
}

export type BookingCategory = {
    id: string;
    title: string;
    description: string;
};