import { useAuthSession } from "@/providers/authctx";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";

export default function AppLayout() {
  const { userNameSession, isLoading, user } = useAuthSession();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Loading..</Text>
        <ActivityIndicator size="large" color="#C8F425" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href={"/authentication"} />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
          title: "Back",
          animation: "slide_from_left",
        }}
      />
      <Stack.Screen
        name="artPostDetails/[id]"
        options={{
          headerStyle: { backgroundColor: "black" },
        }}
      />
    </Stack>
  );
}
