import {ActivityIndicator, Pressable, StyleSheet} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {SHADOW, themeColors} from "@/utils/theme-colors";

type GeoLocationButtonProps = {
    bottom: number;
    isLocating: boolean;
    onPress: () => void;
};


export function GeoLocationButton({bottom, isLocating, onPress}: GeoLocationButtonProps) {
    return (
        <Pressable
            style={[styles.geoBtn, {bottom}]}
            onPress={onPress}
            hitSlop={12}
        >
            {isLocating ? (
                <ActivityIndicator size={18} color={themeColors.text}/>
            ) : (
                <Ionicons
                    name="paper-plane-outline"
                    size={18}
                    color={themeColors.text}
                />
            )}
        </Pressable>
    );
}


const styles = StyleSheet.create({
    geoBtn: {
        position: "absolute",
        right: 16,
        width: 38,
        height: 38,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: themeColors.card,
        borderWidth: 1,
        borderColor: themeColors.border,
        zIndex: 12,
        ...SHADOW,
    },
});
