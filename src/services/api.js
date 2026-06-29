import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

export const getStudents = () => api.get("/students");
export const getCourses = () => api.get("/courses");
export const getGrades = (studentId) => api.get(`/grades/student/${studentId}`);
export const getAssignments = () => api.get("/assignments");
export const getAnnouncements = () => api.get("/announcements");
export const getSubmissions = (studentId) =>
  api.get(`/submissions/student/${studentId}`);
