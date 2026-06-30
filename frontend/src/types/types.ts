

 export   interface RegisterForm {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}


export interface LoginForm {
  email: string;
  password: string;
}


 export type ChoiceForm = {
  choice: string;
  is_correct: boolean;
};

 export type QuestionForm = {
  question: string;
  points: number;
  choices: ChoiceForm[];
};

 export type ExamForm = {
  title: string;
  description: string;
  duration: string;
  is_active: boolean;
};


export type Quiz = {
  id: number;
  title: string;
  description: string | null;
  duration: number | null;
  is_active: boolean;
  questions: Array<{
    id: number;
    question: string;
    points: number;
    choices: ChoiceForm[];
  }>;
};



export interface Choice {
  id: number;
  text: string;
}

export interface Question {
  id: number;
  text: string;
  points: number;
  choices: Choice[];
}

export interface Exam {
  id: number;
  title: string;
  description: string;
  duration: number; 
  questions: Question[];
}
export interface ExamView {
  id: number;
  title: string;
  description: string;
  duration: number;
  totalQuestions: number;
  passingScore: number;
  status: "active";
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

 export interface Result {
  id: number;
  title: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  date: string;
  status: "passed" | "failed";
}