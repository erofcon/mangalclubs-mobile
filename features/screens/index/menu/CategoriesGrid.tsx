import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
    type LayoutChangeEvent,
} from "react-native";
import {TouchableOpacity} from "react-native-gesture-handler";
import {Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import {themeColors} from "@/utils/theme-colors";
import {useCallback, useEffect, useRef} from "react";
import type {Category} from "@/types/products";

type CategoriesGridProps = {
    categories: Category[];
    activeCategoryId: Category["id"] | null;
    savedScrollX: number;
    onSearchPress?: () => void;
    onCategoriesPress?: () => void;
    onSelectCategory: (categoryId: Category["id"]) => void;
    onScrollXChange: (scrollX: number) => void;
};

const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(v, max));

const CONTENT_HORIZONTAL_PADDING = 8;
const CHIP_GAP = 8;
const REVEAL_EDGE_PADDING = 24;

export function CategoriesGrid({
                                   categories,
                                   activeCategoryId,
                                   savedScrollX,
                                   onSearchPress,
                                   onCategoriesPress,
                                   onSelectCategory,
                                   onScrollXChange,
                               }: CategoriesGridProps) {
    const scrollRef = useRef<ScrollView>(null);

    const viewportWidthRef = useRef(0);
    const contentWidthRef = useRef(0);
    const currentScrollXRef = useRef(savedScrollX);

    const chipWidthsRef = useRef<Record<string, number>>({});
    const didRestoreScrollRef = useRef(false);
    const lastActiveRef = useRef<Category["id"] | null>(null);
    const lastPressRef = useRef(0);

    const getChipLayout = useCallback(
        (id: string) => {
            let x = CONTENT_HORIZONTAL_PADDING;

            for (const c of categories) {
                const width = chipWidthsRef.current[c.id];

                if (width == null) {
                    return null;
                }

                if (c.id === id) {
                    return {
                        x,
                        width,
                    };
                }

                x += width + CHIP_GAP;
            }

            return null;
        },
        [categories]
    );

    const scrollToReveal = useCallback(
        (id: string, animated = true) => {
            const layout = getChipLayout(id);

            if (!layout) return;

            const viewportWidth = viewportWidthRef.current;
            const contentWidth = contentWidthRef.current;

            if (!viewportWidth || !contentWidth) return;

            const currentX = currentScrollXRef.current;

            const chipLeft = layout.x;
            const chipRight = layout.x + layout.width;

            const visibleLeft = currentX + REVEAL_EDGE_PADDING;
            const visibleRight =
                currentX + viewportWidth - REVEAL_EDGE_PADDING;

            let targetX: number | null = null;

            if (chipLeft < visibleLeft) {
                targetX = chipLeft - REVEAL_EDGE_PADDING;
            } else if (chipRight > visibleRight) {
                targetX =
                    chipRight -
                    viewportWidth +
                    REVEAL_EDGE_PADDING;
            }

            if (targetX === null) return;

            const maxX = Math.max(
                contentWidth - viewportWidth,
                0
            );

            const nextX = clamp(targetX, 0, maxX);

            currentScrollXRef.current = nextX;
            onScrollXChange(nextX);

            scrollRef.current?.scrollTo({
                x: nextX,
                y: 0,
                animated,
            });
        },
        [getChipLayout, onScrollXChange]
    );

    const requestReveal = useCallback(
        (id: string, animated = true) => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    scrollToReveal(id, animated);
                });
            });
        },
        [scrollToReveal]
    );

    useEffect(() => {
        if (didRestoreScrollRef.current) return;

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

    useEffect(() => {
        if (!activeCategoryId) return;

        if (lastActiveRef.current === activeCategoryId) {
            return;
        }

        lastActiveRef.current = activeCategoryId;

        requestReveal(activeCategoryId);
    }, [activeCategoryId, requestReveal]);

    const handlePress = (id: string) => {
        const now = Date.now();

        if (now - lastPressRef.current < 120) {
            return;
        }

        lastPressRef.current = now;

        requestReveal(id);

        onSelectCategory(id);
    };

    if (!categories.length) return null;

    return (
        <View style={styles.container}>
            <View style={styles.actions}>
                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Открыть поиск"
                    activeOpacity={0.72}
                    style={styles.iconButton}
                    onPress={onSearchPress}
                    hitSlop={8}
                >
                    <Ionicons
                        name="search-outline"
                        size={22}
                        color={themeColors.text}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Открыть категории"
                    activeOpacity={0.72}
                    style={styles.iconButton}
                    onPress={onCategoriesPress}
                    hitSlop={8}
                >
                    <MaterialCommunityIcons
                        name="tune-variant"
                        size={22}
                        color={themeColors.text}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.scrollArea}>
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    bounces={false}
                    alwaysBounceHorizontal={false}
                    showsHorizontalScrollIndicator={false}
                    scrollEventThrottle={16}
                    decelerationRate={
                        Platform.OS === "android"
                            ? 0.98
                            : "normal"
                    }
                    contentContainerStyle={styles.content}
                    onLayout={(e: LayoutChangeEvent) => {
                        viewportWidthRef.current =
                            e.nativeEvent.layout.width;
                    }}
                    onContentSizeChange={(width) => {
                        contentWidthRef.current = width;

                        // Восстанавливаем скролл только после
                        // получения реальной ширины контента
                        if (savedScrollX > 0) {
                            requestAnimationFrame(() => {
                                scrollRef.current?.scrollTo({
                                    x: savedScrollX,
                                    y: 0,
                                    animated: false,
                                });
                            });
                        }
                    }}
                    onScroll={(e) => {
                        const x =
                            e.nativeEvent.contentOffset.x;

                        currentScrollXRef.current = x;

                        onScrollXChange(x);
                    }}
                >
                    {categories.map((c) => {
                        const active =
                            c.id === activeCategoryId;

                        return (
                            <TouchableOpacity
                                key={c.id}
                                activeOpacity={0.8}
                                onLayout={(e) => {
                                    chipWidthsRef.current[
                                        c.id
                                        ] =
                                        e.nativeEvent.layout.width;
                                }}
                                onPress={() =>
                                    handlePress(c.id)
                                }
                                style={[
                                    styles.chip,
                                    active && styles.chipActive,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.text,
                                        active &&
                                        styles.textActive,
                                    ]}
                                >
                                    {c.title}
                                </Text>

                                <View
                                    style={[
                                        styles.underline,
                                        active &&
                                        styles.underlineActive,
                                    ]}
                                />
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
    },

    actions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingLeft: 12,
        paddingRight: 6,
    },

    iconButton: {
        width: 38,
        height: 38,
        borderRadius: 13,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#151411",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
    },

    scrollArea: {
        flex: 1,
        minWidth: 0,
    },

    content: {
        paddingHorizontal: CONTENT_HORIZONTAL_PADDING,
        alignItems: "center",
    },

    chip: {
        height: 38,
        justifyContent: "center",
        alignItems: "center",
        marginRight: CHIP_GAP,
        position: "relative",
        paddingHorizontal: 12,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.07)",
        backgroundColor: "#12110f",
    },

    text: {
        color: themeColors.text,
        fontSize: 14,
        lineHeight: 17,
        fontFamily: "Point-Regular",
        opacity: 0.7,
    },

    textActive: {
        opacity: 1,
        fontFamily: "Point-SemiBold",
        color: themeColors.textOnPrimary,
    },

    chipActive: {
        borderColor: themeColors.primary,
        backgroundColor: themeColors.primary,
    },

    underline: {
        position: "absolute",
        bottom: 5,
        left: 12,
        right: 12,
        height: 0,
        borderRadius: 999,
        backgroundColor: "transparent",
    },

    underlineActive: {
        backgroundColor: "transparent",
    },
});
