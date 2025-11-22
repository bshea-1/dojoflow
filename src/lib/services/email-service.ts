

import { Resend } from "resend";

interface EmailRecipient {
    email: string;
    name?: string;
}

interface SendEmailParams {
    to: EmailRecipient[];
    subject: string;
    htmlBody: string;
    from?: string;
    replyTo?: string;
}

/**
 * Initialize Resend client
 */
function getResendClient() {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        throw new Error(
            "Missing Resend API key. Please configure RESEND_API_KEY in your environment variables."
        );
    }

    return new Resend(apiKey);
}

/**
 * Send email using Resend
 */
export async function sendEmailViaResend({
    to,
    subject,
    htmlBody,
    from,
    replyTo,
}: SendEmailParams): Promise<{ success: boolean; error?: string }> {
    try {
        const resend = getResendClient();

        // Use onboarding@resend.dev as the sender (verified domain)
        const fromEmail = from || "onboarding@resend.dev";

        // Convert recipients to array of email strings
        const recipients = to.map((r) => r.email);

        console.log("Sending email via Resend:", {
            from: fromEmail,
            to: recipients,
            subject,
        });

        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: recipients,
            subject: subject,
            html: htmlBody,
        });

        if (error) {
            console.error("Resend API error:", JSON.stringify(error, null, 2));
            return { success: false, error: error.message };
        }

        console.log("Email sent successfully:", JSON.stringify(data, null, 2));
        return { success: true };
    } catch (error) {
        console.error("Failed to send email via Resend:", error);

        let errorMessage = "Failed to send email";
        if (error instanceof Error) {
            errorMessage = error.message;
        }

        return {
            success: false,
            error: errorMessage,
        };
    }
}

/**
 * Convert plain text to HTML (basic conversion)
 */
export function textToHtml(text: string): string {
    return text
        .split("\n")
        .map((line) => `<p>${line || "&nbsp;"}</p>`)
        .join("");
}

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Send batch emails
 */
export async function sendBatchEmails(emails: SendEmailParams[]) {
    const resend = getResendClient();
    try {
        const batchPayload = emails.map(email => ({
            from: email.from || process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
            to: email.to.map(r => r.email),
            subject: email.subject,
            html: email.htmlBody,
            reply_to: email.replyTo,
        }));

        const { data, error } = await resend.batch.send(batchPayload);

        if (error) {
            console.error("Resend Batch API error:", error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.error("Failed to send batch emails:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

/**
 * Retrieve an email
 */
export async function getEmail(emailId: string) {
    const resend = getResendClient();
    try {
        const { data, error } = await resend.emails.get(emailId);
        if (error) throw new Error(error.message);
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

/**
 * Update an email (scheduled)
 */
export async function updateEmail(emailId: string, scheduledAt: string) {
    const resend = getResendClient();
    try {
        const { data, error } = await resend.emails.update({
            id: emailId,
            scheduledAt,
        });
        if (error) throw new Error(error.message);
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

/**
 * Cancel an email
 */
export async function cancelEmail(emailId: string) {
    const resend = getResendClient();
    try {
        const { data, error } = await resend.emails.cancel(emailId);
        if (error) throw new Error(error.message);
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

/**
 * List emails
 */
export async function listEmails() {
    const resend = getResendClient();
    try {
        const { data, error } = await resend.emails.list();
        if (error) throw new Error(error.message);
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

/**
 * List attachments
 */
export async function listAttachments(emailId: string) {
    const resend = getResendClient();
    try {
        // @ts-ignore - The types might not be fully up to date in the installed version
        const { data, error } = await resend.emails.attachments.list({ emailId });
        if (error) throw new Error(error.message);
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

/**
 * Retrieve attachment
 */
export async function getAttachment(emailId: string, attachmentId: string) {
    const resend = getResendClient();
    try {
        // @ts-ignore
        const { data, error } = await resend.emails.attachments.get({
            id: attachmentId,
            emailId,
        });
        if (error) throw new Error(error.message);
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}
