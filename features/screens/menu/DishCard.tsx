import {memo} from "react";
import {Image, Pressable, StyleSheet, Text, View} from "react-native";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {LinearGradient} from "expo-linear-gradient";

import type {MenuItem} from "@/types/products";
import {SHADOW, themeColors} from "@/utils/theme-colors";

type DishCardProps = {
    item: MenuItem;
    width: number;
    onPress?: () => void;
    onAddPress?: () => void;
};

function formatDishPrice(item: MenuItem) {
    return `${item.price.toLocaleString("ru-RU")} ₽`;
}

export const DishCard = memo(function DishCard({
                                                   item,
                                                   width,
                                                   onPress,
                                                   onAddPress,
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
            {/* IMAGE */}
            <View style={styles.imageWrap}>
                {item.image ? (
                    <Image
                        source={item.image}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : null}

                <LinearGradient
                    pointerEvents="none"
                    colors={[
                        "rgba(0,0,0,0.05)",
                        "rgba(0,0,0,0.25)",
                        "rgba(0,0,0,0.85)",
                    ]}
                    locations={[0, 0.5, 1]}
                    style={StyleSheet.absoluteFillObject}
                />

                <View style={styles.pricePill}>
                    <Text style={styles.priceText} numberOfLines={1}>
                        {formatDishPrice(item)}
                    </Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.name}
                </Text>

                <View style={styles.metaRow}>
                    {item.weight ? (
                        <Text style={styles.weightText} numberOfLines={1}>
                            {item.weight}
                        </Text>
                    ) : (
                        <View />
                    )}

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Добавить ${item.name} в корзину`}
                        hitSlop={8}
                        style={({pressed}) => [
                            styles.addButton,
                            pressed && styles.addButtonPressed,
                        ]}
                        onPress={(event) => {
                            event.stopPropagation();
                            onAddPress?.();
                        }}
                    >
                        <MaterialCommunityIcons
                            name="plus"
                            size={18}
                            color={themeColors.textOnPrimary}
                        />
                    </Pressable>
                </View>
            </View>
        </Pressable>
    );
});

const styles = StyleSheet.create({
    card: {
        minHeight: 202,
        overflow: "hidden",
        borderRadius: 20,
        backgroundColor: "#121210",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        ...SHADOW,
    },

    cardPressed: {
        opacity: 0.86,
        transform: [{scale: 0.98}],
    },

    imageWrap: {
        height: 122,
        overflow: "hidden",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: "#1a1815",
        position: "relative",
    },

    image: {
        width: "100%",
        height: "100%",
    },

    cardBody: {
        flex: 1,
        paddingHorizontal: 10,
        paddingTop: 10,
        paddingBottom: 10,
    },

    cardTitle: {
        color: themeColors.text,
        fontSize: 14,
        lineHeight: 19,
        fontFamily: "Point-Bold",
    },
    pricePill: {
        position: "absolute",
        left: 8,
        bottom: 8,
        maxWidth: "100%",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: "rgba(7,8,8,0.76)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
    },
    priceText: {
        color: themeColors.text,
        fontSize: 12,
        fontFamily: "Point-Bold",
    },
    metaRow: {
        marginTop: 10,
        minHeight: 28,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
    },

    weightText: {
        flex: 1,
        color: themeColors.textSecondary,
        fontSize: 12,
        fontFamily: "Point-Regular",
    },

    addButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: themeColors.primary,
    },

    addButtonPressed: {
        opacity: 0.82,
        transform: [{scale: 0.94}],
    },
});