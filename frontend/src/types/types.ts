

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