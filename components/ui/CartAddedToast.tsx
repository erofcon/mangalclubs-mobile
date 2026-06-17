import {StyleSheet, Text, type StyleProp, type ViewStyle} from "react-native";
import Animated from "react-native-reanimated";

import {themeColors} from "@/utils/theme-colors";

type CartAddedToastProps = {
    message: string;
    bottom: number;
    animatedStyle: StyleProp<ViewStyle>;
};

export function CartAddedToast({message, bottom, animatedStyle}: CartAddedToastProps) {
    if (!message) {
        return null;
    }

    return (
        <Animated.View
            pointerEvents="none"
            style={[
                styles.toast,
                {bottom},
                animatedStyle,
            ]}
        >
            <Text style={styles.toastText} numberOfLines={1}>
                {message}
            </Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    toast: {
        position: "absolute",
        left: 16,
        right: 16,
        minHeight: 48,
        justifyContent: "center",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.10)",
        backgroundColor: "rgba(18,18,16,0.96)",
        zIndex: 1200,
        elevation: 1200,
    },
    toastText: {
        color: themeColors.text,
        fontSize: 14,
        lineHeight: 18,
        fontFamily: "Point-SemiBold",
    },
});
