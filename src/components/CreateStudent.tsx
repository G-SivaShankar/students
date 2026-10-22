"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Typography } from "antd";
import { useRouter } from "next/navigation";

import { addStudent } from "../api/studentAPI";
import type { StudentInput } from "../types/Student";
import StudentForm from "./StudentForm";

export default function CreateStudent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: addStudent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["students"] });
      router.push("/students");
    },
  });

  const saveStudent = async (student: StudentInput) => {
    await mutation.mutateAsync(student);
  };

  return (
    <>
      <div className="page-heading compact-heading">
        <div>
          <Typography.Text className="eyebrow">NEW RECORD</Typography.Text>
          <Typography.Title level={1}>Add student</Typography.Title>
          <Typography.Paragraph type="secondary">Enter the student profile and enrollment details.</Typography.Paragraph>
        </div>
        <Button href="/students">Back to students</Button>
      </div>
      {mutation.error && (
        <Alert className="page-alert" type="error" showIcon title="Student could not be saved" description={mutation.error.message} />
      )}
      <StudentForm
        editingStudent={null}
        onSave={saveStudent}
        onCancel={() => router.push("/students")}
        isSaving={mutation.isPending}
      />
    </>
  );
}