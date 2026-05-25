import {memo} from "react";
import {
    Image,
    type ImageSourcePropType,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {SHADOW, themeColors} from "@/utils/theme-colors";

type ProductCardProps = {
    width: number;
    id: string;
    title: string;
    description?: string;
    weight?: string;
    priceFrom: number;
    image?: ImageSourcePropType;
};

export const ProductCard = memo(function ProductCard({
                                                         width,
                                                         id,
                                                         title,
                                                         description,
                                                         priceFrom,
                                                         image,
                                                     }: ProductCardProps) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={title}
            testID={`product-card-${id}`}
            style={[styles.card, {width}]}
            onPress={() => {}}
            hitSlop={8}
        >
            <View style={styles.content}>
                <View style={styles.imageWrap}>
                    {image ? (
                        <Image
                            source={image}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    ) : null}
                </View>

                <View style={styles.info}>
                    <Text style={styles.title} numberOfLines={2}>
                        {title}
                    </Text>

                    {!!description && (
                        <Text style={styles.description} numberOfLines={1}>
                            {description}
                        </Text>
                    )}

                    <View style={styles.priceBox}>
                        <Text style={styles.priceText}>
                            {priceFrom.toLocaleString("ru-RU")} ₽
                        </Text>
                    </View>
                </View>
            </View>
        </Pressable>
    );
});

const styles = StyleSheet.create({
    card: {
        width: "100%",
        paddingVertical: 14,
    },

    content: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },

    imageWrap: {
        width: 122,
        height: 122,
        borderRadius: 18,
        overflow: "hidden",
        backgroundColor: themeColors.card,
        ...SHADOW,
    },

    image: {
        width: "100%",
        height: "100%",
    },

    info: {
        flex: 1,
        justifyContent: "center",
        minHeight: 102,
    },

    title: {
        color: themeColors.text,
        fontSize: 16,
        fontFamily: "Point-Bold",
    },

    description: {
        marginTop: 4,
        color: themeColors.textSecondary,
        fontSize: 15,
        lineHeight: 18,
        fontFamily: "Point-Regular",
    },

    priceBox: {
        alignSelf: "flex-start",
        marginTop: 12,
        backgroundColor: themeColors.card,
        borderRadius: 999,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },

    priceText: {
        color: themeColors.text,
        fontSize: 16,
        letterSpacing: 0.8,
        fontFamily: "Point-Bold",
    },
});