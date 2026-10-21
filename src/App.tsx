import { useCallback, useMemo, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Alert, Card, Input, Select, Spin, Statistic, Typography } from "antd";

import {
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent,
} from "./api/studentAPI";

import StudentForm from "./components/StudentForm";
import StudentList from "./components/StudentList";

import type { Student, StudentInput } from "./types/Student";

const STUDENTS_KEY = ["students"];
const ENROLLMENT_STATUSES = ["Active", "Graduated", "On leave"] as const;

export default function App() {
  const queryClient = useQueryClient();

  const [editingStudent, setEditingStudent] =
    useState<Student | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // read
  const {
    data: students = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: STUDENTS_KEY,
    queryFn: getStudents,
  });

  // Refresh student data after a successful mutation
  const refreshStudents = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: STUDENTS_KEY,
    });
  }, [queryClient]);

  // create
  const createMutation = useMutation({
    mutationFn: addStudent,
    onSuccess: refreshStudents,
  });

  // update
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      student,
    }: {
      id: string | number;
      student: StudentInput;
    }) => updateStudent(id, student),
    onSuccess: refreshStudents,
  });

  // delete
  const deleteMutation = useMutation({
    mutationFn: deleteStudent,
    onSuccess: refreshStudents,
  });

  const handleSave = async (student: StudentInput) => {
    if (editingStudent) {
      await updateMutation.mutateAsync({
        id: editingStudent.id,
        student,
      });
      setEditingStudent(null);
    } else {
      await createMutation.mutateAsync(student);
    }
  };

  const filteredStudents = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return [...students]
      .sort((a, b) => Number(a.id) - Number(b.id))
      .filter((student) => {
        const name = student.name?.toLowerCase() ?? "";
        const email = student.email?.toLowerCase() ?? "";
        const phone = student.phone?.toLowerCase() ?? "";
        const city = student.city?.toLowerCase() ?? "";
        const pinCode = student.pinCode?.toLowerCase() ?? "";
        const course = student.course?.toLowerCase() ?? "";
        const additionalCourses = student.additionalCourses?.some(({ name }) =>
          name.toLowerCase().includes(searchText),
        ) ?? false;

        return (
          name.includes(searchText) ||
          email.includes(searchText) ||
          phone.includes(searchText) ||
          city.includes(searchText) ||
          pinCode.includes(searchText) ||
          course.includes(searchText) ||
          additionalCourses
        ) && (statusFilter === "All" || (student.status ?? "Active") === statusFilter);
      });
  }, [students, search, statusFilter]);

  const isSaving =
    createMutation.isPending || updateMutation.isPending;

  const mutationError =
    createMutation.error || updateMutation.error || deleteMutation.error;

  return (
    <main className="container">
      <header className="page-header">
        <div>
          <Typography.Text className="eyebrow">STUDENT PORTAL</Typography.Text>
          <Typography.Title level={1}>Student Management</Typography.Title>
          <Typography.Paragraph type="secondary">Manage your students in one place.</Typography.Paragraph>
        </div>

        <Card className="student-count"><Statistic title="Total students" value={students.length} /></Card>
      </header>

      <StudentForm
        editingStudent={editingStudent}
        onSave={handleSave}
        onCancel={() => setEditingStudent(null)}
        isSaving={isSaving}
      />

      {mutationError && (
        <Alert className="operation-error" type="error" showIcon title="Operation failed" description={mutationError.message} />
      )}

      <Card className="list-section">
        <div className="list-header">
          <Typography.Title level={2}>Student Records</Typography.Title>

          <Input.Search
            className="search-input"
            placeholder="Search students..."
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
            style={{ minWidth: 160 }}
          />
        </div>

        {isLoading ? (
          <div className="loading-state"><Spin description="Loading students..." /></div>
        ) : isError ? (
          <Alert type="error" showIcon title="Could not load students" description={error.message} />
        ) : (
          <StudentList
            students={filteredStudents}
            onEdit={setEditingStudent}
            onDelete={(id) => deleteMutation.mutate(id)}
            isDeleting={deleteMutation.isPending}
          />
        )}
      </Card>
    </main>
  );
}