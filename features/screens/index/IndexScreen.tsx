import {useCallback, useMemo, useRef, useState} from "react";
import {
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

import {router} from "expo-router";

import type {AppBottomSheetRef} from "@/components/ui/bottom-sheet/AppBottomSheetModal";
import {Screen} from "@/components/ui/Screen";
import {OrderAvailabilityBar} from "@/components/OrderAvailabilityBar";
import {MenuCategoriesSheet} from "@/features/screens/menu/MenuCategoriesSheet";
import {Categories} from "@/features/screens/index/categories/Categories";
import {Stories} from "@/features/screens/index/stories/Stories";
import {RestaurantsList} from "@/features/screens/index/restaurants/RestaurantsList";
import {Header} from "@/features/screens/index/header/Header";
import {Hero} from "@/features/screens/index/hero/Hero";
import {ListOfDay} from "@/features/screens/index/list_of_day/ListOfDay";
import {SearchBanner} from "@/features/screens/index/search/SearchBanner";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useAppDataStore} from "@/store/app-data-store";
import {themeColors} from "@/utils/theme-colors";
import {CartAddedToast} from "@/components/ui/CartAddedToast";
import {useCartAddedToast} from "@/hooks/useCartAddedToast";

export function IndexScreen() {
    const insets = useSafeAreaInsets();
    const categoriesSheetRef = useRef<AppBottomSheetRef>(null);
    const menus = useAppDataStore((state) => state.menu);
    const [availabilityBarHeight, setAvailabilityBarHeight] = useState(0);
    const {
        toastMessage,
        toastAnimatedStyle,
        showAddedToast,
    } = useCartAddedToast();

    const availableCategories = useMemo(
        () => menus.filter((category) => category.items.length > 0),
        [menus]
    );

    const openCategoriesSheet = useCallback(() => {
        categoriesSheetRef.current?.open();
    }, []);

    const handleCategorySelect = useCallback((categoryId: string) => {
        categoriesSheetRef.current?.close();
        router.push({
            pathname: "/menu",
            params: {categoryId},
        });
    }, []);

    const topChromeHeight = availabilityBarHeight > 0 ? availabilityBarHeight : insets.top;

    return (
        <>
            <Screen>
                <View style={styles.root}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.content}
                    >
                        <View style={{ flex: 1 }}>
                            <Hero />

                            <View style={[styles.headerOverlay, {top: topChromeHeight + 8}]}>
                                <Header />
                            </View>
                        </View>
                        <SearchBanner onCategoriesPress={openCategoriesSheet}/>

                        <Categories
                            categories={availableCategories}
                            onSelectCategory={handleCategorySelect}
                        />

                        <Stories/>

                        <ListOfDay onAddedToCart={showAddedToast}/>

                        <RestaurantsList/>
                    </ScrollView>

                    {availabilityBarHeight === 0 && insets.top > 0 ? (
                        <View
                            pointerEvents="none"
                            style={[styles.topSafeAreaBackground, {height: insets.top}]}
                        />
                    ) : null}

                    <View style={styles.availabilityBarOverlay}>
                        <OrderAvailabilityBar
                            topInset={insets.top}
                            onHeightChange={setAvailabilityBarHeight}
                        />
                    </View>

                    <CartAddedToast
                        message={toastMessage}
                        bottom={insets.bottom + 92}
                        animatedStyle={toastAnimatedStyle}
                    />
                </View>
            </Screen>

            <MenuCategoriesSheet
                ref={categoriesSheetRef}
                categories={availableCategories}
                onSelectCategory={handleCategorySelect}
            />
        </>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: themeColors.background,
    },
    content: {
        paddingBottom: 76,
    },
    headerOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    },
    availabilityBarOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        elevation: 1000,
    },
    topSafeAreaBackground: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: themeColors.background,
        zIndex: 998,
        elevation: 998,
    },
});
