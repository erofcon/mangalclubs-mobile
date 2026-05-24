import {PropsWithChildren} from 'react';
import {Platform, StyleProp, View, ViewStyle} from 'react-native';
import {Edge, SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '@react-navigation/native';

type Props = PropsWithChildren<{
    style?: StyleProp<ViewStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
    withTopInset?: boolean;
    edges?: readonly Edge[];
}>;

const DEFAULT_EDGES: readonly Edge[] = ['left', 'right', 'bottom'];
const ALL_EDGES: readonly Edge[] = ['top', 'left', 'right', 'bottom'];
const MAX_WEB_WIDTH = 430;

export function Screen({
                           children,
                           style,
                           contentContainerStyle,
                           withTopInset = false,
                           edges,
                       }: Props) {
    const {colors} = useTheme();

    const safeAreaEdges = edges ?? (withTopInset ? ALL_EDGES : DEFAULT_EDGES);

    const baseStyle: ViewStyle = {
        flex: 1,
        backgroundColor: colors.background,
    };

    const webCenteredStyle: ViewStyle | undefined = Platform.OS === 'web'
        ? {
            width: '100%',
            maxWidth: MAX_WEB_WIDTH,
            alignSelf: 'center',
        }
        : undefined;

    return (
        <SafeAreaView edges={safeAreaEdges} style={[baseStyle, webCenteredStyle, style]}>
            <View style={[{flex: 1}, contentContainerStyle]}>
                {children}
            </View>
        </SafeAreaView>
    );
}