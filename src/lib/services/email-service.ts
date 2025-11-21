"use server";

import formData from "form-data";
import Mailgun from "mailgun.js";

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
 * Initialize Mailgun client
 */
function getMailgunClient() {
    const apiKey = process.env.MAILGUN_API_KEY;
    const domain = process.env.MAILGUN_DOMAIN;

    if (!apiKey || !domain) {
        throw new Error(
            "Missing Mailgun credentials. Please configure MAILGUN_API_KEY and MAILGUN_DOMAIN in your environment variables."
        );
    }

    const mailgun = new Mailgun(formData);
    return mailgun.client({ username: "api", key: apiKey });
}

/**
 * Send email using Mailgun API
 */
export async function sendEmailViaMailgun({
    to,
    subject,
    htmlBody,
    from,
}: SendEmailParams): Promise<{ success: boolean; error?: string }> {
    try {
        const mg = getMailgunClient();
        const domain = process.env.MAILGUN_DOMAIN;
        const fromEmail = from || process.env.MAILGUN_FROM_EMAIL || "noreply@" + domain;

        if (!domain) {
            throw new Error("MAILGUN_DOMAIN is not configured");
        }

        // Prepare recipients - Mailgun accepts array of email strings or "Name <email>" format
        const recipients = to.map((recipient) =>
            recipient.name ? `${recipient.name} <${recipient.email}>` : recipient.email
        );

        // Send email using Mailgun
        const result = await mg.messages.create(domain, {
            from: fromEmail,
            to: recipients,
            subject,
            html: htmlBody,
        });

        console.log(`Email sent successfully via Mailgun to ${to.length} recipient(s)`, result);
        return { success: true };
    } catch (error) {
        console.error("Failed to send email via Mailgun:", error);

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
