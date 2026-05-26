import {Text} from "react-native";
import {Screen} from "@/components/ui/Screen";
import {themeColors} from "@/utils/theme-colors";

export default function MenuScreen() {
    return (
        <Screen withTopInset contentContainerStyle={{alignItems: "center", justifyContent: "center"}}>
            <Text style={{color: themeColors.text, fontFamily: "Point-Bold", fontSize: 22}}>
                Меню
            </Text>
        </Screen>
    );
}