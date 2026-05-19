"use server"

import bcrypt from "bcryptjs"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"

import { signIn, signOut } from "@/auth"
import { prisma } from "@/lib/db/prisma"

export interface AuthFormState {
  errors?: {
    name?: string
    email?: string
    password?: string
    confirmPassword?: string
  }
  message?: string
  success?: boolean
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateEmail(email: string): string | null {
  if (!email) return "L'email est requis."
  if (!EMAIL_REGEX.test(email)) return "Email invalide."
  return null
}

function validatePassword(password: string): string | null {
  if (!password) return "Le mot de passe est requis."
  if (password.length < 8) return "Au moins 8 caractères."
  if (!/[a-zA-Z]/.test(password)) return "Au moins une lettre."
  if (!/[0-9]/.test(password)) return "Au moins un chiffre."
  return null
}

export async function register(
  _prev: AuthFormState | undefined,
  formData: FormData
): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")
  const confirmPassword = String(formData.get("confirmPassword") ?? "")

  const errors: NonNullable<AuthFormState["errors"]> = {}

  if (name.length < 2) errors.name = "Au moins 2 caractères."

  const emailError = validateEmail(email)
  if (emailError) errors.email = emailError

  const passwordError = validatePassword(password)
  if (passwordError) errors.password = passwordError

  if (password !== confirmPassword) {
    errors.confirmPassword = "Les mots de passe ne correspondent pas."
  }

  if (Object.keys(errors).length > 0) {
    return { errors }
  }

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })
  if (existing) {
    return { errors: { email: "Cet email est déjà utilisé." } }
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
      },
    })
  } catch (e) {
    console.error("[auth.register] create user failed", { email, error: e })
    return { message: "Impossible de créer le compte. Réessaie plus tard." }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    })
  } catch (e) {
    if (e instanceof AuthError) {
      return {
        success: true,
        message: "Compte créé. Connecte-toi avec tes identifiants.",
      }
    }
    throw e
  }

  redirect("/dashboard")
}

export async function login(
  _prev: AuthFormState | undefined,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")

  const errors: NonNullable<AuthFormState["errors"]> = {}
  const emailError = validateEmail(email)
  if (emailError) errors.email = emailError
  if (!password) errors.password = "Le mot de passe est requis."

  if (Object.keys(errors).length > 0) {
    return { errors }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    })
    return {}
  } catch (e) {
    if (e instanceof AuthError) {
      if (e.type === "CredentialsSignin") {
        return { message: "Email ou mot de passe incorrect." }
      }
      return { message: "Erreur de connexion. Réessaie." }
    }
    throw e
  }
}

export async function loginWithGoogle(): Promise<void> {
  await signIn("google", { redirectTo: "/dashboard" })
}

export async function logout(): Promise<void> {
  await signOut({ redirectTo: "/" })
}
