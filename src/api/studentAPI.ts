import type { Student, StudentInput } from "../types/Student";
import { request } from "./request";

const API_URL = "/api/students";

export const getStudents = async (): Promise<Student[]> => {
  return request<Student[]>(API_URL);
};

export const getStudent = async (id: string | number): Promise<Student> => {
  return request<Student>(`${API_URL}/${id}`);
};

export const addStudent = async (
  student: StudentInput,
): Promise<Student> => {
  return request<Student>(API_URL, {
    method: "POST",
    body: JSON.stringify(student),
  });
};

export const updateStudent = async (
  id: string | number,
  student: StudentInput,
): Promise<Student> => {
  return request<Student>(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(student),
  });
};

export const deleteStudent = async (
  id: string | number,
): Promise<void> => {
  await request<void>(`${API_URL}/${id}`, { method: "DELETE" });
};