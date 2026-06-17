import {MaterialCommunityIcons} from "@expo/vector-icons";
import {router} from "expo-router";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

import {DishCard} from "@/features/screens/menu/DishCard";
import {DishDetailsModal} from "@/features/screens/menu/DishDetailsModal";
import type {MenuItem} from "@/types/products";
import {useCartStore} from "@/store/cart-store";
import {themeColors} from "@/utils/theme-colors";
import {useAppDataStore} from "@/store/app-data-store";
import {requestCartAddPermission} from "@/store/cart-gate-store";

export function ListOfDay() {
    const {width} = useWindowDimensions();
    const addItemToCart = useCartStore((state) => state.addItem);
    const menus = useAppDataStore((state) => state.menu);

    const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
    const [toastMessage, setToastMessage] = useState("");

    const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const toastProgress = useSharedValue(0);

    const availableCategories = useMemo(
        () => menus.filter((category) => category.items.length > 0),
        [menus]
    );

    const featuredItems = useMemo(
        () =>
            availableCategories
                .flatMap((category) =>
                    category.items.map((item) => ({
                        ...item,
                        categoryTitle: category.title,
                    }))
                )
                .slice(0, 6),
        [availableCategories]
    );

    const cardWidth = useMemo(() => Math.min(190, width * 0.42), [width]);

    const toastAnimatedStyle = useAnimatedStyle(() => ({
        opacity: toastProgress.value,
        transform: [{translateY: (1 - toastProgress.value) * 12}],
    }));

    const showAddedToast = useCallback(
        (item: MenuItem) => {
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
        },
        [toastProgress]
    );

    const handleProductAdd = useCallback(
        (item: MenuItem) => {
            if (!requestCartAddPermission(item)) {
                return;
            }

            addItemToCart(item);

            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
            });

            showAddedToast(item);
        },
        [addItemToCart, showAddedToast]
    );

    useEffect(() => {
        return () => {
            if (toastTimerRef.current) {
                clearTimeout(toastTimerRef.current);
            }
        };
    }, []);

    return (
        <View>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Популярные блюда</Text>

                <Pressable
                    style={styles.sectionLink}
                    onPress={() => router.push("/menu")}
                >
                    <Text style={styles.sectionLinkText}>Смотреть все</Text>
                    <MaterialCommunityIcons
                        name="chevron-right"
                        size={18}
                        color={themeColors.primary}
                    />
                </Pressable>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.featuredList}
            >
                {featuredItems.map((item) => (
                    <View key={item.id} style={{marginRight: 12}}>
                        <DishCard
                            item={item}
                            width={cardWidth}
                            onPress={() => setSelectedDish(item)}
                            onAddPress={() => handleProductAdd(item)}
                        />
                    </View>
                ))}
            </ScrollView>

            {toastMessage ? (
                <Animated.View
                    pointerEvents="none"
                    style={[styles.toast, toastAnimatedStyle]}
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
        </View>
    );
}

const styles = StyleSheet.create({
    sectionHeader: {
        paddingHorizontal: 12,
        marginBottom: 13,
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 16,
    },

    sectionTitle: {
        color: themeColors.text,
        fontSize: 16,
        fontFamily: "Point-Bold",
    },

    sectionLink: {
        flexDirection: "row",
        alignItems: "center",
        paddingBottom: 2,
    },

    sectionLinkText: {
        color: themeColors.primary,
        fontSize: 12,
        fontFamily: "Point-Bold",
    },

    featuredList: {
        paddingHorizontal: 12,
        paddingBottom: 16,
    },

    toast: {
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 12,
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
