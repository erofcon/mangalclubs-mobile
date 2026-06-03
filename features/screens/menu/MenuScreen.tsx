import {Screen} from "@/components/ui/Screen";
import {StatusBar} from "expo-status-bar";
import {Hero} from "@/features/screens/menu/hero/Hero";
import {OrderType} from "@/features/screens/menu/order_type/OrderType";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useCallback, useEffect, useMemo, useRef, useState, type ComponentRef, type RefObject} from "react";
import {router, useLocalSearchParams} from "expo-router";
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
import * as Haptics from "expo-haptics";
import Animated, {
    runOnJS,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import {menus} from "@/mocks/mocks-data";
import type {MenuItem} from "@/types/products";
import {useIndexMenuScroll} from "@/features/screens/index/menu/use-index-menu-scroll";
import {ANDROID_DECELERATION_RATE} from "@/features/screens/index/menu/constants";
import {CategoriesGrid} from "@/features/screens/index/menu/CategoriesGrid";
import {themeColors} from "@/utils/theme-colors";
import {MenuSections} from "@/features/screens/index/menu/MenuSections";
import {DishDetailsModal} from "@/features/screens/menu/DishDetailsModal";
import type {AppBottomSheetRef} from "@/components/ui/bottom-sheet/AppBottomSheetModal";
import {MenuCategoriesSheet} from "@/features/screens/menu/MenuCategoriesSheet";
import {useCartStore} from "@/store/cart-store";

type AnimatedScrollViewRef = ComponentRef<typeof Animated.ScrollView>;

export function MenuScreen() {
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{categoryId?: string}>();
    const [containerWidth, setContainerWidth] = useState(0);
    const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
    const [toastMessage, setToastMessage] = useState("");
    const categoriesSheetRef = useRef<AppBottomSheetRef>(null);
    const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const itemWidth = useMenuItemWidth(containerWidth);
    const addItemToCart = useCartStore((state) => state.addItem);

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
    const toastProgress = useSharedValue(0);

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

    const toastAnimatedStyle = useAnimatedStyle(() => ({
        opacity: toastProgress.value,
        transform: [{translateY: (1 - toastProgress.value) * 12}],
    }));

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

    const showAddedToast = useCallback((item: MenuItem) => {
        if (toastTimerRef.current) {
            clearTimeout(toastTimerRef.current);
        }

        setToastMessage(`Добавлено: ${item.name}`);
        toastProgress.value = withTiming(1, {duration: 160});

        toastTimerRef.current = setTimeout(() => {
            toastProgress.value = withTiming(0, {duration: 180});

            toastTimerRef.current = setTimeout(() => {
                setToastMessage("");
            }, 200);
        }, 1700);
    }, [toastProgress]);

    const handleProductAdd = useCallback((item: MenuItem) => {
        addItemToCart(item);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
        });
        showAddedToast(item);
    }, [addItemToCart, showAddedToast]);

    useEffect(() => {
        return () => {
            if (toastTimerRef.current) {
                clearTimeout(toastTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const categoryId = params.categoryId;
        if (!categoryId) {
            return;
        }

        const timer = setTimeout(() => {
            scrollToCategory(categoryId);
        }, 350);

        return () => clearTimeout(timer);
    }, [params.categoryId, scrollToCategory]);

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
                        <Hero scrollY={scrollY} />

                        <View
                            collapsable={false}
                            style={styles.stickyHeader}
                            onLayout={handleTabsLayout}
                        >
                                <OrderType scrollY={scrollY} />
                            <View
                                collapsable={false}
                                style={styles.categoriesStickyBlock}
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
                                onProductAdd={handleProductAdd}
                                onCategoryLayout={handleCategoryLayout}
                            />
                        </View>
                    </Animated.ScrollView>

                    {toastMessage ? (
                        <Animated.View
                            pointerEvents="none"
                            style={[
                                styles.toast,
                                {bottom: insets.bottom + 92},
                                toastAnimatedStyle,
                            ]}
                        >
                            <View style={styles.toastIcon}>
                                <Text style={styles.toastIconText}>+</Text>
                            </View>

                            <Text style={styles.toastText} numberOfLines={1}>
                                {toastMessage}
                            </Text>
                        </Animated.View>
                    ) : null}

                    <DishDetailsModal
                        item={selectedDish}
                        onDismiss={() => setSelectedDish(null)}
                    />

                    <MenuCategoriesSheet
                        ref={categoriesSheetRef}
                        categories={availableCategories}
                        activeCategoryId={activeCategoryId}
                        onSelectCategory={handleSheetCategoryPress}
                    />
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
        backgroundColor:themeColors.background,
        marginTop: -40,
        overflow: "hidden",
    },
    categoriesStickyBlock: {
        zIndex: 999,
        elevation: 999,
        paddingHorizontal: 0,
        paddingBottom: 14,
        backgroundColor: themeColors.background,
    },
    sectionsBlock: {
        width: "100%",
        zIndex: 0,
        elevation: 0,
        backgroundColor: themeColors.background,
    },
    toast: {
        position: "absolute",
        left: 16,
        right: 16,
        minHeight: 48,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.10)",
        backgroundColor: "rgba(18,18,16,0.96)",
        zIndex: 1000,
        elevation: 1000,
    },
    toastIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: themeColors.primary,
    },
    toastIconText: {
        color: themeColors.textOnPrimary,
        fontSize: 18,
        lineHeight: 21,
        fontFamily: "Point-Bold",
    },
    toastText: {
        flex: 1,
        minWidth: 0,
        color: themeColors.text,
        fontSize: 14,
        lineHeight: 18,
        fontFamily: "Point-SemiBold",
    },
});
