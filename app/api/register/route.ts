import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { registerLimiter } from "@/lib/rate-limit";
import { validatePasswordStrength } from "@/lib/password-validation";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  language: z.enum(["en", "cs"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const rateLimitResult = registerLimiter.check(ip);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { 
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const { email, password, language = "en" } = parsed.data;
    
    // Password strength validation
    const strengthCheck = validatePasswordStrength(password);
    if (!strengthCheck.valid) {
      return NextResponse.json(
        { 
          error: "Password does not meet security requirements",
          passwordErrors: strengthCheck.errors,
        },
        { status: 400 }
      );
    }
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        settings: { create: { language } },
      },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
