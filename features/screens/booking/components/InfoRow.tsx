import {Text, View} from "react-native";
import {MaterialCommunityIcons} from "@expo/vector-icons";

import {themeColors} from "@/utils/theme-colors";

import styles from "../booking.styles";

type InfoRowProps = {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    label: string;
    value: string | string[];
};

export function InfoRow({icon, label, value}: InfoRowProps) {
    const values = Array.isArray(value) ? value : [value];

    return (
        <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
                <MaterialCommunityIcons name={icon} size={18} color={themeColors.primary} />
            </View>

            <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>{label}</Text>
                {values.map((item) => (
                    <Text key={item} style={styles.infoValue}>
                        {item}
                    </Text>
                ))}
            </View>
        </View>
    );
}
