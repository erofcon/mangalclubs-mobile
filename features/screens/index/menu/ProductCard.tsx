import {Feather} from "@expo/vector-icons";
import {Image, ImageSourcePropType, Pressable, StyleSheet, Text, View} from "react-native";

import {SHADOW, themeColors} from "@/utils/theme-colors";


export function ProductCard({
                                width,
                                id,
                                title,
                                description,
                                weight,
                                priceFrom,
                                image,
                            }: {
    width: number;
    id: string;
    title: string;
    description?: string;
    weight?: string;
    priceFrom: number;
    image?: ImageSourcePropType;
}) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={title}
            testID={`product-card-${id}`}
            style={[styles.productCard, {width, minWidth: width, maxWidth: width}]}
            onPress={() => {}}
            hitSlop={8}
        >
            <View style={styles.imageWrap}>
                <Image source={image} style={styles.productImg} resizeMode="cover"/>
            </View>

            <View style={styles.content}>
                <Text style={styles.productTitle} numberOfLines={1}>
                    {title}
                </Text>

                {description ? (
                    <Text style={styles.productDescription} numberOfLines={1}>
                        {description}
                    </Text>
                ) : null}

                {weight ? (
                    <Text style={styles.productWeight} numberOfLines={1}>
                        {weight}
                    </Text>
                ) : null}

                <Text style={styles.priceText}>{priceFrom.toLocaleString("ru-RU")} ₽</Text>
            </View>

            <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Добавить ${title} в корзину`}
                style={styles.cartButton}
                onPress={() => {}}
                hitSlop={8}
            >
                <Feather name="shopping-cart" size={18} color={themeColors.primary}/>
            </Pressable>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    productCard: {
        height: 130,
        backgroundColor: themeColors.background,
        borderRadius: 10,
        borderWidth: 1,
        borderColor:themeColors.border,
        flexDirection: "row",
        alignItems: "stretch",
        overflow: "hidden",
        ...SHADOW,
    },
    imageWrap: {
        width: "32%",
        minWidth: 124,
        maxWidth: 168,
        height: "100%",
        overflow: "hidden",
        backgroundColor: themeColors.card,
    },
    productImg: {
        width: "100%",
        height: "100%",
    },
    content: {
        flex: 1,
        paddingLeft: 8,
        paddingRight: 8,
        paddingVertical: 18,
        justifyContent: "flex-start",
    },
    productTitle: {
        color: themeColors.text,
        fontSize: 16,
        fontFamily: "Point-Bold",
    },
    productDescription: {
        marginTop: 8,
        color:themeColors.textSecondary,
        fontSize: 12,
        fontFamily: "Point-Regular",
    },
    productWeight: {
        marginTop: 12,
        color: themeColors.textSecondary,
        fontSize: 15,
        fontFamily: "Point-Regular",
    },
    priceText: {
        marginTop: 12,
        color: themeColors.text,
        fontSize: 16,
        fontFamily: "Point-Bold",
    },
    cartButton: {
        position: "absolute",
        right: 18,
        bottom: 18,
        width: 34,
        height: 34,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: themeColors.border,
        alignItems: "center",
        justifyContent: "center",
    },
});
