import {Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import {Pressable, Text, View} from "react-native";

import {PROFILE_MENU} from "@/features/screens/profile/profile.constants";
import {themeColors} from "@/utils/theme-colors";

import {profileStyles as styles} from "../profile.styles";

export function ProfileMenuList() {
    return (
        <View style={styles.menuBlock}>
            {PROFILE_MENU.map((item, index) => (
                <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    style={({pressed}) => [
                        styles.menuItem,
                        index < PROFILE_MENU.length - 1 && styles.menuDivider,
                        pressed && styles.pressed,
                    ]}
                    onPress={() => undefined}
                >
                    <View style={styles.menuIcon}>
                        <MaterialCommunityIcons
                            name={item.icon}
                            size={20}
                            color={themeColors.primary}
                        />
                    </View>

                    <View style={styles.menuText}>
                        <Text style={styles.menuTitle} numberOfLines={1}>
                            {item.title}
                        </Text>
                        {item.subtitle ? (
                            <Text style={styles.menuSubtitle} numberOfLines={1}>
                                {item.subtitle}
                            </Text>
                        ) : null}
                    </View>

                    <Ionicons name="chevron-forward" size={18} color={themeColors.textSecondary} />
                </Pressable>
            ))}
        </View>
    );
}
