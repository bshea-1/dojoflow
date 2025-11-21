

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
        // Use the provided from email or default to the one in env
        // Note: For Resend free tier/testing, you must use 'onboarding@resend.dev' unless you verify a domain
        const fromEmail = from || process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

        // Resend accepts an array of strings for 'to'
        const recipients = to.map((r) => r.email);

        // Try sending from the requested address first (e.g. codenfl@outlook.com)
        // This will likely fail if the domain is not verified, but we attempt it as requested.
        const preferredFrom = from || process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
        const fallbackFrom = "onboarding@resend.dev";

        console.log(`Attempting to send email from: ${preferredFrom}`);

        try {
            const { data, error } = await resend.emails.send({
                from: preferredFrom,
                to: recipients,
                subject: subject,
                html: htmlBody,
                replyTo: replyTo,
            });

            if (error) {
                // If the error is about the "from" address, try the fallback
                if (preferredFrom !== fallbackFrom && (error.message.includes("allowed") || error.message.includes("verify") || error.message.includes("domain"))) {
                    console.warn(`Failed to send from ${preferredFrom}. Retrying with fallback: ${fallbackFrom}`);

                    const { data: fallbackData, error: fallbackError } = await resend.emails.send({
                        from: fallbackFrom,
                        to: recipients,
                        subject: subject,
                        html: htmlBody,
                        replyTo: replyTo || preferredFrom, // Set Reply-To to the original sender if not set
                    });

                    if (fallbackError) {
                        console.error("Fallback email sending failed:", JSON.stringify(fallbackError, null, 2));
                        return { success: false, error: fallbackError.message };
                    }

                    console.log("Email sent successfully via fallback sender:", JSON.stringify(fallbackData, null, 2));
                    return { success: true };
                }

                console.error("Resend API error:", JSON.stringify(error, null, 2));
                return { success: false, error: error.message };
            }

            console.log("Resend API success:", JSON.stringify(data, null, 2));
            return { success: true };
        } catch (err) {
            // Catch unexpected errors and try fallback
            console.error("Unexpected error sending email:", err);
            if (preferredFrom !== fallbackFrom) {
                console.log(`Retrying with fallback: ${fallbackFrom}`);
                try {
                    const { data: fallbackData, error: fallbackError } = await resend.emails.send({
                        from: fallbackFrom,
                        to: recipients,
                        subject: subject,
                        html: htmlBody,
                        replyTo: replyTo || preferredFrom,
                    });

                    if (fallbackError) {
                        return { success: false, error: fallbackError.message };
                    }
                    return { success: true };
                } catch (fallbackErr) {
                    return { success: false, error: "Fallback failed" };
                }
            }
            return { success: false, error: "Failed to send email" };
        }
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
