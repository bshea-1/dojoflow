"use server";

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

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
 * Initialize AWS SES client
 */
function getSESClient() {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION || "us-east-1";

    if (!accessKeyId || !secretAccessKey) {
        throw new Error(
            "Missing AWS credentials. Please configure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your environment variables."
        );
    }

    return new SESClient({
        region,
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
    });
}

/**
 * Send email using Amazon SES
 */
export async function sendEmailViaSES({
    to,
    subject,
    htmlBody,
    from,
}: SendEmailParams): Promise<{ success: boolean; error?: string }> {
    try {
        const ses = getSESClient();
        const fromEmail = from || process.env.AWS_FROM_EMAIL;

        if (!fromEmail) {
            throw new Error("AWS_FROM_EMAIL is not configured");
        }

        // SES sends to a list of addresses
        const recipientAddresses = to.map((r) => r.email);

        const command = new SendEmailCommand({
            Destination: {
                ToAddresses: recipientAddresses,
            },
            Message: {
                Body: {
                    Html: {
                        Charset: "UTF-8",
                        Data: htmlBody,
                    },
                },
                Subject: {
                    Charset: "UTF-8",
                    Data: subject,
                },
            },
            Source: fromEmail,
        });

        const result = await ses.send(command);

        console.log(`Email sent successfully via SES to ${to.length} recipient(s)`, result.MessageId);
        return { success: true };
    } catch (error) {
        console.error("Failed to send email via SES:", error);

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
