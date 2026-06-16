import {Pressable, Text, View} from "react-native";

import styles from "../order-type.styles";

type Props = {
    title: string;
    currentMode: "asap" | "scheduled";
    currentScheduleText: string | null;
    sourceRestaurantTitle: string;
    disabled?: boolean;
    disabledMessage?: string;
    onAsapPress: () => void;
    onSchedulePress: () => void;
    onContinue: () => void;
};

export function OrderPanel({
    title,
    currentMode,
    currentScheduleText,
    sourceRestaurantTitle,
    disabled = false,
    disabledMessage,
    onAsapPress,
    onSchedulePress,
    onContinue,
}: Props) {
    return (
        <View style={styles.panel}>
            <Text style={styles.panelTitle}>{title}</Text>

            <View style={styles.modeList}>
                <Pressable onPress={onAsapPress} style={styles.modeRow}>
                    <View style={[styles.radio, currentMode === "asap" && styles.radioSelected]}>
                        {currentMode === "asap" ? <View style={styles.radioInner} /> : null}
                    </View>
                    <Text style={styles.modeLabel}>Как можно скорее</Text>
                </Pressable>

                <Pressable onPress={onSchedulePress} style={styles.modeRow}>
                    <View style={[styles.radio, currentMode === "scheduled" && styles.radioSelected]}>
                        {currentMode === "scheduled" ? <View style={styles.radioInner} /> : null}
                    </View>

                    <View style={styles.modeTextWrap}>
                        <Text
                            style={[
                                styles.modeLabel,
                                currentMode === "scheduled" && styles.modeLabelActive,
                            ]}
                        >
                            Ко времени
                        </Text>
                        {currentScheduleText ? (
                            <Text style={styles.modeValue}>{currentScheduleText}</Text>
                        ) : null}
                    </View>

                    <Text
                        style={[
                            styles.modeAction,
                            currentMode !== "scheduled" && styles.modeActionHidden,
                        ]}
                    >
                        Изменить
                    </Text>
                </Pressable>
            </View>

            <View style={styles.sourceBlock}>
                <Text style={styles.sourceLabel}>Из ресторана</Text>
                <Text style={styles.sourceTitle}>{sourceRestaurantTitle}</Text>
            </View>

            {disabledMessage ? (
                <Text style={styles.panelWarning}>{disabledMessage}</Text>
            ) : null}

            <Pressable
                style={[styles.primaryButton, disabled && styles.primaryButtonDisabled]}
                onPress={onContinue}
                disabled={disabled}
            >
                <Text style={styles.primaryButtonText}>Продолжить</Text>
            </Pressable>
        </View>
    );
}
