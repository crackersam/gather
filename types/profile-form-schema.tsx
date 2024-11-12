import { z } from "zod";

export const profileFormSchema = z
  .object({
    password: z.nullable(
      z.string().min(6, "Password must be at least 6 characters")
    ),
    newPassword: z.nullable(
      z.string().min(6, "Password must be at least 6 characters")
    ),
    newPasswordConfirmation: z.string().nullable().optional(),
    image: z.string().optional(),
    // bio: z.string().max(160, "Bio must be at most 160 characters"),
    id: z.string(),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirmation, {
    message: "New passwords do not match",
    path: ["newPasswordConfirmation"],
  });
