import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { AuthNavbar } from "@/components/layout/AuthNavbar"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/connexion")
  }

  const user = {
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    image: session.user.image ?? null,
  }

  return (
    <div className="flex flex-col min-h-dvh">
      <AuthNavbar user={user} />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
    </div>
  )
}
