import {useCallback, useMemo, useState} from "react";
import {
    Platform,
    ScrollView,
    StyleSheet,
    View,
    type LayoutChangeEvent,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";

import {Screen} from "@/components/ui/Screen";
import {ANDROID_DECELERATION_RATE} from "@/features/screens/index/menu/constants";
import {CategoriesGrid} from "@/features/screens/index/menu/CategoriesGrid";
import {MenuSections} from "@/features/screens/index/menu/MenuSections";
import {useIndexMenuScroll} from "@/features/screens/index/menu/use-index-menu-scroll";
import {useMenuItemWidth} from "@/features/screens/index/menu/use-menu-item-width";
import {menus} from "@/mocks/mocks-data";
import type {MenuItem} from "@/types/products";
import {SHADOW, themeColors} from "@/utils/theme-colors";
import {Header} from "@/features/screens/index/header/Header";
import {Stories} from "@/features/screens/index/stories/Stories";

export function IndexScreen() {
    const insets = useSafeAreaInsets();
    const [containerWidth, setContainerWidth] = useState(0);
    const itemWidth = useMenuItemWidth(containerWidth);

    const onContainerLayout = useCallback((event: LayoutChangeEvent) => {
        setContainerWidth(event.nativeEvent.layout.width);
    }, []);

    const availableCategories = useMemo(() => {
        return menus.filter((category) => category.items.length > 0);
    }, []);

    const itemsByCategory = useMemo(() => {
        return availableCategories.reduce<Record<string, MenuItem[]>>((acc, category) => {
            acc[category.id] = category.items;
            return acc;
        }, {});
    }, [availableCategories]);

    const {
        activeCategoryId,
        categoryTabsScrollXRef,
        handleCategoryLayout,
        handleCategoryTabsScrollXChange,
        handleMenuMomentumEnd,
        handleMenuScroll,
        handleMenuScrollBeginDrag,
        handleMenuScrollEndDrag,
        handleSectionsLayout,
        handleTabsLayout,
        scrollRef,
        scrollToCategory,
    } = useIndexMenuScroll(availableCategories);

    return (
        <Screen withTopInset>
            <View style={styles.root} onLayout={onContainerLayout}>
                <ScrollView
                    ref={scrollRef}
                    style={styles.scroll}
                    contentContainerStyle={{
                        paddingBottom: insets.bottom + 32,
                    }}
                    stickyHeaderIndices={[2]}
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="always"
                    showsVerticalScrollIndicator={false}
                    decelerationRate={Platform.OS === "android" ? ANDROID_DECELERATION_RATE : "normal"}
                    overScrollMode={Platform.OS === "android" ? "never" : "auto"}
                    scrollEventThrottle={16}
                    onScroll={handleMenuScroll}
                    onScrollBeginDrag={handleMenuScrollBeginDrag}
                    onScrollEndDrag={handleMenuScrollEndDrag}
                    onMomentumScrollEnd={handleMenuMomentumEnd}
                >
                    <Header/>


                    <Stories/>

                    <View
                        collapsable={false}
                        style={styles.categoriesStickyBlock}
                        onLayout={handleTabsLayout}
                    >
                        <CategoriesGrid
                            categories={availableCategories}
                            activeCategoryId={activeCategoryId}
                            savedScrollX={categoryTabsScrollXRef.current}
                            onSelectCategory={scrollToCategory}
                            onScrollXChange={handleCategoryTabsScrollXChange}
                        />
                    </View>

                    <View
                        collapsable={false}
                        style={styles.sectionsBlock}
                        onLayout={handleSectionsLayout}
                    >
                        <MenuSections
                            categories={availableCategories}
                            itemsByCategory={itemsByCategory}
                            itemWidth={itemWidth}
                            onCategoryLayout={handleCategoryLayout}
                        />
                    </View>
                </ScrollView>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    stories_section: {
        flex: 1,
        backgroundColor: themeColors.card,
        borderRadius: 28,

        borderWidth: 1,
        borderColor: themeColors.cardBorder,

        ...SHADOW,
    },
    root: {
        flex: 1,
        width: "100%",
    },
    scroll: {
        flex: 1,
    },
    categoriesStickyBlock: {
        position: "relative",
        paddingHorizontal: 0,
        paddingBottom: 18,
        zIndex: 100,
        elevation: 100,
    },
    sectionsBlock: {
        width: "100%",
        zIndex: 0,
        elevation: 0,
    },
});
