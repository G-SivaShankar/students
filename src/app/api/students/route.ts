import { NextResponse } from "next/server";

import { studentSchema } from "../../../studentSchema";
import { createStudent, listStudents } from "../../../lib/studentStore";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json(await listStudents());
  } catch {
    return NextResponse.json(
      { error: "Could not read student records." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = studentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Student data is invalid.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(await createStudent(parsed.data), { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Could not save the student record." },
      { status: 500 },
    );
  }
}