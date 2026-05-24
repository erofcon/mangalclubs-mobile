import {memo, useCallback} from "react";
import {StyleSheet, Text, View, type LayoutChangeEvent} from "react-native";

import {
    GAP,
    GRID_COLUMNS,
    H_PADDING,
} from "@/features/screens/index/menu/constants";
import {chunkArray} from "@/features/screens/index/menu/menu-utils";
import {ProductCard} from "@/features/screens/index/menu/ProductCard";
import type {Category, MenuCategory, MenuItem} from "@/types/products";
import {themeColors} from "@/utils/theme-colors";

type MenuSectionsProps = {
    categories: MenuCategory[];
    itemsByCategory: Record<string, MenuItem[]>;
    itemWidth: number;
    onCategoryLayout: (categoryId: Category["id"], event: LayoutChangeEvent) => void;
};

export const MenuSections = memo(function MenuSections({
                                                           categories,
                                                           itemsByCategory,
                                                           itemWidth,
                                                           onCategoryLayout,
                                                       }: MenuSectionsProps) {
    const renderCategorySection = useCallback(
        (category: MenuCategory) => {
            const rows = chunkArray(itemsByCategory[category.id] ?? [], GRID_COLUMNS);

            return (
                <View
                    key={category.id}
                    collapsable={false}
                    onLayout={(event) => onCategoryLayout(category.id, event)}
                >
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{category.title}</Text>
                    </View>

                    {rows.map((row, rowIndex) => (
                        <View key={`row-${category.id}-${rowIndex}`} style={styles.productsRow}>
                            {row.map((item) =>
                                itemWidth > 0 ? (
                                    <ProductCard
                                        key={item.id}
                                        width={itemWidth}
                                        id={item.id}
                                        title={item.name}
                                        priceFrom={item.price}
                                        image={item.image}
                                    />
                                ) : null
                            )}

                            {Array.from({length: Math.max(0, GRID_COLUMNS - row.length)}).map(
                                (_, index) => (
                                    <View
                                        key={`spacer-${category.id}-${rowIndex}-${index}`}
                                        style={{width: itemWidth}}
                                    />
                                )
                            )}
                        </View>
                    ))}
                </View>
            );
        },
        [itemWidth, itemsByCategory, onCategoryLayout]
    );

    return <>{categories.map(renderCategorySection)}</>;
});

const styles = StyleSheet.create({
    sectionHeader: {
        paddingHorizontal: H_PADDING,
        marginBottom: 12,
    },
    sectionTitle: {
        color: themeColors.text,
        fontSize: 24,
        fontWeight: "700",
    },
    productsRow: {
        flexDirection: "row",
        gap: GAP,
        paddingHorizontal: H_PADDING,
        marginBottom: 12,
    },
});
