import {Screen} from "@/components/ui/Screen";
import {StatusBar} from "expo-status-bar";
import {VideoHeader} from "@/features/screens/menu/video_header/VideoHeader";
import {OrderType} from "@/features/screens/menu/order_type/OrderType";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useCallback, useMemo, useRef, useState, type ComponentRef, type RefObject} from "react";
import {router} from "expo-router";
import {useMenuItemWidth} from "@/features/screens/index/menu/use-menu-item-width";
import {
    LayoutChangeEvent,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Platform,
    StyleSheet,
    Text,
    View,
} from "react-native";
import {TouchableOpacity} from "react-native-gesture-handler";
import Animated, {
    runOnJS,
    useAnimatedScrollHandler,
    useSharedValue,
} from "react-native-reanimated";
import {menus} from "@/mocks/mocks-data";
import type {MenuItem} from "@/types/products";
import {useIndexMenuScroll} from "@/features/screens/index/menu/use-index-menu-scroll";
import {ANDROID_DECELERATION_RATE} from "@/features/screens/index/menu/constants";
import {CategoriesGrid} from "@/features/screens/index/menu/CategoriesGrid";
import {themeColors} from "@/utils/theme-colors";
import {MenuSections} from "@/features/screens/index/menu/MenuSections";
import {DishDetailsModal} from "@/features/screens/menu/DishDetailsModal";
import {
    AppBottomSheetModal,
    type AppBottomSheetRef,
} from "@/components/ui/bottom-sheet/AppBottomSheetModal";

type AnimatedScrollViewRef = ComponentRef<typeof Animated.ScrollView>;

export function MenuScreen() {
    const insets = useSafeAreaInsets();
    const [containerWidth, setContainerWidth] = useState(0);
    const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
    const categoriesSheetRef = useRef<AppBottomSheetRef>(null);
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

    const scrollY = useSharedValue(0);

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

    const animatedScrollRef = scrollRef as unknown as RefObject<AnimatedScrollViewRef | null>;

    const animatedScrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;

            runOnJS(handleMenuScroll)({
                nativeEvent: {
                    contentOffset: event.contentOffset,
                    contentSize: event.contentSize,
                    layoutMeasurement: event.layoutMeasurement,
                },
            } as NativeSyntheticEvent<NativeScrollEvent>);
        },
    });

    const handleSearchPress = useCallback(() => {
        router.push("/search");
    }, []);

    const openCategoriesSheet = useCallback(() => {
        categoriesSheetRef.current?.open();
    }, []);

    const handleSheetCategoryPress = useCallback(
        (categoryId: string) => {
            categoriesSheetRef.current?.close();
            scrollToCategory(categoryId);
        },
        [scrollToCategory],
    );

    return (
        <>
            <StatusBar style="light" />

            <Screen>
                <View style={styles.root} onLayout={onContainerLayout}>
                    <Animated.ScrollView
                        ref={animatedScrollRef}
                        style={styles.scroll}
                        contentContainerStyle={{
                            paddingBottom: insets.bottom + 104,
                        }}
                        stickyHeaderIndices={[1]}
                        nestedScrollEnabled
                        keyboardShouldPersistTaps="always"
                        showsVerticalScrollIndicator={false}
                        decelerationRate={Platform.OS === "android" ? ANDROID_DECELERATION_RATE : "normal"}
                        overScrollMode={Platform.OS === "android" ? "never" : "auto"}
                        scrollEventThrottle={16}
                        onScroll={animatedScrollHandler}
                        onScrollBeginDrag={handleMenuScrollBeginDrag}
                        onScrollEndDrag={handleMenuScrollEndDrag}
                        onMomentumScrollEnd={handleMenuMomentumEnd}
                    >
                        <VideoHeader scrollY={scrollY} />

                        <View
                            collapsable={false}
                            style={styles.stickyHeader}
                        >
                            <OrderType scrollY={scrollY} />

                            <View
                                collapsable={false}
                                style={styles.categoriesStickyBlock}
                                onLayout={handleTabsLayout}
                            >
                                <CategoriesGrid
                                    categories={availableCategories}
                                    activeCategoryId={activeCategoryId}
                                    savedScrollX={categoryTabsScrollXRef.current}
                                    onSearchPress={handleSearchPress}
                                    onCategoriesPress={openCategoriesSheet}
                                    onSelectCategory={scrollToCategory}
                                    onScrollXChange={handleCategoryTabsScrollXChange}
                                />
                            </View>
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
                                onProductPress={setSelectedDish}
                                onCategoryLayout={handleCategoryLayout}
                            />
                        </View>
                    </Animated.ScrollView>

                    <DishDetailsModal
                        item={selectedDish}
                        onDismiss={() => setSelectedDish(null)}
                    />

                    <AppBottomSheetModal
                        ref={categoriesSheetRef}
                        title="Категории"
                        snapPoints={["34%"]}
                        enableDynamicSizing={false}
                        scrollable
                    >
                        <View style={styles.categoryChips}>
                            {availableCategories.map((category) => {
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
                                        onPress={() => handleSheetCategoryPress(category.id)}
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
                </View>
            </Screen>
        </>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        width: "100%",
    },
    scroll: {
        flex: 1,
    },
    stickyHeader: {
        zIndex: 999,
        elevation: 999,
        marginTop: -34,
        borderTopLeftRadius: 54,
        borderTopRightRadius: 54,
        backgroundColor: themeColors.background,
        overflow: "hidden",
    },
    categoriesStickyBlock: {
        zIndex: 999,
        elevation: 999,
        paddingHorizontal: 0,
        paddingBottom: 18,
        backgroundColor: themeColors.background,
    },
    sectionsBlock: {
        width: "100%",
        zIndex: 0,
        elevation: 0,
        backgroundColor: themeColors.background,
    },
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
