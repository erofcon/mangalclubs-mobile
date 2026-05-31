import {Screen} from "@/components/ui/Screen";
import {StatusBar} from "expo-status-bar";
import {VideoHeader} from "@/features/screens/menu/video_header/VideoHeader";
import {OrderType} from "@/features/screens/menu/order_type/OrderType";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useCallback, useMemo, useState, type ComponentRef, type RefObject} from "react";
import {useMenuItemWidth} from "@/features/screens/index/menu/use-menu-item-width";
import {
    LayoutChangeEvent,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Platform,
    StyleSheet,
    View,
} from "react-native";
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

type AnimatedScrollViewRef = ComponentRef<typeof Animated.ScrollView>;

export function MenuScreen() {
    const insets = useSafeAreaInsets();
    const [containerWidth, setContainerWidth] = useState(0);
    const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
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
});
