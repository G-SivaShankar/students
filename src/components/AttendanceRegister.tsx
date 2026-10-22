"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Card, Empty, Input, Select, Spin, Statistic, Typography } from "antd";

import { getAttendanceForDate, saveAttendanceForDate } from "../api/attendanceAPI";
import { getStudents } from "../api/studentAPI";
import type { AttendanceRecord, AttendanceStatus } from "../types/Attendance";

const STUDENTS_KEY = ["students"];
const ATTENDANCE_DATE_KEY = ["attendance", "date"];
const ATTENDANCE_STATUSES: AttendanceStatus[] = ["Present", "Half day", "Absent"];

function localDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function AttendanceRegister() {
  const queryClient = useQueryClient();
  const [date, setDate] = useState(() => localDateString(new Date()));
  const [editsByDate, setEditsByDate] = useState<
    Record<string, Record<string, AttendanceStatus | null>>
  >({});
  const [editingDates, setEditingDates] = useState<Record<string, boolean>>({});
  const studentsQuery = useQuery({ queryKey: STUDENTS_KEY, queryFn: getStudents });
  const attendanceQuery = useQuery({
    queryKey: [...ATTENDANCE_DATE_KEY, date],
    queryFn: () => getAttendanceForDate(date),
  });
  const saveMutation = useMutation({
    mutationFn: ({ saveDate, records }: { saveDate: string; records: AttendanceRecord[] }) =>
      saveAttendanceForDate(saveDate, records),
    onSuccess: async (records, variables) => {
      queryClient.setQueryData([...ATTENDANCE_DATE_KEY, variables.saveDate], records);
      setEditsByDate((current) => {
        const next = { ...current };
        delete next[variables.saveDate];
        return next;
      });
      setEditingDates((current) => ({ ...current, [variables.saveDate]: false }));
      await queryClient.invalidateQueries({ queryKey: ["attendance", "student"] });
    },
  });

  if (studentsQuery.isLoading || attendanceQuery.isLoading) {
    return <div className="loading-state"><Spin description="Loading attendance register..." /></div>;
  }

  if (studentsQuery.isError) {
    return <Alert type="error" showIcon title="Could not load students" description={studentsQuery.error.message} />;
  }

  if (attendanceQuery.isError) {
    return <Alert type="error" showIcon title="Could not load attendance" description={attendanceQuery.error.message} />;
  }

  const isEditing = Boolean(editingDates[date]);
  const hasSavedAttendance = (attendanceQuery.data ?? []).length > 0;
  const draft: Record<string, AttendanceStatus> = Object.fromEntries(
    (attendanceQuery.data ?? []).map(({ studentId, status }) => [studentId, status]),
  );
  for (const [studentId, status] of Object.entries(editsByDate[date] ?? {})) {
    if (status) draft[studentId] = status;
    else delete draft[studentId];
  }
  const activeStudents = (studentsQuery.data ?? []).filter(
    (student) => (student.status ?? "Active") === "Active",
  );
  const markedCount = activeStudents.filter((student) => draft[String(student.id)]).length;
  const countForStatus = (status: AttendanceStatus) =>
    activeStudents.filter((student) => draft[String(student.id)] === status).length;
  const attendanceRecords = activeStudents.flatMap((student) => {
    const status = draft[String(student.id)];
    return status ? [{ studentId: String(student.id), status }] : [];
  });

  return (
    <>
      <div className="page-heading attendance-heading">
        <div>
          <Typography.Text className="eyebrow">DAILY REGISTER</Typography.Text>
          <Typography.Title level={1}>Attendance</Typography.Title>
          <Typography.Paragraph type="secondary">
            Mark daily attendance for active students.
          </Typography.Paragraph>
        </div>
        <div className="attendance-toolbar">
          <Input
            aria-label="Attendance date"
            type="date"
            value={date}
            onChange={(event) => {
              saveMutation.reset();
              setDate(event.target.value);
            }}
          />
          {hasSavedAttendance && !isEditing ? (
            <Button type="primary" disabled>Already marked</Button>
          ) : (
            <Button
              type="primary"
              loading={saveMutation.isPending}
              disabled={activeStudents.length === 0 || (!hasSavedAttendance && attendanceRecords.length === 0)}
              onClick={() => saveMutation.mutate({ saveDate: date, records: attendanceRecords })}
            >
              {hasSavedAttendance ? "Save changes" : "Add attendance"}
            </Button>
          )}
          {hasSavedAttendance && !isEditing && (
            <Button onClick={() => setEditingDates((current) => ({ ...current, [date]: true }))}>
              Edit attendance
            </Button>
          )}
          {hasSavedAttendance && isEditing && (
            <Button onClick={() => {
              setEditsByDate((current) => {
                const next = { ...current };
                delete next[date];
                return next;
              });
              setEditingDates((current) => ({ ...current, [date]: false }));
            }}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {saveMutation.error && (
        <Alert className="page-alert" type="error" showIcon title="Could not save attendance" description={saveMutation.error.message} />
      )}
      {saveMutation.isSuccess && (
        <Alert className="page-alert" type="success" showIcon title={`Attendance saved for ${date}.`} />
      )}

      <section className="stat-grid attendance-stat-grid" aria-label="Attendance totals">
        <Card className="stat-card"><Statistic title="Active students" value={activeStudents.length} /></Card>
        <Card className="stat-card"><Statistic title="Marked" value={markedCount} /></Card>
        <Card className="stat-card"><Statistic title="Present" value={countForStatus("Present")} /></Card>
        <Card className="stat-card"><Statistic title="Half day" value={countForStatus("Half day")} /></Card>
        <Card className="stat-card"><Statistic title="Absent" value={countForStatus("Absent")} /></Card>
      </section>

      <Card className="attendance-register">
        <div className="list-header attendance-list-heading">
          <Typography.Title level={2}>Student register</Typography.Title>
          <Typography.Text type="secondary">{markedCount} of {activeStudents.length} marked</Typography.Text>
        </div>
        {activeStudents.length === 0 ? (
          <Empty description="No active students to mark" />
        ) : (
          <div className="attendance-list">
            {activeStudents.map((student) => {
              const studentId = String(student.id);
              return (
                <div className="attendance-row" key={studentId}>
                  <div className="attendance-student">
                    <Link href={`/students/${student.id}`}>{student.name}</Link>
                    <Typography.Text type="secondary">{student.course} · {student.email}</Typography.Text>
                  </div>
                  <Select<AttendanceStatus>
                    aria-label={`Attendance for ${student.name}`}
                    placeholder="Not marked"
                    allowClear
                    disabled={hasSavedAttendance && !isEditing}
                    value={draft[studentId]}
                    onChange={(status) => setEditsByDate((current) => ({
                      ...current,
                      [date]: { ...current[date], [studentId]: status ?? null },
                    }))}
                    options={ATTENDANCE_STATUSES.map((status) => ({ label: status, value: status }))}
                  />
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </>
  );
}