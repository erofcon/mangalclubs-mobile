import {ImageSourcePropType} from "react-native";

// Product categories
export interface Category {
    id: string;
    title: string;
}

export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    image?: ImageSourcePropType;
    weight?: string;
    calories?: string | number;
    fats?: string | number;
    proteins?: string | number;
    carbs?: string | number;
}

export interface MenuCategory extends Category {
    items: MenuItem[];
}
