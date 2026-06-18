const {version} = require("./package.json");

/** @type {import("expo/config").ExpoConfig} */
module.exports = {
  name: "Mangal Clubs",
  slug: "mangalclubs-mobile",
  version,
  orientation: "portrait",
  icon: "./assets/logo.png",
  scheme: "mangalclubs-mobile",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.erofcon.mangalclubsmobile",
  },
  android: {
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    softwareKeyboardLayoutMode: "resize",
    package: "com.erofcon.mangalclubsmobile",
  },
  web: {
    output: "static",
    favicon: "",
  },
  plugins: [
    "expo-router",
    "expo-notifications",
    [
      "expo-splash-screen",
      {
        image: "./assets/logo.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#070808",
        dark: {
          image: "./assets/logo.png",
          backgroundColor: "#070808",
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
};
