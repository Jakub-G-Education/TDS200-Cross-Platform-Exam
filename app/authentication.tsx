import { useAuthSession } from "@/providers/authctx";
import { useState } from "react";
import * as authApi from "@/api/authApi";
import {
  StyleSheet,
  Image,
  Text,
  TextInput,
  View,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Entypo } from "@expo/vector-icons";

const Authentication = () => {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");

  const [image, setImage] = useState("");

  const [isSignUp, setIsSignUp] = useState(false);

  const [loading, setLoading] = useState(false);

  const { signIn } = useAuthSession();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    //Main View
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor: "black",
      }}
    >
      {/* Logo View */}
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
          paddingLeft: 20,
        }}
      >
        <Image
          source={require("../assets/images/artvista.png")}
          resizeMode="contain"
          style={{
            width: 70,
            height: 70,
          }}
        />
        <Text
          style={[
            styles.white,
            {
              alignItems: "center",
              fontSize: 40,
              fontWeight: "bold",
            },
          ]}
        >
          ArtVista
        </Text>
      </View>

      {/* Main Container View */}
      <ScrollView
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={{
          width: "100%",
          height: "100%",
          alignItems: "center",
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <View style={styles.mainContainer}>
          <Text style={[styles.white, { fontSize: 25, fontWeight: "500" }]}>
            {isSignUp ? "Sign up to ArtVista" : "Log in to ArtVista"}
          </Text>
          {isSignUp && (
            <View style={styles.textFieldContainer}>
              <Text style={styles.textFieldTitle}>Profile picture</Text>
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Pressable onPress={() => pickImage()} style={styles.avatar}>
                  {image ? (
                    <Image
                      source={{ uri: image }}
                      style={{
                        width: "100%",
                        aspectRatio: 1,
                      }}
                    />
                  ) : (
                    <Entypo name="user" size={100} color={"#E7ECD7"} />
                  )}
                </Pressable>
              </View>
              <View style={styles.textFieldContainer}>
                <Text style={styles.textFieldTitle}>Username</Text>
                <TextInput
                  value={userName}
                  onChangeText={setUserName}
                  style={[styles.white, styles.textField]}
                />
              </View>
            </View>
          )}

          <View style={styles.textFieldContainer}>
            <Text style={styles.textFieldTitle}>Email</Text>
            <TextInput
              value={userEmail}
              onChangeText={setUserEmail}
              style={[styles.white, styles.textField]}
            />
          </View>

          <View style={styles.textFieldContainer}>
            <Text style={styles.textFieldTitle}>Password</Text>
            <TextInput
              value={password}
              secureTextEntry={true}
              onChangeText={setPassword}
              style={[styles.white, styles.textField]}
            />
          </View>

          <Pressable
            style={styles.button}
            onPress={() => {
              if (isSignUp) {
                authApi.signUp(
                  userEmail,
                  password,
                  userName.toLowerCase(),
                  image
                );
                setLoading(true);
              } else {
                {
                  signIn(userEmail, password);
                  setLoading(true);
                }
              }
            }}
          >
            {!loading ? (
              <Text style={styles.buttonTitle}>
                {isSignUp ? "Sign Up" : "Log In"}
              </Text>
            ) : (
              <ActivityIndicator size={"small"} color={"black"} />
            )}
          </Pressable>

          <Pressable
            style={[styles.textFieldContainer, { alignItems: "center" }]}
            onPress={() => {
              setIsSignUp(!isSignUp);
            }}
          >
            <Text style={styles.textFieldTitle}>
              {!isSignUp ? "Don´t have account? " : "Already have account? "}
              <Text style={styles.signUpText}>
                {!isSignUp ? "Sign Up" : "Log In"}
              </Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Authentication;

const styles = StyleSheet.create({
  white: {
    color: "#E7ECD7",
  },
  mainContainer: {
    justifyContent: "center",
    alignItems: "flex-start",
    paddingHorizontal: 30,
    width: "100%",
    height: "100%",
  },
  textFieldContainer: {
    width: "100%",
    paddingTop: 20,
  },
  textFieldTitle: {
    fontSize: 20,
    color: "#E7ECD7",
  },
  textField: {
    width: "100%",
    borderWidth: 1,
    padding: 10,
    marginTop: 10,
    borderColor: "gray",
    borderRadius: 15,
    backgroundColor: "#1E1E1E",
    fontSize: 20,
  },
  signUpText: {
    fontWeight: "bold",
    color: "#C8F425",
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 40,
    paddingVertical: 10,
    width: "100%",
    backgroundColor: "#C8F425",
    borderRadius: 15,
  },
  buttonTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E1E1E",
  },
  avatar: {
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    aspectRatio: 1,
    borderRadius: "100%",
    borderWidth: 2,
    borderColor: "#C8F425",
    overflow: "hidden",
    marginVertical: 10,
  },
});
