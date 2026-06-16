import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";

import {Image} from "expo-image";
import {Feather} from "@expo/vector-icons";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
    Extrapolation,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import {useQuery} from "@tanstack/react-query";
import {VideoView, useVideoPlayer} from "expo-video";

import {getStories} from "@/services/stories";
import {Story} from "@/types/story";
import {SHADOW, themeColors} from "@/utils/theme-colors";

const DEFAULT_IMAGE_DURATION = 5000;
const STORY_SWIPE_DISTANCE = 56;
const STORY_CLOSE_DISTANCE = 110;
const STORY_AXIS_RATIO = 1.15;
const STORY_DRAG_START_DISTANCE = 12;
const STORY_SETTLE_DURATION = 190;

function resolveStoryImage(src?: string) {
    if (!src) return undefined;
    return {uri: src};
}

export function Stories() {
    const insets = useSafeAreaInsets();
    const {width} = useWindowDimensions();
    const {data: stories = []} = useQuery({
        queryKey: ["stories"],
        queryFn: ({signal}) => getStories(signal),
    });

    const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isMediaLoading, setIsMediaLoading] = useState(false);
    const [hasMediaError, setHasMediaError] = useState(false);

    const elapsedRef = useRef(0);
    const isSwitchingRef = useRef(false);
    const suppressTapRef = useRef(false);
    const stripX = useSharedValue(0);
    const dragY = useSharedValue(0);
    const gestureAxis = useSharedValue<0 | 1 | 2>(0);
    const activeStoryIndexValue = useSharedValue(0);

    const activeStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;
    const activeSlide = activeStory?.slides[activeSlideIndex] ?? null;

    const resetSlideState = useCallback(() => {
        elapsedRef.current = 0;
        setProgress(0);
        setIsPaused(false);
        setIsMediaLoading(false);
        setHasMediaError(false);
    }, []);

    const close = useCallback(() => {
        setActiveStoryIndex(null);
        setActiveSlideIndex(0);
        setProgress(0);
        setIsPaused(false);
        setIsMediaLoading(false);
        setHasMediaError(false);
        isSwitchingRef.current = false;
        suppressTapRef.current = false;
        gestureAxis.value = 0;
        stripX.value = 0;
        dragY.value = 0;
    }, [dragY, gestureAxis, stripX]);

    const openStory = useCallback((index: number) => {
        Haptics.selectionAsync().catch(() => {});
        resetSlideState();
        activeStoryIndexValue.value = index;
        stripX.value = -index * width;
        setActiveStoryIndex(index);
        setActiveSlideIndex(0);
    }, [activeStoryIndexValue, resetSlideState, stripX, width]);

    const commitStorySwitch = useCallback((targetIndex: number) => {
        resetSlideState();
        activeStoryIndexValue.value = targetIndex;
        setActiveStoryIndex(targetIndex);
        setActiveSlideIndex(0);
        isSwitchingRef.current = false;

        window.setTimeout(() => {
            suppressTapRef.current = false;
        }, 80);
    }, [activeStoryIndexValue, resetSlideState]);

    const markGestureStarted = useCallback(() => {
        setIsPaused(true);
        suppressTapRef.current = true;
    }, []);

    const markGestureFinished = useCallback(() => {
        setIsPaused(false);

        window.setTimeout(() => {
            suppressTapRef.current = false;
        }, 80);
    }, []);

    const markStorySwitching = useCallback(() => {
        isSwitchingRef.current = true;
        suppressTapRef.current = true;
    }, []);

    const goNext = useCallback(() => {
        if (!activeStory || activeStoryIndex === null || isSwitchingRef.current) return;

        if (activeSlideIndex < activeStory.slides.length - 1) {
            resetSlideState();
            setActiveSlideIndex((value) => value + 1);
            return;
        }

        if (activeStoryIndex < stories.length - 1) {
            const targetIndex = activeStoryIndex + 1;

            resetSlideState();
            activeStoryIndexValue.value = targetIndex;
            stripX.value = -targetIndex * width;
            setActiveStoryIndex(targetIndex);
            setActiveSlideIndex(0);
            return;
        }

        close();
    }, [activeSlideIndex, activeStory, activeStoryIndex, activeStoryIndexValue, close, resetSlideState, stories.length, stripX, width]);

    const goPrev = useCallback(() => {
        if (!activeStory || activeStoryIndex === null || isSwitchingRef.current) return;

        if (activeSlideIndex > 0) {
            resetSlideState();
            setActiveSlideIndex((value) => value - 1);
            return;
        }

        if (activeStoryIndex > 0) {
            const targetIndex = activeStoryIndex - 1;
            const previousStory = stories[activeStoryIndex - 1];

            resetSlideState();
            activeStoryIndexValue.value = targetIndex;
            stripX.value = -targetIndex * width;
            setActiveStoryIndex(targetIndex);
            setActiveSlideIndex(previousStory.slides.length - 1);
        }
    }, [activeSlideIndex, activeStory, activeStoryIndex, activeStoryIndexValue, resetSlideState, stories, stripX, width]);

    const panGesture = useMemo(() => Gesture.Pan()
        .minDistance(STORY_DRAG_START_DISTANCE)
        .onBegin(() => {
            gestureAxis.value = 0;
            runOnJS(markGestureStarted)();
        })
        .onUpdate((event) => {
            const activeIndex = activeStoryIndexValue.value;
            const baseX = -activeIndex * width;
            const absoluteX = Math.abs(event.translationX);
            const absoluteY = Math.abs(event.translationY);

            if (gestureAxis.value === 0) {
                if (absoluteX > absoluteY * STORY_AXIS_RATIO) {
                    gestureAxis.value = 1;
                } else if (
                    event.translationY > 0 &&
                    absoluteY > absoluteX * STORY_AXIS_RATIO
                ) {
                    gestureAxis.value = 2;
                } else {
                    return;
                }
            }

            if (gestureAxis.value === 2) {
                dragY.value = Math.max(0, event.translationY);
                stripX.value = baseX;
                return;
            }

            const isPastFirstStory = activeIndex === 0 && event.translationX > 0;
            const isPastLastStory =
                activeIndex === stories.length - 1 && event.translationX < 0;
            const dampedX = isPastFirstStory || isPastLastStory
                ? event.translationX * 0.22
                : event.translationX;

            stripX.value = baseX + dampedX;
            dragY.value = 0;
        })
        .onEnd((event) => {
            const activeIndex = activeStoryIndexValue.value;
            const baseX = -activeIndex * width;
            const absoluteX = Math.abs(event.translationX);
            const absoluteY = Math.abs(event.translationY);

            if (
                gestureAxis.value === 2 &&
                event.translationY > STORY_CLOSE_DISTANCE &&
                absoluteY > absoluteX
            ) {
                runOnJS(close)();
                return;
            }

            if (
                gestureAxis.value === 1 &&
                event.translationX < -STORY_SWIPE_DISTANCE &&
                absoluteX > absoluteY * STORY_AXIS_RATIO &&
                activeIndex < stories.length - 1
            ) {
                const targetIndex = activeIndex + 1;

                runOnJS(markStorySwitching)();
                stripX.value = withTiming(
                    -targetIndex * width,
                    {duration: STORY_SETTLE_DURATION},
                    (finished) => {
                        if (finished) {
                            dragY.value = 0;
                            gestureAxis.value = 0;
                            runOnJS(commitStorySwitch)(targetIndex);
                        }
                    }
                );
                return;
            }

            if (
                gestureAxis.value === 1 &&
                event.translationX > STORY_SWIPE_DISTANCE &&
                absoluteX > absoluteY * STORY_AXIS_RATIO &&
                activeIndex > 0
            ) {
                const targetIndex = activeIndex - 1;

                runOnJS(markStorySwitching)();
                stripX.value = withTiming(
                    -targetIndex * width,
                    {duration: STORY_SETTLE_DURATION},
                    (finished) => {
                        if (finished) {
                            dragY.value = 0;
                            gestureAxis.value = 0;
                            runOnJS(commitStorySwitch)(targetIndex);
                        }
                    }
                );
                return;
            }

            stripX.value = withSpring(baseX, {damping: 22, stiffness: 260});
            dragY.value = withSpring(0, {damping: 22, stiffness: 260});
            gestureAxis.value = 0;
            runOnJS(markGestureFinished)();
        })
        .onFinalize((_event, success) => {
            if (!success) {
                const baseX = -activeStoryIndexValue.value * width;

                stripX.value = withSpring(baseX, {damping: 22, stiffness: 260});
                dragY.value = withSpring(0, {damping: 22, stiffness: 260});
                gestureAxis.value = 0;
                runOnJS(markGestureFinished)();
            }
        }), [
        activeStoryIndexValue,
        close,
        commitStorySwitch,
        dragY,
        gestureAxis,
        markGestureFinished,
        markGestureStarted,
        markStorySwitching,
        stories.length,
        stripX,
        width,
    ]);

    const tapGesture = useMemo(() => Gesture.Tap()
        .maxDuration(220)
        .maxDistance(10)
        .onEnd((event, success) => {
            if (!success) return;

            const topControlsHeight = insets.top + 78;

            if (event.y <= topControlsHeight) return;

            if (event.x < width * 0.42) {
                runOnJS(goPrev)();
                return;
            }

            runOnJS(goNext)();
        }), [goNext, goPrev, insets.top, width]);

    const storyGesture = useMemo(
        () => Gesture.Exclusive(panGesture, tapGesture),
        [panGesture, tapGesture]
    );

    useEffect(() => {
        if (
            !activeStory ||
            !activeSlide ||
            activeSlide.type === "video" ||
            isPaused ||
            isMediaLoading ||
            hasMediaError
        ) return;

        const duration = activeSlide.durationMs ?? DEFAULT_IMAGE_DURATION;
        const startedAt = Date.now();
        const startElapsed = elapsedRef.current;

        const timerId = window.setInterval(() => {
            const elapsed = startElapsed + Date.now() - startedAt;
            elapsedRef.current = elapsed;

            const nextProgress = Math.min((elapsed / duration) * 100, 100);
            setProgress(nextProgress);

            if (nextProgress >= 100) {
                window.clearInterval(timerId);
                goNext();
            }
        }, 40);

        return () => window.clearInterval(timerId);
    }, [activeSlide, activeStory, goNext, hasMediaError, isMediaLoading, isPaused]);

    const viewerAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            {translateY: dragY.value},
            {
                scale: interpolate(
                    dragY.value,
                    [0, 220],
                    [1, 0.86],
                    Extrapolation.CLAMP
                ),
            },
        ],
    }));

    const stripAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{translateX: stripX.value}],
    }));

    const backdropAnimatedStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            dragY.value,
            [0, 220],
            [1, 0.25],
            Extrapolation.CLAMP
        ),
    }));

    useEffect(() => {
        if (activeStoryIndex === null || isSwitchingRef.current) return;

        activeStoryIndexValue.value = activeStoryIndex;
        stripX.value = -activeStoryIndex * width;
    }, [activeStoryIndex, activeStoryIndexValue, stripX, width]);

    useEffect(() => {
        if (activeStoryIndex !== null && activeStoryIndex >= stories.length) {
            close();
        }
    }, [activeStoryIndex, close, stories.length]);

    if (stories.length === 0) {
        return null;
    }

    return (
        <>
            <View style={styles.section}>
                <FlatList
                    horizontal
                    data={stories}
                    keyExtractor={(item) => String(item.id)}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    renderItem={({item, index}) => (
                        <StoryPreview
                            story={item}
                            index={index}
                            onPress={() => openStory(index)}
                            bannerWidth={Math.min(width * 0.82, 340)}
                        />
                    )}
                />
            </View>

            <Modal
                visible={activeStory !== null}
                transparent={false}
                animationType="fade"
                presentationStyle="fullScreen"
                statusBarTranslucent
                onRequestClose={close}
            >
                <GestureHandlerRootView style={styles.modal}>
                    <Animated.View style={[styles.backdrop, backdropAnimatedStyle]} />
                    <PreloadedStoryImages stories={stories} />

                    {activeStory && activeSlide && (
                        <GestureDetector gesture={storyGesture}>
                            <Animated.View style={[styles.viewer, viewerAnimatedStyle]}>
                                <Animated.View
                                    style={[
                                        styles.storyStrip,
                                        {width: width * stories.length},
                                        stripAnimatedStyle,
                                    ]}
                                >
                                    {stories.map((story, index) => (
                                        <StoryMediaPanel
                                            key={String(story.id)}
                                            story={story}
                                            width={width}
                                            slideIndex={index === activeStoryIndex ? activeSlideIndex : 0}
                                            isActive={index === activeStoryIndex}
                                            isPaused={isPaused}
                                            onLoadStart={index === activeStoryIndex ? () => {
                                                setIsMediaLoading(true);
                                                setHasMediaError(false);
                                            } : undefined}
                                            onLoadEnd={index === activeStoryIndex ? () => setIsMediaLoading(false) : undefined}
                                            onError={index === activeStoryIndex ? () => {
                                                setIsMediaLoading(false);
                                                setHasMediaError(true);
                                            } : undefined}
                                            onEnd={index === activeStoryIndex ? goNext : undefined}
                                            onProgress={index === activeStoryIndex ? setProgress : undefined}
                                        />
                                    ))}
                                </Animated.View>

                                <View style={[styles.topLayer, {paddingTop: insets.top + 8}]}>
                                    <View style={styles.progressRow}>
                                        {activeStory.slides.map((slide, index) => (
                                            <View key={String(slide.id)} style={styles.progressTrack}>
                                                <View
                                                    style={[
                                                        styles.progressFill,
                                                        {
                                                            width:
                                                                index < activeSlideIndex
                                                                    ? "100%"
                                                                    : index === activeSlideIndex
                                                                        ? `${progress}%`
                                                                        : "0%",
                                                        },
                                                    ]}
                                                />
                                            </View>
                                        ))}
                                    </View>

                                    <View style={styles.headerRow}>
                                        <Text style={styles.viewerTitle} numberOfLines={1}>
                                            {activeStory.title}
                                        </Text>

                                        <Pressable
                                            onPress={close}
                                            hitSlop={12}
                                            style={styles.closeButton}
                                        >
                                            <Feather name="x" size={26} color="#fff" />
                                        </Pressable>
                                    </View>
                                </View>

                                {hasMediaError && (
                                    <View style={styles.loadingLayer} pointerEvents="none">
                                        <Text style={styles.errorText}>
                                            Не удалось загрузить изображение
                                        </Text>
                                    </View>
                                )}
                            </Animated.View>
                        </GestureDetector>
                    )}
                </GestureHandlerRootView>
            </Modal>
        </>
    );
}

