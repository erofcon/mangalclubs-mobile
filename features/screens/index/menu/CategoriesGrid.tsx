import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    type LayoutChangeEvent,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { SHADOW, themeColors } from "@/utils/theme-colors";
import { useCallback, useEffect, useRef } from "react";
import type { Category } from "@/types/products";

type CategoriesGridProps = {
    categories: Category[];
    activeCategoryId: Category["id"] | null;
    savedScrollX: number;
    onSelectCategory: (categoryId: Category["id"]) => void;
    onScrollXChange: (scrollX: number) => void;
};

const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(v, max));

const CONTENT_HORIZONTAL_PADDING = 16;
const CHIP_GAP = 8;
const REVEAL_EDGE_PADDING = 16;

export function CategoriesGrid({
                                   categories,
                                   activeCategoryId,
                                   savedScrollX,
                                   onSelectCategory,
                                   onScrollXChange,
                               }: CategoriesGridProps) {
    const scrollRef = useRef<ScrollView>(null);

    const viewportWidthRef = useRef(0);
    const contentWidthRef = useRef(0);
    const currentScrollXRef = useRef(savedScrollX);

    const chipWidthsRef = useRef<Record<string, number>>({});
    const didRestoreScrollRef = useRef(false);
    const lastActiveCategoryIdRef = useRef<Category["id"] | null>(null);
    const shouldRevealActiveRef = useRef(false);
    const lastPressRef = useRef(0);

    const getMeasuredContentWidth = useCallback(() => {
        if (!categories.length) return 0;

        let width = CONTENT_HORIZONTAL_PADDING * 2;

        for (let index = 0; index < categories.length; index += 1) {
            const category = categories[index];
            const chipWidth = chipWidthsRef.current[category.id];
            if (!chipWidth) return null;

            width += chipWidth;

            if (index < categories.length - 1) {
                width += CHIP_GAP;
            }
        }

        return width;
    }, [categories]);

    const getChipLayout = useCallback(
        (id: Category["id"]) => {
            let x = CONTENT_HORIZONTAL_PADDING;

            for (const category of categories) {
                const width = chipWidthsRef.current[category.id];
                if (!width) return null;

                if (category.id === id) {
                    return { x, width };
                }

                x += width + CHIP_GAP;
            }

            return null;
        },
        [categories]
    );

    const scrollToReveal = useCallback((id: string, animated: boolean) => {
        const layout = getChipLayout(id);
        if (!layout) return;

        const viewportWidth = viewportWidthRef.current;
        const measuredContentWidth = getMeasuredContentWidth();
        const contentWidth = contentWidthRef.current || measuredContentWidth || 0;

        if (!viewportWidth || !contentWidth) return;

        const edgePadding = REVEAL_EDGE_PADDING;
        const currentX = currentScrollXRef.current;
        const chipLeft = layout.x;
        const chipRight = layout.x + layout.width;
        const visibleLeft = currentX + edgePadding;
        const visibleRight = currentX + viewportWidth - edgePadding;

        let targetX: number | null = null;

        if (chipLeft < visibleLeft) {
            targetX = chipLeft - edgePadding;
        } else if (chipRight > visibleRight) {
            targetX = chipRight - viewportWidth + edgePadding;
        }

        if (targetX === null) {
            shouldRevealActiveRef.current = false;
            return;
        }

        const maxX = Math.max(contentWidth - viewportWidth, 0);
        const nextX = clamp(targetX, 0, maxX);
        currentScrollXRef.current = nextX;
        onScrollXChange(nextX);
        shouldRevealActiveRef.current = false;

        scrollRef.current?.scrollTo({
            x: nextX,
            y: 0,
            animated,
        });
    }, [getChipLayout, getMeasuredContentWidth, onScrollXChange]);

    const requestReveal = useCallback((id: string, animated: boolean) => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                scrollToReveal(id, animated);
            });
        });
    }, [scrollToReveal]);

    // Restore the manual horizontal position if the sticky header remounts.
    useEffect(() => {
        if (didRestoreScrollRef.current) return;
        if (!savedScrollX) return;

        didRestoreScrollRef.current = true;
        currentScrollXRef.current = savedScrollX;

        requestAnimationFrame(() => {
            scrollRef.current?.scrollTo({
                x: savedScrollX,
                y: 0,
                animated: false,
            });
        });
    }, [savedScrollX]);

    // Keep the active category inside the visible horizontal viewport.
    useEffect(() => {
        if (!activeCategoryId) return;

        const previousActiveCategoryId = lastActiveCategoryIdRef.current;
        lastActiveCategoryIdRef.current = activeCategoryId;

        if (previousActiveCategoryId === activeCategoryId) {
            return;
        }

        shouldRevealActiveRef.current = true;
        requestReveal(activeCategoryId, false);
    }, [activeCategoryId, requestReveal]);

    const revealPendingActiveCategory = useCallback(() => {
        if (!activeCategoryId || !shouldRevealActiveRef.current) return;
        requestReveal(activeCategoryId, false);
    }, [activeCategoryId, requestReveal]);

    const handleViewportLayout = (e: LayoutChangeEvent) => {
        viewportWidthRef.current = e.nativeEvent.layout.width;
        revealPendingActiveCategory();
    };

    const handleContentSizeChange = (w: number) => {
        contentWidthRef.current = w;
        revealPendingActiveCategory();
    };

    const handleChipLayout = (id: string, e: LayoutChangeEvent) => {
        const { width } = e.nativeEvent.layout;
        chipWidthsRef.current[id] = width;

        const measuredContentWidth = getMeasuredContentWidth();
        if (measuredContentWidth) {
            contentWidthRef.current = Math.max(contentWidthRef.current, measuredContentWidth);
        }

        revealPendingActiveCategory();
    };

    const handlePress = (id: string) => {
        const now = Date.now();

        // anti double-tap glitch (Android fix)
        if (now - lastPressRef.current < 100) return;
        lastPressRef.current = now;
        shouldRevealActiveRef.current = true;
        requestReveal(id, false);

        onSelectCategory(id);
    };

    if (!categories.length) return null;

    return (
        <View style={styles.container} onLayout={handleViewportLayout}>
            <ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="always"
                nestedScrollEnabled
                scrollEventThrottle={16}
                onContentSizeChange={handleContentSizeChange}
                onScroll={(e) => {
                    const scrollX = e.nativeEvent.contentOffset.x;
                    currentScrollXRef.current = scrollX;
                    onScrollXChange(scrollX);
                }}
            >
                {categories.map((category) => {
                    const isActive = category.id === activeCategoryId;

                    return (
                        <TouchableOpacity
                            key={category.id}
                            activeOpacity={0.7}
                            disallowInterruption
                            onLayout={(e) => handleChipLayout(category.id, e)}
                            onPress={() => handlePress(category.id)}
                            style={[
                                styles.chip,
                                isActive && styles.chipActive,
                            ]}
                        >
                            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                                {category.title}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 8,
    },
    content: {
        gap: CHIP_GAP,
        alignItems: "center",
        paddingHorizontal: CONTENT_HORIZONTAL_PADDING,
    },
    chip: {
        height: 40,
        paddingHorizontal: 16,
        borderRadius: 999,
        backgroundColor: themeColors.card,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        ...SHADOW,
    },
    chipActive: {
        borderColor: themeColors.border,
    },
    chipText: {
        color: themeColors.text,
        fontSize: 15,
        fontWeight: "600",
    },
    chipTextActive: {
        color: themeColors.primary,
    },
});
