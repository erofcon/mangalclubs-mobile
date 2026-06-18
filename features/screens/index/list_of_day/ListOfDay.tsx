import {MaterialCommunityIcons} from "@expo/vector-icons";
import {router} from "expo-router";
import {useCallback, useMemo, useState} from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import * as Haptics from "expo-haptics";

import {DishCard} from "@/features/screens/menu/DishCard";
import {DishDetailsModal} from "@/features/screens/menu/DishDetailsModal";
import type {MenuItem} from "@/types/products";
import {useCartStore} from "@/store/cart-store";
import {themeColors} from "@/utils/theme-colors";
import {useAppDataStore} from "@/store/app-data-store";
import {requestCartAddPermission} from "@/store/cart-gate-store";

type ListOfDayProps = {
    onAddedToCart?: (item: MenuItem) => void;
};

export function ListOfDay({onAddedToCart}: ListOfDayProps) {
    const {width} = useWindowDimensions();
    const addItemToCart = useCartStore((state) => state.addItem);
    const menus = useAppDataStore((state) => state.menu);

    const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);

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

    const handleProductAdd = useCallback(
        (item: MenuItem) => {
            if (!requestCartAddPermission(item)) {
                return;
            }

            addItemToCart(item);

            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
            });

            onAddedToCart?.(item);
        },
        [addItemToCart, onAddedToCart]
    );

    return (
        <View>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Популярные блюда</Text>

                <Pressable
                    style={styles.sectionLink}
                    onPress={() => router.push("/menu")}
                    hitSlop={8}
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

            <DishDetailsModal
                item={selectedDish}
                onDismiss={() => setSelectedDish(null)}
                onAddedToCart={onAddedToCart}
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
        fontSize: 18,
        lineHeight: 22,
        fontFamily: "Point-Bold",
    },

    sectionLink: {
        minHeight: 36,
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 8,
        paddingVertical: 4,
    },

    sectionLinkText: {
        color: themeColors.primary,
        fontSize: 14,
        lineHeight: 18,
        fontFamily: "Point-Bold",
    },

    featuredList: {
        paddingHorizontal: 12,
        paddingBottom: 16,
    },

});
