// schemas/memorialSchema.js
const { z } = require("zod");

const createMemorialSchema = z.object({
  // Basic Info
  firstName: z.string().min(1),
  middleName: z.string().optional().default(""),
  lastName: z.string().min(1),
  gender: z.string().optional().default(""),
  relationship: z.string().min(1),
  relationshipOther: z.string().optional().default(""),
  designation: z.string().min(1),
  designationOther: z.string().optional().default(""),
  specialDesignation: z.string().optional().default(""),
  moreDetails: z.string().optional().default(""),

  // Birth Info
  bornYear: z.string().optional().default(""),
  bornMonth: z.string().optional().default(""),
  bornDay: z.string().optional().default(""),
  bornCity: z.string().optional().default(""),
  bornState: z.string().optional().default(""),
  bornCountry: z.string().optional().default(""),

  // Passing Info
  passedYear: z.string().optional().default(""),
  passedMonth: z.string().optional().default(""),
  passedDay: z.string().optional().default(""),
  passedCity: z.string().optional().default(""),
  passedState: z.string().optional().default(""),
  passedCountry: z.string().optional().default(""),

  // Website & Settings
  website: z.string().min(1),
  plan: z.enum(["Basic", "Premium", "Lifetime"]).optional().default("Basic"),
  privacy: z.enum(["public", "private"]).optional().default("public"),
});

module.exports = { createMemorialSchema };

