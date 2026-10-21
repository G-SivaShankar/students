"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Card, Descriptions, Popconfirm, Spin, Tag, Typography } from "antd";
import { useRouter } from "next/navigation";

import { deleteStudent, getStudent, updateStudent } from "../api/studentAPI";
import type { StudentInput } from "../types/Student";
import StatusControl from "./StatusControl";
import StudentForm from "./StudentForm";

export default function StudentDetails({ id }: { id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const query = useQuery({
    queryKey: ["student", id],
    queryFn: () => getStudent(id),
  });
  const updateMutation = useMutation({
    mutationFn: (student: StudentInput) => updateStudent(id, student),
    onSuccess: async (student) => {
      queryClient.setQueryData(["student", id], student);
      await queryClient.invalidateQueries({ queryKey: ["students"] });
      setIsEditing(false);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: () => deleteStudent(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["students"] });
      router.push("/students");
    },
  });

  if (query.isLoading) {
    return <div className="loading-state"><Spin description="Loading student..." /></div>;
  }

  if (query.isError || !query.data) {
    return (
      <>
        <Alert type="error" showIcon message="Student could not be loaded" description={query.error?.message ?? "Student not found."} />
        <Button className="back-button" href="/students">Back to students</Button>
      </>
    );
  }

  const student = query.data;
  const courses = [student.course, ...(student.additionalCourses ?? []).map(({ name }) => name)];

  return (
    <>
      <div className="page-heading compact-heading">
        <div>
          <Typography.Text className="eyebrow">STUDENT PROFILE</Typography.Text>
          <Typography.Title level={1}>{student.name}</Typography.Title>
          <Typography.Paragraph type="secondary">Student record and enrollment information.</Typography.Paragraph>
        </div>
        <Button href="/students">Back to students</Button>
      </div>

      {updateMutation.error && <Alert className="page-alert" type="error" showIcon message="Update failed" description={updateMutation.error.message} />}
      {deleteMutation.error && <Alert className="page-alert" type="error" showIcon message="Delete failed" description={deleteMutation.error.message} />}

      {isEditing ? (
        <StudentForm
          editingStudent={student}
          onSave={(input) => updateMutation.mutateAsync(input).then(() => undefined)}
          onCancel={() => setIsEditing(false)}
          isSaving={updateMutation.isPending}
        />
      ) : (
        <Card className="details-card" title="Student details">
          <Descriptions column={{ xs: 1, sm: 2 }} bordered>
            <Descriptions.Item label="Email">{student.email}</Descriptions.Item>
            <Descriptions.Item label="Phone">{student.phone || "-"}</Descriptions.Item>
            <Descriptions.Item label="City">{student.city || "-"}</Descriptions.Item>
            <Descriptions.Item label="PIN code">{student.pinCode || "-"}</Descriptions.Item>
            <Descriptions.Item label="Courses" span={2}>
              <div className="course-tags">
                {courses.map((course) => <Tag key={course}>{course}</Tag>)}
              </div>
            </Descriptions.Item>
          </Descriptions>
          <div className="detail-status">
            <Typography.Text strong>Enrollment status</Typography.Text>
            <StatusControl student={student} />
          </div>
          <div className="detail-actions">
            <Button type="primary" onClick={() => setIsEditing(true)}>Edit details</Button>
            <Popconfirm
              title={`Delete ${student.name}?`}
              description="This action cannot be undone."
              onConfirm={() => deleteMutation.mutate()}
              okText="Delete"
              okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
            >
              <Button danger loading={deleteMutation.isPending}>Delete student</Button>
            </Popconfirm>
            <Link className="subtle-link" href="/students/status">View status overview</Link>
          </div>
        </Card>
      )}
    </>
  );
}