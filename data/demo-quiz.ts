import type { Question } from "@/lib/types";

export const demoQuiz: { title: string; description: string; status: string; questions: Partial<Question>[] } = {
  title: "Launch Night Trivia",
  description: "A fast sample quiz showing multiple choice, true or false, image, and text questions.",
  status: "published",
  questions: [
    {
      prompt: "Which technology powers the live updates in this app?",
      type: "multiple_choice",
      options: ["Pusher", "Polling", "Static HTML", "Email"],
      correct_answer: "Pusher",
      timer_seconds: 20,
      points: 1000
    },
    {
      prompt: "The projector screen should hide player scores while the quiz is running.",
      type: "true_false",
      options: ["True", "False"],
      correct_answer: "True",
      timer_seconds: 15,
      points: 800
    },
    {
      prompt: "What does this interface ask players to scan?",
      type: "image",
      options: ["QR Code", "Barcode", "Map", "Receipt"],
      correct_answer: "QR Code",
      timer_seconds: 20,
      points: 1000,
      image_url: "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&w=1200&q=80"
    },
    {
      prompt: "Type the name of the database provider used by this project.",
      type: "text",
      options: ["Neon"],
      correct_answer: "Neon",
      timer_seconds: 25,
      points: 1200
    }
  ]
};
