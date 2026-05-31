import {memo} from "react";
import {Image, Pressable, StyleSheet, Text, View} from "react-native";

import type {MenuItem} from "@/types/products";
import {SHADOW, themeColors} from "@/utils/theme-colors";

type DishCardProps = {
    item: MenuItem;
    width: number;
    onPress?: () => void;
};

function formatDishPrice(item: MenuItem) {
    return `${item.weight ?? ""}${item.weight ? " / " : ""}${item.price.toLocaleString("ru-RU")} ₽`;
}

export const DishCard = memo(function DishCard({
    item,
    width,
    onPress,
}: DishCardProps) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={item.name}
            testID={`dish-card-${item.id}`}
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
});

const styles = StyleSheet.create({
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
});
