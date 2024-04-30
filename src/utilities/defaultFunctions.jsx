import { useNavigate } from "react-router-dom";

export const language = localStorage.getItem("language");
export const setLanguage = (language) => {
  localStorage.setItem("language", language);
};

export const userId = localStorage.getItem("userId");
export const removeUserId = () => localStorage.removeItem("userId");
export const setUserId = (userId) => {
  localStorage.setItem("userId", userId);
};
