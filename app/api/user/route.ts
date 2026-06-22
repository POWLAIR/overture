import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db/prisma"

export async function DELETE(): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await prisma.user.delete({ where: { id: session.user.id } })

  return NextResponse.json({ ok: true })
}
