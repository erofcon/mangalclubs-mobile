import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Image, Pressable, StyleSheet, Text, useWindowDimensions, View} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {
    BottomSheetBackdrop,
    type BottomSheetBackdropProps,
    BottomSheetFooter,
    type BottomSheetFooterProps,
    BottomSheetModal,
    BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import {Ionicons} from "@expo/vector-icons";

import type {MenuItem} from "@/types/products";
import {useCartStore} from "@/store/cart-store";
import {themeColors} from "@/utils/theme-colors";

type DishDetailsModalProps = {
    item: MenuItem | null;
    onDismiss: () => void;
};

const formatPrice = (price: number) => price.toLocaleString("ru-RU");

export function DishDetailsModal({item, onDismiss}: DishDetailsModalProps) {
    const sheetRef = useRef<BottomSheetModal>(null);
    const insets = useSafeAreaInsets();
    const {width} = useWindowDimensions();
    const [quantity, setQuantity] = useState(1);
    const addItemToCart = useCartStore((state) => state.addItem);

    const snapPoints = useMemo(() => ["92%"], []);
    const imageHeight = Math.min(300, width * 0.78);
    const totalPrice = item ? item.price * quantity : 0;

    useEffect(() => {
        if (item) {
            setQuantity(1);
            sheetRef.current?.present();
        }
    }, [item]);

    const handleDismiss = useCallback(() => {
        setQuantity(1);
        onDismiss();
    }, [onDismiss]);

    const handleAddToCart = useCallback(() => {
        if (!item) {
            return;
        }

        addItemToCart(item, quantity);
        sheetRef.current?.dismiss();
    }, [addItemToCart, item, quantity]);

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                opacity={0.72}
                pressBehavior="close"
            />
        ),
        [],
    );

    const renderFooter = useCallback(
        (props: BottomSheetFooterProps) => {
            if (!item) {
                return null;
            }

            return (
                <BottomSheetFooter {...props} bottomInset={0}>
                    <View style={[styles.footer, {paddingBottom: insets.bottom + 12}]}>
                        <View style={styles.quantityControl}>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Уменьшить количество"
                                style={styles.quantityButton}
                                onPress={() => setQuantity((current) => Math.max(1, current - 1))}
                                hitSlop={8}
                            >
                                <Ionicons name="remove" size={20} color={themeColors.textSecondary} />
                            </Pressable>

                            <Text style={styles.quantityText}>{quantity}</Text>

                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Увеличить количество"
                                style={styles.quantityButton}
                                onPress={() => setQuantity((current) => current + 1)}
                                hitSlop={8}
                            >
                                <Ionicons name="add" size={22} color={themeColors.text} />
                            </Pressable>
                        </View>

                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Добавить ${item.name}`}
                            style={styles.addButton}
                            onPress={handleAddToCart}
                        >
                            <Text style={styles.addButtonText} numberOfLines={1}>
                                Добавить за {formatPrice(totalPrice)} ₽
                            </Text>
                        </Pressable>
                    </View>
                </BottomSheetFooter>
            );
        },
        [handleAddToCart, insets.bottom, item, quantity, totalPrice],
    );

    return (
        <BottomSheetModal
            ref={sheetRef}
            index={0}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            enablePanDownToClose
            backdropComponent={renderBackdrop}
            footerComponent={renderFooter}
            handleComponent={null}
            backgroundStyle={styles.sheetBackground}
            onDismiss={handleDismiss}
        >
            <BottomSheetScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.content,
                    {paddingBottom: insets.bottom + 112},
                ]}
            >
                <View style={[styles.imageWrap, {height: imageHeight}]}>
                    {item?.image ? (
                        <Image source={item.image} style={styles.image} resizeMode="cover" />
                    ) : null}

                </View>

                {item ? (
                    <View style={styles.details}>
                        <Text style={styles.title}>{item.name}</Text>
                        <Text style={styles.description}>{item.description}</Text>

                        <Text style={styles.sectionTitle}>Пищевая ценность</Text>

                        <View style={styles.nutritionGrid}>
                            <NutritionCell label="кКал" value={item.calories} />
                            <NutritionCell label="Жиры" value={item.fats} suffix="г" />
                            <NutritionCell label="Белки" value={item.proteins} suffix="г" />
                            <NutritionCell label="Углеводы" value={item.carbs} />
                        </View>
                    </View>
                ) : null}
            </BottomSheetScrollView>
        </BottomSheetModal>
    );
}

function NutritionCell({
    label,
    value,
    suffix,
}: {
    label: string;
    value?: string | number;
    suffix?: string;
}) {
    const formattedValue = value !== undefined && value !== null ? `${value}${suffix ? ` ${suffix}` : ""}` : "—";

    return (
        <View style={styles.nutritionCell}>
            <Text style={styles.nutritionLabel}>{label}</Text>
            <Text style={styles.nutritionValue}>{formattedValue}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    sheetBackground: {
        backgroundColor: "#070808",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
    },

    content: {
        backgroundColor: "#070808",
    },

    imageWrap: {
        width: "100%",
        backgroundColor: "#121210",
    },

    image: {
        width: "100%",
        height: "100%",
    },

    closeButton: {
        position: "absolute",
        top: 12,
        right: 12,
        width: 42,
        height: 42,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(7, 8, 8, 0.86)",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.18)",
    },

    details: {
        paddingHorizontal: 14,
        paddingTop: 20,
    },

    eyebrow: {
        color: themeColors.primary,
        fontSize: 12,
        fontFamily: "Point-Bold",
        letterSpacing: 3,
        textTransform: "uppercase",
    },

    title: {
        marginTop: 12,
        color: themeColors.text,
        fontSize: 22,
        letterSpacing: 0.8,
        fontFamily: "Point-Bold",
    },

    description: {
        marginTop: 14,
        color: themeColors.textSecondary,
        fontSize: 14,
        fontFamily: "Point-Regular",
    },

    sectionTitle: {
        marginTop: 26,
        color: themeColors.text,
        fontSize: 14,
        fontFamily: "Point-Bold",
    },

    nutritionGrid: {
        marginTop: 16,
        flexDirection: "row",
        flexWrap: "wrap",
        overflow: "hidden",
        borderWidth: 1,
        borderRadius: 18,
        borderColor: themeColors.border,
    },

    nutritionCell: {
        width: "50%",
        minHeight: 59,
        alignItems: "center",
        justifyContent: "center",
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: themeColors.border,
    },

    nutritionLabel: {
        color: themeColors.textSecondary,
        fontSize: 12,
        fontFamily: "Point-Regular",
    },

    nutritionValue: {
        marginTop: 2,
        color: themeColors.text,
        fontSize: 14,
        fontFamily: "Point-Bold",
    },

    footer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingTop: 12,
        paddingHorizontal: 15,
        backgroundColor: "#070808",
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.08)",
    },

    quantityControl: {
        width: 120,
        height: 46,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.10)",
        backgroundColor: "#11110f",
    },

    quantityButton: {
        width: 32,
        height: 32,
        alignItems: "center",
        justifyContent: "center",
    },

    quantityText: {
        minWidth: 22,
        color: themeColors.text,
        fontSize: 17,
        textAlign: "center",
        fontFamily: "Point-Bold",
    },

    addButton: {
        flex: 1,
        height: 46,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 14,
        borderRadius: 12,
        backgroundColor: themeColors.primary,
    },

    addButtonText: {
        color: themeColors.textOnPrimary,
        fontSize: 14,
        fontFamily: "Point-Bold",
    },
});
