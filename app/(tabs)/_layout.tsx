import { tabs } from "@/constants/data";
import { colors, components } from "@/constants/theme";
import clsx from "clsx";
import { Tabs } from "expo-router";
import { Image, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TabLayout = () => {
    const insets = useSafeAreaInsets();
    const TabIcon = ({ focused, icon }: TabIconProps) => {
        return (
            <View className="tabs-icon">
                <View className={clsx('tabs-pill', focused && 'tabs-active')}>
                    <Image
                        source={icon}
                        className="tabs-glyph"
                        resizeMode="contain"
                    />
                </View>
            </View>
        );
    };

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle:{
                  position:"absolute",
                  bottom:Math.max(insets.bottom,components.tabBar.horizontalInset),
                  height:components.tabBar.height,
                  backgroundColor:colors.primary,
                  borderRadius:components.tabBar.radius,
                  borderTopWidth:0,
                  elevation:0
                },
                tabBarItemStyle:{
                    paddingVertical: components.tabBar.height/2 - components.tabBar.iconFrame/1.6
                },
                tabBarIconStyle:{
                    width: components.tabBar.iconFrame,
                    height: components.tabBar.iconFrame,
                    alignItems:'center',
                    
                }
            }}
        >
            {tabs.map((tab) => (
                <Tabs.Screen
                    key={tab.name}
                    name={tab.name}
                    options={{
                        title: tab.title,
                        tabBarIcon: ({ focused }) => (
                            <TabIcon focused={focused} icon={tab.icon} />
                        ),
                    }}
                />
            ))}
        </Tabs>
    );
};

export default TabLayout;