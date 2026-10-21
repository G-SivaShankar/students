"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, Select, Spin } from "antd";

import { updateStudent } from "../api/studentAPI";
import type { Student, StudentInput } from "../types/Student";

const STATUSES = ["Active", "Graduated", "On leave"] as const;

export default function StatusControl({ student }: { student: Student }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (status: StudentInput["status"]) => {
      const { id, ...studentInput } = student;
      return updateStudent(id, { ...studentInput, status });
    },
    onSuccess: async (updatedStudent) => {
      queryClient.setQueryData(["student", updatedStudent.id], updatedStudent);
      await queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });

  return (
    <span className="status-control">
      <Select
        aria-label={`Enrollment status for ${student.name}`}
        value={student.status ?? "Active"}
        disabled={mutation.isPending}
        onChange={(status: StudentInput["status"]) => mutation.mutate(status)}
        options={STATUSES.map((status) => ({ label: status, value: status }))}
        suffixIcon={mutation.isPending ? <Spin size="small" /> : undefined}
      />
      {mutation.error && <Alert className="inline-error" type="error" message="Save failed" />}
    </span>
  );
}