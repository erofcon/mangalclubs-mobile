import {Tabs} from "expo-router";

import {FloatingTabBar} from "@/components/navigation/FloatingTabBar";

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                animation: "none",
            }}
            tabBar={(props) => <FloatingTabBar {...props} />}
        >
            <Tabs.Screen name="index"/>
            <Tabs.Screen name="menu"/>
            <Tabs.Screen name="cart"/>
            <Tabs.Screen name="booking"/>
            <Tabs.Screen name="profile"/>
        </Tabs>
    );
}
