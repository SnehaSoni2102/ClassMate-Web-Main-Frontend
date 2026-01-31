export interface Test {
  _id: string;
  title: string;
  title_hi: string;
  description: string;
  type: 'mock' | 'live';
  durationInMinutes: number;
  totalQuestions: number;
  totalSections: number;
  totalMarks: number;
  marksPerQuestion: number;
  negativeMarks: number;
  languageOptions: string[];
  status: 'published' | 'in-progress';
  sections: {
    _id: string;
    name: string;
    name_hi: string;
    order: number;
    timeLimit: number;
    questions: {
      _id: string;
      question: string;
      question_hi: string;
      options: string[];
      options_hi: string[];
      correctAnswers: string[];
      correctAnswers_hi: string[];
      positiveMarking: number;
      negativeMarking: number;
      multipleSelection: boolean;
      image?: string;
    }[];
  }[];
  createdAt: string;
  updatedAt: string;
} 