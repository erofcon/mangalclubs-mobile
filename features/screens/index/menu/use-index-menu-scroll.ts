import * as Haptics from "expo-haptics";
import {useCallback, useEffect, useRef, useState} from "react";
import {
    ScrollView,
    type LayoutChangeEvent,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
} from "react-native";

import {
    AUTO_SCROLL_LOCK_TIMEOUT_MS,
    BOTTOM_REACH_THRESHOLD,
    SCROLL_CATEGORY_HAPTIC_THROTTLE_MS,
    SCROLL_TARGET_TOLERANCE,
    SECTION_OFFSET_GAP,
} from "@/features/screens/index/menu/constants";
import type {Category, MenuCategory} from "@/types/products";

export function useIndexMenuScroll(availableCategories: MenuCategory[]) {
    const scrollRef = useRef<ScrollView>(null);
    const sectionsTopOffsetRef = useRef(0);
    const tabsContainerOffsetYRef = useRef(0);
    const tabsLocalOffsetYRef = useRef(0);
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

    const [activeCategoryId, setActiveCategoryId] = useState<Category["id"] | null>(null);
    const [isTabsPinned, setIsTabsPinned] = useState(false);
    const [tabsAnchorOffsetY, setTabsAnchorOffsetY] = useState(Number.POSITIVE_INFINITY);
    const [stickyTabsHeight, setStickyTabsHeight] = useState(0);

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

    const updateTabsPinned = useCallback(
        (scrollY: number) => {
            const nextIsTabsPinned =
                Number.isFinite(tabsAnchorOffsetY) &&
                scrollY >= Math.max(tabsAnchorOffsetY, 0);

            setIsTabsPinned((current) =>
                current === nextIsTabsPinned ? current : nextIsTabsPinned
            );

            return nextIsTabsPinned;
        },
        [tabsAnchorOffsetY]
    );

    const handleMenuScroll = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const nextScrollY = event.nativeEvent.contentOffset.y;
            currentScrollYRef.current = nextScrollY;
            lastViewportHeightRef.current = event.nativeEvent.layoutMeasurement.height;
            lastContentHeightRef.current = event.nativeEvent.contentSize.height;

            const shouldPinTabs = updateTabsPinned(nextScrollY);

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
        [clearAutoScrollLock, updateActiveCategory, updateTabsPinned]
    );

    const handleMenuScrollEndDrag = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const nextScrollY = event.nativeEvent.contentOffset.y;
            currentScrollYRef.current = nextScrollY;
            lastViewportHeightRef.current = event.nativeEvent.layoutMeasurement.height;
            lastContentHeightRef.current = event.nativeEvent.contentSize.height;

            const shouldPinTabs = updateTabsPinned(nextScrollY);

            if (autoScrollLockRef.current) return;

            updateActiveCategory(
                nextScrollY,
                event.nativeEvent.layoutMeasurement.height,
                event.nativeEvent.contentSize.height,
                shouldPinTabs
            );
        },
        [updateActiveCategory, updateTabsPinned]
    );

    const handleMenuMomentumEnd = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const nextScrollY = event.nativeEvent.contentOffset.y;
            currentScrollYRef.current = nextScrollY;
            lastViewportHeightRef.current = event.nativeEvent.layoutMeasurement.height;
            lastContentHeightRef.current = event.nativeEvent.contentSize.height;

            const shouldPinTabs = updateTabsPinned(nextScrollY);

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
        [clearAutoScrollLock, updateActiveCategory, updateTabsPinned]
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

            const shouldAnimateScroll = true;

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

    const updateTabsAnchorOffset = useCallback(() => {
        setTabsAnchorOffsetY(tabsContainerOffsetYRef.current + tabsLocalOffsetYRef.current);
    }, []);

    const handleTabsContainerLayout = useCallback(
        (event: LayoutChangeEvent) => {
            tabsContainerOffsetYRef.current = event.nativeEvent.layout.y;
            updateTabsAnchorOffset();
        },
        [updateTabsAnchorOffset]
    );

    const handleTabsLayout = useCallback((event: LayoutChangeEvent) => {
        tabsLocalOffsetYRef.current = event.nativeEvent.layout.y;
        updateTabsAnchorOffset();
        setStickyTabsHeight(event.nativeEvent.layout.height);
    }, [updateTabsAnchorOffset]);

    const handleSectionsLayout = useCallback((event: LayoutChangeEvent) => {
        sectionsTopOffsetRef.current = event.nativeEvent.layout.y;
    }, []);

    return {
        activeCategoryId,
        categoryTabsScrollXRef,
        handleCategoryLayout,
        handleCategoryTabsScrollXChange,
        handleMenuMomentumEnd,
        handleMenuScroll,
        handleMenuScrollBeginDrag,
        handleMenuScrollEndDrag,
        handleSectionsLayout,
        handleTabsContainerLayout,
        handleTabsLayout,
        isTabsPinned,
        scrollRef,
        scrollToCategory,
    };
}