function StoryMediaPanel({
                             story,
                             width,
                             slideIndex,
                             isActive,
                             isPaused,
                             onLoadStart,
                             onLoadEnd,
                             onError,
                             onEnd,
                             onProgress,
                         }: {
    story: Story;
    width: number;
    slideIndex: number;
    isActive: boolean;
    isPaused: boolean;
    onLoadStart?: () => void;
    onLoadEnd?: () => void;
    onError?: () => void;
    onEnd?: () => void;
    onProgress?: (progress: number) => void;
}) {
    const slide = story?.slides[slideIndex] ?? story?.slides[0] ?? null;

    return (
        <View style={[styles.storyPanel, {width}]}>
            {slide?.type === "video" ? (
                <StoryVideo
                    key={`${story.id}-${slide.id}`}
                    slide={slide}
                    isActive={isActive}
                    isPaused={isPaused}
                    onLoadStart={onLoadStart}
                    onLoadEnd={onLoadEnd}
                    onError={onError}
                    onEnd={onEnd}
                    onProgress={onProgress}
                />
            ) : slide ? (
                <Image
                    key={`${story.id}-${slide.id}`}
                    source={resolveStoryImage(slide.src ?? slide.poster)}
                    style={styles.media}
                    contentFit="contain"
                    transition={0}
                    cachePolicy="memory-disk"
                    recyclingKey={`${story.id}-${slide.id}`}
                    onLoadStart={onLoadStart}
                    onLoadEnd={onLoadEnd}
                    onError={onError}
                />
            ) : null}
        </View>
    );
}

