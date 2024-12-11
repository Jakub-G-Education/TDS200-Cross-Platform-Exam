import { auth, getDownloadUrl } from "@/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { uploadImageToFirebase } from "./imageApi";

export const signIn = async (email: string, password: string) => {
  await signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log("User signed in", userCredential);
    })
    .catch((error) => {
      console.log("Oops, kunne ikke logge inn", error);
    });
};

export const signOut = async () => {
  await auth.signOut().then(() => {
    console.log("Signed out");
  });
};

export const signUp = async (
  email: string,
  password: string,
  username: string,
  image: string
) => {
  let userPictureDownloadUrl = null;

  if (image)
    try {
      const firebaseImage = await uploadImageToFirebase(image);
      userPictureDownloadUrl = await getDownloadUrl(firebaseImage);
    } catch (e) {
      console.log("Error uploading image, ", e);
    }

  await createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      console.log("User signed up", userCredential.user.email);
      await updateProfile(userCredential.user, {
        displayName: username,
        photoURL: userPictureDownloadUrl || null,
      });
      console.log("User updated", userCredential.user.displayName);
    })
    .catch((error) => {
      console.log(`Oops! ${error.code} message: ${error.message}`);
    });
};
