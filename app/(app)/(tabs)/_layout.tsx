import { useAuthSession } from "@/providers/authctx";
import { Entypo } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { Text } from "react-native";

const TabsLayout = () => {
  const { userNameSession, user } = useAuthSession();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#C8F425",
        tabBarStyle: {
          backgroundColor: "#1E1E1E",
          borderTopColor: "#000000",
        },
        headerStyle: { backgroundColor: "black" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: true,
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Entypo name="home" size={30} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="searchPage"
        options={{
          headerShown: true,
          title: "Search",
          tabBarIcon: ({ color, focused }) => (
            <Entypo name="magnifying-glass" size={30} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="[username]"
        initialParams={{
          userName: userNameSession,
          userPicture: user?.photoURL,
        }}
        options={{
          href: `${userNameSession}`,
          headerShown: true,
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Entypo name="user" size={30} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
