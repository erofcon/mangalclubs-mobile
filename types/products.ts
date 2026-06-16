import {ImageSourcePropType} from "react-native";

// Product categories
export interface Category {
    id: string;
    title: string;
    video?: ImageSourcePropType;
}

export interface MenuItem {
    id: string;
    sku?: string | null;
    name: string;
    description: string;
    price: number;
    image?: ImageSourcePropType | string;
    weight?: string;
    calories?: string | number;
    fats?: string | number;
    proteins?: string | number;
    carbs?: string | number;
    size_id?: string | null;
    size_name?: string | null;
    measure_unit_type?: string | null;
    modifiers?: Record<string, unknown>[];
}

export interface MenuCategory extends Category {
    items: MenuItem[];
}
