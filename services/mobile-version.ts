import Constants from "expo-constants";
import * as Application from "expo-application";
import {Platform} from "react-native";

import {apiFetch} from "@/services/api";

export type MobilePlatform = "android" | "ios";

export type MobileUpdateCopy = {
    title: string;
    message: string;
};

export type MobilePlatformVersion = {
    minSupportedBuild: number;
    latestBuild: number;
    storeUrl?: string | null;
};

export type MobileVersionConfig = {
    android: MobilePlatformVersion;
    ios: MobilePlatformVersion;
    forceUpdate: MobileUpdateCopy;
    softUpdate: MobileUpdateCopy;
};

export type MobileVersionStatus =
    | {
    status: "supported";
    currentBuild: number;
    latestBuild: number;
    storeUrl?: string | null;
}
    | {
    status: "soft-update";
    currentBuild: number;
    latestBuild: number;
    storeUrl?: string | null;
    title: string;
    message: string;
}
    | {
    status: "force-update";
    currentBuild: number;
    minSupportedBuild: number;
    latestBuild: number;
    storeUrl?: string | null;
    title: string;
    message: string;
};

const parseBuildNumber = (value: unknown) => {
    if (typeof value === "number" && Number.isFinite(value)) {
        return Math.trunc(value);
    }

    if (typeof value === "string") {
        const parsed = Number.parseInt(value, 10);

        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }

    return null;
};

export const getCurrentMobilePlatform = (): MobilePlatform | null => {
    if (Platform.OS === "android" || Platform.OS === "ios") {
        return Platform.OS;
    }

    return null;
};

export const getCurrentBuildNumber = () => {
    const isExpoGo = Constants.executionEnvironment === "storeClient";
    const nativeBuild = isExpoGo ? null : parseBuildNumber(Application.nativeBuildVersion);

    if (nativeBuild !== null) {
        return nativeBuild;
    }

    const expoConfig = Constants.expoConfig;

    if (Platform.OS === "android") {
        return parseBuildNumber(expoConfig?.android?.versionCode);
    }

    if (Platform.OS === "ios") {
        return parseBuildNumber(expoConfig?.ios?.buildNumber);
    }

    return null;
};

export const getMobileVersionConfig = (signal: AbortSignal) =>
    apiFetch<MobileVersionConfig>("/api/v1/app/mobile-version", {
        auth: false,
        signal,
    });

export const evaluateMobileVersion = (
    config: MobileVersionConfig,
): MobileVersionStatus | null => {
    const platform = getCurrentMobilePlatform();
    const currentBuild = getCurrentBuildNumber();

    if (!platform || currentBuild === null) {
        return null;
    }

    const platformConfig = config[platform];
    const latestBuild = Math.max(platformConfig.latestBuild, platformConfig.minSupportedBuild);

    if (currentBuild < platformConfig.minSupportedBuild) {
        return {
            status: "force-update",
            currentBuild,
            minSupportedBuild: platformConfig.minSupportedBuild,
            latestBuild,
            storeUrl: platformConfig.storeUrl,
            title: config.forceUpdate.title,
            message: config.forceUpdate.message,
        };
    }

    if (currentBuild < latestBuild) {
        return {
            status: "soft-update",
            currentBuild,
            latestBuild,
            storeUrl: platformConfig.storeUrl,
            title: config.softUpdate.title,
            message: config.softUpdate.message,
        };
    }

    return {
        status: "supported",
        currentBuild,
        latestBuild,
        storeUrl: platformConfig.storeUrl,
    };
};
