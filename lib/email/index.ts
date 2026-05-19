import { Resend } from "resend"

import { alertEmailTemplate, type AlertEmailInput } from "@/lib/email/templates"

let cachedClient: Resend | null = null

function getResend(): Resend {
  if (cachedClient) return cachedClient
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error("[email] RESEND_API_KEY manquant")
  }
  cachedClient = new Resend(apiKey)
  return cachedClient
}

function getFromAddress(): string {
  const from = process.env.RESEND_FROM_EMAIL
  if (!from) {
    throw new Error("[email] RESEND_FROM_EMAIL manquant")
  }
  return from
}

export async function sendAlertEmail(input: AlertEmailInput): Promise<{ ok: boolean; id?: string }> {
  if (!input.user.email) {
    return { ok: false }
  }

  const { subject, html, text } = alertEmailTemplate(input)

  try {
    const resend = getResend()
    const result = await resend.emails.send({
      from: getFromAddress(),
      to: input.user.email,
      subject,
      html,
      text,
    })

    if (result.error) {
      console.error("[email] resend error", { error: result.error, to: input.user.email })
      return { ok: false }
    }

    return { ok: true, id: result.data?.id }
  } catch (error) {
    console.error("[email] send failed", { error, to: input.user.email })
    return { ok: false }
  }
}
