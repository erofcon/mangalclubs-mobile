export {MenuScreen as default} from "@/features/screens/menu/MenuScreen"

// import {useCallback, useMemo, useState} from "react";
// import {
//     LayoutAnimation,
//     Platform,
//     ScrollView,
//     StyleSheet,
//     Text,
//     UIManager,
//     View,
//     type LayoutChangeEvent,
//     type NativeScrollEvent,
//     type NativeSyntheticEvent,
// } from "react-native";
// import {MaterialCommunityIcons} from "@expo/vector-icons";
// import {StatusBar} from "expo-status-bar";
// import {VideoView, useVideoPlayer} from "expo-video";
// import {useSafeAreaInsets} from "react-native-safe-area-context";
//
// import {Screen} from "@/components/ui/Screen";
// import {menus} from "@/mocks/mocks-data";
// import type {MenuItem} from "@/types/products";
// import {SHADOW, themeColors} from "@/utils/theme-colors";
// import {ANDROID_DECELERATION_RATE} from "@/features/screens/index/menu/constants";
// import {CategoriesGrid} from "@/features/screens/index/menu/CategoriesGrid";
// import {MenuSections} from "@/features/screens/index/menu/MenuSections";
// import {useIndexMenuScroll} from "@/features/screens/index/menu/use-index-menu-scroll";
// import {useMenuItemWidth} from "@/features/screens/index/menu/use-menu-item-width";
//
// if (
//     Platform.OS === "android" &&
//     UIManager.setLayoutAnimationEnabledExperimental
// ) {
//     UIManager.setLayoutAnimationEnabledExperimental(true);
// }
//
// const HERO_HEIGHT = 270;
// const HERO_OVERLAP = 46;
//
// const COLLAPSE_AT = HERO_HEIGHT - 8;
// const EXPAND_AT = HERO_HEIGHT - 58;
//
// const layoutConfig = {
//     duration: 220,
//     create: {
//         type: LayoutAnimation.Types.easeInEaseOut,
//         property: LayoutAnimation.Properties.opacity,
//     },
//     update: {
//         type: LayoutAnimation.Types.easeInEaseOut,
//     },
//     delete: {
//         type: LayoutAnimation.Types.easeInEaseOut,
//         property: LayoutAnimation.Properties.opacity,
//     },
// };
//
// export default function MenuScreen() {
//     const insets = useSafeAreaInsets();
//     const [containerWidth, setContainerWidth] = useState(0);
//     const [isOrderCollapsed, setIsOrderCollapsed] = useState(false);
//
//     const itemWidth = useMenuItemWidth(containerWidth);
//
//     const player = useVideoPlayer(
//         require("@/assets/mocks/restaurant-video/video_1.mp4"),
//         (player) => {
//             player.loop = true;
//             player.muted = true;
//             player.play();
//         }
//     );
//
//     const availableCategories = useMemo(() => {
//         return menus.filter((category) => category.items.length > 0);
//     }, []);
//
//     const itemsByCategory = useMemo(() => {
//         return availableCategories.reduce<Record<string, MenuItem[]>>((acc, category) => {
//             acc[category.id] = category.items;
//             return acc;
//         }, {});
//     }, [availableCategories]);
//
//     const {
//         activeCategoryId,
//         categoryTabsScrollXRef,
//         handleCategoryLayout,
//         handleCategoryTabsScrollXChange,
//         handleMenuMomentumEnd,
//         handleMenuScroll,
//         handleMenuScrollBeginDrag,
//         handleMenuScrollEndDrag,
//         handleSectionsLayout,
//         handleTabsLayout,
//         scrollRef,
//         scrollToCategory,
//     } = useIndexMenuScroll(availableCategories);
//
//     const onContainerLayout = useCallback((event: LayoutChangeEvent) => {
//         setContainerWidth(event.nativeEvent.layout.width);
//     }, []);
//
//     const setCollapsedSmoothly = useCallback((nextCollapsed: boolean) => {
//         setIsOrderCollapsed((current) => {
//             if (current === nextCollapsed) return current;
//
//             LayoutAnimation.configureNext(layoutConfig);
//             return nextCollapsed;
//         });
//     }, []);
//
//     const onScroll = useCallback(
//         (event: NativeSyntheticEvent<NativeScrollEvent>) => {
//             const y = event.nativeEvent.contentOffset.y;
//
//             if (!isOrderCollapsed && y > COLLAPSE_AT) {
//                 setCollapsedSmoothly(true);
//             }
//
//             if (isOrderCollapsed && y < EXPAND_AT) {
//                 setCollapsedSmoothly(false);
//             }
//
//             handleMenuScroll(event);
//         },
//         [handleMenuScroll, isOrderCollapsed, setCollapsedSmoothly]
//     );
//
//     return (
//         <Screen edges={["left", "right", "bottom"]}>
//             <StatusBar style="light" />
//
//             <View style={styles.root} onLayout={onContainerLayout}>
//                 <ScrollView
//                     ref={scrollRef}
//                     style={styles.scroll}
//                     contentContainerStyle={{
//                         paddingBottom: insets.bottom + 104,
//                     }}
//                     stickyHeaderIndices={[1]}
//                     nestedScrollEnabled
//                     keyboardShouldPersistTaps="always"
//                     showsVerticalScrollIndicator={false}
//                     decelerationRate={Platform.OS === "android" ? ANDROID_DECELERATION_RATE : "normal"}
//                     overScrollMode={Platform.OS === "android" ? "never" : "auto"}
//                     scrollEventThrottle={16}
//                     onScroll={onScroll}
//                     onScrollBeginDrag={handleMenuScrollBeginDrag}
//                     onScrollEndDrag={handleMenuScrollEndDrag}
//                     onMomentumScrollEnd={handleMenuMomentumEnd}
//                 >
//                     <View style={styles.hero}>
//                         <VideoView
//                             player={player}
//                             style={styles.video}
//                             contentFit="cover"
//                             nativeControls={false}
//                             allowsFullscreen={false}
//                             allowsPictureInPicture={false}
//                         />
//
//                         <View style={styles.heroShade} />
//
//                         <Text style={styles.restaurantName}>
//                             MangalClubs
//                         </Text>
//                     </View>
//
//                     <View
//                         collapsable={false}
//                         style={[
//                             styles.stickyBlock,
//                             isOrderCollapsed && styles.stickyBlockCollapsed,
//                         ]}
//                         onLayout={handleTabsLayout}
//                     >
//                         <OrderTypeCard collapsed={isOrderCollapsed} />
//
//                         <CategoriesGrid
//                             categories={availableCategories}
//                             activeCategoryId={activeCategoryId}
//                             savedScrollX={categoryTabsScrollXRef.current}
//                             onSelectCategory={scrollToCategory}
//                             onScrollXChange={handleCategoryTabsScrollXChange}
//                         />
//                     </View>
//
//                     <View
//                         collapsable={false}
//                         style={styles.sectionsBlock}
//                         onLayout={handleSectionsLayout}
//                     >
//                         <MenuSections
//                             categories={availableCategories}
//                             itemsByCategory={itemsByCategory}
//                             itemWidth={itemWidth}
//                             onCategoryLayout={handleCategoryLayout}
//                         />
//                     </View>
//                 </ScrollView>
//
//                 <CartBar bottom={insets.bottom} />
//             </View>
//         </Screen>
//     );
// }
//
// function OrderTypeCard({collapsed}: {collapsed: boolean}) {
//     return (
//         <View style={[styles.orderCard, collapsed && styles.orderCardCollapsed]}>
//             {!collapsed && (
//                 <View style={styles.segment}>
//                     <View style={styles.segmentActive}>
//                         <Text style={styles.segmentActiveText}>Доставка</Text>
//                     </View>
//
//                     <View style={styles.segmentInactive}>
//                         <Text style={styles.segmentText}>Навынос</Text>
//                     </View>
//                 </View>
//             )}
//
//             <View style={[styles.addressRow, collapsed && styles.addressRowCollapsed]}>
//                 <Text style={styles.addressText}>
//                     Указать адрес доставки
//                 </Text>
//
//                 <MaterialCommunityIcons
//                     name="chevron-right"
//                     size={28}
//                     color={themeColors.text}
//                 />
//             </View>
//         </View>
//     );
// }
//
// function CartBar({bottom}: {bottom: number}) {
//     return (
//         <View style={[styles.cartBar, {bottom: Math.max(bottom, 0) + 76}]}>
//             <MaterialCommunityIcons
//                 name="cart"
//                 size={26}
//                 color="#fff"
//             />
//
//             <Text style={styles.cartText}>2 товара</Text>
//             <Text style={styles.cartPrice}>1 560 ₽</Text>
//         </View>
//     );
// }
//
// const styles = StyleSheet.create({
//     root: {
//         flex: 1,
//         width: "100%",
//         backgroundColor: themeColors.background,
//     },
//
//     scroll: {
//         flex: 1,
//         backgroundColor: themeColors.background,
//     },
//
//     hero: {
//         height: HERO_HEIGHT,
//         overflow: "hidden",
//         backgroundColor: themeColors.card,
//     },
//
//     video: {
//         width: "100%",
//         height: "100%",
//     },
//
//     heroShade: {
//         ...StyleSheet.absoluteFillObject,
//         backgroundColor: "rgba(0, 0, 0, 0.42)",
//     },
//
//     restaurantName: {
//         position: "absolute",
//         left: 16,
//         right: 16,
//         bottom: HERO_OVERLAP + 10,
//         color: themeColors.text,
//         fontSize: 28,
//         lineHeight: 32,
//         letterSpacing: 5,
//         textTransform: "uppercase",
//         fontFamily: "Point-ExtraBold",
//     },
//
//     stickyBlock: {
//         zIndex: 100,
//         elevation: 100,
//         marginTop: -HERO_OVERLAP,
//         paddingTop: 10,
//         paddingBottom: 8,
//         borderTopLeftRadius: 34,
//         borderTopRightRadius: 34,
//         backgroundColor: themeColors.background,
//         overflow: "hidden",
//     },
//
//     stickyBlockCollapsed: {
//         paddingTop: 24,
//     },
//
//     orderCard: {
//         marginHorizontal: 16,
//         marginBottom: 12,
//         padding: 10,
//         borderRadius: 20,
//         backgroundColor: themeColors.card,
//         borderWidth: 1,
//         borderColor: themeColors.cardBorder,
//         ...SHADOW,
//     },
//
//     orderCardCollapsed: {
//         paddingTop: 6,
//         paddingBottom: 6,
//         borderRadius: 16,
//     },
//
//     segment: {
//         height: 42,
//         flexDirection: "row",
//         padding: 4,
//         marginBottom: 10,
//         borderRadius: 14,
//         backgroundColor: themeColors.cardSecondary,
//         borderWidth: 1,
//         borderColor: "rgba(255, 255, 255, 0.08)",
//     },
//
//     segmentActive: {
//         flex: 1,
//         alignItems: "center",
//         justifyContent: "center",
//         borderRadius: 10,
//         backgroundColor: themeColors.primary,
//     },
//
//     segmentInactive: {
//         flex: 1,
//         alignItems: "center",
//         justifyContent: "center",
//         borderRadius: 10,
//     },
//
//     segmentActiveText: {
//         color: themeColors.textOnPrimary,
//         fontSize: 14,
//         fontFamily: "Point-SemiBold",
//     },
//
//     segmentText: {
//         color: themeColors.text,
//         fontSize: 14,
//         fontFamily: "Point-SemiBold",
//         opacity: 0.78,
//     },
//
//     addressRow: {
//         minHeight: 58,
//         flexDirection: "row",
//         alignItems: "center",
//         justifyContent: "space-between",
//         paddingHorizontal: 8,
//         paddingTop: 6,
//     },
//
//     addressRowCollapsed: {
//         minHeight: 46,
//         paddingTop: 0,
//     },
//
//     addressText: {
//         color: themeColors.text,
//         fontSize: 17,
//         fontFamily: "Point-SemiBold",
//     },
//
//     sectionsBlock: {
//         width: "100%",
//         backgroundColor: themeColors.background,
//     },
//
//     cartBar: {
//         position: "absolute",
//         right: 12,
//         height: 58,
//         minWidth: 236,
//         paddingHorizontal: 22,
//         borderRadius: 999,
//         flexDirection: "row",
//         alignItems: "center",
//         justifyContent: "space-between",
//         gap: 12,
//         backgroundColor: "#ef4338",
//         ...SHADOW,
//     },
//
//     cartText: {
//         color: "#fff",
//         fontSize: 17,
//         fontFamily: "Point-Bold",
//     },
//
//     cartPrice: {
//         color: "#fff",
//         fontSize: 20,
//         fontFamily: "Point-ExtraBold",
//     },
// });