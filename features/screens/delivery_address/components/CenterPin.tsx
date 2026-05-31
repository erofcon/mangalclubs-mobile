import React from "react";
import {StyleSheet, View} from "react-native";
import Entypo from '@expo/vector-icons/Entypo';
import {SHADOW} from "@/utils/theme-colors";


export function CenterPin() {
    return (
        <View pointerEvents="none" style={styles.container}>
            <Entypo name="location-pin" size={54} color="black"/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: "37%",
        left: "50%",
        width: 58,
        height: 58,
        transform: [
            {translateX: -19},
            {translateY: -38},
        ],
        zIndex: 20,
        ...SHADOW,
    },
    marker: {
        width: "100%",
        height: "100%",
    },
});
