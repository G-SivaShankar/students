import { NextResponse } from "next/server";

import { attendanceBatchSchema, attendanceDateSchema } from "../../../attendanceSchema";
import {
  listAttendanceForDate,
  listStudentAttendance,
  saveAttendanceForDate,
} from "../../../lib/studentStore";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const studentId = url.searchParams.get("studentId");

  try {
    if (studentId) {
      return NextResponse.json(await listStudentAttendance(studentId));
    }

    const parsedDate = attendanceDateSchema.safeParse(url.searchParams.get("date"));
    if (!parsedDate.success) {
      return NextResponse.json({ error: "A valid date is required." }, { status: 400 });
    }

    return NextResponse.json(await listAttendanceForDate(parsedDate.data));
  } catch (error) {
    console.error("Failed to read attendance records:", error);
    return NextResponse.json(
      { error: "Could not read attendance records." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = attendanceBatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Attendance data is invalid.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const records = await saveAttendanceForDate(parsed.data.date, parsed.data.records);
    return records
      ? NextResponse.json(records)
      : NextResponse.json(
          { error: "Attendance can only be recorded for active students." },
          { status: 400 },
        );
  } catch (error) {
    console.error("Failed to save attendance records:", error);
    return NextResponse.json(
      { error: "Could not save attendance records." },
      { status: 500 },
    );
  }
}