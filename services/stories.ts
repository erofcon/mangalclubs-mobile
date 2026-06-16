import {apiFetch, resolveApiAssetUrl} from "@/services/api";
import type {Story} from "@/types/story";

type ApiStorySlide = {
    id: string;
    src?: string | null;
    url?: string | null;
    type?: "image" | "video" | null;
    media_type?: "image" | "video" | null;
    title?: string | null;
    caption?: string | null;
    duration_seconds?: number | null;
    sort_order?: number | null;
};

type ApiStory = {
    id: string;
    slug?: string;
    title?: string;
    previewImage?: string | null;
    preview_url?: string | null;
    description?: string | null;
    slides?: ApiStorySlide[];
    sort_order?: number | null;
};

const normalizeStorySlide = (slide: ApiStorySlide): Story["slides"][number] | null => {
    const src = resolveApiAssetUrl(slide.src ?? slide.url);

    if (!src) {
        return null;
    }

    return {
        id: slide.id,
        src,
        type: slide.type ?? slide.media_type ?? "image",
        durationMs: slide.duration_seconds
            ? slide.duration_seconds * 1000
            : undefined,
    };
};

const normalizeStory = (story: ApiStory): Story | null => {
    const slides = (story.slides ?? [])
        .map(normalizeStorySlide)
        .filter((slide): slide is Story["slides"][number] => Boolean(slide));

    if (slides.length === 0) {
        return null;
    }

    const previewImage =
        resolveApiAssetUrl(story.previewImage ?? story.preview_url) ??
        slides.find((slide) => slide.type === "image")?.src ??
        slides[0]?.poster ??
        slides[0]?.src;

    if (!previewImage) {
        return null;
    }

    return {
        id: story.id,
        slug: story.slug,
        title: story.title,
        previewImage,
        description: story.description,
        slides,
    };
};

export const getStories = async (signal?: AbortSignal) => {
    const stories = await apiFetch<ApiStory[]>("/api/v1/stories", {signal});

    return stories
        .map(normalizeStory)
        .filter((story): story is Story => Boolean(story));
};
