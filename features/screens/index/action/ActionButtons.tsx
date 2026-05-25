import {StyleSheet, Text, View} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {themeColors} from "@/utils/theme-colors";


export function ActionButtons(){
    return(
        <View style={styles.actionContainer}>
            <View style={styles.iconContainer}>
                <View style={styles.iconItem}>
                    <FontAwesome name="bicycle" size={26} color={themeColors.text}/>
                </View>
                <Text style={styles.actionText}>Доставка</Text>
            </View>
            <View style={styles.iconContainer}>
                <View style={styles.iconItem}>
                    <FontAwesome name="shopping-bag" size={26} color={themeColors.text}/>
                </View>
                <Text style={styles.actionText}>Заказ с собой</Text>
            </View>
            <View style={styles.iconContainer}>
                <View style={styles.iconItem}>
                    <FontAwesome name="calendar-check-o" size={26} color={themeColors.text}/>
                </View>
                <Text style={styles.actionText}>Бронь стола</Text>
            </View>

        </View>
    )
}

const styles = StyleSheet.create({

    // Actions
    actionContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginHorizontal: 12,
        marginVertical: 32,
        gap: 28,
    },
    iconContainer: {
        flex: 1,
    },
    iconItem: {
        backgroundColor: themeColors.card,
        alignItems: "center",
        borderRadius: 18,
        paddingVertical: 25,
    },
    actionText: {
        color: themeColors.text,
        textAlign: "center",
        marginTop: 10,
        fontFamily: "Point-SemiBold",
    }
})