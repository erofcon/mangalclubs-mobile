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
import type {MenuItem} from "@/types/products";
import {useIndexMenuScroll} from "@/features/screens/index/menu/use-index-menu-scroll";
import {ANDROID_DECELERATION_RATE, GAP, H_PADDING} from "@/features/screens/index/menu/constants";
import {CategoriesGrid} from "@/features/screens/index/menu/CategoriesGrid";
import {themeColors} from "@/utils/theme-colors";
import {MenuSections} from "@/features/screens/index/menu/MenuSections";
import {DishDetailsModal} from "@/features/screens/menu/DishDetailsModal";
import type {AppBottomSheetRef} from "@/components/ui/bottom-sheet/AppBottomSheetModal";
import {MenuCategoriesSheet} from "@/features/screens/menu/MenuCategoriesSheet";
import {useCartStore} from "@/store/cart-store";
import {useAppDataStore} from "@/store/app-data-store";
import {useDeliveryStore} from "@/store/delivery-store";
import {OrderAvailabilityBar} from "@/components/OrderAvailabilityBar";

type AnimatedScrollViewRef = ComponentRef<typeof Animated.ScrollView>;
const SKELETON_CATEGORIES = [
    "skeleton-category-1",
    "skeleton-category-2",
    "skeleton-category-3",
    "skeleton-category-4",
];
const SKELETON_ITEMS = [
    "skeleton-dish-1",
    "skeleton-dish-2",
    "skeleton-dish-3",
    "skeleton-dish-4",
    "skeleton-dish-5",
    "skeleton-dish-6",
];

