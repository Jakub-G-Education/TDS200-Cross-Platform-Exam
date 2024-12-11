import { CameraView, useCameraPermissions } from "expo-camera";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Entypo } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

type CameraModalProps = {
  closeModal: () => void;
  setImage: (image: string) => void;
};

export default function CameraModal({
  closeModal,
  setImage,
}: CameraModalProps) {
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    return (
      <BlurView>
        <ActivityIndicator size="large" color="#C8F425" />
      </BlurView>
    );
  }

  if (!permission.granted) {
    return (
      <BlurView style={styles.mainContainer}>
        <View style={styles.permissionContainer}>
          <View>
            <Text style={[styles.text, { fontWeight: "bold" }]}>
              "ArtVista" would like to access the camera.
            </Text>
            <Text style={styles.text}>
              This lets you take photos that you can share within the app.
            </Text>
          </View>
          <View style={styles.buttonContainer}>
            <Pressable onPress={closeModal}>
              <Text style={[styles.text, styles.button, { color: "red" }]}>
                Don´t Allow
              </Text>
            </Pressable>
            <Pressable onPress={requestPermission}>
              <Text
                style={[
                  styles.text,
                  styles.button,
                  { fontWeight: "bold", color: "green" },
                ]}
              >
                OK
              </Text>
            </Pressable>
          </View>
        </View>
      </BlurView>
    );
  }

  let camera: CameraView | null = null;
  const captureImage = async () => {
    if (camera) {
      const image = await camera.takePictureAsync();
      let ratios = await camera.getAvailablePictureSizesAsync();
      if (image) {
        setImage(image.uri);
        closeModal();
      }
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      closeModal();
    }
  };

  return (
    <BlurView intensity={15} style={styles.mainContainer}>
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          mode="picture"
          autofocus="on"
          facing="back"
          ref={(r) => (camera = r)}
        ></CameraView>
      </View>
      <View style={[styles.buttonContainer, styles.cameraControllsContainer]}>
        <Pressable onPress={() => pickImage()}>
          <Entypo name="images" size={64} color={"#C8F425"} />
        </Pressable>
        <Pressable
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => captureImage()}
        >
          <Entypo
            name="controller-record"
            size={96}
            color="#4a4a4a"
            style={{ position: "absolute" }}
          />
          <Entypo
            name="controller-record"
            size={74}
            color="#E7ECD7"
            style={{ position: "absolute" }}
          />
        </Pressable>
        <Pressable onPress={() => closeModal()}>
          <Entypo name="back" size={64} color={"#C8F425"} />
        </Pressable>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: "center",
  },
  cameraContainer: {
    aspectRatio: 1,
    position: "relative",
    bottom: "10%",
  },
  camera: { flex: 1 },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    paddingTop: 30,
  },
  cameraControllsContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingHorizontal: 25,
    paddingBottom: 40,
    backgroundColor: "#00000080",
  },
  button: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  text: {
    fontSize: 20,
    color: "#E7ECD7",
    paddingVertical: 3,
  },
  permissionContainer: {
    paddingHorizontal: "10%",
    paddingVertical: "5%",
    marginHorizontal: "10%",
  },
});
