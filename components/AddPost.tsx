import { useAuthSession } from "@/providers/authctx";
import { ArtPostData } from "@/utils/artPostData";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import * as artApi from "@/api/artApi";
import * as Location from "expo-location";
import { Entypo } from "@expo/vector-icons";
import CameraModal from "./CameraModal";

type AddPostProps = {
  addNewPost: () => void;
  closeModal: () => void;
};

export default function AddPost({ addNewPost, closeModal }: AddPostProps) {
  const [titleText, setTitleText] = useState("");
  const [descriptionText, setDescriptionText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { userNameSession, user } = useAuthSession();

  const [location, setLocation] =
    useState<Location.LocationGeocodedAddress | null>(null);
  const postCoordinatesData = useRef<Location.LocationObjectCoords | null>(
    null
  );

  const getLocation = async () => {
    let locationPermission = await Location.requestForegroundPermissionsAsync();
    if (!locationPermission.granted) {
      return;
    } else {
      let location = await Location.getCurrentPositionAsync();
      postCoordinatesData.current = location.coords;
      const locationAddress = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setLocation(locationAddress[0]);
    }
  };

  useEffect(() => {
    getLocation();
  });

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
      >
        <Modal visible={isCameraOpen} animationType="slide" transparent={true}>
          <CameraModal
            closeModal={() => {
              setIsCameraOpen(false);
              getLocation();
            }}
            setImage={setImage}
          />
        </Modal>
        <View style={styles.topContainer}>
          <Pressable style={styles.backButton} onPress={() => closeModal()}>
            <Text style={[styles.buttonText, styles.white]}>Cancel</Text>
          </Pressable>
          <Image
            source={require("../assets/images/artvista.png")}
            resizeMode="contain"
            style={{
              width: 50,
              height: 50,
            }}
          />
          <Pressable
            style={styles.addButton}
            onPress={async () => {
              setLoading(true);
              if (!image || !titleText || !descriptionText) {
                Alert.alert(
                  "Post not added",
                  "Please fill out all fields and select a image"
                );
                return;
              }
              const newPost: ArtPostData = {
                id: `postname-${titleText}`,
                title: titleText,
                description: descriptionText,
                author: userNameSession || "",
                isLiked: false,
                likes: [],
                imageURL: image || "",
                comments: [],
                postCoordinates: postCoordinatesData.current,
                date: new Date().toISOString(),
                authorPicture: user?.photoURL || "",
              };

              console.log("Post adding in progress");
              await artApi.createArtPost(newPost);
              console.log("Post added.");
              addNewPost(), setTitleText("");
              setDescriptionText("");
              setLoading(false);
            }}
          >
            {loading ? (
              <ActivityIndicator size={"small"} color={"black"} />
            ) : (
              <Text style={styles.buttonText}>Add Post</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.imageContainer}>
          <Pressable onPress={() => setIsCameraOpen(true)} style={styles.image}>
            {image ? (
              <Image
                source={{ uri: image }}
                style={{
                  resizeMode: "center",
                  width: "100%",
                  aspectRatio: 1,
                }}
              />
            ) : (
              <View style={styles.addImageButton}>
                <Entypo name="folder-images" size={64} color={"#4a4a4a"} />
                <Entypo
                  style={{ position: "relative", right: -30, bottom: 30 }}
                  name="plus"
                  size={40}
                  color={"#C8F425"}
                />
              </View>
            )}
          </Pressable>
        </View>

        <View>
          <Text style={styles.locationContainer}>
            {location?.city}, {location?.country}
          </Text>
        </View>

        <View>
          <TextInput
            onChangeText={setTitleText}
            value={titleText}
            maxLength={32}
            style={styles.inputContainer}
            placeholder="Artwork title.."
            placeholderTextColor={"#4a4a4a"}
          />
          <Text style={styles.lengthText}>{titleText.length}/32</Text>
        </View>

        <View>
          <TextInput
            style={[styles.inputContainer, styles.descriptionContainer]}
            multiline={true}
            maxLength={255}
            numberOfLines={4}
            onChangeText={setDescriptionText}
            value={descriptionText}
            placeholder="Describe this piece of art.."
            placeholderTextColor={"#4a4a4a"}
          />
          <Text style={styles.lengthText}>{descriptionText.length}/255</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    height: "100%",
    paddingTop: 40,
    backgroundColor: "black",
  },
  topContainer: {
    justifyContent: "space-between",
    flexDirection: "row",
    paddingHorizontal: 5,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderColor: "#4a4a4a",
  },
  backButton: {
    justifyContent: "center",
    alignItems: "center",
    width: "30%",
    paddingVertical: 20,
  },
  addButton: {
    justifyContent: "center",
    alignItems: "center",
    width: "30%",
    paddingVertical: 10,
    marginVertical: 10,
    backgroundColor: "#C8F425",
    borderRadius: 100,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
  white: {
    color: "#E7ECD7",
  },
  inputContainer: {
    marginHorizontal: 15,
    marginTop: 30,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderColor: "#4a4a4a",
    color: "#E7ECD7",
    fontSize: 18,
  },
  descriptionContainer: {
    height: 140,
  },
  lengthText: {
    position: "absolute",
    right: 3,
    bottom: 3,
    color: "#4a4a4a",
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 15,
    marginTop: 30,
    borderWidth: 1,
    borderColor: "#4a4a4a",
  },
  addImageButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    paddingHorizontal: 50,
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    justifyContent: "center",
  },
  locationContainer: {
    flexDirection: "row",
    marginHorizontal: 15,
    marginTop: 5,
    textAlign: "right",
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderColor: "#4a4a4a",
    color: "#E7ECD7",
    fontSize: 15,
  },
});
