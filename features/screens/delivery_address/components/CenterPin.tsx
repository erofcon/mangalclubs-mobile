import React from "react";
import {StyleSheet, View} from "react-native";

import {themeColors} from "@/utils/theme-colors";

export function CenterPin() {
    return (
        <View pointerEvents="none" style={styles.container}>
            <View style={styles.ring} />
            <View style={styles.dot} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 28,
        height: 28,
        transform: [
            {translateX: -14},
            {translateY: -14},
        ],
        zIndex: 20,
    },
    ring: {
        position: "absolute",
        inset: 0,
        borderRadius: 999,
        backgroundColor: "rgba(229,72,59,0.18)",
        borderWidth: 4,
        borderColor: "rgba(229,72,59,0.22)",
    },
    dot: {
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 10,
        height: 10,
        borderRadius: 999,
        backgroundColor: themeColors.primary,
        transform: [
            {translateX: -5},
            {translateY: -5},
        ],
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.18,
        shadowRadius: 4,
        elevation: 2,
    },
});