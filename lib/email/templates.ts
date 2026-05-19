import type { CalendarConcert } from "@/lib/calendar"

const ACCENT = "#c8872a"
const ACCENT_LIGHT = "#f0c060"
const BG = "#0d0a07"
const SURFACE = "#1a1410"
const TEXT = "#f0e6d0"
const TEXT_MUTED = "#8a7a60"
const BORDER = "#3d3020"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://overture.music"

function formatFrenchDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  }).format(date)
}

function formatVenue(venue: CalendarConcert["venue"]): string {
  if (!venue) return ""
  return [venue.name, venue.city, venue.country].filter(Boolean).join(" · ")
}

function urgencyLabel(daysBefore: number): string {
  if (daysBefore <= 1) return "Demain"
  if (daysBefore <= 7) return `Dans ${daysBefore} jours`
  if (daysBefore <= 30) return `Dans ${daysBefore} jours`
  return `Dans ${daysBefore} jours`
}

export type AlertEmailInput = {
  user: { name?: string | null; email: string }
  concert: CalendarConcert & {
    ticketUrl?: string | null
  }
  daysBefore: number
}

export type EmailContent = {
  subject: string
  html: string
  text: string
}

export function alertEmailTemplate(input: AlertEmailInput): EmailContent {
  const { user, concert, daysBefore } = input
  const greeting = user.name ? `Bonjour ${user.name}` : "Bonjour"
  const urgency = urgencyLabel(daysBefore)
  const venue = formatVenue(concert.venue)
  const dateLabel = formatFrenchDate(concert.date)
  const concertUrl = `${APP_URL}/concerts/${concert.id}`

  const subject = `${urgency} : ${concert.artist} — ${concert.title}`

  const text = [
    `${greeting},`,
    "",
    `Le concert "${concert.title}" par ${concert.artist} approche.`,
    `Date : ${dateLabel}`,
    venue ? `Lieu : ${venue}` : null,
    concert.ticketUrl ? `Billetterie : ${concert.ticketUrl}` : null,
    "",
    `Détails : ${concertUrl}`,
    "",
    "— Overture",
  ]
    .filter(Boolean)
    .join("\n")

  const ticketButton = concert.ticketUrl
    ? `<a href="${concert.ticketUrl}" style="display:inline-block;padding:12px 24px;background:${ACCENT};color:${BG};text-decoration:none;border-radius:6px;font-weight:600;font-family:Georgia,serif;margin-right:8px;">Billetterie</a>`
    : ""

  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:${BG};color:${TEXT};font-family:Georgia,'EB Garamond',serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:${SURFACE};border:1px solid ${BORDER};border-radius:12px;overflow:hidden;">
        <tr>
          <td style="padding:32px 32px 24px;border-bottom:1px solid ${BORDER};">
            <p style="margin:0;font-family:Georgia,serif;letter-spacing:0.2em;text-transform:uppercase;color:${ACCENT_LIGHT};font-size:12px;">Overture</p>
            <h1 style="margin:8px 0 0;font-family:Georgia,'Cinzel',serif;color:${ACCENT};font-size:24px;letter-spacing:0.05em;">${urgency}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 16px;color:${TEXT_MUTED};font-size:15px;">${greeting},</p>
            <p style="margin:0 0 24px;color:${TEXT};font-size:16px;line-height:1.6;">Un concert que vous suivez approche. Préparez votre billetterie.</p>

            <div style="border-left:3px solid ${ACCENT};padding:16px 20px;background:${BG};border-radius:0 8px 8px 0;">
              <h2 style="margin:0 0 4px;font-family:Georgia,'Cinzel',serif;color:${TEXT};font-size:20px;">${concert.title}</h2>
              <p style="margin:0 0 12px;color:${ACCENT_LIGHT};font-size:15px;font-style:italic;">${concert.artist}</p>
              <p style="margin:0 0 4px;color:${TEXT};font-size:14px;"><strong style="color:${ACCENT};">Date :</strong> ${dateLabel}</p>
              ${venue ? `<p style="margin:0;color:${TEXT};font-size:14px;"><strong style="color:${ACCENT};">Lieu :</strong> ${venue}</p>` : ""}
            </div>

            <div style="margin-top:32px;">
              ${ticketButton}
              <a href="${concertUrl}" style="display:inline-block;padding:12px 24px;border:1px solid ${ACCENT};color:${ACCENT};text-decoration:none;border-radius:6px;font-weight:600;font-family:Georgia,serif;">Voir sur Overture</a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px;border-top:1px solid ${BORDER};color:${TEXT_MUTED};font-size:12px;text-align:center;">
            Vous recevez cet email parce que vous avez activé une alerte sur Overture.<br>
            <a href="${APP_URL}/alerts" style="color:${ACCENT_LIGHT};text-decoration:underline;">Gérer mes alertes</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`

  return { subject, html, text }
}
