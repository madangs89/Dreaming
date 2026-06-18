export type RevisionQuestion = {
  id: string;
  question: string;
  generation_count: number;
  notes_id: string;
  review_id: string;
  expectedAnswer: string;
  difficulty: string;
  createdAt: Date;
  updatedAt: Date;
};

// export type RevisionBody = {
//   questionHistories: RevisionQuestion[];
// };
