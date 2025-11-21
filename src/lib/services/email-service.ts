

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
}: SendEmailParams): Promise<{ success: boolean; error?: string }> {
    try {
        const resend = getResendClient();
        // Use the provided from email or default to the one in env
        // Note: For Resend free tier/testing, you must use 'onboarding@resend.dev' unless you verify a domain
        const fromEmail = from || process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

        // Resend accepts an array of strings for 'to'
        const recipients = to.map((r) => r.email);

        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: recipients,
            subject: subject,
            html: htmlBody,
        });

        if (error) {
            console.error("Resend API error:", error);
            return { success: false, error: error.message };
        }

        console.log(`Email sent successfully via Resend to ${to.length} recipient(s)`, data?.id);
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
