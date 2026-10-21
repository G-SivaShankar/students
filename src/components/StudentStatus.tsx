"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Alert, Card, Empty, Spin, Statistic, Typography } from "antd";

import { getStudents } from "../api/studentAPI";
import type { Student } from "../types/Student";
import StatusControl from "./StatusControl";

const STATUSES = ["Active", "Graduated", "On leave"] as const;

export default function StudentStatus() {
  const { data: students = [], isLoading, isError, error } = useQuery({
    queryKey: ["students"],
    queryFn: getStudents,
  });
  const statusOf = (student: Student) => student.status ?? "Active";

  if (isLoading) return <div className="loading-state"><Spin description="Loading enrollment status..." /></div>;
  if (isError) return <Alert type="error" showIcon message="Could not load student status" description={error.message} />;

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
      </div>

      <section className="stat-grid status-stat-grid" aria-label="Enrollment status totals">
        {STATUSES.map((status) => (
          <Card className="stat-card" key={status}>
            <Statistic title={status} value={students.filter((student) => statusOf(student) === status).length} />
          </Card>
        ))}
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