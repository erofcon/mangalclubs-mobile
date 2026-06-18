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
        paddingBottom: 180,
        gap: 14,
    },

    keyboardAvoidingContent: {
        flex: 1,
    },

    pressed: {
        opacity: 0.76,
    },

    disabled: {
        opacity: 0.55,
    },

    hero: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.09)",
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
        borderRadius: 12,
        backgroundColor: "#050606",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.10)",
        overflow: "hidden",
    },

    avatarImage: {
        width: "100%",
        height: "100%",
    },

    avatarActionBadge: {
        position: "absolute",
        right: 5,
        bottom: 5,
        width: 24,
        height: 24,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.35)",
        backgroundColor: themeColors.primary,
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
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.09)",
        backgroundColor: "#11100E",
    },

    statsRow: {
        flexDirection: "row",
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.08)",
    },

    statCell: {
        flex: 1,
        minWidth: 0,
        paddingHorizontal: 10,
        paddingVertical: 12,
        borderRightWidth: 1,
        borderRightColor: "rgba(255,255,255,0.07)",
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
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.09)",
        backgroundColor: "#080909",
    },

    segment: {
        flex: 1,
        minHeight: 36,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        borderRadius: 9,
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

    segmentBadge: {
        minWidth: 18,
        height: 18,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 5,
        borderRadius: 9,
        backgroundColor: themeColors.notification,
    },

    segmentBadgeText: {
        color: themeColors.text,
        fontSize: 10,
        lineHeight: 12,
        fontFamily: "Point-Bold",
    },

    section: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.09)",
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
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
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
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.09)",
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
        borderRadius: 12,
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
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.10)",
    },

    secondaryButtonText: {
        color: themeColors.primary,
        fontSize: 13,
        lineHeight: 17,
        fontFamily: "Point-Bold",
    },

    linksBlock: {
        gap: 8,
        paddingTop: 2,
    },

    linkRow: {
        minHeight: 54,
        flexDirection: "row",
        alignItems: "center",
        gap: 11,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.09)",
        backgroundColor: "#080909",
    },

    linkIcon: {
        width: 34,
        height: 34,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "rgba(236,172,24,0.20)",
        backgroundColor: "rgba(236,172,24,0.08)",
    },

    linkIconDanger: {
        borderColor: "rgba(221,46,68,0.24)",
        backgroundColor: "rgba(221,46,68,0.08)",
    },

    linkText: {
        flex: 1,
        minWidth: 0,
        color: themeColors.text,
        fontSize: 16,
        lineHeight: 18,
        fontFamily: "Point-SemiBold",
    },

    linkTextDanger: {
        color: "#FF8C9A",
    },

    versionText: {
        color: themeColors.textSecondary,
        fontSize: 11,
        lineHeight: 14,
        fontFamily: "Point-SemiBold",
    },

    versionBadge: {
        alignSelf: "center",
        minHeight: 30,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "rgba(236,172,24,0.18)",
        backgroundColor: "rgba(236,172,24,0.06)",
    },

    supportSheetBackground: {
        backgroundColor: "#070808",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderWidth: 1,
        borderBottomWidth: 0,
        borderColor: "rgba(255,255,255,0.09)",
    },

    supportSheetContainer: {
        backgroundColor: "#070808",
    },

    supportSheetContent: {
        backgroundColor: "#070808",
        paddingBottom: 22,
    },

    supportIntro: {
        minHeight: 74,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.09)",
        backgroundColor: "#080909",
    },

    supportIntroIcon: {
        width: 46,
        height: 46,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(236,172,24,0.22)",
        backgroundColor: "rgba(236,172,24,0.08)",
    },

    supportIntroText: {
        flex: 1,
        minWidth: 0,
    },

    supportTitle: {
        color: themeColors.text,
        fontSize: 17,
        lineHeight: 22,
        fontFamily: "Point-SemiBold",
    },

    supportSubtitle: {
        marginTop: 4,
        color: themeColors.textSecondary,
        fontSize: 12,
        lineHeight: 17,
        fontFamily: "Point-Regular",
    },

    supportRestaurantsList: {
        gap: 12,
        marginTop: 12,
    },

    supportRestaurantCard: {
        gap: 13,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.09)",
        backgroundColor: "#11100E",
    },

    supportRestaurantHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },

    supportRestaurantIcon: {
        width: 42,
        height: 42,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.09)",
        backgroundColor: "#080909",
    },

    supportRestaurantTitleWrap: {
        flex: 1,
        minWidth: 0,
    },

    supportRestaurantName: {
        color: themeColors.text,
        fontSize: 16,
        lineHeight: 20,
        fontFamily: "Point-SemiBold",
    },

    supportRestaurantAddress: {
        marginTop: 4,
        color: themeColors.textSecondary,
        fontSize: 12,
        lineHeight: 17,
        fontFamily: "Point-Regular",
    },

    supportInfoList: {
        gap: 8,
    },

    supportInfoRow: {
        minHeight: 44,
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        backgroundColor: "#080909",
    },

    supportInfoTextWrap: {
        flex: 1,
        minWidth: 0,
        gap: 3,
    },

    supportInfoLabel: {
        color: themeColors.textSecondary,
        fontSize: 10,
        lineHeight: 13,
        fontFamily: "Point-Bold",
        textTransform: "uppercase",
    },

    supportInfoValue: {
        color: themeColors.text,
        fontSize: 13,
        lineHeight: 18,
        fontFamily: "Point-Regular",
    },

    supportActions: {
        flexDirection: "row",
        gap: 8,
    },

    supportCallButton: {
        flex: 1,
        minHeight: 44,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderRadius: 12,
        backgroundColor: themeColors.primary,
    },

    supportCallButtonText: {
        color: themeColors.textOnPrimary,
        fontSize: 13,
        lineHeight: 17,
        fontFamily: "Point-Bold",
    },

    supportWhatsappButton: {
        flex: 1,
        minHeight: 44,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.10)",
        backgroundColor: "#080909",
    },

    supportWhatsappButtonText: {
        color: themeColors.text,
        fontSize: 13,
        lineHeight: 17,
        fontFamily: "Point-Bold",
    },

    supportEmpty: {
        alignItems: "center",
        gap: 8,
        marginTop: 12,
        paddingHorizontal: 18,
        paddingVertical: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.09)",
        backgroundColor: "#11100E",
    },

    supportEmptyTitle: {
        color: themeColors.text,
        fontSize: 16,
        lineHeight: 20,
        textAlign: "center",
        fontFamily: "Point-SemiBold",
    },

    supportEmptyText: {
        color: themeColors.textSecondary,
        fontSize: 12,
        lineHeight: 17,
        textAlign: "center",
        fontFamily: "Point-Regular",
    },

    modalBackdrop: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        backgroundColor: "rgba(0,0,0,0.64)",
    },

    modalCard: {
        width: "100%",
        maxWidth: 360,
        gap: 10,
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.09)",
        backgroundColor: "#080909",
    },

    modalTitle: {
        color: themeColors.text,
        fontSize: 18,
        lineHeight: 23,
        fontFamily: "Point-Bold",
    },

    modalText: {
        color: themeColors.textSecondary,
        fontSize: 14,
        lineHeight: 20,
        fontFamily: "Point-Regular",
    },

    modalActions: {
        flexDirection: "row",
        gap: 10,
        marginTop: 8,
    },

    modalCancel: {
        flex: 1,
        minHeight: 50,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.10)",
        backgroundColor: "#11100E",
    },

    modalCancelText: {
        color: themeColors.text,
        fontSize: 15,
        lineHeight: 19,
        fontFamily: "Point-SemiBold",
    },

    modalDelete: {
        flex: 1,
        minHeight: 50,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        backgroundColor: themeColors.primary,
    },

    modalDeleteText: {
        color: themeColors.textOnPrimary,
        fontSize: 15,
        lineHeight: 19,
        fontFamily: "Point-Bold",
    },

    menuButton: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
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
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.09)",
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
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.09)",
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
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.09)",
        backgroundColor: "#080909",
    },

    orderUnreadBadge: {
        position: "absolute",
        top: -3,
        right: -3,
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: "#11100E",
        backgroundColor: themeColors.notification,
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
        flex: 1,
        minWidth: 0,
        color: "#C8BDB1",
        fontSize: 13,
        lineHeight: 19,
        fontFamily: "Point-Regular",
    },

    orderSummaryRow: {
        flexDirection: "row",
        gap: 8,
    },

    orderFooterRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
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
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
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
        borderRadius: 12,
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
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.10)",
    },

    refreshButtonText: {
        color: themeColors.primary,
        fontSize: 13,
        lineHeight: 17,
        fontFamily: "Point-Bold",
    },

    orderSheetBackground: {
        backgroundColor: "#070808",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderWidth: 1,
        borderBottomWidth: 0,
        borderColor: "rgba(255,255,255,0.09)",
    },

    orderSheetHandle: {
        backgroundColor: "rgba(255,255,255,0.22)",
    },

    orderSheetContainer: {
        backgroundColor: "#070808",
    },

    orderSheetContent: {
        backgroundColor: "#070808",
        paddingBottom: 20,
    },

    detailsSheet: {
        gap: 14,
        paddingBottom: 10,
    },

    detailsHero: {
        gap: 14,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.09)",
        backgroundColor: "#080909",
    },

    detailsHeroHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },

    orderIconLarge: {
        width: 46,
        height: 46,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.09)",
        backgroundColor: "#11100E",
    },

    detailsTitle: {
        color: themeColors.text,
        fontSize: 17,
        lineHeight: 22,
        fontFamily: "Point-SemiBold",
    },

    detailsBlock: {
        gap: 10,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.09)",
        backgroundColor: "#11100E",
    },

    detailsBlockTitle: {
        color: themeColors.text,
        fontSize: 16,
        lineHeight: 20,
        fontFamily: "Point-SemiBold",
    },

    detailsText: {
        color: themeColors.textSecondary,
        fontSize: 13,
        lineHeight: 19,
        fontFamily: "Point-Regular",
    },

    detailsMutedText: {
        color: themeColors.textSecondary,
        fontSize: 13,
        lineHeight: 19,
        fontFamily: "Point-Regular",
    },

    orderItemsList: {
        gap: 10,
    },

    orderItemRow: {
        minHeight: 76,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },

    orderItemImageWrap: {
        width: 64,
        height: 64,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.09)",
        backgroundColor: "#080909",
    },

    orderItemImage: {
        width: "100%",
        height: "100%",
    },

    orderItemInfo: {
        flex: 1,
        minWidth: 0,
    },

    orderItemName: {
        color: themeColors.text,
        fontSize: 14,
        lineHeight: 18,
        fontFamily: "Point-SemiBold",
    },

    orderItemMeta: {
        marginTop: 4,
        color: themeColors.textSecondary,
        fontSize: 12,
        lineHeight: 16,
        fontFamily: "Point-Regular",
    },

    orderItemComment: {
        marginTop: 4,
        color: "#C8BDB1",
        fontSize: 12,
        lineHeight: 16,
        fontFamily: "Point-Regular",
    },

    orderItemPrice: {
        maxWidth: 72,
        color: themeColors.text,
        fontSize: 13,
        lineHeight: 17,
        textAlign: "right",
        fontFamily: "Point-Bold",
    },

    statusBadge: {
        maxWidth: 118,
        minHeight: 28,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 8,
        borderRadius: 10,
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
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.09)",
        backgroundColor: "#11100E",
    },

    emptyIcon: {
        width: 62,
        height: 62,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.10)",
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
