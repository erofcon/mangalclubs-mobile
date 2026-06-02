import React from "react";
import {
    ImageSourcePropType,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import {Image} from "expo-image";
import {LinearGradient} from "expo-linear-gradient";
import {router} from "expo-router";
import {MaterialCommunityIcons} from "@expo/vector-icons";

import {SHADOW, themeColors} from "@/utils/theme-colors";

type DishCategory = {
    id: string;
    categoryId?: string;
    title: string;
    image: ImageSourcePropType;
    icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
};

const dishCategories: DishCategory[] = [
    {
        id: "salads",
        categoryId: "97",
        title: "Салаты",
        image: require("@/assets/mocks/categories-icons/salad.png"),
        icon: "leaf",
    },
    {
        id: "mangal",
        categoryId: "98",
        title: "Мангал",
        image: require("@/assets/mocks/categories-icons/mangal.png"),
        icon: "grill",
    },
    {
        id: "soups",
        title: "Супы",
        image: require("@/assets/mocks/categories-icons/soup.png"),
        icon: "pot-steam-outline",
    },
    {
        id: "desserts",
        title: "Десерты",
        image: require("@/assets/mocks/categories-icons/dessert.png"),
        icon: "cake-variant-outline",
    },
];

export function Categories() {
    return (
        <View style={styles.categoriesBlock}>
            <View style={styles.categoriesHeader}>
                <Text style={styles.categoriesTitle}
                      numberOfLines={1}
                >
                    Категории блюд
                </Text>

                <Pressable
                    style={styles.categoriesSeeAll}
                    onPress={() => router.push("/menu")}
                >
                    <Text style={styles.categoriesSeeAllText}>
                        Смотреть все
                    </Text>

                    <MaterialCommunityIcons
                        name="chevron-right"
                        size={20}
                        color={themeColors.primary}
                    />
                </Pressable>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesList}
            >
                {dishCategories.map((category, index) => (
                    <Pressable
                        key={category.id}
                        onPress={() =>
                            router.push({
                                pathname: "/menu",
                                params: category.categoryId
                                    ? {categoryId: category.categoryId}
                                    : undefined,
                            })
                        }
                        style={({pressed}) => [
                            styles.categoryCard,
                            index !== dishCategories.length - 1 &&
                            styles.categoryCardGap,
                            pressed && styles.previewPressed,
                        ]}
                    >
                        <Image
                            source={category.image}
                            style={styles.categoryImage}
                            contentFit="cover"
                        />

                        <LinearGradient
                            pointerEvents="none"
                            colors={["rgba(18,18,16,0.16)", "#121210"]}
                            locations={[0, 1]}
                            start={{x: 1, y: 0}}
                            end={{x: 0, y: 1}}
                            style={StyleSheet.absoluteFillObject}
                        />

                        <View style={styles.categoryTopRow}>
                            <View style={styles.categoryIconWrap}>
                                <MaterialCommunityIcons
                                    name={category.icon}
                                    size={18}
                                    color={themeColors.primary}
                                />
                            </View>

                            <MaterialCommunityIcons
                                name="chevron-right"
                                size={20}
                                color="rgba(255,255,255,0.66)"
                            />
                        </View>

                        <Text style={styles.categoryName} numberOfLines={1}>
                            {category.title}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    /* Categories */

    categoriesBlock: {
        paddingTop: 8,
        paddingBottom: 18,
    },

    categoriesHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

        paddingHorizontal: 12,
        marginBottom: 13,
    },

    categoriesTitle: {
        color: themeColors.text,
        fontSize: 20,
        lineHeight: 24,
        fontFamily: "Point-Bold",
        maxWidth: 190,
    },

    categoriesSeeAll: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
    },

    categoriesSeeAllText: {
        color: themeColors.primary,
        fontSize: 14,
        fontFamily: "Point-Bold",
    },

    categoriesList: {
        paddingHorizontal: 12,
    },

    categoryCard: {
        width: 152,
        height: 106,
        borderRadius: 18,
        overflow: "hidden",
        justifyContent: "space-between",
        padding: 12,
        backgroundColor: "#121210",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        ...SHADOW,
    },

    categoryCardGap: {
        marginRight: 12,
    },

    categoryImage: {
        position: "absolute",
        right: -10,
        bottom: -13,
        width: 96,
        height: 96,
        opacity: 0.92,
    },

    categoryTopRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    categoryIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(236,172,24,0.10)",
        borderWidth: 1,
        borderColor: "rgba(236,172,24,0.16)",
    },

    categoryName: {
        maxWidth: 96,
        color: themeColors.text,
        fontSize: 16,
        lineHeight: 20,
        fontFamily: "Point-Bold",
    },
    previewPressed: {
        opacity: 0.82,
        transform: [{scale: 0.98}],
    },
});
