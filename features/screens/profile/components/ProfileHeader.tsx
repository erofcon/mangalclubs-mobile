import {Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import {Pressable, Text, View} from "react-native";

import {PROFILE_USER} from "@/features/screens/profile/profile.constants";
import {themeColors} from "@/utils/theme-colors";

import {profileStyles as styles} from "../profile.styles";

export function ProfileHeader() {
    return (
        <View>
            <View style={styles.avatar}>
                <MaterialCommunityIcons
                    name="account-outline"
                    size={58}
                    color={themeColors.primary}
                />

                <View style={styles.avatarAddBadge}>
                    <Ionicons name="add" size={18} color={themeColors.text} />
                </View>
            </View>

            <View style={styles.profileText}>
                <Text style={styles.profileEyebrow}>{PROFILE_USER.eyebrow}</Text>
                <Text style={styles.profileName} numberOfLines={1}>
                    {PROFILE_USER.name}
                </Text>
                <Text style={styles.profileDescription}>
                    {PROFILE_USER.description}
                </Text>
            </View>

            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Изменить данные гостя"
                style={({pressed}) => [styles.editButton, pressed && styles.pressed]}
                onPress={() => undefined}
            >
                <MaterialCommunityIcons
                    name="pencil"
                    size={18}
                    color={themeColors.text}
                />
                <Text style={styles.editButtonText}>Изменить</Text>
            </Pressable>
        </View>
    );
}
