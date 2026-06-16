import {Pressable, Text, View} from "react-native";

import {Screen} from "@/components/ui/Screen";
import {AppBottomSheetModal} from "@/components/ui/bottom-sheet/AppBottomSheetModal";

import styles from "./order-type.styles";
import {useOrderTypeScreen} from "./useOrderTypeScreen";
import {AddressesList} from "./components/AddressesList";
import {TakeawayRestaurantsList} from "./components/TakeawayRestaurantsList";
import {OrderPanel} from "./components/OrderPanel";
import {AddAddressPanel} from "./components/AddAddressPanel";
import {DeleteAddressModal} from "./components/DeleteAddressModal";
import {DeliveryTimeSheetContent} from "./components/DeliveryTimeSheetContent";

export function OrderTypeScreen() {
    const {
        now,
        addresses,
        selectedAddressId,
        setSelectedAddressId,
        addressToDelete,
        setAddressToDelete,
        sheetDay,
        sheetDraftTime,
        sheetRef,

        activeTab,
        setActiveTab,
        visibleTab,

        canAddMoreAddresses,
        showOrderPanel,
        bottomPadding,

        currentSchedule,
        currentScheduleText,

        takeawayRestaurants,
        selectedTakeawayRestaurantId,
        setTakeawayRestaurantId,
        sourceRestaurantTitle,
        orderUnavailableMessage,
        canContinueOrder,
        scheduleSlots,

        openSheet,
        handleDayPress,
        handleSlotPress,
        handleSaveSheet,
        handleAsapPress,
        handleContinue,
        handleConfirmDelete,

        selectAddress,
    } = useOrderTypeScreen();

    return (
        <Screen withTopInset>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.segment}>
                        <Pressable
                            onPress={() => setActiveTab("delivery")}
                            style={[
                                styles.segmentButton,
                                activeTab === "delivery" && styles.segmentButtonActive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.segmentText,
                                    activeTab === "delivery" && styles.segmentTextActive,
                                ]}
                            >
                                Доставка
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={() => setActiveTab("takeaway")}
                            style={[
                                styles.segmentButton,
                                activeTab === "takeaway" && styles.segmentButtonActive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.segmentText,
                                    activeTab === "takeaway" && styles.segmentTextActive,
                                ]}
                            >
                                Самовывоз
                            </Text>
                        </Pressable>
                    </View>
                </View>

                <View style={styles.content}>
                    <View style={styles.topText}>
                        <Text style={styles.title}>
                            {visibleTab === "delivery" ? "Адрес доставки" : "Выберите ресторан"}
                        </Text>

                        <Text style={styles.subtitle}>
                            {visibleTab === "delivery"
                                ? "Выберите сохраненный адрес или добавьте новый"
                                : "Где вы хотите забрать заказ"}
                        </Text>
                    </View>

                    {visibleTab === "delivery" ? (
                        <AddressesList
                            addresses={addresses}
                            selectedAddressId={selectedAddressId}
                            onSelect={(addressId) => {
                                setSelectedAddressId(addressId);
                                selectAddress(addressId);
                            }}
                            onDelete={setAddressToDelete}
                            bottomPadding={bottomPadding}
                        />
                    ) : (
                        <TakeawayRestaurantsList
                            restaurants={takeawayRestaurants}
                            selectedRestaurantId={selectedTakeawayRestaurantId}
                            onSelect={setTakeawayRestaurantId}
                            bottomPadding={bottomPadding}
                        />
                    )}
                </View>

                <View style={styles.bottomPanel}>
                    {showOrderPanel ? (
                        <OrderPanel
                            title={visibleTab === "takeaway" ? "Время самовывоза" : "Время доставки"}
                            currentMode={currentSchedule.mode}
                            currentScheduleText={currentScheduleText}
                            sourceRestaurantTitle={sourceRestaurantTitle}
                            disabled={!canContinueOrder}
                            disabledMessage={orderUnavailableMessage}
                            onAsapPress={handleAsapPress}
                            onSchedulePress={openSheet}
                            onContinue={handleContinue}
                        />
                    ) : (
                        <AddAddressPanel canAddMoreAddresses={canAddMoreAddresses} />
                    )}
                </View>

                <DeleteAddressModal
                    address={addressToDelete}
                    onClose={() => setAddressToDelete(null)}
                    onConfirm={handleConfirmDelete}
                />

                <AppBottomSheetModal
                    ref={sheetRef}
                    title={visibleTab === "takeaway" ? "Время самовывоза" : "Время доставки"}
                    scrollable
                    snapPoints={["82%"]}
                    enableDynamicSizing={false}
                    onDismiss={() => {}}
                >
                    <DeliveryTimeSheetContent
                        now={now}
                        sheetDay={sheetDay}
                        sheetDraftTime={sheetDraftTime}
                        scheduleSlots={scheduleSlots}
                        onDayPress={handleDayPress}
                        onSlotPress={handleSlotPress}
                        onSave={handleSaveSheet}
                    />
                </AppBottomSheetModal>
            </View>
        </Screen>
    );
}
