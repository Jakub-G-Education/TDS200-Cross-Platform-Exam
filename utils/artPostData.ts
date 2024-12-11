import { LocationObjectCoords } from "expo-location";

export interface ArtPostData {
  id: string;
  title: string;
  description: string;
  author: string;
  isLiked: boolean;
  likes: string[];
  imageURL: string;
  comments: string[];
  postCoordinates: LocationObjectCoords | null;
  date: string;
  authorPicture: string;
}

export interface CommentObject {
  id: string;
  comment: CommentData;
}

export interface CommentData {
  authorId: string;
  authorName: string;
  authorImageUrl: string;
  comment: string;
  date: string;
}
