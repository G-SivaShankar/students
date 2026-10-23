import type { Student } from "../types/Student";
import { Button, Empty, Popconfirm, Space, Table } from "antd";
import type { TableColumnsType } from "antd";
import Link from "next/link";

interface StudentListProps {
  students: Student[];
  onDelete: (id: string | number) => void;
  isDeleting: boolean;
}

export default function StudentList({
  students,
  onDelete,
  isDeleting,
}: StudentListProps) {
  const columns: TableColumnsType<Student> = [
    {
      title: "S. No.",
      key: "serial",
      width: 80,
      render: (_value, _student, index) => index + 1,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string, student) => <Link href={`/students/${student.id}`}>{name}</Link>,
    },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone", dataIndex: "phone", key: "phone", render: (phone: string | null) => phone || "-" },
    { title: "City", dataIndex: "city", key: "city", render: (city: string | null) => city || "-" },
    { title: "PIN Code", dataIndex: "pinCode", key: "pinCode", render: (pinCode: string | null) => pinCode || "-" },
    { title: "Status", dataIndex: "status", key: "status", render: (status: string | undefined) => status ?? "Active" },
    {
      title: "Course",
      key: "course",
      render: (_value, student) =>
        [student.course, ...(student.additionalCourses ?? []).map(({ name }) => name)].join(", "),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_value, student) => (
        <Space>
          <Button href={`/students/${student.id}`}>Details</Button>
          <Popconfirm
            title={`Delete ${student.name}?`}
            onConfirm={() => onDelete(student.id)}
            okText="Delete"
            okButtonProps={{ danger: true, loading: isDeleting }}
          >
            <Button danger disabled={isDeleting}>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table<Student>
      rowKey={(student) => String(student.id)}
      columns={columns}
      dataSource={students}
      pagination={{ pageSize: 8, showSizeChanger: true }}
      scroll={{ x: 900 }}
      locale={{ emptyText: <Empty description="No students found" /> }}
    />
  );
}