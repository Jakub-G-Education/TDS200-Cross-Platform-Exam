import { useAuthSession } from "@/providers/authctx";
import * as artApi from "@/api/artApi";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ArtPostData } from "@/utils/artPostData";
import { Entypo } from "@expo/vector-icons";
import { Link, router, Stack, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { updateUserProfilePicture } from "@/api/userApi";

export default function ProfilePage() {
  const { userName } = useLocalSearchParams<{
    userName: string;
  }>();
  const { userNameSession, user, signOut } = useAuthSession();
  const [artPosts, setArtPosts] = useState<ArtPostData[]>([]);
  const [numOfPosts, setNumOfPosts] = useState("");
  const [totalLikes, setTotalLikes] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [image, setImage] = useState<string | null>();

  useEffect(() => {
    if (userName && user) {
      allUserPosts(userName as string);
      console.log(user);
      console.log(userName);
    }
    if (userNameSession === userName) {
      setImage(user?.photoURL);
    }
  }, [userName, user]);

  const allUserPosts = async (userName: string) => {
    if (userName) {
      setRefreshing(true);
      const artPosts = await artApi.getUserPosts(userName);
      artPosts?.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setArtPosts(artPosts ?? []);
      if (artPosts) {
        setNumOfPosts((artPosts?.length ?? 0).toString());
        let likes = 0;
        artPosts?.forEach((post) => {
          likes += post.likes ? post.likes.length : 0;
        });
        setTotalLikes(likes?.toString());
        if (artPosts[0].authorPicture) {
          setImage(artPosts[0].authorPicture);
        } else {
          setImage("");
        }
      } else {
        setImage(user?.photoURL);
      }
      setRefreshing(false);
      console.log(numOfPosts, "number of posts");

      console.log(totalLikes, "number of likes");
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
    });
    if (!result.canceled) {
      updateUserProfilePicture(result.assets[0].uri);
    }
  };

  if (!userNameSession) {
    return (
      <View
        style={[
          styles.topContainer,
          {
            width: "100%",
            height: "100%",
            backgroundColor: "black",
          },
        ]}
      >
        <ActivityIndicator size={"large"} color={"#C8F425"} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ backgroundColor: "black" }}>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Text
              style={[
                styles.detailsText,
                {
                  fontWeight: "bold",
                  width: "100%",
                  textAlign: "center",
                },
              ]}
            >
              @{userName}
            </Text>
          ),
          headerLeft: () =>
            userName !== userNameSession ? (
              <Pressable
                style={{ paddingHorizontal: 5 }}
                onPress={async () => {
                  router.back();
                }}
              >
                <Entypo name="chevron-left" size={35} color={"#E7ECD7"} />
              </Pressable>
            ) : (
              ""
            ),
          headerRight: () =>
            userName === userNameSession ? (
              <Pressable
                onPress={async () => {
                  signOut();
                }}
                style={{ paddingHorizontal: 5 }}
              >
                <Entypo name="log-out" size={25} color={"#E7ECD7"} />
              </Pressable>
            ) : (
              ""
            ),
        }}
      />
      <FlatList
        style={styles.list}
        numColumns={3}
        data={artPosts}
        ListHeaderComponent={
          <View>
            <View style={styles.topContainer}>
              <Pressable
                onPress={
                  userName === userNameSession ? () => pickImage() : null
                }
                style={styles.avatar}
              >
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
              <View>
                <View style={styles.topContainer}>
                  <View style={styles.topContainerDetails}>
                    <Text style={[styles.detailsText, { fontWeight: "bold" }]}>
                      {numOfPosts}
                    </Text>
                    <Text style={styles.detailsText}>posts</Text>
                  </View>
                  <View style={styles.topContainerDetails}>
                    <Text style={[styles.detailsText, { fontWeight: "bold" }]}>
                      {totalLikes || "0"}
                    </Text>
                    <Text style={styles.detailsText}>likes</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => allUserPosts(userName as string)}
          />
        }
        renderItem={(artPost) => (
          <Link
            href={{
              pathname: "/artPostDetails/[id]",
              params: { id: artPost.item.id },
            }}
            style={styles.imageContainer}
          >
            <View>
              <Image
                style={styles.image}
                source={{ uri: artPost.item.imageURL }}
              />
              <View
                style={{
                  position: "absolute",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  right: 0,
                  bottom: 0,
                  backgroundColor: "#00000099",
                  padding: 8,
                  borderTopLeftRadius: 15,
                }}
              >
                <Text style={styles.detailsText}>
                  {artPost.item.likes
                    ? artPost.item.likes.length.toString()
                    : "0"}
                </Text>
                <Entypo name="heart" size={15} color={"#C8F425"} />
              </View>
            </View>
          </Link>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,

    justifyContent: "space-evenly",
  },
  topContainerDetails: {
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 20,
  },
  detailsText: {
    fontSize: 16,
    color: "#E7ECD7",
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
  },
  imageContainer: {
    width: "34%",
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    borderWidth: 1,
    shadowColor: "white",
    shadowRadius: 200,
  },
  list: {
    height: "100%",
    paddingBottom: 50,
    width: "100%",
    paddingHorizontal: 5,
  },
});
