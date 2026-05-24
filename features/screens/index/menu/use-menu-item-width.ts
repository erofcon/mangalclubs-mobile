import {useMemo} from "react";
import {Platform, useWindowDimensions} from "react-native";

import {
    GAP,
    GRID_COLUMNS,
    H_PADDING,
    NATIVE_FALLBACK_WIDTH,
    WEB_MAX_WIDTH,
} from "@/features/screens/index/menu/constants";

export function useMenuItemWidth(containerWidth: number) {
    const {width: windowWidth} = useWindowDimensions();

    const listWidth = useMemo(() => {
        if (containerWidth > 0) return containerWidth;
        if (Platform.OS === "web" && windowWidth > 0) return Math.min(windowWidth, WEB_MAX_WIDTH);
        if (Platform.OS === "web") return WEB_MAX_WIDTH;
        return windowWidth || NATIVE_FALLBACK_WIDTH;
    }, [containerWidth, windowWidth]);

    return useMemo(() => {
        if (!listWidth) return 0;

        const availableWidth = listWidth - H_PADDING * 2 - GAP * (GRID_COLUMNS - 1);
        return Math.floor(availableWidth / GRID_COLUMNS);
    }, [listWidth]);
}
