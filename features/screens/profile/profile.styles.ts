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
        paddingBottom: 118,
        gap: 14,
    },

    pressed: {
        opacity: 0.76,
    },

    disabled: {
        opacity: 0.55,
    },

    hero: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(236,172,24,0.18)",
        backgroundColor: "#080909",
        overflow: "hidden",
    },

    heroTop: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 14,
    },

    avatar: {
        width: 72,
        height: 72,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 7,
        backgroundColor: "#050606",
        borderWidth: 1,
        borderColor: "rgba(236,172,24,0.28)",
        overflow: "hidden",
    },

    avatarImage: {
        width: "100%",
        height: "100%",
    },

    heroText: {
        flex: 1,
        minWidth: 0,
    },

    eyebrow: {
        color: themeColors.primary,
        fontSize: 11,
        lineHeight: 14,
        fontFamily: "Point-Bold",
        textTransform: "uppercase",
    },

    heroTitle: {
        marginTop: 6,
        color: themeColors.text,
        fontSize: 24,
        lineHeight: 29,
        fontFamily: "Point-Regular",
    },

    heroSubtitle: {
        marginTop: 5,
        color: themeColors.textSecondary,
        fontSize: 13,
        lineHeight: 17,
        fontFamily: "Point-Regular",
    },

    iconButton: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 7,
        borderWidth: 1,
        borderColor: "rgba(236,172,24,0.18)",
        backgroundColor: "#11100E",
    },

    statsRow: {
        flexDirection: "row",
        borderTopWidth: 1,
        borderTopColor: "rgba(236,172,24,0.12)",
    },

    statCell: {
        flex: 1,
        minWidth: 0,
        paddingHorizontal: 10,
        paddingVertical: 12,
        borderRightWidth: 1,
        borderRightColor: "rgba(236,172,24,0.10)",
    },

    statLabel: {
        color: themeColors.textSecondary,
        fontSize: 10,
        lineHeight: 13,
        fontFamily: "Point-Bold",
        textTransform: "uppercase",
    },

    statValue: {
        marginTop: 5,
        color: themeColors.text,
        fontSize: 18,
        lineHeight: 22,
        fontFamily: "Point-SemiBold",
    },

    statValueCompact: {
        fontSize: 12,
        lineHeight: 16,
        fontFamily: "Point-Regular",
    },

    segmented: {
        minHeight: 46,
        flexDirection: "row",
        padding: 4,
        gap: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(236,172,24,0.16)",
        backgroundColor: "#080909",
    },

    segment: {
        flex: 1,
        minHeight: 36,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 6,
    },

    segmentActive: {
        backgroundColor: themeColors.primary,
    },

    segmentText: {
        color: themeColors.textSecondary,
        fontSize: 13,
        lineHeight: 17,
        fontFamily: "Point-Bold",
    },

    segmentTextActive: {
        color: themeColors.textOnPrimary,
    },

    section: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(236,172,24,0.18)",
        backgroundColor: "#080909",
        padding: 14,
        gap: 14,
    },

    sectionHeader: {
        gap: 5,
    },

    sectionHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },

    sectionEyebrow: {
        color: themeColors.primary,
        fontSize: 11,
        lineHeight: 14,
        fontFamily: "Point-Bold",
        textTransform: "uppercase",
    },

    sectionTitle: {
        color: themeColors.text,
        fontSize: 24,
        lineHeight: 29,
        fontFamily: "Point-Regular",
    },

    infoGrid: {
        flexDirection: "row",
        gap: 8,
    },

    infoPill: {
        flex: 1,
        minWidth: 0,
        minHeight: 96,
        padding: 12,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: "rgba(236,172,24,0.14)",
        backgroundColor: "#11100E",
    },

    infoLabel: {
        marginTop: 9,
        color: themeColors.textSecondary,
        fontSize: 11,
        lineHeight: 14,
        fontFamily: "Point-Regular",
    },

    infoValue: {
        marginTop: 5,
        color: themeColors.text,
        fontSize: 13,
        lineHeight: 17,
        fontFamily: "Point-SemiBold",
    },

    formBlock: {
        gap: 11,
    },

    field: {
        gap: 7,
    },

    fieldLabel: {
        color: themeColors.textSecondary,
        fontSize: 12,
        lineHeight: 15,
        fontFamily: "Point-Bold",
    },

    inputWrap: {
        minHeight: 48,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 12,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: "rgba(236,172,24,0.16)",
        backgroundColor: "#050606",
    },

    input: {
        flex: 1,
        minWidth: 0,
        paddingVertical: 0,
        color: themeColors.text,
        fontSize: 15,
        lineHeight: 19,
        fontFamily: "Point-Regular",
    },

    primaryButton: {
        minHeight: 50,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderRadius: 7,
        backgroundColor: themeColors.primary,
    },

    primaryButtonText: {
        color: themeColors.textOnPrimary,
        fontSize: 15,
        lineHeight: 19,
        fontFamily: "Point-Bold",
    },

    secondaryButton: {
        minHeight: 42,
        alignSelf: "center",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingHorizontal: 16,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: "rgba(236,172,24,0.22)",
    },

    secondaryButtonText: {
        color: themeColors.primary,
        fontSize: 13,
        lineHeight: 17,
        fontFamily: "Point-Bold",
    },

    menuButton: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 7,
        backgroundColor: themeColors.primary,
    },

    successText: {
        color: themeColors.success,
        fontSize: 12,
        lineHeight: 17,
        fontFamily: "Point-Regular",
    },

    errorText: {
        color: themeColors.notification,
        fontSize: 12,
        lineHeight: 17,
        fontFamily: "Point-Regular",
    },

    stateBlock: {
        minHeight: 160,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(236,172,24,0.16)",
        backgroundColor: "#080909",
    },

    stateText: {
        color: themeColors.textSecondary,
        fontSize: 13,
        lineHeight: 17,
        fontFamily: "Point-Regular",
    },

    ordersList: {
        gap: 10,
    },

    orderCard: {
        gap: 12,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(236,172,24,0.14)",
        backgroundColor: "#11100E",
    },

    orderTop: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },

    orderIcon: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 7,
        borderWidth: 1,
        borderColor: "rgba(236,172,24,0.18)",
        backgroundColor: "#080909",
    },

    orderTitleWrap: {
        flex: 1,
        minWidth: 0,
    },

    orderTitle: {
        color: themeColors.text,
        fontSize: 15,
        lineHeight: 19,
        fontFamily: "Point-SemiBold",
    },

    orderDate: {
        marginTop: 3,
        color: themeColors.textSecondary,
        fontSize: 11,
        lineHeight: 14,
        fontFamily: "Point-Regular",
    },

    orderPreview: {
        color: "#C8BDB1",
        fontSize: 13,
        lineHeight: 19,
        fontFamily: "Point-Regular",
    },

    orderMetaGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },

    orderMeta: {
        width: "48%",
        minHeight: 34,
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
        paddingHorizontal: 9,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "rgba(236,172,24,0.10)",
        backgroundColor: "#080909",
    },

    orderMetaText: {
        flex: 1,
        minWidth: 0,
        color: themeColors.textSecondary,
        fontSize: 11,
        lineHeight: 14,
        fontFamily: "Point-Regular",
    },

    orderActions: {
        flexDirection: "row",
        gap: 8,
    },

    payButton: {
        flex: 1,
        minHeight: 42,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        borderRadius: 7,
        backgroundColor: themeColors.primary,
    },

    payButtonText: {
        color: themeColors.textOnPrimary,
        fontSize: 13,
        lineHeight: 17,
        fontFamily: "Point-Bold",
    },

    refreshButton: {
        flex: 1,
        minHeight: 42,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: "rgba(236,172,24,0.22)",
    },

    refreshButtonText: {
        color: themeColors.primary,
        fontSize: 13,
        lineHeight: 17,
        fontFamily: "Point-Bold",
    },

    statusBadge: {
        maxWidth: 118,
        minHeight: 28,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 8,
        borderRadius: 6,
        borderWidth: 1,
    },

    statusText: {
        fontSize: 10,
        lineHeight: 13,
        fontFamily: "Point-Bold",
    },

    statusBadge_success: {
        borderColor: "rgba(51,172,113,0.38)",
        backgroundColor: "rgba(51,172,113,0.12)",
    },

    statusBadge_progress: {
        borderColor: "rgba(236,172,24,0.40)",
        backgroundColor: "rgba(236,172,24,0.12)",
    },

    statusBadge_warning: {
        borderColor: "rgba(252,194,27,0.38)",
        backgroundColor: "rgba(252,194,27,0.12)",
    },

    statusBadge_danger: {
        borderColor: "rgba(221,46,68,0.42)",
        backgroundColor: "rgba(221,46,68,0.12)",
    },

    statusBadge_muted: {
        borderColor: "rgba(255,255,255,0.10)",
        backgroundColor: "rgba(255,255,255,0.04)",
    },

    statusText_success: {
        color: "#7EE0AA",
    },

    statusText_progress: {
        color: themeColors.primary,
    },

    statusText_warning: {
        color: "#FFD96A",
    },

    statusText_danger: {
        color: "#FF8C9A",
    },

    statusText_muted: {
        color: themeColors.textSecondary,
    },

    emptyBlock: {
        alignItems: "center",
        paddingHorizontal: 18,
        paddingVertical: 26,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(236,172,24,0.14)",
        backgroundColor: "#11100E",
    },

    emptyIcon: {
        width: 62,
        height: 62,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(236,172,24,0.20)",
        backgroundColor: "#080909",
    },

    emptyTitle: {
        marginTop: 15,
        color: themeColors.text,
        fontSize: 18,
        lineHeight: 23,
        textAlign: "center",
        fontFamily: "Point-SemiBold",
    },

    emptyText: {
        marginTop: 8,
        marginBottom: 18,
        color: themeColors.textSecondary,
        fontSize: 13,
        lineHeight: 19,
        textAlign: "center",
        fontFamily: "Point-Regular",
    },
});
