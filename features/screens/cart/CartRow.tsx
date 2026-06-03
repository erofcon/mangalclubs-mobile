import {Pressable, StyleSheet, Text, TextInput, View, Image} from "react-native";
import {Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import {themeColors} from "@/utils/theme-colors";
import {CartItem} from "@/store/cart-store";
import {formatPrice} from "@/utils/format_price";


export function CartRow({
                            item,
                            isCommentOpen,
                            onToggleComment,
                            onChangeComment,
                            onIncrement,
                            onDecrement,
                        }: {
    item: CartItem;
    isCommentOpen: boolean;
    onToggleComment: () => void;
    onChangeComment: (comment: string) => void;
    onIncrement: () => void;
    onDecrement: () => void;
}) {
    return (
        <View style={styles.cartRowWrap}>
            <View style={styles.cartRow}>
                <View style={styles.itemImageWrap}>
                    {item.image ? (
                        <Image source={item.image} style={styles.itemImage} resizeMode="cover"/>
                    ) : (
                        <MaterialCommunityIcons
                            name="food"
                            size={32}
                            color={themeColors.textSecondary}
                        />
                    )}
                </View>

                <View style={styles.itemBody}>
                    <Text style={styles.itemTitle} numberOfLines={2}>
                        {item.name}
                    </Text>

                    <View style={styles.itemControls}>

                        <View style={styles.quantityControl}>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Уменьшить количество"
                                style={styles.quantityButton}
                                onPress={onDecrement}
                                hitSlop={8}
                            >
                                <Ionicons name="remove" size={18} color={themeColors.text}/>
                            </Pressable>

                            <Text style={styles.quantityText}>{item.quantity}</Text>

                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Увеличить количество"
                                style={styles.quantityButton}
                                onPress={onIncrement}
                                hitSlop={8}
                            >
                                <Ionicons name="add" size={19} color={themeColors.text}/>
                            </Pressable>
                        </View>
                    </View>
                </View>

                <Text style={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</Text>
            </View>

            {isCommentOpen ? (
                <TextInput
                    value={item.comment}
                    onChangeText={onChangeComment}
                    placeholder="Комментарий к блюду"
                    placeholderTextColor={themeColors.textMuted}
                    multiline
                    style={styles.commentInput}
                />
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    cartRowWrap: {
        paddingVertical: 8,
    },

    cartRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },

    itemImageWrap: {
        width: 78,
        height: 78,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 15,
        overflow: "hidden",
        backgroundColor: themeColors.card,
        borderWidth: 1,
        borderColor: themeColors.cardBorder,
    },

    itemImage: {
        width: "100%",
        height: "100%",
    },

    itemBody: {
        flex: 1,
        minWidth: 0,
    },

    itemTitle: {
        color: themeColors.text,
        fontSize: 14,
        fontFamily: "Point-Bold",
    },

    itemControls: {
        marginTop: 9,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },

    quantityControl: {
        height: 34,
        minWidth: 92,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 8,
        borderRadius: 17,
        backgroundColor: themeColors.cardSecondary,
        borderWidth: 1,
        borderColor: themeColors.cardBorder,
    },

    quantityButton: {
        width: 26,
        height: 26,
        alignItems: "center",
        justifyContent: "center",
    },

    quantityText: {
        minWidth: 20,
        color: themeColors.text,
        fontSize: 15,
        textAlign: "center",
        fontFamily: "Point-Bold",
    },

    itemPrice: {
        minWidth: 70,
        color: themeColors.text,
        fontSize: 15,
        textAlign: "right",
        fontFamily: "Point-SemiBold",
    },

    commentInput: {
        minHeight: 72,
        marginTop: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        color: themeColors.text,
        fontSize: 15,
        lineHeight: 20,
        textAlignVertical: "top",
        fontFamily: "Point-Regular",
        borderRadius: 14,
        backgroundColor: themeColors.card,
        borderWidth: 1,
        borderColor: themeColors.cardBorder,
    },
})

