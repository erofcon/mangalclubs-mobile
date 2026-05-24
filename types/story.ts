export type Story = {
    id: number | string;
    title?: string;
    previewImage: string;
    slides: {
        id: number | string;
        src: string;
        type: "image" | "video";
        poster?: string;
        durationMs?: number;
    }[];
};