export type Story = {
    id: number | string;
    slug?: string;
    title?: string;
    previewImage: string;
    description?: string | null;
    slides: {
        id: number | string;
        src: string;
        type: "image" | "video";
        poster?: string;
        durationMs?: number;
    }[];
};
