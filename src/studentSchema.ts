import { z } from "zod";

const studentProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .regex(/^[a-zA-Z ]+$/, "Name must contain only letters"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().regex(/^\d{10}$/, "Phone number must be 10 digits"),
  city: z
    .string()
    .trim()
    .min(3, "City must be at least 3 characters")
    .regex(/^[a-zA-Z]+$/, "City must contain only letters"),
  pinCode: z.string().trim().regex(/^\d{6}$/, "PIN code must be 6 digits"),
});

const studentEnrollmentSchema = z.object({
  course: z
    .string()
    .trim()
    .min(1, "Select a course")
    .pipe(z.enum(["React", "TypeScript", "JavaScript", "Full Stack"], {
    error: "Select a course",
    })),
  additionalCourses: z
    .array(
      z.object({
        name: z.string().trim().min(2, "Course name must be at least 2 characters"),
      }),
    )
    .default([]),
});

export const studentSchema = studentProfileSchema.extend(
  studentEnrollmentSchema.shape,
);