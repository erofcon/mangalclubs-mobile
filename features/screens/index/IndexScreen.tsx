import {Screen} from "@/components/ui/Screen";
import {CategoriesGrid} from "@/features/screens/index/menu/CategoriesGrid";
import {ProductCard} from "@/features/screens/index/menu/ProductCard";
import {menus} from "@/mocks/mocks-data";
import {
    type Category,
    type MenuCategory,
    type MenuItem,
} from "@/types/products";
import {themeColors} from "@/utils/theme-colors";
import * as Haptics from "expo-haptics";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
    type LayoutChangeEvent,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";

const GRID_COLUMNS = 3;
const GAP = 12;
const H_PADDING = 16;
const WEB_MAX_WIDTH = 430;
const NATIVE_FALLBACK_WIDTH = 360;
const SECTION_OFFSET_GAP = 18;
const BOTTOM_REACH_THRESHOLD = 2;
const SCROLL_TARGET_TOLERANCE = 6;
const AUTO_SCROLL_LOCK_TIMEOUT_MS = 700;
const SCROLL_CATEGORY_HAPTIC_THROTTLE_MS = 650;

function chunkArray<T>(items: T[], size: number): T[][] {
    if (size <= 0) return [items];

    const result: T[][] = [];
    for (let index = 0; index < items.length; index += size) {
        result.push(items.slice(index, index + size));
    }
    return result;
}

