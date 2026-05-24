import {Image, ImageSourcePropType, Pressable, StyleSheet, Text, View} from "react-native";
import {SHADOW, themeColors} from "@/utils/theme-colors";

const CARD_RADIUS = 24;

export function ProductCard({
                                width,
                                id,
                                title,
                                priceFrom,
                                image,
                            }: {
    width: number;
    id: string;
    title: string;
    priceFrom: number;
    image?: ImageSourcePropType;
}) {
    return (
        <Pressable
            style={[styles.productCard, {width, minWidth: width, maxWidth: width}]}
            onPress={() =>{}}
            hitSlop={8}
        >
            <View style={styles.imageWrap}>
                <Image source={image} style={styles.productImg} resizeMode="cover"/>
            </View>

            <Text style={styles.productTitle} numberOfLines={2}>
                {title}
            </Text>

            <View style={styles.pricePill}>
                <Text style={styles.priceText}>{priceFrom} ₽</Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    productCard: {
        backgroundColor: themeColors.card,
        borderRadius: CARD_RADIUS,
        borderWidth: 1,
        // borderColor: themeColors.stroke,
        alignItems: "center",
        overflow: "hidden",
        paddingBottom: 14,
        ...SHADOW,
    },
    imageWrap: {
        width: "100%",
        aspectRatio: 1,
        overflow: "hidden",
        borderTopLeftRadius: CARD_RADIUS,
        borderTopRightRadius: CARD_RADIUS,
        // backgroundColor: themeColors.stroke,
    },
    productImg: {
        width: "100%",
        height: "100%",
    },
    productTitle: {
        marginTop: 10,
        paddingHorizontal: 10,
        color: themeColors.text,
        fontSize: 13,
        fontWeight: "600",
        textAlign: "center",
        lineHeight: 16,
        minHeight: 34,
    },
    pricePill: {
        marginTop: 12,
        // backgroundColor: themeColors.stroke,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.04)",
    },
    priceText: {color: themeColors.text, fontSize: 13, fontWeight: "600"},
});
