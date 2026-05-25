import {StyleSheet, Text, View} from "react-native";
import {themeColors} from "@/utils/theme-colors";


export function Address() {
    return (
        <View style={styles.container}>
            <View style={{}}>
                <Text style={styles.textCity}>Грозный</Text>
                <Text style={styles.textAddress}>ул. Светлая 124</Text>
            </View>
        </View>
    )
}


const styles = StyleSheet.create({

    //Address
    container: {
        marginHorizontal: 12,
    },
    textCity: {
        color: themeColors.textSecondary,
        fontFamily: "Point-SemiBold",
        fontSize: 16,
        letterSpacing: 0.8,
    },
    textAddress: {
        color: themeColors.text,
        fontFamily: "Point-Bold",
        fontSize: 18,
        letterSpacing: 0.8,
    },
})