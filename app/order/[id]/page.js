import { redirect } from "next/navigation";

export default async function LegacyOrderRoute({ params }) {
  const { id } = await params;
  redirect(`/orders/${id}`);
}
