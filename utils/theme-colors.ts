import {Platform} from "react-native";

export const themeColors = {

    // Brand colors
    primary: '#ECAC18',

    // Background colors
    background: '#070808',
    card: '#181715',
    cardSecondary: '#211F1B',
    cardHover: '#1A1815',

    // Text colors
    text: '#ffffff',
    textSecondary: '#8f867b',
    textOnPrimary: '#18130c',

    // UI elements
    hover: '#E09A00',
    border: '#615739',
    cardBorder: '#2A2418',
    surface: '#181715',
    textMuted: '#8f867b',
    pillActiveBg: '#ECAC18',
    pillActiveText: '#18130c',

    // Status colors
    notification: '#DD2E44',
    success: '#33AC71',
    warning: '#FCC21B',
    info: '#BAE2FD',

};

export const SHADOW = Platform.select({
    ios: {
        shadowColor: "#000",
        shadowOpacity: 0.32,
        shadowRadius: 18,
        shadowOffset: {width: 0, height: 10},
    },
    android: {elevation: 10},
    web: {
        boxShadow: "0px 10px 18px rgba(0, 0, 0, 0.32)",
    },
    default: {},
});
