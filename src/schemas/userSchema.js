const { z } = require("zod");

const registerUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "password must be at least 8 characters"),
  userType: z.enum(["admin", "user"]).optional(),
});


const loginUserSchema = z.object({
    email:z.string().email("Invalid email"),
    password:z.string().min(8,"password must be at least 8 character")
})



module.exports = { registerUserSchema,loginUserSchema };
