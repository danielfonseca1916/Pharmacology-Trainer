import { z } from "zod";

export interface PasswordStrengthResult {
  valid: boolean;
  errors: {
    en: string[];
    cs: string[];
  };
}

export function validatePasswordStrength(password: string): PasswordStrengthResult {
  const errors = {
    en: [] as string[],
    cs: [] as string[],
  };

  // Minimum length
  if (password.length < 8) {
    errors.en.push("Password must be at least 8 characters long");
    errors.cs.push("Heslo musí mít alespoň 8 znaků");
  }

  // Must contain at least one number
  if (!/\d/.test(password)) {
    errors.en.push("Password must contain at least one number");
    errors.cs.push("Heslo musí obsahovat alespoň jednu číslici");
  }

  // Must contain at least one letter
  if (!/[a-zA-Z]/.test(password)) {
    errors.en.push("Password must contain at least one letter");
    errors.cs.push("Heslo musí obsahovat alespoň jedno písmeno");
  }

  // Warn about common patterns
  const commonPatterns = [
    "password",
    "123456",
    "qwerty",
    "abc123",
    "password123",
  ];
  const lowerPassword = password.toLowerCase();
  if (commonPatterns.some((pattern) => lowerPassword.includes(pattern))) {
    errors.en.push("Password contains common patterns and is not secure");
    errors.cs.push("Heslo obsahuje běžné vzory a není bezpečné");
  }

  return {
    valid: errors.en.length === 0,
    errors,
  };
}

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/\d/, "Password must contain at least one number")
  .regex(/[a-zA-Z]/, "Password must contain at least one letter");

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
  language: z.enum(["en", "cs"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
