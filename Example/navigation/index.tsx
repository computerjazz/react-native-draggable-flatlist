/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { FontAwesome } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";
import { ColorSchemeName, Pressable } from "react-native";

import Colors from "../constants/Colors";
import useColorScheme from "../hooks/useColorScheme";
import NotFoundScreen from "../screens/NotFoundScreen";
import BasicScreen from "../screens/BasicScreen";
import SwipeableScreen from "../screens/SwipeableScreen";
import {
  RootStackParamList,
  RootTabParamList,
  RootTabScreenProps,
} from "../types";
import LinkingConfiguration from "./LinkingConfiguration";
import NestedScreen from "../screens/NestedScreen";
import HorizontalScreen from "../screens/HorizontalScreen";

export default function Navigation({
  colorScheme,
}: {
  colorScheme: ColorSchemeName;
}) {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Root"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */
const BottomTab = createBottomTabNavigator<RootTabParamList>();

function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator
      initialRouteName="Basic"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
      }}
    >
      <BottomTab.Screen
        name="Basic"
        component={BasicScreen}
        options={({ navigation }: RootTabScreenProps<"Basic">) => ({
          title: "Basic",
          tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
        })}
      />
      <BottomTab.Screen
        name="Swipeable"
        component={SwipeableScreen}
        options={{
          title: "Swipeable",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="hand-o-left" color={color} />
          ),
        }}
      />
      <BottomTab.Screen
        name="Nested"
        component={NestedScreen}
        options={{
          title: "Nested",
          tabBarIcon: ({ color }) => <TabBarIcon name="indent" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="Horizontal"
        component={HorizontalScreen}
        options={{
          title: "Horizontal",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="arrows-h" color={color} />
          ),
        }}
      />
    </BottomTab.Navigator>
  );
}

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={30} style={{ marginBottom: -3 }} {...props} />;
}
