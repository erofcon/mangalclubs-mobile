import {Pressable, Text, View} from "react-native";

import styles from "../order-type.styles";
import {themeColors} from "@/utils/theme-colors";
import type {DeliveryTimeSlot} from "@/store/delivery-store";

type Props = {
    title: string;
    currentMode: "asap" | "scheduled";
    currentScheduleText: string | null;
    sourceRestaurantTitle: string;
    onAsapPress: () => void;
    onSchedulePress: () => void;
    onContinue: () => void;
};

export function OrderPanel({
                               title,
                               currentMode,
                               currentScheduleText,
                               sourceRestaurantTitle,
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
                        {currentMode === "asap" ? <View style={styles.radioInner}/> : null}
                    </View>
                    <Text style={styles.modeLabel}>Как можно скорее</Text>
                </Pressable>

                <Pressable onPress={onSchedulePress} style={styles.modeRow}>
                    <View style={[styles.radio, currentMode === "scheduled" && styles.radioSelected]}>
                        {currentMode === "scheduled" ? <View style={styles.radioInner}/> : null}
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

            <Pressable style={styles.primaryButton} onPress={onContinue}>
                <Text style={styles.primaryButtonText}>Продолжить</Text>
            </Pressable>
        </View>
    );
}