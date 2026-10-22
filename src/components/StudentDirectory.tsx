"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Card, Input, Select, Spin, Statistic, Typography } from "antd";

import { deleteStudent, getStudents } from "../api/studentAPI";
import StudentList from "./StudentList";

const STUDENTS_KEY = ["students"];
const ENROLLMENT_STATUSES = ["Active", "Graduated", "Dropout"] as const;

export default function StudentDirectory() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const { data: students = [], isLoading, isError, error } = useQuery({
    queryKey: STUDENTS_KEY,
    queryFn: getStudents,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STUDENTS_KEY }),
  });

  const filteredStudents = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return [...students]
      .sort((first, second) => String(first.id).localeCompare(String(second.id)))
      .filter((student) => {
        const searchableFields = [
          student.name,
          student.email,
          student.phone,
          student.city,
          student.pinCode,
          student.course,
          ...(student.additionalCourses ?? []).map(({ name }) => name),
        ];
        const matchesSearch = searchableFields.some((field) =>
          field?.toLowerCase().includes(searchText),
        );

        return matchesSearch &&
          (statusFilter === "All" || (student.status ?? "Active") === statusFilter);
      });
  }, [students, search, statusFilter]);

  const activeCount = students.filter((student) => (student.status ?? "Active") === "Active").length;

  return (
    <>
      <div className="page-heading">
        <div>
          <Typography.Text className="eyebrow">RECORDS</Typography.Text>
          <Typography.Title level={1}>Students</Typography.Title>
          <Typography.Paragraph type="secondary">Browse and manage student records.</Typography.Paragraph>
        </div>
        <Button type="primary" href="/students/new">Add student</Button>
      </div>

      <section className="stat-grid" aria-label="Student totals">
        <Card className="stat-card"><Statistic title="Total students" value={students.length} /></Card>
        <Card className="stat-card active-stat"><Statistic title="Active enrollment" value={activeCount} /></Card>
        <Card className="stat-card"><Statistic title="Showing" value={filteredStudents.length} /></Card>
      </section>

      {deleteMutation.error && (
        <Alert className="page-alert" type="error" showIcon title="Could not delete student" description={deleteMutation.error.message} />
      )}

      <Card className="list-section">
        <div className="list-header">
          <Typography.Title level={2}>Student records</Typography.Title>
          <div className="list-controls">
            <Input.Search
              className="search-input"
              placeholder="Search students"
              aria-label="Search students"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              allowClear
            />
            <Select
              aria-label="Filter by enrollment status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { label: "All statuses", value: "All" },
                ...ENROLLMENT_STATUSES.map((status) => ({ label: status, value: status })),
              ]}
              style={{ minWidth: 155 }}
            />
          </div>
        </div>
        {isLoading ? (
          <div className="loading-state"><Spin description="Loading students..." /></div>
        ) : isError ? (
          <Alert type="error" showIcon title="Could not load students" description={error.message} />
        ) : (
          <StudentList
            students={filteredStudents}
            onDelete={(id) => deleteMutation.mutate(id)}
            isDeleting={deleteMutation.isPending}
          />
        )}
      </Card>
      <div className="status-link-row">
        <Typography.Text type="secondary">Need an enrollment overview?</Typography.Text>
        <Link href="/students/status">View student status</Link>
      </div>
    </>
  );
}