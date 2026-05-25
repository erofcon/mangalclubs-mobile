import {StyleSheet, Text, View} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import {themeColors} from "@/utils/theme-colors";


export function SearchBanner() {
    return (
        <View style={styles.searchContainer}>
            <Feather name="search" size={22} color={themeColors.text}/>
            <Text style={styles.searchText}>Найти блюда</Text>
        </View>
    )
}

const styles = StyleSheet.create({


    // Search
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 22,
        backgroundColor: themeColors.card,
    },
    searchText: {
        color: themeColors.text,
        fontFamily: "Point-SemiBold",
        fontSize: 16,
        letterSpacing: 0.8,
    },
})