import { z } from "zod";

export const newMeetingSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(50, "Title must be at most 50 characters"),
  description: z
    .string()
    .min(3, "Description must be at least 3 characters")
    .max(100, "Description must be at most 100 characters"),
  date: z.date().refine((val) => !isNaN(val.getTime()), {
    message: "Date must be a valid date",
  }),
});
