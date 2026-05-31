import {Story} from "@/types/story";
import {Category, MenuCategory} from "@/types/products";
import {Organization} from "@/types/organization";


export const StoriesData: Story[] = [
    {
        id: "delivery",
        title: "Доставка",
        previewImage: "assets/mocks/stories/delivery/story-save.com_Instagram_mangalclubs_3834710151765166617.jpg",
        slides: [
            {
                id: "delivery-1",
                src: "assets/mocks/stories/delivery/story-save.com_Instagram_mangalclubs_3524636564161616270.jpg",
                type: "image"
            },
            {
                id: "delivery-2",
                src: "assets/mocks/stories/delivery/story-save.com_Instagram_mangalclubs_3834710202994431662.jpg",
                type: "image"
            },
            {
                id: "delivery-3",
                src: "assets/mocks/stories/delivery/story-save.com_Instagram_mangalclubs_3834710151765166617.jpg",
                type: "image"
            },
            {
                id: "delivery-4",
                src: "assets/mocks/stories/delivery/story-save.com_Instagram_mangalclubs_3834710048291748543.jpg",
                type: "image"
            },
            {
                id: "delivery-5",
                src: "assets/mocks/stories/delivery/story-save.com_Instagram_mangalclubs_3834709189977711846.jpg",
                type: "image"
            },
        ],
    },
    {
        id: "sauna",
        title: "Сауна Mangal",
        previewImage: "assets/mocks/stories/sauna/story-save.com_Instagram_mangalclubs_3867130753218028097.jpg",
        slides: [
            {
                id: "sauna-1",
                src: "assets/mocks/stories/sauna/story-save.com_Instagram_mangalclubs_3867130753352259742.jpg",
                type: "image"
            },
            {
                id: "sauna-2",
                src: "assets/mocks/stories/sauna/story-save.com_Instagram_mangalclubs_3867130753218028097.jpg",
                type: "image"
            },
            {
                id: "sauna-3",
                src: "assets/mocks/stories/sauna/story-save.com_Instagram_mangalclubs_3867130750248452637.jpg",
                type: "image"
            },
            {
                id: "sauna-4",
                src: "assets/mocks/stories/sauna/story-save.com_Instagram_mangalclubs_3867130748897879169.jpg",
                type: "image"
            },
            {
                id: "sauna-5",
                src: "assets/mocks/stories/sauna/story-save.com_Instagram_mangalclubs_3867130748646239697.jpg",
                type: "image"
            },
        ],
    },
    {
        id: "vip-fazenda",
        title: "VIP FAZENDA",
        previewImage: "assets/mocks/stories/vip-fazenda/story-save.com_Instagram_mangalclubs_3801707989854605294.jpg",
        slides: [
            {
                id: "vip-fazenda-1",
                src: "assets/mocks/stories/vip-fazenda/story-save.com_Instagram_mangalclubs_3801707989854605294.jpg",
                type: "image"
            },
            {
                id: "vip-fazenda-2",
                src: "assets/mocks/stories/vip-fazenda/story-save.com_Instagram_mangalclubs_3801708386996456768.jpg",
                type: "image"
            },
            {
                id: "vip-fazenda-3",
                src: "assets/mocks/stories/vip-fazenda/story-save.com_Instagram_mangalclubs_3801708283296482743.jpg",
                type: "image"
            },
            {
                id: "vip-fazenda-4",
                src: "assets/mocks/stories/vip-fazenda/story-save.com_Instagram_mangalclubs_3801708282700931770.jpg",
                type: "image"
            },
            {
                id: "vip-fazenda-5",
                src: "assets/mocks/stories/vip-fazenda/story-save.com_Instagram_mangalclubs_3801708280670891279.jpg",
                type: "image"
            },
        ],
    },
];


export const categories: Category[] = [
    {
        id: "99",
        title: "Стейки из мраморной говядины",
    },
    {
        id: "98",
        title: "Мангал",
    },
    {
        id: "97",
        title: "Салаты",
    },
];


