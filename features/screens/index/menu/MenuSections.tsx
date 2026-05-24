import {memo, useCallback, useEffect} from "react";
import {StyleSheet, Text, View, type ImageSourcePropType, type LayoutChangeEvent} from "react-native";
import {LinearGradient} from "expo-linear-gradient";
import {VideoView, useVideoPlayer, type VideoSource} from "expo-video";

import {
    GAP,
    GRID_COLUMNS,
    H_PADDING,
} from "@/features/screens/index/menu/constants";
import {chunkArray} from "@/features/screens/index/menu/menu-utils";
import {ProductCard} from "@/features/screens/index/menu/ProductCard";
import type {Category, MenuCategory, MenuItem} from "@/types/products";
import {SHADOW, themeColors} from "@/utils/theme-colors";

type MenuSectionsProps = {
    categories: MenuCategory[];
    itemsByCategory: Record<string, MenuItem[]>;
    itemWidth: number;
    onCategoryLayout: (categoryId: Category["id"], event: LayoutChangeEvent) => void;
};

export const MenuSections = memo(function MenuSections({
                                                           categories,
                                                           itemsByCategory,
                                                           itemWidth,
                                                           onCategoryLayout,
                                                       }: MenuSectionsProps) {
    const renderCategorySection = useCallback(
        (category: MenuCategory) => {
            const rows = chunkArray(itemsByCategory[category.id] ?? [], GRID_COLUMNS);

            return (
                <View
                    key={category.id}
                    collapsable={false}
                    onLayout={(event) => onCategoryLayout(category.id, event)}
                >
                    <CategoryVideoHeader category={category}/>

                    {rows.map((row, rowIndex) => (
                        <View
                            key={`row-${category.id}-${rowIndex}`}
                            style={[
                                styles.productsRow,
                                rowIndex === 0 && category.video ? styles.productsRowOverVideo : null,
                            ]}
                        >
                            {row.map((item) =>
                                itemWidth > 0 ? (
                                    <ProductCard
                                        key={item.id}
                                        width={itemWidth}
                                        id={item.id}
                                        title={item.name}
                                        description={item.description}
                                        weight={item.weight}
                                        priceFrom={item.price}
                                        image={item.image}
                                    />
                                ) : null
                            )}

                            {Array.from({length: Math.max(0, GRID_COLUMNS - row.length)}).map(
                                (_, index) => (
                                    <View
                                        key={`spacer-${category.id}-${rowIndex}-${index}`}
                                        style={{width: itemWidth}}
                                    />
                                )
                            )}
                        </View>
                    ))}
                </View>
            );
        },
        [itemWidth, itemsByCategory, onCategoryLayout]
    );

    return <>{categories.map(renderCategorySection)}</>;
});

function CategoryVideoHeader({category}: { category: MenuCategory }) {
    if (!category.video) {
        return (
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{category.title}</Text>
            </View>
        );
    }

    return (
        <View style={styles.videoHeader}>
            <CategoryVideo source={category.video}/>

            <LinearGradient
                colors={[
                    "rgba(0,0,0,0.62)",
                    "rgba(0,0,0,0.24)",
                    "rgba(0,0,0,0.18)",
                ]}
                locations={[0, 0.48, 1]}
                style={[StyleSheet.absoluteFill, styles.gradientOverlay]}
            />

            <LinearGradient
                colors={[
                    "rgba(7,8,8,0)",
                    "rgba(7,8,8,0.64)",
                    themeColors.background,
                ]}
                locations={[0, 0.52, 1]}
                style={styles.videoBottomFade}
            />

            <Text style={styles.videoTitle} numberOfLines={2}>
                {category.title}
            </Text>
        </View>
    );
}

function CategoryVideo({source}: { source: ImageSourcePropType }) {
    const player = useVideoPlayer(getVideoSource(source), (videoPlayer) => {
        videoPlayer.loop = true;
        videoPlayer.muted = true;
        videoPlayer.play();
    });

    useEffect(() => {
        player.play();

        return () => {
            player.pause();
        };
    }, [player]);

    return (
        <VideoView
            player={player}
            style={styles.video}
            contentFit="cover"
            nativeControls={false}
            allowsFullscreen={false}
            surfaceType="textureView"
        />
    );
}

function getVideoSource(source: ImageSourcePropType): VideoSource {
    if (typeof source === "number") {
        return {assetId: source};
    }

    if (typeof source === "string" || source === null) {
        return source;
    }

    if (source && !Array.isArray(source) && "uri" in source && typeof source.uri === "string") {
        return {uri: source.uri};
    }

    return null;
}

const styles = StyleSheet.create({
    sectionHeader: {
        paddingHorizontal: H_PADDING,
        marginBottom: 12,
    },
    sectionTitle: {
        color: themeColors.text,
        fontSize: 24,
        fontWeight: "700",
    },
    videoHeader: {
        position: "relative",
        marginBottom: 0,
        aspectRatio: 1.58,
        borderTopRightRadius: 28,
        borderTopLeftRadius: 28,
        overflow: "hidden",
        backgroundColor: themeColors.background,
        ...SHADOW,
    },
    video: {
        width: "100%",
        height: "100%",
    },
    gradientOverlay: {
        pointerEvents: "none",
    },
    videoBottomFade: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: "52%",
        pointerEvents: "none",
    },
    videoTitle: {
        position: "absolute",
        top: 22,
        left: 22,
        right: 22,
        color: themeColors.text,
        fontSize: 24,
        fontFamily: "Point-Bold",
        lineHeight: 27,
    },
    productsRow: {
        flexDirection: "row",
        gap: GAP,
        paddingHorizontal: H_PADDING,
        justifyContent: "center",
        marginBottom: 24,
    },
    productsRowOverVideo: {
        marginTop: -36,
    },
});
