import { ArtPostData } from "@/utils/artPostData";
import { uploadImageToFirebase } from "./imageApi";
import { db, storage, getDownloadUrl } from "@/firebaseConfig";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";

export const createArtPost = async (art: ArtPostData) => {
  try {
    const firebaseImage = await uploadImageToFirebase(art.imageURL);
    if (firebaseImage === "ERROR") {
      return;
    }

    const artPostImageDownloadUrl = await getDownloadUrl(firebaseImage);
    const artPostWithImageData: ArtPostData = {
      ...art,
      imageURL: artPostImageDownloadUrl,
    };
    const docRef = await addDoc(collection(db, "posts"), artPostWithImageData);
    console.log("Art post added, ID: ", docRef.id);
  } catch (e) {
    console.log("Unexpected error while adding art post.", e);
  }
};

export const getAllArtPosts = async () => {
  const queryResult = await getDocs(collection(db, "posts"));

  return queryResult.docs.map((doc) => {
    return { ...doc.data(), id: doc.id } as ArtPostData;
  });
};

export const toggleLikePost = async (id: string, userId: string) => {
  const postRef = doc(db, "posts", id);
  const post = await getDoc(postRef);
  if (post.data()?.likes) {
    const likes = post.data()!.likes;
    if (likes.includes(userId)) {
      await updateDoc(postRef, {
        likes: likes.filter((like: string) => like !== userId),
      });
    } else {
      await updateDoc(postRef, {
        likes: [...likes, userId],
      });
    }
  } else {
    await updateDoc(postRef, {
      likes: [userId],
    });
  }
};

export const deletePost = async (postId: string, imageURL: string) => {
  try {
    const post = doc(db, "posts", postId);
    const image = ref(storage, imageURL);

    await deleteDoc(post);
    await deleteObject(image);
  } catch (e) {
    console.log("Unexpected error while deleting art post.", e);
  }
};

export const getUserPosts = async (user: string) => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, "posts"), where("author", "==", user))
    );
    return querySnapshot.docs.map((doc) => {
      return { ...doc.data(), id: doc.id } as ArtPostData;
    });
  } catch (e) {
    console.log("Error while retriving data: ", e);
  }
};

export const getPostById = async (id: string) => {
  const post = await getDoc(doc(db, "posts", id));
  return {
    ...post.data(),
    id: post.id,
  } as ArtPostData;
};

export const getSearchedPosts = async (searchString: string) => {
  const queryResult = await getDocs(collection(db, "posts"));
  return queryResult.docs
    .map((doc) => {
      return { ...doc.data(), id: doc.id } as ArtPostData;
    })
    .filter(
      (post) =>
        (post.author &&
          post.author.toLowerCase().includes(searchString.toLowerCase())) ||
        (post.title &&
          post.title.toLowerCase().includes(searchString.toLowerCase()))
    );
};
