import {Modal, Pressable, Text} from "react-native";

import type {SavedAddress} from "@/store/address-store";
import styles from "../order-type.styles";

type Props = {
    address: SavedAddress | null;
    onClose: () => void;
    onConfirm: () => void;
};

export function DeleteAddressModal({address, onClose, onConfirm}: Props) {
    return (
        <Modal visible={address !== null} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.modalBackdrop} onPress={onClose}>
                <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
                    <Text style={styles.modalTitle}>Удалить адрес?</Text>
                    <Text style={styles.modalAddress} numberOfLines={2}>
                        {address?.shortAddress}
                    </Text>

                    <Pressable style={styles.modalActions} onPress={undefined}>
                        <Pressable style={styles.modalCancel} onPress={onClose}>
                            <Text style={styles.modalCancelText}>Отмена</Text>
                        </Pressable>
                        <Pressable style={styles.modalDelete} onPress={onConfirm}>
                            <Text style={styles.modalDeleteText}>Удалить</Text>
                        </Pressable>
                    </Pressable>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
