import {Dimensions, Pressable, StyleSheet, Text, View} from "react-native";

import type {MenuCategory} from "@/types/products";
import {themeColors} from "@/utils/theme-colors";

const SCREEN_WIDTH = Dimensions.get("window").width;
const PADDING = 24;
const GAP = 10;
const COLUMNS = 4;

const CARD_SIZE =
    (SCREEN_WIDTH - PADDING - GAP * (COLUMNS - 1)) / COLUMNS;

type Props = {
    categories?: MenuCategory[];
    onSelectCategory?: (categoryId: MenuCategory["id"]) => void;
};

export function Categories({categories, onSelectCategory}: Props) {
    const visibleCategories = categories?.slice(0, 6) ?? [];

    if (visibleCategories.length === 0) {
        return null;
    }

    return (
        <View style={styles.block}>
            <View style={styles.grid}>
                {visibleCategories.map((category) => (
                    <Pressable
                        key={category.id}
                        onPress={() => onSelectCategory?.(category.id)}
                        style={({pressed}) => [
                            styles.card,
                            pressed && styles.pressed,
                        ]}
                    >
                        <Text style={styles.title} numberOfLines={2}>
                            {category.title}
                        </Text>
                    </Pressable>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    block: {
        paddingHorizontal: 12,
        paddingTop: 10,
    },

    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },

    card: {
        width: CARD_SIZE,
        minHeight: 58,
        paddingHorizontal: 8,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 1,
        borderColor: themeColors.cardBorder,
        alignItems: "center",
        justifyContent: "center",
    },

    title: {
        color: themeColors.text,
        fontSize: 12,
        lineHeight: 15,
        textAlign: "center",
        fontFamily: "Point-SemiBold",
    },

    pressed: {
        opacity: 0.75,
        transform: [{scale: 0.97}],
    },
});
