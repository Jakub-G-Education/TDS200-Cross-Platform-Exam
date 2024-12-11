import { auth, getDownloadUrl, db } from "@/firebaseConfig";
import { uploadImageToFirebase } from "./imageApi";
import { updateProfile } from "firebase/auth";

export const updateUserProfilePicture = async (uri: string) => {
  if (!auth.currentUser) {
    return;
  }
  try {
    const firebaseImage = await uploadImageToFirebase(uri);
    if (firebaseImage === "ERROR") {
      console.log("userApi upload error");
      return;
    }

    const userPictureDownloadUrl = await getDownloadUrl(firebaseImage);

    await updateProfile(auth.currentUser, { photoURL: userPictureDownloadUrl });
    console.log("User profile picture updated");
  } catch (e) {
    console.error("Unexpected error while updating user profile picture:", e);
  }
};
