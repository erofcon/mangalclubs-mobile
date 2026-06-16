import {Text, View} from "react-native";
import {MaterialCommunityIcons} from "@expo/vector-icons";

import {themeColors} from "@/utils/theme-colors";

import styles from "../booking.styles";

type InfoRowProps = {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    label: string;
    value: string;
};

export function InfoRow({icon, label, value}: InfoRowProps) {
    return (
        <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
                <MaterialCommunityIcons name={icon} size={18} color={themeColors.primary} />
            </View>

            <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
            </View>
        </View>
    );
}