function StoryVideo({
                        slide,
                        isActive,
                        isPaused,
                        onLoadStart,
                        onLoadEnd,
                        onError,
                        onEnd,
                        onProgress,
                    }: {
    slide: Story["slides"][number];
    isActive: boolean;
    isPaused: boolean;
    onLoadStart?: () => void;
    onLoadEnd?: () => void;
    onError?: () => void;
    onEnd?: () => void;
    onProgress?: (progress: number) => void;
}) {
    const player = useVideoPlayer(
        {uri: slide.src, useCaching: true},
        (videoPlayer) => {
            videoPlayer.loop = false;
            videoPlayer.muted = false;
            videoPlayer.timeUpdateEventInterval = 0.25;
        }
    );

    useEffect(() => {
        if (!isActive || isPaused) {
            player.pause();
            return;
        }

        player.play();
    }, [isActive, isPaused, player]);

    useEffect(() => {
        if (!isActive) {
            player.pause();
            player.currentTime = 0;
        }
    }, [isActive, player]);

    useEffect(() => {
        const statusSubscription = player.addListener("statusChange", ({status}) => {
            if (status === "loading") {
                onLoadStart?.();
                return;
            }

            if (status === "readyToPlay") {
                onLoadEnd?.();
                return;
            }

            if (status === "error") {
                onError?.();
            }
        });
        const endSubscription = player.addListener("playToEnd", () => {
            onProgress?.(100);
            onEnd?.();
        });
        const timeSubscription = player.addListener("timeUpdate", ({currentTime}) => {
            const durationSeconds =
                slide.durationMs ? slide.durationMs / 1000 : player.duration;

            if (durationSeconds > 0) {
                onProgress?.(Math.min((currentTime / durationSeconds) * 100, 100));
            }
        });

        return () => {
            statusSubscription.remove();
            endSubscription.remove();
            timeSubscription.remove();
        };
    }, [onEnd, onError, onLoadEnd, onLoadStart, onProgress, player, slide.durationMs]);

    return (
        <VideoView
            player={player}
            style={styles.media}
            contentFit="contain"
            nativeControls={false}
            allowsFullscreen={false}
            allowsPictureInPicture={false}
            onFirstFrameRender={onLoadEnd}
        />
    );
}