export function MenuScreen() {
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{categoryId?: string}>();
    const [containerWidth, setContainerWidth] = useState(0);
    const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
    const [toastMessage, setToastMessage] = useState("");
    const [availabilityBarHeight, setAvailabilityBarHeight] = useState(0);
    const categoriesSheetRef = useRef<AppBottomSheetRef>(null);
    const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const categoryScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const itemWidth = useMenuItemWidth(containerWidth);
    const addItemToCart = useCartStore((state) => state.addItem);
    const deliveryType = useDeliveryStore((state) => state.type);
    const menus = useAppDataStore((state) => state.menu);
    const isMenuLoading = useAppDataStore((state) => state.isMenuLoading);
    const errorMessage = useAppDataStore((state) => state.errorMessage);

    const onContainerLayout = useCallback((event: LayoutChangeEvent) => {
        setContainerWidth(event.nativeEvent.layout.width);
    }, []);

    const availableCategories = useMemo(() => {
        return menus.filter((category) => category.items.length > 0);
    }, [menus]);

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
        if (!deliveryType) {
            router.push("/order_type");
            return;
        }

        addItemToCart(item);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
        });
        showAddedToast(item);
    }, [addItemToCart, deliveryType, showAddedToast]);

    useEffect(() => {
        return () => {
            if (toastTimerRef.current) {
                clearTimeout(toastTimerRef.current);
            }

            if (categoryScrollTimerRef.current) {
                clearTimeout(categoryScrollTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const categoryId = params.categoryId;
        if (!categoryId) {
            return;
        }

        categoryScrollTimerRef.current = setTimeout(() => {
            scrollToCategory(categoryId);
        }, 120);

        return () => {
            if (categoryScrollTimerRef.current) {
                clearTimeout(categoryScrollTimerRef.current);
                categoryScrollTimerRef.current = null;
            }
        };
    }, [params.categoryId, scrollToCategory]);

    const topChromeHeight = availabilityBarHeight > 0 ? availabilityBarHeight : insets.top;

    return (
        <>
            <StatusBar style="light" />

            <Screen>
                <View style={styles.root} onLayout={onContainerLayout}>
                    <Animated.ScrollView
                        ref={animatedScrollRef}
                        style={[
                            styles.scroll,
                            {marginTop: topChromeHeight},
                        ]}
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
                                {isMenuLoading ? (
                                    <MenuCategoriesSkeleton />
                                ) : (
                                    <CategoriesGrid
                                        categories={availableCategories}
                                        activeCategoryId={activeCategoryId}
                                        savedScrollX={categoryTabsScrollXRef.current}
                                        onSearchPress={handleSearchPress}
                                        onCategoriesPress={openCategoriesSheet}
                                        onSelectCategory={scrollToCategory}
                                        onScrollXChange={handleCategoryTabsScrollXChange}
                                    />
                                )}
                            </View>
                        </View>

                        <View
                            collapsable={false}
                            style={styles.sectionsBlock}
                            onLayout={handleSectionsLayout}
                        >
                            {isMenuLoading ? (
                                <MenuSkeleton itemWidth={itemWidth} />
                            ) : errorMessage ? (
                                <View style={styles.stateBlock}>
                                    <Text style={styles.stateText}>{errorMessage}</Text>
                                </View>
                            ) : availableCategories.length === 0 ? (
                                <View style={styles.stateBlock}>
                                    <Text style={styles.stateText}>Меню пока недоступно</Text>
                                </View>
                            ) : (
                                <MenuSections
                                    categories={availableCategories}
                                    itemsByCategory={itemsByCategory}
                                    itemWidth={itemWidth}
                                    onProductPress={setSelectedDish}
                                    onProductAdd={handleProductAdd}
                                    onCategoryLayout={handleCategoryLayout}
                                />
                            )}
                        </View>
                    </Animated.ScrollView>

                    {availabilityBarHeight === 0 && topChromeHeight > 0 ? (
                        <View
                            pointerEvents="none"
                            style={[
                                styles.topSafeAreaBackground,
                                {height: topChromeHeight},
                            ]}
                        />
                    ) : null}

                    <View style={styles.availabilityBarOverlay}>
                        <OrderAvailabilityBar
                            topInset={insets.top}
                            onHeightChange={setAvailabilityBarHeight}
                        />
                    </View>

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

function MenuCategoriesSkeleton() {
    return (
        <View style={styles.categoriesSkeleton}>
            <View style={styles.skeletonIconButton} />
            <View style={styles.skeletonIconButton} />

            <View style={styles.skeletonChips}>
                {SKELETON_CATEGORIES.map((item, index) => (
                    <View
                        key={item}
                        style={[
                            styles.skeletonChip,
                            {width: index === 0 ? 84 : index === 1 ? 112 : 74},
                        ]}
                    />
                ))}
            </View>
        </View>
    );
}

function MenuSkeleton({itemWidth}: {itemWidth: number}) {
    const skeletonWidth = itemWidth > 0 ? itemWidth : 160;

    return (
        <View style={styles.skeletonSection}>
            <View style={styles.skeletonTitle} />

            <View style={styles.skeletonGrid}>
                {SKELETON_ITEMS.map((item) => (
                    <View
                        key={item}
                        style={[
                            styles.skeletonCard,
                            {width: skeletonWidth},
                        ]}
                    >
                        <View style={styles.skeletonImage} />
                        <View style={styles.skeletonLineWide} />
                        <View style={styles.skeletonLineShort} />
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        width: "100%",
        backgroundColor: themeColors.background,
    },
    scroll: {
        flex: 1,
        backgroundColor: themeColors.background,
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
    stickyHeader: {
        zIndex: 999,
        backgroundColor: themeColors.background,
        overflow: "hidden",
    },
    categoriesStickyBlock: {
        zIndex: 999,
        elevation: 999,
        paddingHorizontal: 0,
        paddingTop: 8,
        paddingBottom: 10,
        backgroundColor: themeColors.background,
    },
    sectionsBlock: {
        width: "100%",
        zIndex: 0,
        elevation: 0,
        backgroundColor: themeColors.background,
    },
    stateBlock: {
        minHeight: 180,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    stateText: {
        color: themeColors.textSecondary,
        fontSize: 14,
        lineHeight: 20,
        textAlign: "center",
        fontFamily: "Point-Regular",
    },
    categoriesSkeleton: {
        minHeight: 38,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingLeft: 12,
        paddingRight: 8,
    },
    skeletonIconButton: {
        width: 38,
        height: 38,
        borderRadius: 13,
        backgroundColor: "#151411",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
    },
    skeletonChips: {
        flex: 1,
        minWidth: 0,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        overflow: "hidden",
    },
    skeletonChip: {
        height: 38,
        borderRadius: 999,
        backgroundColor: "#151411",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
    },
    skeletonSection: {
        paddingTop: 24,
    },
    skeletonTitle: {
        width: 132,
        height: 18,
        marginHorizontal: 12,
        marginBottom: 12,
        borderRadius: 6,
        backgroundColor: "#151411",
    },
    skeletonGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: GAP,
        paddingHorizontal: H_PADDING,
    },
    skeletonCard: {
        minHeight: 202,
        marginBottom: 2,
        overflow: "hidden",
        borderRadius: 20,
        backgroundColor: "#121210",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
    },
    skeletonImage: {
        height: 122,
        backgroundColor: "#1a1815",
    },
    skeletonLineWide: {
        height: 14,
        marginTop: 14,
        marginHorizontal: 10,
        borderRadius: 6,
        backgroundColor: "#201e1a",
    },
    skeletonLineShort: {
        width: "54%",
        height: 12,
        marginTop: 12,
        marginHorizontal: 10,
        borderRadius: 6,
        backgroundColor: "#201e1a",
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
