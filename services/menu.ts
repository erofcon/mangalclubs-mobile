import type {MenuCategory} from "@/types/products";
import {resolveApiAssetUrl} from "@/services/api";

export const normalizeMenuWeight = (weight?: string | null) => {
    if (!weight) {
        return undefined;
    }

    return weight
        .trim()
        .replace(/\s*(kilograms|kilogram|kgs|kg)\b/gi, " кг")
        .replace(/\s*(grams|gram|gr|g)\b/gi, " г")
        .replace(/\s*(milliliters|milliliter|ml)\b/gi, " мл")
        .replace(/\s*(liters|liter|l)\b/gi, " л")
        .replace(/\s+/g, " ");
};

export const normalizeMenu = (menu: MenuCategory[]) => (
    menu.map((category) => ({
        ...category,
        items: category.items.map((item) => ({
            ...item,
            description: item.description ?? "",
            image: resolveApiAssetUrl(typeof item.image === "string" ? item.image : undefined) ?? item.image,
            weight: normalizeMenuWeight(item.weight),
        })),
    }))
);
