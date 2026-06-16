import {StyleSheet} from "react-native";

import {themeColors} from "@/utils/theme-colors";

export const profileStyles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: themeColors.background,
    },

    content: {
        paddingHorizontal: 16,
        paddingTop: 4,
        paddingBottom: 110,
        gap: 14,
    },

    pressed: {
        opacity: 0.76,
    },

    avatar: {
        width: 106,
        height: 106,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 7,
        backgroundColor: "#050606",
        borderWidth: 1,
        borderColor: "rgba(236,172,24,0.28)",
    },

    avatarAddBadge: {
        position: "absolute",
        right: 8,
        bottom: 8,
        width: 32,
        height: 32,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 7,
        borderWidth: 1,
        borderColor: "rgba(236,172,24,0.26)",
        backgroundColor: "#151411",
    },

    profileText: {
        marginTop: 18,
        minWidth: 0,
    },

    profileEyebrow: {
        color: themeColors.primary,
        fontSize: 12,
        lineHeight: 16,
        fontFamily: "Point-Bold",
        textTransform: "uppercase",
    },

    profileName: {
        marginTop: 12,
        color: themeColors.text,
        fontSize: 26,
        lineHeight: 32,
        fontFamily: "Point-Regular",
    },

    profileDescription: {
        marginTop: 14,
        maxWidth: 286,
        color: "#A59A8F",
        fontSize: 15,
        lineHeight: 23,
        fontFamily: "Point-Regular",
    },

    editButton: {
        minHeight: 42,
        marginTop: 24,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "rgba(236,172,24,0.22)",
        backgroundColor: "#080909",
    },

    editButtonText: {
        color: themeColors.text,
        fontSize: 14,
        lineHeight: 18,
        fontFamily: "Point-Bold",
    },

    menuBlock: {
        overflow: "hidden",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(236,172,24,0.18)",
        backgroundColor: "#080909",
    },

    menuItem: {
        minHeight: 70,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 12,
        paddingVertical: 12,
    },

    menuDivider: {
        borderBottomWidth: 1,
        borderBottomColor: "rgba(236,172,24,0.12)",
    },

    menuIcon: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 7,
        borderWidth: 1,
        borderColor: "rgba(236,172,24,0.18)",
        backgroundColor: "#11100E",
    },

    menuText: {
        flex: 1,
        minWidth: 0,
    },

    menuTitle: {
        color: themeColors.text,
        fontSize: 15,
        lineHeight: 19,
        fontFamily: "Point-SemiBold",
    },

    menuSubtitle: {
        marginTop: 3,
        color: themeColors.textSecondary,
        fontSize: 12,
        lineHeight: 15,
        fontFamily: "Point-Regular",
    },

});
