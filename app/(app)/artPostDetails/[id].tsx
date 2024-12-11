import * as artApi from "@/api/artApi";
import * as commentApi from "@/api/commentApi";
import * as Location from "expo-location";
import { useAuthSession } from "@/providers/authctx";
import { ArtPostData, CommentObject } from "@/utils/artPostData";
import { Entypo } from "@expo/vector-icons";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function artPostDetails() {
  const { userNameSession, user } = useAuthSession();
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState<ArtPostData | null>(null);
  const [postComments, setPostComments] = useState<CommentObject[]>([]);
  const [location, setLocation] =
    useState<Location.LocationGeocodedAddress | null>(null);

  const [numLikes, setNumLikes] = useState(post ? post.likes?.length : 0);
  const [isLiked, setIsLiked] = useState(
    post ? post.likes?.includes(user?.uid ?? "") : false
  );

  const [commentText, setCommentText] = useState("");

  const [isUploadingAddComment, setIsUploadingAddComment] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(true);

  const visibleCommentIds = useRef<string[]>([]);

  const router = useRouter();

  useEffect(() => {
    getPostData();
  }, []);

  const getPostData = async () => {
    const post = await artApi.getPostById(id as string);
    if (post) {
      setPost(post);
      getComments(post.comments);
      visibleCommentIds.current = post.comments;
      const location = await Location.reverseGeocodeAsync({
        latitude: post.postCoordinates?.latitude ?? 0,
        longitude: post.postCoordinates?.longitude ?? 0,
      });
      setLocation(location[0] ?? "");
    }
  };

  const getComments = async (commentIds: string[]) => {
    const comments = await commentApi.getCommentsByIds(commentIds);
    if (comments) {
      setPostComments(comments);
    }
    setIsLoadingComments(false);
  };

  return (
    <SafeAreaView style={{ backgroundColor: "black", height: "100%" }}>
      <Stack.Screen
        options={{
          headerTitle: () => <Text style={styles.bigText}>{post?.title}</Text>,
          headerLeft: () => (
            <Pressable
              onPress={async () => {
                router.back();
              }}
            >
              <Entypo name="chevron-left" size={35} color={"#E7ECD7"} />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
      >
        <Link
          push
          href={{
            pathname: "/(app)/(tabs)/[username]",
            params: {
              userName: post?.author,
              userPicture: post?.authorPicture,
            },
          }}
        >
          <View style={styles.profileContainer}>
            {post?.authorPicture ? (
              <Image
                source={{ uri: post?.authorPicture }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatar}>
                <Entypo name="user" size={45} color={"#E7ECD7"} />
              </View>
            )}
            <Text style={styles.bigText}>@{post?.author}</Text>
          </View>
        </Link>
        <View>
          <Text style={styles.text}>{post?.description}</Text>
        </View>
        <View style={styles.imageContainer}>
          <Image style={styles.image} source={{ uri: post?.imageURL }} />
        </View>
        <View
          style={[
            styles.row,
            { justifyContent: "space-between", paddingHorizontal: 5 },
          ]}
        >
          <View style={styles.row}>
            <Text style={{ color: "#4a4a4a" }}>
              {new Date(post ? post.date : "").toLocaleTimeString().slice(0, 5)}
            </Text>
            <Entypo name="dot-single" size={15} color={"#4a4a4a"} />
            <Text style={{ color: "#4a4a4a" }}>
              {new Date(post ? post.date : "").toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={{ color: "#4a4a4a" }}>{location?.street} </Text>
            <Text style={{ color: "#4a4a4a" }}>{location?.streetNumber}, </Text>
            <Text style={{ color: "#4a4a4a" }}>{location?.city}, </Text>
            <Text style={{ color: "#4a4a4a" }}>{location?.country}</Text>
          </View>
        </View>
        <View
          style={[
            styles.row,
            { justifyContent: "space-evenly", paddingVertical: 3 },
          ]}
        >
          <View style={styles.row}>
            <Entypo name="chat" size={26} color="#4a4a4a" />
            <Text style={[styles.bigText, { color: "#4a4a4a" }]}>
              {post ? post.comments.length : ""}
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
              await artApi.toggleLikePost(
                post ? post?.id : "",
                user?.uid ?? ""
              );
            }}
          >
            <Entypo
              name="heart"
              size={26}
              color={isLiked ? "red" : "#4a4a4a"}
            />
            <Text style={[styles.bigText, { color: "#4a4a4a" }]}>
              {numLikes}
            </Text>
          </Pressable>
        </View>
        <View
          style={{
            width: "100%",
          }}
        >
          <View>
            <TextInput
              style={[styles.textInput]}
              value={commentText}
              onChangeText={setCommentText}
              multiline={true}
              maxLength={128}
              numberOfLines={4}
              placeholder="Share your thougts about this.."
              placeholderTextColor={"#4a4a4a"}
            />
            <Text
              style={{
                color: "#4a4a4a",
                right: 0,
                bottom: 0,
                position: "absolute",
              }}
            >
              {commentText.length}/128
            </Text>
          </View>
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              justifyContent: "flex-end",
              paddingVertical: 10,
            }}
          >
            <Pressable
              style={styles.addButton}
              onPress={async () => {
                if (post && commentText !== "") {
                  setIsUploadingAddComment(true);
                  const newComment = await commentApi.addComment(post.id, {
                    authorId: user?.uid ?? "",
                    authorName: userNameSession ?? "",
                    authorImageUrl: user?.photoURL ?? "",
                    comment: commentText,
                    date: new Date().toISOString(),
                  });
                  if (newComment) {
                    visibleCommentIds.current.push(newComment);
                    await getComments(visibleCommentIds.current);
                    setCommentText("");
                    setIsUploadingAddComment(false);
                  }
                }
              }}
            >
              {isUploadingAddComment ? (
                <ActivityIndicator size="small" color="black" />
              ) : (
                <Text style={[styles.bigText, { color: "black" }]}>Send</Text>
              )}
            </Pressable>
          </View>
        </View>
        {isLoadingComments ? (
          <ActivityIndicator size="small" color="black" />
        ) : (
          postComments.map((comment) => {
            return (
              <View
                key={comment.id}
                style={{
                  borderBottomWidth: 1,
                  borderColor: "#4a4a4a",
                  paddingVertical: 10,
                }}
              >
                <View style={[styles.row, { justifyContent: "space-between" }]}>
                  <Link
                    href={{
                      pathname: "/(app)/(tabs)/[username]",
                      params: {
                        userName: comment.comment.authorName,
                        userPicture: comment.comment.authorImageUrl,
                      },
                    }}
                  >
                    <View style={[styles.row, { alignItems: "center" }]}>
                      {comment.comment.authorImageUrl ? (
                        <Image
                          source={{ uri: comment.comment.authorImageUrl }}
                          style={styles.avatar}
                        />
                      ) : (
                        <View style={styles.avatar}>
                          <Entypo name="user" size={45} color={"#E7ECD7"} />
                        </View>
                      )}
                      <Text style={styles.bigText}>
                        @{comment.comment.authorName}
                      </Text>
                      <Text style={{ color: "#4a4a4a" }}>
                        {new Date(comment.comment.date).toLocaleDateString()}
                      </Text>
                    </View>
                  </Link>
                  {userNameSession === comment.comment.authorName && (
                    <Pressable
                      onPress={() => {
                        commentApi.deleteComment(comment.id, post?.id ?? "");
                        setPostComments(
                          postComments.filter((c) => c.id !== comment.id)
                        );
                        visibleCommentIds.current =
                          visibleCommentIds.current.filter(
                            (id) => id !== comment.id
                          );
                      }}
                    >
                      <Entypo name="trash" size={25} color={"#4a4a4a"} />
                    </Pressable>
                  )}
                </View>
                <Text style={styles.text}>{comment.comment.comment}</Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bigText: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#E7ECD7",
    paddingHorizontal: 10,
  },
  text: {
    fontSize: 17,
    color: "#E7ECD7",
    paddingVertical: 15,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    justifyContent: "center",
    alignItems: "center",
    width: 50,
    aspectRatio: 1,
    borderRadius: "100%",
    borderWidth: 2,
    borderColor: "#C8F425",
    overflow: "hidden",
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    borderWidth: 1,
    borderRadius: 15,
  },
  row: {
    flexDirection: "row",
  },
  textInput: {
    width: "95%",
    marginHorizontal: 15,
    marginTop: 30,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderColor: "#4a4a4a",
    color: "#E7ECD7",
    fontSize: 18,
  },
  addButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#C8F425",
    borderRadius: 100,
    padding: 10,
  },
});
