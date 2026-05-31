import {useMemo, useState} from "react";
import {
    FlatList,
    Image,
    Keyboard,
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

import {Screen} from "@/components/ui/Screen";
import {menus} from "@/mocks/mocks-data";
import type {MenuItem} from "@/types/products";
import {DishDetailsModal} from "@/features/screens/menu/DishDetailsModal";
import {SHADOW, themeColors} from "@/utils/theme-colors";

type SearchItem = MenuItem & {
    categoryTitle: string;
};

const PAGE_HORIZONTAL_PADDING = 14;
const GRID_GAP = 8;
const MAX_WEB_WIDTH = 430;

const allSearchItems: SearchItem[] = menus.flatMap((category) =>
    category.items.map((item) => ({
        ...item,
        categoryTitle: category.title,
    }))
);

function normalizeSearchText(value: string) {
    return value.trim().toLocaleLowerCase("ru-RU");
}

function formatDishPrice(item: MenuItem) {
    return `${item.weight ?? ""}${item.weight ? " / " : ""}${item.price.toLocaleString("ru-RU")} ₽`;
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
    const {width} = useWindowDimensions();

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
    }, [normalizedQuery]);

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
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[
                        styles.listContent,
                        filteredItems.length === 0 && styles.emptyListContent,
                    ]}
                    columnWrapperStyle={styles.row}
                    renderItem={({item}) => (
                        <SearchDishCard
                            item={item}
                            width={cardWidth}
                            onPress={() => {
                                Keyboard.dismiss();
                                setSelectedDish(item);
                            }}
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
            </Screen>

            <DishDetailsModal
                item={selectedDish}
                onDismiss={() => setSelectedDish(null)}
            />
        </>
    );
}

function SearchDishCard({
    item,
    width,
    onPress,
}: {
    item: MenuItem;
    width: number;
    onPress: () => void;
}) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={item.name}
            style={({pressed}) => [
                styles.card,
                {width},
                pressed && styles.cardPressed,
            ]}
            onPress={onPress}
        >
            <View style={styles.imageWrap}>
                {item.image ? (
                    <Image source={item.image} style={styles.image} resizeMode="cover" />
                ) : null}
            </View>

            <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.name}
                </Text>

                <View style={styles.pricePill}>
                    <Text style={styles.priceText} numberOfLines={1}>
                        {formatDishPrice(item)}
                    </Text>
                </View>
            </View>
        </Pressable>
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
        paddingBottom: 28,
    },

    emptyListContent: {
        flexGrow: 1,
    },

    row: {
        gap: GRID_GAP,
        marginBottom: GRID_GAP,
    },

    card: {
        minHeight: 168,
        overflow: "hidden",
        borderRadius: 18,
        backgroundColor: themeColors.card,
        borderWidth: 1,
        borderColor: themeColors.cardBorder,
        ...SHADOW,
    },

    cardPressed: {
        opacity: 0.86,
        transform: [{scale: 0.98}],
    },

    imageWrap: {
        height: 104,
        overflow: "hidden",
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        backgroundColor: themeColors.cardSecondary,
    },

    image: {
        width: "100%",
        height: "100%",
    },

    cardBody: {
        flex: 1,
        paddingTop: 8,
    },

    cardTitle: {
        minHeight: 38,
        paddingHorizontal: 8,
        color: themeColors.text,
        fontSize: 14,
        lineHeight: 17,
        fontFamily: "Point-Bold",
    },

    pricePill: {
        alignSelf: "flex-start",
        maxWidth: "100%",
        marginTop: 7,
        marginLeft: 6,
        marginRight: 6,
        paddingHorizontal: 9,
        paddingVertical: 7,
        borderRadius: 999,
        backgroundColor: themeColors.background,
    },

    priceText: {
        color: themeColors.text,
        fontSize: 13,
        fontFamily: "Point-Regular",
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
