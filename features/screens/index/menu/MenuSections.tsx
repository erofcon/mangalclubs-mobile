import {memo, useCallback} from "react";
import {
    StyleSheet,
    Text,
    View,
    type LayoutChangeEvent,
} from "react-native";

import {
    GAP,
    GRID_COLUMNS,
    H_PADDING,
} from "@/features/screens/index/menu/constants";

import {chunkArray} from "@/features/screens/index/menu/menu-utils";
import {DishCard} from "@/features/screens/menu/DishCard";

import type {Category, MenuCategory, MenuItem} from "@/types/products";

import {themeColors} from "@/utils/theme-colors";

type MenuSectionsProps = {
    categories: MenuCategory[];
    itemsByCategory: Record<string, MenuItem[]>;
    itemWidth: number;
    onProductPress?: (item: MenuItem) => void;
    onProductAdd?: (item: MenuItem) => void;
    onCategoryLayout: (
        categoryId: Category["id"],
        event: LayoutChangeEvent
    ) => void;
};

export const MenuSections = memo(function MenuSections({
                                                           categories,
                                                           itemsByCategory,
                                                           itemWidth,
                                                           onProductPress,
                                                           onProductAdd,
                                                           onCategoryLayout,
                                                       }: MenuSectionsProps) {
    const renderCategorySection = useCallback(
        (category: MenuCategory) => {
            const rows = chunkArray(
                itemsByCategory[category.id] ?? [],
                GRID_COLUMNS
            );

            return (
                <View
                    key={category.id}
                    collapsable={false}
                    onLayout={(event) =>
                        onCategoryLayout(category.id, event)
                    }
                >

                    <Text style={styles.sectionTitle}
                          numberOfLines={1}
                    >
                        {category.title}
                    </Text>

                    {rows.map((row, rowIndex) => (
                        <View
                            key={`row-${category.id}-${rowIndex}`}
                            style={styles.productsRow}
                        >
                            {row.map((item) =>
                                itemWidth > 0 ? (
                                    <DishCard
                                        key={item.id}
                                        width={itemWidth}
                                        item={item}
                                        onPress={() => onProductPress?.(item)}
                                        onAddPress={() => onProductAdd?.(item)}
                                    />
                                ) : null
                            )}

                            {Array.from({
                                length: Math.max(
                                    0,
                                    GRID_COLUMNS - row.length
                                ),
                            }).map((_, index) => (
                                <View
                                    key={`spacer-${category.id}-${rowIndex}-${index}`}
                                    style={{width: itemWidth}}
                                />
                            ))}
                        </View>
                    ))}
                </View>
            );
        },
        [itemWidth, itemsByCategory, onCategoryLayout, onProductAdd, onProductPress]
    );

    return <>{categories.map(renderCategorySection)}</>;
});

const styles = StyleSheet.create({

    sectionTitle: {
        color: themeColors.text,
        fontSize: 22,
        lineHeight: 27,
        fontFamily: "Point-Bold",
        marginTop: 24,
        marginBottom: 12,
        marginHorizontal: 12,
    },

    productsRow: {
        flexDirection: "row",
        gap: GAP,
        paddingHorizontal: H_PADDING,
        justifyContent: "center",
        marginBottom: 10,
    },
});
