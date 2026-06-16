import React, {useMemo} from "react";
import { Pressable, StyleSheet, Text, View, Dimensions } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { themeColors } from "@/utils/theme-colors";
import type {MenuCategory} from "@/types/products";

const SCREEN_WIDTH = Dimensions.get("window").width;
const PADDING = 24;
const GAP = 10;
const COLUMNS = 4;

const CARD_SIZE =
    (SCREEN_WIDTH - PADDING - GAP * (COLUMNS - 1)) / COLUMNS;

type DishCategory = {
    id: string;
    categoryId?: string;
    title: string;
    icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
};

const dishCategories: DishCategory[] = [
    { id: "salads", categoryId: "97", title: "Салаты", icon: "leaf" },
    { id: "mangal", categoryId: "98", title: "Мангал", icon: "grill" },
    { id: "soups", title: "Супы", icon: "pot-steam-outline" },
    { id: "desserts", title: "Десерты", icon: "cake-variant-outline" },
    { id: "drinks", title: "Напитки", icon: "cup" },
    { id: "pizza", title: "Пицца", icon: "pizza" },
];

const fallbackIcons: React.ComponentProps<typeof MaterialCommunityIcons>["name"][] = [
    "food-steak",
    "grill",
    "leaf",
    "pot-steam-outline",
    "cake-variant-outline",
    "cup",
];

type Props = {
    categories?: MenuCategory[];
};

export function Categories({categories}: Props) {
    const visibleCategories = useMemo<DishCategory[]>(() => {
        if (!categories?.length) {
            return dishCategories;
        }

        return categories.slice(0, 6).map((category, index) => ({
            id: category.id,
            categoryId: category.id,
            title: category.title,
            icon: fallbackIcons[index % fallbackIcons.length],
        }));
    }, [categories]);

    return (
        <View style={styles.block}>
            <View style={styles.grid}>
                {visibleCategories.map((category) => (
                    <Pressable
                        key={category.id}
                        onPress={() =>
                            router.push({
                                pathname: "/menu",
                                params: category.categoryId
                                    ? { categoryId: category.categoryId }
                                    : undefined,
                            })
                        }
                        style={({ pressed }) => [
                            styles.card,
                            pressed && styles.pressed,
                        ]}
                    >
                        <MaterialCommunityIcons
                            name={category.icon}
                            size={22}
                            color={themeColors.primary}
                        />

                        <Text style={styles.title} numberOfLines={2}>
                            {category.title}
                        </Text>
                    </Pressable>
                ))}
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    block: {
        paddingHorizontal: 12,
        paddingTop: 10,
    },

    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },

    card: {
        width: CARD_SIZE,

        height: 78,
        borderRadius: 16,

        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 1,
        borderColor: themeColors.cardBorder,

        alignItems: "center",
        justifyContent: "center",
        gap: 4,
    },

    title: {
        color: themeColors.text,
        fontSize: 11,
        textAlign: "center",
        fontFamily: "Point-Regular",
    },

    pressed: {
        opacity: 0.75,
        transform: [{ scale: 0.97 }],
    },
});
