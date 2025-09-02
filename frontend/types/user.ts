export interface User {
  id: string;
  name: string;
  email: string;
  nativeLanguage: string;
  learningLanguages: string[];
  progress: {
    [key: string]: number;
  };
}