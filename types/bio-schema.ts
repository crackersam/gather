import { z } from "zod";

export const bioSchema = z.object({
  bio: z
    .string()
    .min(10, "Bio must contain at least 10 characters")
    .max(200, "Bio must contain at most 200 characters"),
});
