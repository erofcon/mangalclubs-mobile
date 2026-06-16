import type {ImageSourcePropType} from "react-native";

export const toImageSource = (
    source: ImageSourcePropType | string | null | undefined
): ImageSourcePropType | undefined => {
    if (!source) {
        return undefined;
    }

    return typeof source === "string" ? {uri: source} : source;
};
