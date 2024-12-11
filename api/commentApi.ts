import { db } from "@/firebaseConfig";
import { CommentData, CommentObject } from "@/utils/artPostData";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

export const addComment = async (postId: string, comment: CommentData) => {
  try {
    const commentRef = await addDoc(collection(db, "comments"), comment);
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      comments: arrayUnion(commentRef.id),
    });
    console.log("Added comment with id:", commentRef.id);
    return commentRef.id;
  } catch (e) {
    console.log("Error while adding comment", e);
  }
};

export const getCommentsByIds = async (ids: string[]) => {
  try {
    const response = await Promise.all(
      ids.map((id) => {
        return getDoc(doc(db, "comments", id));
      })
    );
    return response.map((doc) => {
      return { id: doc.id, comment: doc.data() } as CommentObject;
    });
  } catch (e) {
    console.log("Error while retriving comments", e);
  }
};

export const deleteComment = async (commentId: string, postId: string) => {
  try {
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      comments: arrayRemove(commentId),
    });
    await deleteDoc(doc(db, "comments", commentId));
  } catch (e) {
    console.log("Error while deleting comments: ", e);
  }
};