export function IndexScreen() {
    const insets = useSafeAreaInsets();
    const {width: windowWidth} = useWindowDimensions();

    const scrollRef = useRef<ScrollView>(null);
    const sectionsTopOffsetRef = useRef(0);
    const categoryRelativeOffsetsRef = useRef<Record<string, number>>({});
    const categoryTabsScrollXRef = useRef(0);
    const currentScrollYRef = useRef(0);
    const autoScrollLockRef = useRef(false);
    const autoScrollTargetYRef = useRef<number | null>(null);
    const pendingCategoryIdRef = useRef<Category["id"] | null>(null);
    const autoScrollUnlockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastScrollCategoryHapticAtRef = useRef(0);
    const lastViewportHeightRef = useRef(0);
    const lastContentHeightRef = useRef(0);

    const [containerWidth, setContainerWidth] = useState(0);
    const [activeCategoryId, setActiveCategoryId] = useState<Category["id"] | null>(null);
    const [tabsAnchorOffsetY, setTabsAnchorOffsetY] = useState(Number.POSITIVE_INFINITY);
    const [stickyTabsHeight, setStickyTabsHeight] = useState(0);

    const onContainerLayout = useCallback((event: LayoutChangeEvent) => {
        setContainerWidth(event.nativeEvent.layout.width);
    }, []);

    const listWidth = useMemo(() => {
        if (containerWidth > 0) return containerWidth;
        if (Platform.OS === "web" && windowWidth > 0) return Math.min(windowWidth, WEB_MAX_WIDTH);
        if (Platform.OS === "web") return WEB_MAX_WIDTH;
        return windowWidth || NATIVE_FALLBACK_WIDTH;
    }, [containerWidth, windowWidth]);

    const itemWidth = useMemo(() => {
        if (!listWidth) return 0;
        const availableWidth = listWidth - H_PADDING * 2 - GAP * (GRID_COLUMNS - 1);
        return Math.floor(availableWidth / GRID_COLUMNS);
    }, [listWidth]);

    const availableCategories = useMemo(() => {
        return menus.filter((category) => category.items.length > 0);
    }, []);

    const itemsByCategory = useMemo(() => {
        return availableCategories.reduce<Record<string, MenuItem[]>>((acc, category) => {
            acc[category.id] = category.items;
            return acc;
        }, {});
    }, [availableCategories]);

    useEffect(() => {
        categoryRelativeOffsetsRef.current = {};
        sectionsTopOffsetRef.current = 0;
    }, [availableCategories]);

    useEffect(() => {
        if (availableCategories.length === 0) {
            setActiveCategoryId(null);
            return;
        }

        setActiveCategoryId((current) => {
            const valid = availableCategories.some((category) => category.id === current);
            return valid ? current : availableCategories[0].id;
        });
    }, [availableCategories]);

    useEffect(() => {
        return () => {
            if (autoScrollUnlockTimeoutRef.current !== null) {
                clearTimeout(autoScrollUnlockTimeoutRef.current);
            }
        };
    }, []);

    const clearAutoScrollLock = useCallback(() => {
        autoScrollLockRef.current = false;
        autoScrollTargetYRef.current = null;
        pendingCategoryIdRef.current = null;

        if (autoScrollUnlockTimeoutRef.current !== null) {
            clearTimeout(autoScrollUnlockTimeoutRef.current);
            autoScrollUnlockTimeoutRef.current = null;
        }
    }, []);

    const scheduleAutoScrollUnlock = useCallback(() => {
        if (autoScrollUnlockTimeoutRef.current !== null) {
            clearTimeout(autoScrollUnlockTimeoutRef.current);
        }

        autoScrollUnlockTimeoutRef.current = setTimeout(() => {
            const pendingCategoryId = pendingCategoryIdRef.current;
            if (pendingCategoryId) {
                setActiveCategoryId((current) =>
                    current === pendingCategoryId ? current : pendingCategoryId
                );
            }

            clearAutoScrollLock();
        }, AUTO_SCROLL_LOCK_TIMEOUT_MS);
    }, [clearAutoScrollLock]);

    const getCategoryByOffset = useCallback(
        (
            scrollY: number,
            viewportHeight: number,
            contentHeight: number,
            isTabsPinned: boolean
        ): Category["id"] | null => {
            if (availableCategories.length === 0) return null;

            const isAtBottom =
                scrollY + viewportHeight >= contentHeight - BOTTOM_REACH_THRESHOLD;

            if (isAtBottom) {
                return availableCategories[availableCategories.length - 1].id;
            }

            const stickyOffset = isTabsPinned ? stickyTabsHeight : 0;
            const normalizedOffset = scrollY + stickyOffset + SECTION_OFFSET_GAP;

            let currentCategoryId = availableCategories[0].id;

            for (const category of availableCategories) {
                const relativeOffset = categoryRelativeOffsetsRef.current[category.id];
                if (relativeOffset === undefined) continue;

                const sectionTop = sectionsTopOffsetRef.current + relativeOffset;

                if (normalizedOffset >= sectionTop - 4) {
                    currentCategoryId = category.id;
                } else {
                    break;
                }
            }

            return currentCategoryId;
        },
        [availableCategories, stickyTabsHeight]
    );

    const updateActiveCategory = useCallback(
        (
            scrollY: number,
            viewportHeight: number,
            contentHeight: number,
            isTabsPinned: boolean
        ) => {
            const nextCategoryId = getCategoryByOffset(
                scrollY,
                viewportHeight,
                contentHeight,
                isTabsPinned
            );

            if (!nextCategoryId) return;

            setActiveCategoryId((current) => {
                if (current === nextCategoryId) {
                    return current;
                }

                const now = Date.now();
                if (now - lastScrollCategoryHapticAtRef.current >= SCROLL_CATEGORY_HAPTIC_THROTTLE_MS) {
                    lastScrollCategoryHapticAtRef.current = now;
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
                    });
                }

                return nextCategoryId;
            });
        },
        [getCategoryByOffset]
    );

    const handleMenuScroll = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const nextScrollY = event.nativeEvent.contentOffset.y;
            currentScrollYRef.current = nextScrollY;
            lastViewportHeightRef.current = event.nativeEvent.layoutMeasurement.height;
            lastContentHeightRef.current = event.nativeEvent.contentSize.height;

            const shouldPinTabs =
                Number.isFinite(tabsAnchorOffsetY) &&
                nextScrollY >= Math.max(tabsAnchorOffsetY, 0);

            if (autoScrollLockRef.current) {
                const maxScrollableY = Math.max(
                    event.nativeEvent.contentSize.height - event.nativeEvent.layoutMeasurement.height,
                    0
                );

                const hasReachedTarget =
                    autoScrollTargetYRef.current !== null &&
                    Math.abs(nextScrollY - autoScrollTargetYRef.current) <= SCROLL_TARGET_TOLERANCE;

                const hasReachedScrollableEnd =
                    autoScrollTargetYRef.current !== null &&
                    Math.abs(nextScrollY - maxScrollableY) <= SCROLL_TARGET_TOLERANCE &&
                    Math.abs(nextScrollY - autoScrollTargetYRef.current) > SCROLL_TARGET_TOLERANCE;

                if (hasReachedTarget || hasReachedScrollableEnd) {
                    const pendingCategoryId = pendingCategoryIdRef.current;
                    if (pendingCategoryId) {
                        setActiveCategoryId((current) =>
                            current === pendingCategoryId ? current : pendingCategoryId
                        );
                    }

                    clearAutoScrollLock();
                }

                return;
            }

            updateActiveCategory(
                nextScrollY,
                event.nativeEvent.layoutMeasurement.height,
                event.nativeEvent.contentSize.height,
                shouldPinTabs
            );
        },
        [clearAutoScrollLock, tabsAnchorOffsetY, updateActiveCategory]
    );

    const handleMenuScrollEndDrag = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const nextScrollY = event.nativeEvent.contentOffset.y;
            currentScrollYRef.current = nextScrollY;
            lastViewportHeightRef.current = event.nativeEvent.layoutMeasurement.height;
            lastContentHeightRef.current = event.nativeEvent.contentSize.height;

            const shouldPinTabs =
                Number.isFinite(tabsAnchorOffsetY) &&
                nextScrollY >= Math.max(tabsAnchorOffsetY, 0);

            if (autoScrollLockRef.current) return;

            updateActiveCategory(
                nextScrollY,
                event.nativeEvent.layoutMeasurement.height,
                event.nativeEvent.contentSize.height,
                shouldPinTabs
            );
        },
        [tabsAnchorOffsetY, updateActiveCategory]
    );

    const handleMenuMomentumEnd = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const nextScrollY = event.nativeEvent.contentOffset.y;
            currentScrollYRef.current = nextScrollY;
            lastViewportHeightRef.current = event.nativeEvent.layoutMeasurement.height;
            lastContentHeightRef.current = event.nativeEvent.contentSize.height;

            const shouldPinTabs =
                Number.isFinite(tabsAnchorOffsetY) &&
                nextScrollY >= Math.max(tabsAnchorOffsetY, 0);

            if (autoScrollLockRef.current) {
                const pendingCategoryId = pendingCategoryIdRef.current;
                if (pendingCategoryId) {
                    setActiveCategoryId((current) =>
                        current === pendingCategoryId ? current : pendingCategoryId
                    );
                }

                clearAutoScrollLock();
                return;
            }

            updateActiveCategory(
                nextScrollY,
                event.nativeEvent.layoutMeasurement.height,
                event.nativeEvent.contentSize.height,
                shouldPinTabs
            );
        },
        [clearAutoScrollLock, tabsAnchorOffsetY, updateActiveCategory]
    );

    const handleMenuScrollBeginDrag = useCallback(() => {
        if (!autoScrollLockRef.current) return;
        clearAutoScrollLock();
    }, [clearAutoScrollLock]);

    const scrollToCategory = useCallback(
        (categoryId: Category["id"]) => {
            const relativeOffset = categoryRelativeOffsetsRef.current[categoryId];
            if (relativeOffset === undefined) return;

            const categoryTop = sectionsTopOffsetRef.current + relativeOffset;
            const isFirstCategory = categoryId === availableCategories[0]?.id;
            const alignmentGap = isFirstCategory ? 0 : SECTION_OFFSET_GAP;

            const rawTargetY = Math.max(categoryTop - stickyTabsHeight - alignmentGap, 0);

            const hasScrollMetrics =
                lastContentHeightRef.current > 0 && lastViewportHeightRef.current > 0;

            const maxScrollableY = hasScrollMetrics
                ? Math.max(lastContentHeightRef.current - lastViewportHeightRef.current, 0)
                : rawTargetY;

            const targetY = hasScrollMetrics ? Math.min(rawTargetY, maxScrollableY) : rawTargetY;

            clearAutoScrollLock();

            setActiveCategoryId(categoryId);

            const shouldAnimateScroll = Platform.OS !== "android";

            if (shouldAnimateScroll) {
                autoScrollLockRef.current = true;
                autoScrollTargetYRef.current = targetY;
                pendingCategoryIdRef.current = categoryId;
                scheduleAutoScrollUnlock();
            }

            scrollRef.current?.scrollTo({
                y: targetY,
                animated: shouldAnimateScroll,
            });
        },
        [
            availableCategories,
            clearAutoScrollLock,
            scheduleAutoScrollUnlock,
            stickyTabsHeight,
        ]
    );

    const handleCategoryTabsScrollXChange = useCallback((scrollX: number) => {
        categoryTabsScrollXRef.current = scrollX;
    }, []);

    const handleCategoryLayout = useCallback((categoryId: Category["id"], event: LayoutChangeEvent) => {
        categoryRelativeOffsetsRef.current[categoryId] = event.nativeEvent.layout.y;
    }, []);

    const renderCategorySection = useCallback(
        (category: MenuCategory) => {
            const rows = chunkArray(itemsByCategory[category.id] ?? [], GRID_COLUMNS);

            return (
                <View
                    key={category.id}
                    collapsable={false}
                    onLayout={(event) => handleCategoryLayout(category.id, event)}
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
        [handleCategoryLayout, itemWidth, itemsByCategory]
    );

    return (
        <Screen withTopInset>
            <View style={styles.root} onLayout={onContainerLayout}>
                <ScrollView
                    ref={scrollRef}
                    style={styles.scroll}
                    contentContainerStyle={{
                        paddingBottom: insets.bottom + 32,
                    }}
                    stickyHeaderIndices={[0]}
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="always"
                    showsVerticalScrollIndicator={false}
                    scrollEventThrottle={16}
                    onScroll={handleMenuScroll}
                    onScrollBeginDrag={handleMenuScrollBeginDrag}
                    onScrollEndDrag={handleMenuScrollEndDrag}
                    onMomentumScrollEnd={handleMenuMomentumEnd}
                >
                    <View
                        collapsable={false}
                        style={styles.categoriesStickyBlock}
                        onLayout={(event) => {
                            setTabsAnchorOffsetY(event.nativeEvent.layout.y);
                            setStickyTabsHeight(event.nativeEvent.layout.height);
                        }}
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
                        onLayout={(event) => {
                            sectionsTopOffsetRef.current = event.nativeEvent.layout.y;
                        }}
                    >
                        {availableCategories.map(renderCategorySection)}
                    </View>
                </ScrollView>
            </View>
        </Screen>
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
    categoriesStickyBlock: {
        position: "relative",
        paddingHorizontal: 0,
        paddingBottom: 18,
        backgroundColor: themeColors.background,
        zIndex: 100,
        elevation: 100,
    },
    sectionsBlock: {
        width: "100%",
        zIndex: 0,
        elevation: 0,
    },
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
