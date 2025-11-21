"use server";

import { createClient } from "@/lib/supabase/server";
import { sendEmailViaMailgun, isValidEmail } from "@/lib/services/email-service";

export async function sendEmail(
    recipients: string[],
    subject: string,
    body: string,
    attachments: { name: string; type: string; size: number }[]
) {
    try {
        // Validate recipients
        const validRecipients = recipients.filter(email => isValidEmail(email));

        if (validRecipients.length === 0) {
            return {
                success: false,
                error: "No valid email recipients provided"
            };
        }

        // Prepare recipients for Mailgun API
        const emailRecipients = validRecipients.map(email => ({
            email,
            name: email.split('@')[0], // Use email prefix as name
        }));

        // Send email via Mailgun
        const result = await sendEmailViaMailgun({
            to: emailRecipients,
            subject,
            htmlBody: body, // Body is already HTML from RichTextEditor
        });

        if (!result.success) {
            console.error("Email sending failed:", result.error);
            return {
                success: false,
                error: result.error || "Failed to send email"
            };
        }

        console.log(`Email sent successfully to ${validRecipients.length} recipient(s)`);

        // Note: Attachment handling can be added later if needed
        if (attachments.length > 0) {
            console.log(`Note: ${attachments.length} attachment(s) were not sent (feature not yet implemented)`);
        }

        return { success: true };
    } catch (error) {
        console.error("Error in sendEmail action:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred"
        };
    }
}

export async function sendSms(
    recipients: string[],
    body: string,
    attachments: { name: string; type: string; size: number }[]
) {
    // Mock SMS sending
    console.log("Sending SMS:", {
        recipients,
        body,
        attachments,
    });

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return { success: true };
}

