import axios from "axios";
import type { Student, StudentInput } from "../types/Student";

const API_URL = "http://localhost:3001/students";

// READ: Get all students
export const getStudents = async (): Promise<Student[]> => {
  const response = await axios.get<Student[]>(API_URL);
  return response.data;
};

// CREATE: Add a student
export const addStudent = async (
  student: StudentInput
): Promise<Student> => {
  const response = await axios.post<Student>(API_URL, student);
  return response.data;
};

// UPDATE: Edit a student
export const updateStudent = async (
  id: string | number,
  student: StudentInput
): Promise<Student> => {
  const response = await axios.put<Student>(
    `${API_URL}/${id}`,
    student
  );
  return response.data;
};

// DELETE: Remove a student
export const deleteStudent = async (
  id: string | number
): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};