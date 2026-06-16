import {Pressable, Text, View} from "react-native";
import {Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";

import {themeColors} from "@/utils/theme-colors";

import styles from "../booking.styles";

type FilterButtonProps = {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    label: string;
    value?: string | null;
    onPress: () => void;
};

export function FilterButton({icon, label, value, onPress}: FilterButtonProps) {
    const hasValue = Boolean(value);

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={hasValue ? `${label}: ${value}` : label}
            style={[styles.filterButton, !hasValue && styles.filterButtonCompact]}
            onPress={onPress}
        >
            <View style={styles.filterIconWrap}>
                <MaterialCommunityIcons name={icon} size={20} color={themeColors.primary} />
            </View>

            {hasValue ? (
                <View style={styles.filterTextWrap}>
                    <Text style={styles.filterLabel}>{label}</Text>
                    <Text style={styles.filterValue} numberOfLines={1}>
                        {value}
                    </Text>
                </View>
            ) : null}

            {hasValue ? (
                <Ionicons name="chevron-down" size={16} color={themeColors.textSecondary} />
            ) : null}
        </Pressable>
    );
}
