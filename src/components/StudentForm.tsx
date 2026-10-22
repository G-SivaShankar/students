import { Button, Card, Col, Form, Input, Row, Select, Space, Typography } from "antd";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import type { z } from "zod";
import { studentSchema } from "../studentSchema";
import type { Student, StudentInput } from "../types/Student";

interface StudentFormProps {
  editingStudent: Student | null;
  onSave: (student: StudentInput) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

type StudentFormValues = z.input<typeof studentSchema>;

const emptyStudent: StudentFormValues = {
  name: "",
  email: "",
  phone: "",
  city: "",
  pinCode: "",
  status: "Active",
  course: "",
  additionalCourses: [],
};

export default function StudentForm({
  editingStudent,
  onSave,
  onCancel,
  isSaving,
}: StudentFormProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setFocus,
  } = useForm<StudentFormValues, unknown, StudentInput>({
    resolver: zodResolver(studentSchema),
    defaultValues: emptyStudent,
  });
  const { append, fields, remove } = useFieldArray({
    control,
    name: "additionalCourses",
  });

  useEffect(() => {
    if (editingStudent) {
      reset({
        name: editingStudent.name,
        email: editingStudent.email,
        phone: editingStudent.phone ?? "",
        city: editingStudent.city ?? "",
        pinCode: editingStudent.pinCode ?? "",
        status: editingStudent.status ?? "Active",
        course: editingStudent.course,
        additionalCourses: editingStudent.additionalCourses ?? [],
      });
    } else {
      reset(emptyStudent);
    }

    setFocus("name");
  }, [editingStudent, reset, setFocus]);

  const submitStudent = handleSubmit(async (student) => {
    try {
      await onSave(student);
      reset(emptyStudent);
      setFocus("name");
    } catch {
      // Keep the entered details so the user can retry.
    }
  });

  return (
    <Card
      className="student-form"
      title={editingStudent ? "Edit Student" : "Add Student"}
    >
      <form onSubmit={submitStudent} noValidate>
        <Form layout="vertical" component={false}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label="Student name" validateStatus={errors.name ? "error" : ""} help={errors.name?.message}>
              <Controller
                control={control}
                name="name"
                render={({ field }) => <Input {...field} placeholder="Student name" />}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Email address" validateStatus={errors.email ? "error" : ""} help={errors.email?.message}>
              <Controller
                control={control}
                name="email"
                render={({ field }) => <Input {...field} type="email" placeholder="Email address" />}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Phone number" validateStatus={errors.phone ? "error" : ""} help={errors.phone?.message}>
              <Controller
                control={control}
                name="phone"
                render={({ field }) => <Input {...field} type="tel" placeholder="Phone number" />}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="City" validateStatus={errors.city ? "error" : ""} help={errors.city?.message}>
              <Controller
                control={control}
                name="city"
                render={({ field }) => <Input {...field} placeholder="City" />}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="PIN Code" validateStatus={errors.pinCode ? "error" : ""} help={errors.pinCode?.message}>
              <Controller
                control={control}
                name="pinCode"
                render={({ field }) => <Input {...field} placeholder="PIN Code" />}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Enrollment status">
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    {...field}
                    options={["Active", "Graduated", "Dropout"].map((status) => ({
                      label: status,
                      value: status,
                    }))}
                  />
                )}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Course" validateStatus={errors.course ? "error" : ""} help={errors.course?.message}>
              <Controller
                control={control}
                name="course"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select course"
                    options={["React", "TypeScript", "JavaScript", "Full Stack" ,"Others"].map((course) => ({
                      label: course,
                      value: course,
                    }))}
                  />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <section className="field-array" aria-label="Additional courses">
          <Typography.Title level={5}>Additional courses</Typography.Title>
          {fields.map((field, index) => {
            const courseError = errors.additionalCourses?.[index]?.name;

            return (
              <div className="additional-course-row" key={field.id}>
                <Form.Item
                  className="additional-course-input"
                  validateStatus={courseError ? "error" : ""}
                  help={courseError?.message}
                >
                  <Controller
                    control={control}
                    name={`additionalCourses.${index}.name`}
                    render={({ field: inputField }) => (
                      <Input {...inputField} placeholder="Course name" />
                    )}
                  />
                </Form.Item>
                <Button onClick={() => remove(index)} aria-label={`Remove additional course ${index + 1}`}>
                  Remove
                </Button>
              </div>
            );
          })}
          <Button onClick={() => append({ name: "" })}>Add another course</Button>
        </section>

        <Space className="form-actions">
          <Button type="primary" htmlType="submit" loading={isSaving}>
            {editingStudent ? "Update Student" : "Add Student"}
          </Button>
          {editingStudent && <Button onClick={onCancel}>Cancel</Button>}
        </Space>
        </Form>
      </form>
    </Card>
  );
}