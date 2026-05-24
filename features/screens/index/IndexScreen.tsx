import {Screen} from "@/components/ui/Screen";
import {Header} from "@/features/screens/index/header/Header";
import {Stories} from "@/features/screens/index/stories/Stories";
import {View, StyleSheet} from "react-native";
import {SHADOW, themeColors} from "@/utils/theme-colors";

export function IndexScreen() {
    return (
        <Screen withTopInset>
            <Header/>
            <View style={styles.section}>
                <Stories/>
            </View>

        </Screen>
    )
}

const styles = StyleSheet.create({
    section: {
        flex: 1,
        backgroundColor: themeColors.card,
        borderRadius: 28,

        borderWidth: 1,
        borderColor: themeColors.cardBorder,

        ...SHADOW,
    }
})