import type {MaterialCommunityIcons} from "@expo/vector-icons";

export type ProfileMenuItem = {
    id: string;
    title: string;
    subtitle?: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

export const PROFILE_USER = {
    name: "Имя гостя",
    eyebrow: "Данные гостя",
    description: "Контакты используются для подтверждения заказов, доставки и бронирования.",
};

export const PROFILE_MENU: ProfileMenuItem[] = [
    {
        id: "personal",
        title: "Личные данные",
        subtitle: "Имя, телефон и дата рождения",
        icon: "account-edit-outline",
    },
    {
        id: "orders-history",
        title: "История заказов",
        subtitle: "Повторить заказ или открыть детали",
        icon: "receipt-text-outline",
    },
    {
        id: "support",
        title: "Поддержка",
        subtitle: "Связаться с рестораном",
        icon: "chat-question-outline",
    },
    {
        id: "about",
        title: "О компании",
        subtitle: "Mangal Clubs, адреса и контакты",
        icon: "information-outline",
    },
];
