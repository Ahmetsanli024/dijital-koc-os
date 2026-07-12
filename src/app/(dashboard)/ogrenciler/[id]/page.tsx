import { redirect } from "next/navigation"

export default async function StudentFolderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/ogrenciler/${id}/ozet`)
}