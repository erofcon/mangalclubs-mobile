import {forwardRef} from "react";
import {StyleSheet, Text, View} from "react-native";
import {TouchableOpacity} from "react-native-gesture-handler";

import {
    AppBottomSheetModal,
    type AppBottomSheetRef,
} from "@/components/ui/bottom-sheet/AppBottomSheetModal";
import type {Category} from "@/types/products";

type MenuCategoriesSheetProps = {
    categories: Category[];
    activeCategoryId?: Category["id"] | null;
    onSelectCategory: (categoryId: Category["id"]) => void;
};

export const MenuCategoriesSheet = forwardRef<AppBottomSheetRef, MenuCategoriesSheetProps>(
    ({categories, activeCategoryId, onSelectCategory}, ref) => {
        return (
            <AppBottomSheetModal
                ref={ref}
                title="Категории"
                snapPoints={["34%"]}
                enableDynamicSizing={false}
                scrollable
            >
                <View style={styles.categoryChips}>
                    {categories.map((category) => {
                        const isActive = category.id === activeCategoryId;

                        return (
                            <TouchableOpacity
                                key={category.id}
                                accessibilityRole="button"
                                accessibilityLabel={category.title}
                                activeOpacity={0.72}
                                style={[
                                    styles.categoryChip,
                                    isActive && styles.categoryChipActive,
                                ]}
                                onPress={() => onSelectCategory(category.id)}
                            >
                                <Text
                                    style={[
                                        styles.categoryChipText,
                                        isActive && styles.categoryChipTextActive,
                                    ]}
                                    numberOfLines={1}
                                >
                                    {category.title}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </AppBottomSheetModal>
        );
    },
);

MenuCategoriesSheet.displayName = "MenuCategoriesSheet";

const styles = StyleSheet.create({
    categoryChips: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 8,
        paddingBottom: 8,
    },
    categoryChip: {
        minHeight: 30,
        maxWidth: "100%",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 7,
        backgroundColor: "rgba(255, 238, 230, 0.95)",
        borderWidth: 1,
        borderColor: "rgba(244, 196, 182, 0.7)",
    },
    categoryChipActive: {
        backgroundColor: "#FFE2DA",
        borderColor: "#E89A88",
    },
    categoryChipText: {
        color: "#D76D5F",
        fontSize: 13,
        lineHeight: 16,
        fontFamily: "Point-SemiBold",
    },
    categoryChipTextActive: {
        color: "#C94F43",
    },
});
