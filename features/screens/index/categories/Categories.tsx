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
import {MaterialCommunityIcons} from "@expo/vector-icons";

import {SHADOW, themeColors} from "@/utils/theme-colors";

type DishCategory = {
    id: string;
    title: string;
    image: ImageSourcePropType;
    icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
};

const dishCategories: DishCategory[] = [
    {
        id: "salads",
        title: "Салаты",
        image: require("@/assets/mocks/categories-icons/salad.png"),
        icon: "leaf",
    },
    {
        id: "mangal",
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

                <Pressable style={styles.categoriesSeeAll}>
                    <Text style={styles.categoriesSeeAllText}>
                        Посмотреть все
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
                        style={({pressed}) => [
                            styles.categoryCard,
                            index !== dishCategories.length - 1 &&
                            styles.categoryCardGap,
                            pressed && styles.previewPressed,
                        ]}
                    >
                        <View style={styles.categoryImageWrap}>
                            <Image
                                source={category.image}
                                style={styles.categoryImage}
                                contentFit="cover"
                            />

                            <View style={styles.categoryIconWrap}>
                                <MaterialCommunityIcons
                                    name={category.icon}
                                    size={20}
                                    color={themeColors.primary}
                                />
                            </View>
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
        paddingTop: 4,
        paddingBottom: 14,
    },

    categoriesHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

        paddingHorizontal: 12,
        marginBottom: 14,
    },

    categoriesTitle: {
        color: themeColors.text,
        fontSize: 16,
        fontFamily: "Point-Bold",
        maxWidth: 140,
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
        width: 112,
        height: 164,
        borderRadius: 24,

        alignItems: "center",

        paddingTop: 14,
        paddingHorizontal: 10,
        paddingBottom: 14,

        backgroundColor: themeColors.card,

        borderWidth: 1,
        borderColor: themeColors.cardBorder,

        ...SHADOW,
    },

    categoryCardGap: {
        marginRight: 12,
    },

    categoryImageWrap: {
        width: 82,
        height: 82,
        borderRadius: 999,

        overflow: "visible",
        position: "relative",

        alignItems: "center",

        backgroundColor: themeColors.cardSecondary,
    },

    categoryImage: {
        width: "100%",
        height: "100%",
        borderRadius: 999,
    },

    categoryIconWrap: {
        position: "absolute",
        bottom: -25,

        width: 38,
        height: 38,
        borderRadius: 999,

        alignItems: "center",
        justifyContent: "center",

        backgroundColor: themeColors.cardSecondary,

        borderWidth: 1,
        borderColor: themeColors.cardBorder,

        ...SHADOW,
    },

    categoryName: {
        marginTop: 34,

        color: themeColors.text,
        fontSize: 14,
        fontFamily: "Point-Regular",
    },
    previewPressed: {
        opacity: 0.82,
        transform: [{scale: 0.98}],
    },
});