
import {Text, TextProps} from "react-native";

export function RegularText({style, ...props}: TextProps) {
    return (
        <Text
            {...props}
            style={[{fontFamily: "Point-Regular"}, style]}
        />
    );
}