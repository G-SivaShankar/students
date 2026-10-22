import { z } from "zod";

export const attendanceStatusSchema = z.enum(["Present", "Absent", "Half day"]);

export const attendanceRecordSchema = z.object({
  studentId: z.string().min(1),
  status: attendanceStatusSchema,
});

export const attendanceDateSchema = z.string().refine((date) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsedDate = new Date(`${date}T00:00:00.000Z`);
  return !Number.isNaN(parsedDate.valueOf()) &&
    parsedDate.toISOString().slice(0, 10) === date;
}, "Enter a valid date in YYYY-MM-DD format");

export const attendanceBatchSchema = z.object({
  date: attendanceDateSchema,
  records: z.array(attendanceRecordSchema).max(1000),
}).superRefine(({ records }, context) => {
  const studentIds = new Set<string>();

  records.forEach(({ studentId }, index) => {
    if (studentIds.has(studentId)) {
      context.addIssue({
        code: "custom",
        path: ["records", index, "studentId"],
        message: "A student can only have one attendance record per date",
      });
    }
    studentIds.add(studentId);
  });
});