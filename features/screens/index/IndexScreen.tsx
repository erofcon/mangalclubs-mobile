import {useCallback, useMemo, useRef} from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {LinearGradient} from "expo-linear-gradient";
import {router} from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import type {AppBottomSheetRef} from "@/components/ui/bottom-sheet/AppBottomSheetModal";
import {Screen} from "@/components/ui/Screen";
import {MenuCategoriesSheet} from "@/features/screens/menu/MenuCategoriesSheet";
import {Categories} from "@/features/screens/index/categories/Categories";
import {Stories} from "@/features/screens/index/stories/Stories";
import {RestaurantsList} from "@/features/screens/index/restaurants/RestaurantsList";
import {menus, Organizations} from "@/mocks/mocks-data";
import {useDeliveryStore} from "@/store/delivery-store";
import {SHADOW, themeColors} from "@/utils/theme-colors";
import {Header} from "@/features/screens/index/header/Header";
import {Hero} from "@/features/screens/index/hero/Hero";
import {QuickActions} from "@/features/screens/index/hero/QuickActions";
import {ListOfDay} from "@/features/screens/index/list_of_day/ListOfDay";
import {SearchBanner} from "@/features/screens/index/search/SearchBanner";


export function IndexScreen() {
    const categoriesSheetRef = useRef<AppBottomSheetRef>(null);


    const availableCategories = useMemo(
        () => menus.filter((category) => category.items.length > 0),
        []
    );


    const handleCategorySelect = useCallback((categoryId: string) => {
        categoriesSheetRef.current?.close();
        router.push({
            pathname: "/menu",
            params: {categoryId},
        });
    }, []);


    return (
        <Screen withTopInset>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                <View style={{ flex: 1 }}>
                    <Hero />

                    <View style={styles.headerOverlay}>
                        <Header />
                    </View>
                </View>
                <SearchBanner/>

                <Categories/>

                <Stories/>

                <ListOfDay/>

                <RestaurantsList/>
            </ScrollView>

            <MenuCategoriesSheet
                ref={categoriesSheetRef}
                categories={availableCategories}
                onSelectCategory={handleCategorySelect}
            />
        </Screen>
    );
}

const styles = StyleSheet.create({
    content: {
        paddingBottom: 76,
    },
    headerOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    }
});
