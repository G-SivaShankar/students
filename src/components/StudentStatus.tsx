"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Card, Empty, Input, Spin, Statistic, Tag, Typography } from "antd";

import { getAttendanceForDate } from "../api/attendanceAPI";
import { getStudents } from "../api/studentAPI";
import type { AttendanceStatus } from "../types/Attendance";
import type { Student } from "../types/Student";
import StatusControl from "./StatusControl";

const STATUSES = ["Active", "Graduated", "Dropout"] as const;

function localDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function StudentStatus() {
  const [attendanceDate, setAttendanceDate] = useState(() => localDateString(new Date()));
  const { data: students = [], isLoading, isError, error } = useQuery({
    queryKey: ["students"],
    queryFn: getStudents,
  });
  const attendanceQuery = useQuery({
    queryKey: ["attendance", "date", attendanceDate],
    queryFn: () => getAttendanceForDate(attendanceDate),
  });
  const statusOf = (student: Student) => student.status ?? "Active";

  if (isLoading || attendanceQuery.isLoading) return <div className="loading-state"><Spin description="Loading student and attendance status..." /></div>;
  if (isError) return <Alert type="error" showIcon title="Could not load student status" description={error.message} />;
  if (attendanceQuery.isError) return <Alert type="error" showIcon title="Could not load attendance status" description={attendanceQuery.error.message} />;

  const attendanceByStudent = new Map(
    (attendanceQuery.data ?? []).map(({ studentId, status }) => [studentId, status]),
  );
  const activeCount = students.filter((student) => statusOf(student) === "Active").length;
  const attendanceCount = (status: AttendanceStatus) =>
    [...attendanceByStudent.values()].filter((savedStatus) => savedStatus === status).length;

  return (
    <>
      <div className="page-heading">
        <div>
          <Typography.Text className="eyebrow">ENROLLMENT</Typography.Text>
          <Typography.Title level={1}>Student status</Typography.Title>
          <Typography.Paragraph type="secondary">
            Review enrollment counts and update a student’s current status.
          </Typography.Paragraph>
        </div>
        <Input
          className="status-attendance-date"
          aria-label="Attendance date"
          type="date"
          value={attendanceDate}
          onChange={(event) => setAttendanceDate(event.target.value)}
        />
      </div>

      <section className="stat-grid status-stat-grid" aria-label="Enrollment status totals">
        {STATUSES.map((status) => (
          <Card className="stat-card" key={status}>
            <Statistic title={status} value={students.filter((student) => statusOf(student) === status).length} />
          </Card>
        ))}
      </section>

      <section className="stat-grid attendance-status-grid" aria-label={`Attendance totals for ${attendanceDate}`}>
        <Card className="stat-card"><Statistic title="Present" value={attendanceCount("Present")} /></Card>
        <Card className="stat-card"><Statistic title="Half day" value={attendanceCount("Half day")} /></Card>
        <Card className="stat-card"><Statistic title="Absent" value={attendanceCount("Absent")} /></Card>
        <Card className="stat-card"><Statistic title="Not marked" value={Math.max(activeCount - attendanceByStudent.size, 0)} /></Card>
      </section>

      {students.length === 0 ? (
        <Card><Empty description="No students to show" /></Card>
      ) : (
        <div className="status-groups">
          {STATUSES.map((status) => {
            const group = students.filter((student) => statusOf(student) === status);

            return (
              <section className="status-group" key={status}>
                <div className="status-group-heading">
                  <Typography.Title level={2}>{status}</Typography.Title>
                  <Typography.Text type="secondary">{group.length} students</Typography.Text>
                </div>
                {group.length ? (
                  <div className="status-list">
                    {group.map((student) => (
                      <div className="status-row" key={student.id}>
                        <div className="status-student">
                          <Link href={`/students/${student.id}`}>{student.name}</Link>
                          <Typography.Text type="secondary">{student.course} · {student.email}</Typography.Text>
                          {statusOf(student) === "Active" && (
                            <Tag
                              color={attendanceByStudent.get(String(student.id)) === "Present" ? "green" :
                                attendanceByStudent.get(String(student.id)) === "Half day" ? "gold" :
                                  attendanceByStudent.get(String(student.id)) === "Absent" ? "red" : undefined}
                            >
                              {attendanceByStudent.get(String(student.id)) ?? "Not marked"}
                            </Tag>
                          )}
                        </div>
                        <StatusControl student={student} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <Typography.Paragraph className="empty-status" type="secondary">No students in this status.</Typography.Paragraph>
                )}
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}