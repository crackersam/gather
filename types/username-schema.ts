import { z } from "zod";

export const usernameSchema = z.object({
  username: z
    .string()
    .min(3, "username must be at least 3 characters")
    .max(20, "username must be at most 20 characters"),
  id: z.string(),
});
