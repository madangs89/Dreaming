
import { prisma } from "../../configs/prisma.js";
import { DocumentBody } from "../../modules/notes/notes.types.js";
import { ReviewBody } from "../../modules/review/review.types.js";


export const getReviewDetails = async (
  review_id: string,
): Promise<ReviewBody> => {
  const review = await prisma.review.findUnique({
    where: { id: review_id },
    include: {
      topic: true,
      notes: true,
    },
  });

  if (!review) {
    throw new Error("Review not found");
  }
  return review;
};


export const getDocumentData = async (
  notes_id: string,
): Promise<DocumentBody[]> => {
  const documentData = await prisma.document.findMany({
    where: { notes_id },
  });
  return documentData;
};

