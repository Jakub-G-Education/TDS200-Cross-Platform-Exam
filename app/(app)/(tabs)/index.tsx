import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  RefreshControl,
  Pressable,
  Modal,
  SafeAreaView,
  Image,
} from "react-native";
import * as artApi from "@/api/artApi";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { useAuthSession } from "@/providers/authctx";
import { ArtPostData } from "@/utils/artPostData";
import ArtPost from "@/components/ArtPost";
import { Entypo } from "@expo/vector-icons";
import AddPost from "@/components/AddPost";
import { Stack } from "expo-router";

export default function Index() {
  const [refreshing, setRefreshing] = useState(false);
  const [artPosts, setArtPosts] = useState<ArtPostData[]>([]);
  const [isAddPostModalOpen, setIsAddPostModalOpen] = useState(false);
  const { userNameSession, signOut } = useAuthSession();

  const getAllArtPosts = async () => {
    setRefreshing(true);
    const artPosts = await artApi.getAllArtPosts();
    artPosts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setArtPosts(artPosts);
    setRefreshing(false);
  };

  const deletePost = async (postId: string, imageURL: string) => {
    await artApi.deletePost(postId, imageURL);
    await getAllArtPosts();
  };

  useEffect(() => {
    getAllArtPosts();
  }, [artPosts]);

  return (
    <SafeAreaView style={styles.mainContainer}>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Pressable onPress={getAllArtPosts}>
              <Image
                source={require("../../../assets/images/artvista.png")}
                resizeMode="contain"
                style={{
                  width: 70,
                  height: 70,
                }}
              />
            </Pressable>
          ),
        }}
      />
      <Modal visible={isAddPostModalOpen} animationType="slide">
        <AddPost
          addNewPost={async () => {
            await getAllArtPosts();
            setIsAddPostModalOpen(false);
          }}
          closeModal={() => setIsAddPostModalOpen(false)}
        />
      </Modal>

      <FlatList
        data={artPosts}
        style={{ width: "100%", paddingHorizontal: 5 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={getAllArtPosts} />
        }
        renderItem={(artPost) => (
          <ArtPost
            key={artPost.index}
            artPostData={artPost.item}
            toggleLike={(id) => {
              const tempPosts = artPosts.map((tempPost) => {
                if (tempPost.id === id) {
                  return { ...tempPost, isLiked: !tempPost.isLiked };
                }
                return tempPost;
              });
            }}
            deletePost={(postId, imageURL) => deletePost(postId, imageURL)}
          />
        )}
      />
      <Pressable
        style={styles.addButton}
        onPress={() => setIsAddPostModalOpen(true)}
      >
        <Entypo name="plus" size={36} color={"black"} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "black",
    paddingTop: "10%",
  },
  addButton: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: 5,
    bottom: 5,
    width: 75,
    height: 75,
    borderRadius: 100,
    backgroundColor: "#C8F425",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
});
