import type { Student, StudentInput } from "../types/Student";

const API_URL = "/api/students";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options?.body ? { "Content-Type": "application/json" } : {}),
      ...options?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(body?.error ?? `Request failed (${response.status})`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

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