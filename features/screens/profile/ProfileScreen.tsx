import {ScrollView, View} from "react-native";

import {Screen} from "@/components/ui/Screen";

import {ProfileHeader} from "./components/ProfileHeader";
import {ProfileMenuList} from "./components/ProfileMenuList";
import {profileStyles as styles} from "./profile.styles";

export function ProfileScreen() {
    return (
        <Screen withTopInset>
            <View style={styles.root}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.content}
                >
                    <ProfileHeader />
                    <ProfileMenuList />
                </ScrollView>
            </View>
        </Screen>
    );
}
