import {forwardRef} from "react";
import {StyleSheet, Text, View} from "react-native";
import {TouchableOpacity} from "react-native-gesture-handler";

import {
    AppBottomSheetModal,
    type AppBottomSheetRef,
} from "@/components/ui/bottom-sheet/AppBottomSheetModal";
import {themeColors} from "@/utils/theme-colors";

export type SelectionChipOption = {
    id: string;
    title: string;
    description?: string;
};

type SelectionChipsSheetProps = {
    title: string;
    options: SelectionChipOption[];
    activeOptionId?: SelectionChipOption["id"] | null;
    onSelectOption: (optionId: SelectionChipOption["id"] | null) => void;
    snapPoints?: (string | number)[];
};

export const SelectionChipsSheet = forwardRef<AppBottomSheetRef, SelectionChipsSheetProps>(
    (
        {
            title,
            options,
            activeOptionId,
            onSelectOption,
            snapPoints = ["34%"],
        },
        ref,
    ) => {
        return (
            <AppBottomSheetModal
                ref={ref}
                title={title}
                snapPoints={snapPoints}
                enableDynamicSizing={false}
                scrollable
            >
                <View style={styles.optionList}>
                    {options.map((option) => {
                        const isActive = option.id === activeOptionId;

                        return (
                            <TouchableOpacity
                                key={option.id}
                                activeOpacity={0.72}
                                style={[
                                    styles.optionChip,
                                    isActive && styles.optionChipActive,
                                ]}
                                onPress={() => {
                                    onSelectOption(
                                        isActive
                                            ? null
                                            : option.id
                                    );
                                }}
                            >
                                <Text
                                    style={[
                                        styles.optionTitle,
                                        isActive && styles.optionTitleActive,
                                    ]}
                                    numberOfLines={1}
                                >
                                    {option.title}
                                </Text>

                                {option.description ? (
                                    <Text
                                        style={[
                                            styles.optionDescription,
                                            isActive &&
                                            styles.optionDescriptionActive,
                                        ]}
                                        numberOfLines={2}
                                    >
                                        {option.description}
                                    </Text>
                                ) : null}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </AppBottomSheetModal>
        );
    },
);

SelectionChipsSheet.displayName = "SelectionChipsSheet";

const styles = StyleSheet.create({
    optionList: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        paddingBottom: 8,
    },

    optionChip: {
        minHeight: 34,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: themeColors.border,
        backgroundColor: themeColors.card,
    },

    optionChipActive: {
        backgroundColor: themeColors.primary,
        borderColor: themeColors.primary,
    },

    optionTitle: {
        color: themeColors.text,
        fontSize: 13,
        fontFamily: "Point-SemiBold",
    },

    optionTitleActive: {
        color: themeColors.textOnPrimary,
    },

    optionDescription: {
        marginTop: 4,
        color: themeColors.textSecondary,
        fontSize: 12,
        fontFamily: "Point-Regular",
    },

    optionDescriptionActive: {
        color: "rgba(24,19,12,0.76)",
    },
});