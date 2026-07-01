import { db } from "../lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";

export interface Review {
  id: string;
  animeId: string;
  userId: string;
  username: string;
  comment: string;
  createdAt: any;
  isReported: boolean;
}

export const addReview = async (
  animeId: string,
  userId: string,
  username: string,
  comment: string
): Promise<void> => {
  await addDoc(collection(db, "reviews"), {
    animeId,
    userId,
    username,
    comment,
    createdAt: serverTimestamp(),
    isReported: false,
  });
};

export const getReviews = (
  animeId: string,
  limitCount: number,
  onData: (reviews: Review[], hasMore: boolean) => void,
  onError: (error: Error) => void
) => {
  const reviewsRef = collection(db, "reviews");
  const q = query(
    reviewsRef,
    where("animeId", "==", animeId),
    where("isReported", "==", false),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const newReviews = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Review[];

      // If the number of documents is equal to the limit, there might be more
      const hasMore = snapshot.docs.length === limitCount;

      onData(newReviews, hasMore);
    },
    onError
  );
};

export const reportReview = async (reviewId: string): Promise<void> => {
  const reviewRef = doc(db, "reviews", reviewId);
  await updateDoc(reviewRef, {
    isReported: true,
  });
};
