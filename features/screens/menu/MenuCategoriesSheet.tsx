import {forwardRef} from "react";

import type {AppBottomSheetRef} from "@/components/ui/bottom-sheet/AppBottomSheetModal";
import {SelectionChipsSheet} from "@/components/ui/bottom-sheet/SelectionChipsSheet";
import type {Category} from "@/types/products";

type MenuCategoriesSheetProps = {
    categories: Category[];
    activeCategoryId?: Category["id"] | null;
    onSelectCategory: (categoryId: Category["id"]) => void;
};

export const MenuCategoriesSheet = forwardRef<AppBottomSheetRef, MenuCategoriesSheetProps>(
    ({categories, activeCategoryId, onSelectCategory}, ref) => {
        return (
            <SelectionChipsSheet
                ref={ref}
                title="Категории"
                options={categories}
                activeOptionId={activeCategoryId}
                onSelectOption={(categoryId) => {
                    if (categoryId) {
                        onSelectCategory(categoryId);
                    }
                }}
            />
        );
    },
);

MenuCategoriesSheet.displayName = "MenuCategoriesSheet";