export const menus: MenuCategory[] = [
    {
        id: categories[0].id,
        title: categories[0].title,
        video: categories[0].video,
        items: [
            {
                id: "1",
                name: "Томагавк",
                description: "Премиальный стейк из мраморной говядины",
                weight: "600 г",
                price: 4490,
                image: require("@/assets/mocks/menu/steak/Мраморный стейк томагавк.jpg"),
                calories: 1200,
                carbs: 24,
                fats: 64,
                proteins: 80,
            },
            {
                id: "2",
                name: "Рибай",
                description: "Сочный стейк зернового откорма",
                weight: "400 г",
                price: 2990,
                image: require("@/assets/mocks/menu/steak/Мраморный стейк Рибай.jpg"),
                calories: 1200,
                carbs: 24,
                fats: 64,
                proteins: 80,
            },
        ],
    },
    {
        id: categories[1].id,
        title: categories[1].title,
        video: categories[1].video,
        items: [
            {
                id: "3",
                name: "Люля-кебаб из говядины",
                description: "Нежный люля-кебаб с луком и специями",
                weight: "230 г",
                price: 590,
                image: require("@/assets/mocks/menu/mangal/Люля кебаб говядина.jpg"),
                calories: 1200,
                carbs: 24,
                fats: 64,
                proteins: 80,
            },
            {
                id: "4",
                name: "Шашлык куриный",
                description: "Куриный шашлык с дымным ароматом",
                weight: "300 г",
                price: 550,
                image: require("@/assets/mocks/menu/mangal/Куриные крылышки.jpg"),
                calories: 1200,
                carbs: 24,
                fats: 64,
                proteins: 80,
            },
            {
                id: "5",
                name: "Люля-кебаб из баранины",
                description: "Сочный люля-кебаб из баранины",
                weight: "230 г",
                price: 650,
                image: require("@/assets/mocks/menu/mangal/Люля кебаб баранина.jpg"),
                calories: 1200,
                carbs: 24,
                fats: 64,
                proteins: 80,
            },
            {
                id: "6",
                name: "Стейк из говядины",
                description: "Стейк с овощами на гриле",
                weight: "320 г",
                price: 890,
                image: require("@/assets/mocks/menu/mangal/Антрекоты.jpg"),
                calories: 1200,
                carbs: 24,
                fats: 64,
                proteins: 80,
            },
        ],
    },
    {
        id: categories[2].id,
        title: categories[2].title,
        video: categories[2].video,
        items: [
            {
                id: "11",
                name: "Салат с бурратой",
                description: "Буратта, микс салата, томаты",
                weight: "230 г",
                price: 590,
                image: require("@/assets/mocks/menu/salats/Салат с бураттой.jpg"),
                calories: 1200,
                carbs: 24,
                fats: 64,
                proteins: 80,
            },
            {
                id: "14",
                name: "Греческий салат",
                description: "Помидоры, огурцы, болгарский перец, лук маслины и оливки, сыр фета",
                weight: "300 г",
                price: 550,
                image: require("@/assets/mocks/menu/salats/Греческий салат.jpg"),
                calories: 1200,
                carbs: 24,
                fats: 64,
                proteins: 80,
            },
            {
                id: "15",
                name: "Салат Капрезе",
                description: "Томаты, базилик, моцарелла",
                weight: "230 г",
                price: 650,
                image: require("@/assets/mocks/menu/salats/Салат капрезе.jpg"),
                calories: 1200,
                carbs: 24,
                fats: 64,
                proteins: 80,
            },
            {
                id: "16",
                name: "Салат из хрустящих баклажанов",
                description: "Салат из хрустящих баклажанов, со спелыми помидорами черри, миксом",
                weight: "320 г",
                price: 890,
                image: require("@/assets/mocks/menu/salats/Салат из хрустящих баклажанов.jpg"),
                calories: 1200,
                carbs: 24,
                fats: 64,
                proteins: 80,
            },
            {
                id: "116",
                name: "Свежий салат",
                description: "Помидоры, огурцы, лук",
                weight: "320 г",
                price: 890,
                image: require("@/assets/mocks/menu/salats/Свежий салат.jpg"),
                calories: 1200,
                carbs: 24,
                fats: 64,
                proteins: 80,
            },
        ],
    },
];


export const Organizations: Organization[] = [
    {
        id: "fazenda",
        name: "Fazenda",
        city: "г. Грозный",
        address: "ул. Светлая улица, 105А",
        schedule: "Ежедневно с 11:30 до 02:30",
        phone: "+7 (928) 340-50-50",
        intro: "Команда Mangal Clubs переосмысливает приватность и комфорт. Здесь современное гостеприимство встречается с камерной атмосферой, а каждая кабинка становится уютным местом для встреч с близкими.",
        coordinates: {
            latitude: 43.359307,
            longitude: 45.697802,
            accuracy: null,
        },
    },
    {
        id: "mangal-club",
        name: "Mangal Club",
        city: "г. Грозный",
        address: "ул. Окраинная, 4",
        schedule: "Ежедневно с 10:30 до 01:30",
        phone: "+7 (983) 999-50-50",
        intro: "Команда Mangal Clubs переосмысливает приватность и комфорт. Здесь современное гостеприимство встречается с камерной атмосферой, а каждая кабинка становится уютным местом для встреч с близкими.",
        coordinates: {
            latitude: 43.346346,
            longitude: 45.694209,
            accuracy: null,
        },
    }
];