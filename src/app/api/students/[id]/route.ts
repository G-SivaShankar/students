import { NextResponse } from "next/server";

import { studentSchema } from "../../../../studentSchema";
import {
  deleteStudentRecord,
  findStudent,
  updateStudentRecord,
} from "../../../../lib/studentStore";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  try {
    const student = await findStudent(id);
    return student
      ? NextResponse.json(student)
      : NextResponse.json({ error: "Student not found." }, { status: 404 });
  } catch {
    return NextResponse.json(
      { error: "Could not read the student record." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  const { id } = await params;
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
    const student = await updateStudentRecord(id, parsed.data);
    return student
      ? NextResponse.json(student)
      : NextResponse.json({ error: "Student not found." }, { status: 404 });
  } catch {
    return NextResponse.json(
      { error: "Could not update the student record." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  try {
    const deleted = await deleteStudentRecord(id);
    return deleted
      ? new Response(null, { status: 204 })
      : NextResponse.json({ error: "Student not found." }, { status: 404 });
  } catch {
    return NextResponse.json(
      { error: "Could not delete the student record." },
      { status: 500 },
    );
  }
}