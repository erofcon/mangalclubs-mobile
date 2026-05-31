import React, {useEffect, useState} from "react";
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {Ionicons} from "@expo/vector-icons";
import {router, useLocalSearchParams} from "expo-router";

import {Screen} from "@/components/ui/Screen";
import {useAddressStore, type SavedAddress} from "@/store/address-store";
import {SHADOW, themeColors} from "@/utils/theme-colors";

type OrderType = "delivery" | "takeaway";

export function OrderTypeScreen() {
    const params = useLocalSearchParams<{
        type?: OrderType;
    }>();

    const initialTab: OrderType =
        params.type === "takeaway" ? "takeaway" : "delivery";

    const [activeTab, setActiveTab] = useState<OrderType>(initialTab);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
        null
    );
    const [addressToDelete, setAddressToDelete] =
        useState<SavedAddress | null>(null);

    const addresses = useAddressStore((state) => state.addresses);
    const deleteAddress = useAddressStore((state) => state.deleteAddress);

    useEffect(() => {
        if (addresses.length === 0) {
            setSelectedAddressId(null);
            return;
        }

        setSelectedAddressId((current) => {
            if (current && addresses.some((address) => address.id === current)) {
                return current;
            }

            return addresses[0]?.id ?? null;
        });
    }, [addresses]);

    useEffect(() => {
        if (
            addressToDelete &&
            !addresses.some((address) => address.id === addressToDelete.id)
        ) {
            setAddressToDelete(null);
        }
    }, [addresses, addressToDelete]);

    const handleConfirmDelete = () => {
        if (!addressToDelete) {
            return;
        }

        deleteAddress(addressToDelete.id);
        setAddressToDelete(null);
    };

    const renderAddressItem = ({
        item,
    }: {
        item: SavedAddress;
    }) => {
        const isSelected = item.id === selectedAddressId;

        return (
            <Pressable
                onPress={() => setSelectedAddressId(item.id)}
                style={[
                    styles.addressItem,
                    isSelected && styles.addressItemSelected,
                ]}
            >
                <View style={styles.addressItemLeft}>
                    <View
                        style={[
                            styles.radioOuter,
                            isSelected && styles.radioOuterSelected,
                        ]}
                    >
                        {isSelected ? (
                            <View style={styles.radioInner} />
                        ) : null}
                    </View>

                    <View style={styles.addressTextContainer}>
                        <Text
                            style={styles.addressItemText}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {item.shortAddress}
                        </Text>
                    </View>
                </View>

                <Pressable
                    hitSlop={10}
                    onPress={() => setAddressToDelete(item)}
                    style={styles.menuButton}
                >
                    <Ionicons
                        name="ellipsis-horizontal"
                        size={22}
                        color={themeColors.textSecondary}
                    />
                </Pressable>
            </Pressable>
        );
    };

    return (
        <Screen withTopInset>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.segment}>
                        <Pressable
                            onPress={() => setActiveTab("delivery")}
                            style={[
                                styles.segmentButton,
                                activeTab === "delivery" &&
                                    styles.segmentButtonActive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.segmentText,
                                    activeTab === "delivery" &&
                                        styles.segmentTextActive,
                                ]}
                            >
                                Доставка
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={() => setActiveTab("takeaway")}
                            style={[
                                styles.segmentButton,
                                activeTab === "takeaway" &&
                                    styles.segmentButtonActive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.segmentText,
                                    activeTab === "takeaway" &&
                                        styles.segmentTextActive,
                                ]}
                            >
                                Навынос
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {activeTab === "delivery" ? (
                    <View style={styles.contentContainer}>
                        <View style={styles.contentHeader}>
                            <Text style={styles.title}>
                                Сохранённые адреса
                            </Text>

                            <Text style={styles.subtitle}>
                                Выберите адрес для доставки
                            </Text>
                        </View>

                        <FlatList
                            data={addresses}
                            keyExtractor={(item) => item.id}
                            renderItem={renderAddressItem}
                            style={styles.list}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <View style={styles.emptyState}>
                                    <Ionicons
                                        name="location-outline"
                                        size={28}
                                        color={themeColors.primary}
                                    />
                                    <Text style={styles.emptyStateTitle}>
                                        Адресов пока нет
                                    </Text>
                                    <Text style={styles.emptyStateText}>
                                        Добавьте первый адрес, чтобы выбрать его
                                        в списке.
                                    </Text>
                                </View>
                            }
                        />

                        <Pressable
                            style={styles.addressButton}
                            onPress={() => router.push("/delivery_address")}
                        >
                            <Text style={styles.addressButtonText}>
                                Добавить адрес
                            </Text>
                        </Pressable>
                    </View>
                ) : (
                    <View style={styles.takeawayContainer}>
                        <Text style={styles.takeawayText}>
                            Самовывоз будет здесь.
                        </Text>
                    </View>
                )}

                <Modal
                    visible={addressToDelete !== null}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setAddressToDelete(null)}
                >
                    <Pressable
                        style={styles.modalBackdrop}
                        onPress={() => setAddressToDelete(null)}
                    >
                        <Pressable
                            style={styles.modalCard}
                            onPress={(event) => event.stopPropagation()}
                        >
                            <Text style={styles.modalTitle}>
                                Удалить адрес?
                            </Text>

                            <Text style={styles.modalAddress} numberOfLines={2}>
                                {addressToDelete?.shortAddress}
                            </Text>

                            <View style={styles.modalActions}>
                                <Pressable
                                    style={styles.cancelButton}
                                    onPress={() => setAddressToDelete(null)}
                                >
                                    <Text style={styles.cancelButtonText}>
                                        Отмена
                                    </Text>
                                </Pressable>

                                <Pressable
                                    style={styles.deleteButton}
                                    onPress={handleConfirmDelete}
                                >
                                    <Text style={styles.deleteButtonText}>
                                        Удалить
                                    </Text>
                                </Pressable>
                            </View>
                        </Pressable>
                    </Pressable>
                </Modal>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: themeColors.background,
    },
    header: {
        paddingTop: 16,
        alignItems: "center",
        paddingHorizontal: 16,
    },
    segment: {
        flexDirection: "row",
        backgroundColor: themeColors.card,
        borderRadius: 10,
        padding: 3,
        width: "100%",
        maxWidth: 300,
    },
    segmentButton: {
        flex: 1,
        height: 38,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    segmentButtonActive: {
        backgroundColor: themeColors.text,
        ...SHADOW,
    },
    segmentText: {
        fontSize: 15,
        fontFamily: "Point-SemiBold",
        color: themeColors.textSecondary,
    },
    segmentTextActive: {
        color: themeColors.textOnPrimary,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 24,
        gap: 16,
    },
    contentHeader: {
        gap: 4,
    },
    title: {
        color: themeColors.text,
        fontSize: 20,
        fontFamily: "Point-Bold",
        letterSpacing: -0.4,
    },
    subtitle: {
        color: themeColors.textSecondary,
        fontSize: 14,
        fontFamily: "Point-Regular",
        letterSpacing: -0.2,
    },
    list: {
        flex: 1,
    },
    listContent: {
        gap: 12,
        paddingBottom: 8,
        flexGrow: 1,
    },
    addressItem: {
        minHeight: 58,
        borderRadius: 16,
        backgroundColor: themeColors.card,
        borderWidth: 1,
        borderColor: themeColors.cardBorder,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },
    addressItemSelected: {
        borderColor: themeColors.primary,
        backgroundColor: themeColors.cardHover,
    },
    addressItemLeft: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        minWidth: 0,
    },
    radioOuter: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: themeColors.border,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    radioOuterSelected: {
        borderColor: themeColors.primary,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: themeColors.primary,
    },
    addressTextContainer: {
        flex: 1,
        minWidth: 0,
    },
    addressItemText: {
        color: themeColors.text,
        fontSize: 16,
        fontFamily: "Point-SemiBold",
        letterSpacing: -0.3,
    },
    menuButton: {
        width: 34,
        height: 34,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    addressButton: {
        height: 56,
        borderRadius: 18,
        backgroundColor: themeColors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    addressButtonText: {
        fontSize: 16,
        fontFamily: "Point-Bold",
        color: themeColors.textOnPrimary,
    },
    emptyState: {
        flex: 1,
        minHeight: 220,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        gap: 8,
    },
    emptyStateTitle: {
        color: themeColors.text,
        fontSize: 18,
        fontFamily: "Point-SemiBold",
        letterSpacing: -0.3,
        textAlign: "center",
    },
    emptyStateText: {
        color: themeColors.textSecondary,
        fontSize: 14,
        fontFamily: "Point-Regular",
        textAlign: "center",
        lineHeight: 20,
    },
    takeawayContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    takeawayText: {
        color: themeColors.textSecondary,
        fontSize: 16,
        fontFamily: "Point-Regular",
        textAlign: "center",
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    modalCard: {
        width: "100%",
        maxWidth: 360,
        borderRadius: 20,
        backgroundColor: themeColors.card,
        borderWidth: 1,
        borderColor: themeColors.cardBorder,
        padding: 20,
        gap: 10,
        ...SHADOW,
    },
    modalTitle: {
        color: themeColors.text,
        fontSize: 18,
        fontFamily: "Point-Bold",
        letterSpacing: -0.3,
    },
    modalAddress: {
        color: themeColors.textSecondary,
        fontSize: 15,
        fontFamily: "Point-Regular",
        lineHeight: 21,
    },
    modalActions: {
        flexDirection: "row",
        gap: 10,
        marginTop: 8,
    },
    cancelButton: {
        flex: 1,
        height: 50,
        borderRadius: 16,
        backgroundColor: themeColors.cardSecondary,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: themeColors.cardBorder,
    },
    cancelButtonText: {
        color: themeColors.text,
        fontSize: 15,
        fontFamily: "Point-SemiBold",
    },
    deleteButton: {
        flex: 1,
        height: 50,
        borderRadius: 16,
        backgroundColor: themeColors.notification,
        alignItems: "center",
        justifyContent: "center",
    },
    deleteButtonText: {
        color: themeColors.text,
        fontSize: 15,
        fontFamily: "Point-Bold",
    },
});
