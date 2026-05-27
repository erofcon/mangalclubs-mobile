import React from "react";
import {StyleSheet, View} from "react-native";
import Entypo from '@expo/vector-icons/Entypo';
import {themeColors} from "@/utils/theme-colors";

export function CenterPin() {
    return (
        <View pointerEvents="none" style={styles.container}>
            <Entypo name="circle" size={20} color={themeColors.text}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: [
            {translateX: -10},
            {translateY: -24},
        ],
    },
});