import {FlatList, Pressable, Text, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";

import type {SavedAddress} from "@/store/address-store";
import {themeColors} from "@/utils/theme-colors";

import styles from "../order-type.styles";

type Props = {
    addresses: SavedAddress[];
    selectedAddressId: string | null;
    onSelect: (addressId: string) => void;
    onDelete: (address: SavedAddress) => void;
    bottomPadding: number;
};

export function AddressesList({
                                  addresses,
                                  selectedAddressId,
                                  onSelect,
                                  onDelete,
                                  bottomPadding,
                              }: Props) {
    const renderAddressItem = ({item}: {item: SavedAddress}) => {
        const isSelected = item.id === selectedAddressId;

        return (
            <Pressable
                onPress={() => onSelect(item.id)}
                style={[styles.card, isSelected && styles.cardSelected]}
            >
                <View style={styles.cardRow}>
                    <View style={[styles.radio, isSelected && styles.radioSelected]}>
                        {isSelected ? <View style={styles.radioInner} /> : null}
                    </View>

                    <Text style={styles.cardText} numberOfLines={1}>
                        {item.shortAddress}
                    </Text>
                </View>

                <Pressable hitSlop={10} onPress={() => onDelete(item)} style={styles.iconButton}>
                    <Ionicons name="ellipsis-horizontal" size={22} color={themeColors.textSecondary} />
                </Pressable>
            </Pressable>
        );
    };

    return (
        <FlatList
            data={addresses}
            keyExtractor={(item) => item.id}
            renderItem={renderAddressItem}
            style={styles.list}
            contentContainerStyle={{
                flexGrow: 1,
                paddingBottom: bottomPadding,
            }}
            showsVerticalScrollIndicator={false}

            ListEmptyComponent={
                <View style={styles.emptyState}>
                    <Ionicons name="location-outline" size={28} color={themeColors.primary} />
                    <Text style={styles.emptyTitle}>Адресов пока нет</Text>
                    <Text style={styles.emptyText}>
                        Добавьте первый адрес, чтобы выбрать его в списке.
                    </Text>
                </View>
            }
        />
    );
}