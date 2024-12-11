import * as artApi from "@/api/artApi";
import ArtPost from "@/components/ArtPost";
import { ArtPostData } from "@/utils/artPostData";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function SearchPage() {
  const [posts, setPosts] = useState<ArtPostData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const searchPosts = async (search: string) => {
    if (!search) {
      setPosts([]);
      return;
    }
    setPosts([]);
    setRefreshing(true);
    const posts = await artApi.getSearchedPosts(search);
    setPosts(posts);
    setRefreshing(false);
  };

  useEffect(() => {
    setRefreshing(true);
    const delay = setTimeout(() => {
      searchPosts(search);
    }, 800);
    return () => clearTimeout(delay);
  }, [search]);

  return (
    <SafeAreaView style={styles.mainContainer}>
      <Stack.Screen
        options={{
          headerTitle: () => <Text style={styles.header}>Search</Text>,
        }}
      />
      <View style={styles.textFieldContainer}>
        <TextInput
          style={styles.textField}
          value={search}
          placeholder="Search.."
          onChangeText={(text) => {
            setSearch(text);
          }}
        />
      </View>

      {refreshing && search ? (
        <ActivityIndicator
          style={{ padding: 10 }}
          size={"large"}
          color={"#C8F425"}
        />
      ) : null}
      <FlatList
        data={posts}
        style={{ width: "100%" }}
        renderItem={(artPost) => (
          <ArtPost
            key={artPost.index}
            artPostData={artPost.item}
            toggleLike={(id) => {
              const tempPosts = posts.map((tempPost) => {
                if (tempPost.id === id) {
                  return { ...tempPost, isLiked: !tempPost.isLiked };
                }
                return tempPost;
              });
            }}
            deletePost={(postId, imageURL) =>
              artApi.deletePost(postId, imageURL)
            }
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  white: {
    color: "#E7ECD7",
  },
  header: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#E7ECD7",
  },

  mainContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    paddingHorizontal: 5,
    width: "100%",
    height: "100%",
  },
  textFieldContainer: {
    width: "100%",
    paddingTop: 10,
  },
  textFieldTitle: {
    fontSize: 18,
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
    fontSize: 18,
    color: "#E7ECD7",
  },
});
