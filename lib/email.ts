import { supabase } from "./supabase";
import {
  generateStaffInvitationEmailHTML,
  generateStaffInvitationEmailText,
} from "./email-templates";

export interface StaffInvitationEmailData {
  invitationId: string;
  businessName: string;
  inviterName: string;
  role: string;
  acceptUrl: string;
  expiresAt: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isNewUser: boolean;
}

import { emailService } from "./simple-email-api";

export async function sendStaffInvitationEmail(
  email: string,
  data: StaffInvitationEmailData
) {
  try {
    // Generate email content
    const htmlContent = generateStaffInvitationEmailHTML({
      businessName: data.businessName,
      inviterName: data.inviterName,
      role: data.role,
      acceptUrl: data.acceptUrl,
      expiresAt: data.expiresAt,
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      isNewUser: data.isNewUser,
    });

    const textContent = generateStaffInvitationEmailText({
      businessName: data.businessName,
      inviterName: data.inviterName,
      role: data.role,
      acceptUrl: data.acceptUrl,
      expiresAt: data.expiresAt,
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      isNewUser: data.isNewUser,
    });

    const subject = `You're invited to join ${data.businessName} on ShivehView`;

    // Use our custom email service
    const emailId = await emailService.queueEmail(
      email,
      subject,
      htmlContent,
      textContent
    );

    return { success: true, emailId };
  } catch (error) {
    console.error("Failed to send invitation email:", error);
    return { success: false, error };
  }
}

export function generateInvitationToken(invitationId: string): string {
  // Create a simple token based on invitation ID and timestamp
  const timestamp = Date.now();
  const token = Buffer.from(`${invitationId}:${timestamp}`).toString("base64");
  return token;
}

export function validateInvitationToken(token: string): string | null {
  try {
    console.log("🔍 Debug: Validating token:", token);
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    console.log("🔍 Debug: Decoded token:", decoded);
    const [invitationId] = decoded.split(":");
    console.log("🔍 Debug: Extracted invitation ID:", invitationId);
    return invitationId;
  } catch (error) {
    console.log("🔍 Debug: Token validation error:", error);
    return null;
  }
}
