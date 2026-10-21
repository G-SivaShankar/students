import { randomUUID } from "node:crypto";
import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Student, StudentInput } from "../types/Student";

interface StudentDatabase {
  students: Student[];
  [key: string]: unknown;
}

const databasePath = path.join(process.cwd(), "db.json");
let writeQueue: Promise<void> = Promise.resolve();

async function readDatabase(): Promise<StudentDatabase> {
  const content = await readFile(databasePath, "utf8");
  const database = JSON.parse(content) as StudentDatabase;

  if (!Array.isArray(database.students)) {
    throw new Error("Student database has an invalid format.");
  }

  return database;
}

async function saveDatabase(database: StudentDatabase): Promise<void> {
  const temporaryPath = `${databasePath}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(database, null, 2)}\n`, {
    encoding: "utf8",
    flag: "wx",
  });
  await rename(temporaryPath, databasePath);
}

async function updateDatabase<T>(
  update: (database: StudentDatabase) => T,
): Promise<T> {
  let release!: () => void;
  const previousWrite = writeQueue;
  writeQueue = new Promise<void>((resolve) => {
    release = resolve;
  });

  await previousWrite;
  try {
    const database = await readDatabase();
    const result = update(database);
    await saveDatabase(database);
    return result;
  } finally {
    release();
  }
}

export async function listStudents(): Promise<Student[]> {
  const database = await readDatabase();
  return database.students;
}

export async function findStudent(id: string): Promise<Student | undefined> {
  const database = await readDatabase();
  return database.students.find((student) => String(student.id) === id);
}

export async function createStudent(input: StudentInput): Promise<Student> {
  return updateDatabase((database) => {
    const student: Student = { ...input, id: randomUUID() };
    database.students.push(student);
    return student;
  });
}

export async function updateStudentRecord(
  id: string,
  input: StudentInput,
): Promise<Student | undefined> {
  return updateDatabase((database) => {
    const index = database.students.findIndex(
      (student) => String(student.id) === id,
    );
    if (index === -1) return undefined;

    const student = { ...input, id: database.students[index].id };
    database.students[index] = student;
    return student;
  });
}

export async function deleteStudentRecord(id: string): Promise<boolean> {
  return updateDatabase((database) => {
    const index = database.students.findIndex(
      (student) => String(student.id) === id,
    );
    if (index === -1) return false;

    database.students.splice(index, 1);
    return true;
  });
}