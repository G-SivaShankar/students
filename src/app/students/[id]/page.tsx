import StudentDetails from "../../../components/StudentDetails";

export default async function StudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StudentDetails id={id} />;
}