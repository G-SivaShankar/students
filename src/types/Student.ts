import type { z } from "zod";
import type { studentSchema } from "../studentSchema";

export type StudentInput = z.output<typeof studentSchema>;
export type Student = StudentInput & { id: string | number };