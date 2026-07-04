import axios from "axios";
import { Platform } from "react-native";

const API_CONFIG = {
  WEB_URL: "http://localhost:3000/api",
  MOBILE_URL: "http://192.168.1.111:3000/api",
};

const api = axios.create({
  baseURL: Platform.OS === "web" ? API_CONFIG.WEB_URL : API_CONFIG.MOBILE_URL,
});

export const checkEmail = (email) => api.post("/auth/check-email", { email });
export const register = (email, password) =>
  api.post("/auth/register", { email, password });
export const login = (email, password) =>
  api.post("/auth/login", { email, password });
export const changePassword = (studentId, oldPassword, newPassword) =>
  api.post("/auth/change-password", { studentId, oldPassword, newPassword });

export const getStudents = () => api.get("/students");
export const getCourses = () => api.get("/courses");
export const getGrades = (studentId) => api.get(`/grades/student/${studentId}`);
export const getAssignments = () => api.get("/assignments");
export const getAnnouncements = () => api.get("/announcements");
export const getSubmissions = (studentId) =>
  api.get(`/submissions/student/${studentId}`);

// Advisors & Appointments & Messages
export const getMyAdvisor = (studentId) =>
  api.get(`/advisors/my-advisor/${studentId}`);
export const getAppointments = (studentId) =>
  api.get(`/advisors/appointments/${studentId}`);
export const bookAppointment = (data) =>
  api.post("/advisors/appointments", data);
export const getMessages = (studentId) =>
  api.get(`/advisors/messages/${studentId}`);
export const sendMessage = (data) =>
  api.post("/advisors/messages", data);

// Documents & Verification
export const getMyDocuments = (studentId) =>
  api.get(`/documents/my-documents/${studentId}`);
export const requestDocument = (data) =>
  api.post("/documents/request", data);
export const verifyDocument = (code) =>
  api.get(`/documents/verify/${code}`);

// Notifications
export const getNotifications = (studentId) =>
  api.get(`/notifications/${studentId}`);
export const markNotificationRead = (id) =>
  api.put(`/notifications/${id}/read`);

export default api;
