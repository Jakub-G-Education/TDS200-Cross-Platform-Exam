import { useAuthSession } from "@/providers/authctx";
import { ArtPostData } from "@/utils/artPostData";
import { Entypo } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import * as artApi from "@/api/artApi";
import * as Location from "expo-location";

type ArtPostProps = {
  artPostData: ArtPostData;
  toggleLike: (id: string) => void;
  deletePost: (id: string, imageURL: string) => void;
};

export default function ArtPost({
  artPostData,
  toggleLike,
  deletePost,
}: ArtPostProps) {
  const { user } = useAuthSession();

  const [isLiked, setIsLiked] = useState(
    artPostData.likes?.includes(user?.uid ?? "") ?? false
  );
  const [numLikes, setNumLikes] = useState(artPostData.likes?.length ?? 0);

  const [location, setLocation] =
    useState<Location.LocationGeocodedAddress | null>(null);

  const router = useRouter();

  useEffect(() => {
    (async () => {
      if (artPostData.postCoordinates) {
        const locationAddress = await Location.reverseGeocodeAsync({
          latitude: artPostData.postCoordinates.latitude,
          longitude: artPostData.postCoordinates.longitude,
        });
        setLocation(locationAddress[0]);
      }
    })();
  }, []);

  function calculatePostDate() {
    const postDate: Date = new Date(artPostData.date);
    const currentDate: Date = new Date();
    const hoursDifference = Math.floor(
      (currentDate.getTime() - postDate.getTime()) / (1000 * 60 * 60)
    );

    if (hoursDifference < 24) {
      return `${hoursDifference}h. ago`;
    }
    return postDate.toLocaleDateString();
  }

  const dateToDisplay = calculatePostDate();

  const deleteAlert = () => {
    Alert.alert("Delete post", "Are you sure you want to delete this post?", [
      {
        text: "Cancel",
      },
      {
        text: "Delete",
        onPress: () => deletePost(artPostData.id, artPostData.imageURL),
      },
    ]);
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.profilePictureContainer}>
        {artPostData.authorPicture ? (
          <Image
            source={{ uri: artPostData.authorPicture }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatar}>
            <Entypo name="user" size={45} color={"#E7ECD7"} />
          </View>
        )}
      </View>
      <View style={styles.postContainer}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Link
            href={{
              pathname: "/(app)/(tabs)/[username]",
              params: {
                userName: artPostData.author,
                userPicture: artPostData.authorPicture,
              },
            }}
          >
            <Text style={styles.postAuthor}>@{artPostData.author}</Text>
          </Link>
          <View style={styles.row}>
            <Text style={{ color: "#4a4a4a" }}>{dateToDisplay}</Text>
            {user?.displayName === artPostData.author && (
              <Pressable onPress={() => deleteAlert()}>
                <Entypo name="trash" size={20} color="#4a4a4a" />
              </Pressable>
            )}
          </View>
        </View>
        <Text style={styles.postDescription}>{artPostData.description}</Text>
        <View style={{ width: "90%" }}>
          <Link
            style={styles.postImage}
            href={{
              pathname: "/artPostDetails/[id]",
              params: { id: artPostData.id },
            }}
          >
            <Image
              style={{
                width: "100%",
                height: "100%",
                resizeMode: "cover",
                borderRadius: 15,
              }}
              source={{ uri: artPostData.imageURL }}
            />
          </Link>
        </View>
        <View style={styles.detailsContainer}>
          <View style={styles.row}>
            <Entypo name="chat" size={26} color="#4a4a4a" />
            <Text style={styles.postDetails}>
              {artPostData.comments.length}
            </Text>
          </View>
          <Pressable
            style={styles.row}
            onPress={async () => {
              if (isLiked) {
                setNumLikes(numLikes - 1);
                setIsLiked(false);
              } else {
                setNumLikes(numLikes + 1);
                setIsLiked(true);
              }
              await artApi.toggleLikePost(artPostData.id, user?.uid ?? "");
            }}
          >
            <Entypo
              name="heart"
              size={26}
              color={isLiked ? "red" : "#4a4a4a"}
            />
            <Text style={styles.postDetails}>{numLikes}</Text>
          </Pressable>
          <View>
            <Text style={styles.postDetails}>
              {location?.city}, {location?.country}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    width: "100%",
    marginVertical: 10,
    paddingVertical: 10,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#4a4a4a",
  },
  postContainer: {
    width: "87%",
  },
  profilePictureContainer: {
    width: "13%",
    paddingHorizontal: 5,
  },
  postImage: {
    width: "100%",
    aspectRatio: 1,

    marginVertical: 10,
  },
  postAuthor: {
    fontWeight: "bold",
    fontSize: 17,
    color: "#E7ECD7",
  },
  postDescription: {
    fontSize: 16,
    color: "#E7ECD7",
    marginVertical: 10,
    marginHorizontal: 5,
  },
  detailsContainer: {
    flexDirection: "row",
    gap: 50,
  },
  postDetails: {
    color: "#4a4a4a",
    fontSize: 15,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: "row",
  },
  avatar: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    aspectRatio: 1,
    borderRadius: "100%",
    borderWidth: 1,
    borderColor: "#C8F425",
    overflow: "hidden",
  },
});
