import { z } from "zod";

export const JoinRequestSchema = z.object({
  roleId: z.number({ 
    message: "Role ID is required and must be a number" 
  }).int("Role ID must be an integer").positive("Role ID must be positive"),
});


export const respondRequestSchema = z.object({
    status: z.enum(["accepted", "rejected"], { 
      message: "Status must be either 'accepted' or 'rejected'"
    }),
});