function PreloadedStoryImages({stories}: {stories: Story[]}) {
    return (
        <View pointerEvents="none" style={styles.preloadLayer}>
            {stories.flatMap((story) => [
                story.previewImage,
                ...story.slides
                    .filter((slide) => slide.type === "image")
                    .map((slide) => slide.src),
                ...story.slides.map((slide) => slide.poster).filter(Boolean),
            ]).map((src, index) => (
                <Image
                    key={`${src}-${index}`}
                    source={resolveStoryImage(src)}
                    style={styles.preloadImage}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                />
            ))}
        </View>
    );
}

function StoryPreview({
                          story,
                          index,
                          onPress,
                          bannerWidth,
                      }: {
    story: Story;
    index: number;
    onPress: () => void;
    bannerWidth: number;
}) {
    return (
        <Pressable
            onPress={onPress}
            style={({pressed}) => [
                styles.preview,
                index === 0 && styles.firstPreview,
                pressed && styles.previewPressed,
                {width: bannerWidth},
            ]}
        >
            <View style={[styles.banner, {width: bannerWidth}]}>
                <Image
                    source={resolveStoryImage(story.previewImage)}
                    style={styles.bannerImage}
                    contentFit="cover"
                    transition={180}
                    cachePolicy="memory-disk"
                />

                <View style={styles.bannerOverlay} />

                <View style={styles.bannerContent}>
                    <View style={styles.bannerBottomRow}>
                        <Text style={styles.bannerTitle} numberOfLines={2}>
                            {story.title}
                        </Text>
                    </View>
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    storiesTitle: {
        color: themeColors.text,
        fontSize: 20,
        lineHeight: 24,
        fontFamily: "Point-Bold",
        paddingHorizontal: 12,
    },

    section: {
        paddingTop: 13,
        paddingBottom: 18,
        paddingHorizontal: 12,
    },
    listContent: {
        paddingHorizontal: 0,
    },

    preview: {
        marginRight: 12,
        alignItems: "center",
    },
    firstPreview: {
        marginLeft: 0,
    },
    previewPressed: {
        opacity: 0.9,
        transform: [{scale: 0.985}],
    },

    banner: {
        height: 200,
        borderRadius: 24,
        overflow: "hidden",
        backgroundColor: themeColors.card,
        borderWidth: 1.5,
        borderColor: themeColors.cardBorder,
        ...SHADOW,
    },
    bannerImage: {
        ...StyleSheet.absoluteFillObject,
        width: "100%",
        height: "100%",
    },
    bannerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.30)",
    },
    bannerContent: {
        flex: 1,
        paddingHorizontal: 14,
        paddingVertical: 14,
        justifyContent: "flex-end",
    },
    bannerTopRow: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
    },
    bannerPill: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.18)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.22)",
    },
    bannerPillText: {
        color: "#fff",
        fontFamily: "Point-SemiBold",
        fontSize: 12,
        lineHeight: 14,
    },
    bannerBottomRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 12,
    },
    bannerTitle: {
        flex: 1,
        color: "#fff",
        fontFamily: "Point-Bold",
        fontSize: 18,
        lineHeight: 22,
        textShadowColor: "rgba(0,0,0,0.45)",
        textShadowOffset: {width: 0, height: 1},
        textShadowRadius: 4,
    },
    bannerAction: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.18)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.20)",
    },

    modal: {
        flex: 1,
        backgroundColor: "#000",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#000",
    },
    viewer: {
        ...StyleSheet.absoluteFillObject,
        overflow: "hidden",
        backgroundColor: "#000",
    },
    storyStrip: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        flexDirection: "row",
        backgroundColor: "#000",
    },
    storyPanel: {
        height: "100%",
        overflow: "hidden",
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
    },
    media: {
        width: "100%",
        height: "100%",
    },
    preloadLayer: {
        position: "absolute",
        left: -2,
        top: -2,
        width: 1,
        height: 1,
        opacity: 0,
        overflow: "hidden",
    },
    preloadImage: {
        width: 1,
        height: 1,
    },
    topLayer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 30,
        paddingHorizontal: 10,
    },
    progressRow: {
        flexDirection: "row",
        gap: 4,
    },
    progressTrack: {
        flex: 1,
        height: 3,
        borderRadius: 999,
        overflow: "hidden",
        backgroundColor: "rgba(255,255,255,0.35)",
    },
    progressFill: {
        height: "100%",
        borderRadius: 999,
        backgroundColor: "#fff",
    },
    headerRow: {
        marginTop: 12,
        minHeight: 44,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },
    viewerTitle: {
        flex: 1,
        color: "#fff",
        fontFamily: "Point-SemiBold",
        fontSize: 16,
        lineHeight: 20,
        textShadowColor: "rgba(0,0,0,0.65)",
        textShadowOffset: {width: 0, height: 1},
        textShadowRadius: 4,
    },
    closeButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.35)",
    },
    loadingLayer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.28)",
    },
    errorText: {
        color: "#fff",
        fontFamily: "Point-Regular",
        fontSize: 14,
    },
});
