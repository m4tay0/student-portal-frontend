import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.1.142:3000/api",
});

export const checkEmail = (email) => api.post("/auth/check-email", { email });
export const register = (email, password) =>
  api.post("/auth/register", { email, password });
export const login = (email, password) =>
  api.post("/auth/login", { email, password });

export const getStudents = () => api.get("/students");
export const getCourses = () => api.get("/courses");
export const getGrades = (studentId) => api.get(`/grades/student/${studentId}`);
export const getAssignments = () => api.get("/assignments");
export const getAnnouncements = () => api.get("/announcements");
export const getSubmissions = (studentId) =>
  api.get(`/submissions/student/${studentId}`);

export default api;
