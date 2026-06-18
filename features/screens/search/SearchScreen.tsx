import {useCallback, useEffect, useMemo, useState} from "react";
import {
    FlatList,
    Keyboard,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from "react-native";
import {StatusBar} from "expo-status-bar";
import {Ionicons} from "@expo/vector-icons";
import {router} from "expo-router";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import {Screen} from "@/components/ui/Screen";
import {CartAddedToast} from "@/components/ui/CartAddedToast";
import type {MenuItem} from "@/types/products";
import {DishDetailsModal} from "@/features/screens/menu/DishDetailsModal";
import {DishCard} from "@/features/screens/menu/DishCard";
import {useAppDataStore} from "@/store/app-data-store";
import {requestCartAddPermission} from "@/store/cart-gate-store";
import {useCartStore} from "@/store/cart-store";
import {useCartAddedToast} from "@/hooks/useCartAddedToast";
import {SHADOW, themeColors} from "@/utils/theme-colors";

type SearchItem = MenuItem & {
    categoryTitle: string;
};

const PAGE_HORIZONTAL_PADDING = 14;
const GRID_GAP = 8;
const MAX_WEB_WIDTH = 430;

function normalizeSearchText(value: string) {
    return value.trim().toLocaleLowerCase("ru-RU");
}

function closeSearch() {
    if (router.canGoBack()) {
        router.back();
        return;
    }

    router.replace("/");
}

export function SearchScreen() {
    const [query, setQuery] = useState("");
    const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const {width} = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const menu = useAppDataStore((state) => state.menu);
    const addItemToCart = useCartStore((state) => state.addItem);
    const {
        toastMessage,
        toastAnimatedStyle,
        showAddedToast,
    } = useCartAddedToast();

    const allSearchItems = useMemo<SearchItem[]>(
        () =>
            menu.flatMap((category) =>
                category.items.map((item) => ({
                    ...item,
                    categoryTitle: category.title,
                }))
            ),
        [menu]
    );

    const contentWidth = width > 0 ? Math.min(width, MAX_WEB_WIDTH) : MAX_WEB_WIDTH;
    const cardWidth = (contentWidth - PAGE_HORIZONTAL_PADDING * 2 - GRID_GAP) / 2;
    const normalizedQuery = normalizeSearchText(query);

    const filteredItems = useMemo(() => {
        if (!normalizedQuery) {
            return allSearchItems;
        }

        return allSearchItems.filter((item) => {
            const searchableText = [
                item.name,
                item.description,
                item.categoryTitle,
            ]
                .join(" ")
                .toLocaleLowerCase("ru-RU");

            return searchableText.includes(normalizedQuery);
        });
    }, [allSearchItems, normalizedQuery]);

    useEffect(() => {
        const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
        const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

        const showSubscription = Keyboard.addListener(showEvent, (event) => {
            setKeyboardHeight(event.endCoordinates.height);
        });
        const hideSubscription = Keyboard.addListener(hideEvent, () => {
            setKeyboardHeight(0);
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    const handleProductAdd = useCallback((item: MenuItem) => {
        if (!requestCartAddPermission(item)) {
            return;
        }

        addItemToCart(item);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
        });
        showAddedToast(item);
    }, [addItemToCart, showAddedToast]);

    const toastBottom = Math.max(insets.bottom + 28, keyboardHeight + 16);

    return (
        <>
            <StatusBar style="dark" />

            <Screen
                withTopInset
                style={styles.screen}
                contentContainerStyle={styles.container}
            >
                <View style={styles.header}>
                    <View style={styles.searchBox}>
                        <Ionicons name="search-outline" size={21} color={themeColors.textSecondary} />

                        <TextInput
                            value={query}
                            onChangeText={setQuery}
                            placeholder="Поиск"
                            placeholderTextColor={themeColors.textSecondary}
                            autoFocus
                            returnKeyType="search"
                            clearButtonMode="while-editing"
                            autoCorrect={false}
                            style={styles.searchInput}
                        />
                    </View>

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Закрыть поиск"
                        onPress={closeSearch}
                        hitSlop={10}
                        style={styles.cancelButton}
                    >
                        <Text style={styles.cancelText}>Отмена</Text>
                    </Pressable>
                </View>

                <FlatList
                    data={filteredItems}
                    extraData={cardWidth}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    keyboardShouldPersistTaps="always"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[
                        styles.listContent,
                        filteredItems.length === 0 && styles.emptyListContent,
                    ]}
                    columnWrapperStyle={styles.row}
                    renderItem={({item}) => (
                        <DishCard
                            item={item}
                            width={cardWidth}
                            onPress={() => {
                                Keyboard.dismiss();
                                setSelectedDish(item);
                            }}
                            onAddPress={() => handleProductAdd(item)}
                        />
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyTitle}>Ничего не нашли</Text>
                            <Text style={styles.emptyText}>
                                Попробуйте другое название блюда.
                            </Text>
                        </View>
                    }
                />

                <CartAddedToast
                    message={toastMessage}
                    bottom={toastBottom}
                    animatedStyle={toastAnimatedStyle}
                />
            </Screen>

            <DishDetailsModal
                item={selectedDish}
                onDismiss={() => setSelectedDish(null)}
                onAddedToCart={showAddedToast}
            />
        </>
    );
}

const styles = StyleSheet.create({
    screen: {
        backgroundColor: themeColors.background,
    },
    container: {
        flex: 1,
        backgroundColor: themeColors.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: PAGE_HORIZONTAL_PADDING,
        paddingTop: 4,
        paddingBottom: 14,
        backgroundColor: themeColors.background,
    },
    searchBox: {
        flex: 1,
        height: 44,
        minWidth: 0,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 14,
        borderRadius: 22,
        backgroundColor: themeColors.card,
        borderWidth: 1,
        borderColor: themeColors.border,
        ...SHADOW,
    },
    searchInput: {
        flex: 1,
        minWidth: 0,
        paddingVertical: 0,
        color: themeColors.text,
        fontSize: 17,
        fontFamily: "Point-Regular",
        outlineColor: "transparent",
        outlineStyle: "solid",
        outlineWidth: 0,
    },
    cancelButton: {
        minHeight: 44,
        justifyContent: "center",
    },
    cancelText: {
        color: themeColors.primary,
        fontSize: 14,
        fontFamily: "Point-Bold",
    },
    listContent: {
        paddingHorizontal: PAGE_HORIZONTAL_PADDING,
        paddingTop: 16,
        paddingBottom: 28,
    },
    emptyListContent: {
        flexGrow: 1,
    },
    row: {
        gap: GRID_GAP,
        marginBottom: GRID_GAP,
    },
    emptyState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 26,
    },
    emptyTitle: {
        color: themeColors.text,
        fontSize: 18,
        fontFamily: "Point-Bold",
        textAlign: "center",
    },
    emptyText: {
        marginTop: 8,
        color: themeColors.textSecondary,
        fontSize: 15,
        lineHeight: 20,
        fontFamily: "Point-Regular",
        textAlign: "center",
    },
});
