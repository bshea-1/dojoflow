"use server";

import { Client } from "@microsoft/microsoft-graph-client";
import { ClientSecretCredential } from "@azure/identity";
import "isomorphic-fetch";

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
 * Initialize Microsoft Graph client with Azure AD credentials
 */
function getGraphClient(): Client {
    const clientId = process.env.AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;
    const tenantId = process.env.AZURE_TENANT_ID;

    if (!clientId || !clientSecret || !tenantId) {
        throw new Error(
            "Missing Azure AD credentials. Please configure AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, and AZURE_TENANT_ID in your environment variables."
        );
    }

    // Create credential using client credentials flow
    const credential = new ClientSecretCredential(
        tenantId,
        clientId,
        clientSecret
    );

    // Initialize Graph client
    const client = Client.initWithMiddleware({
        authProvider: {
            getAccessToken: async () => {
                const token = await credential.getToken(
                    "https://graph.microsoft.com/.default"
                );
                return token?.token || "";
            },
        },
    });

    return client;
}

/**
 * Send email using Microsoft Graph API
 */
export async function sendEmailViaGraph({
    to,
    subject,
    htmlBody,
    from,
}: SendEmailParams): Promise<{ success: boolean; error?: string }> {
    try {
        const client = getGraphClient();
        const fromEmail = from || process.env.OUTLOOK_EMAIL_FROM;

        if (!fromEmail) {
            throw new Error(
                "No sender email configured. Please set OUTLOOK_EMAIL_FROM in your environment variables."
            );
        }

        // Prepare recipients
        const recipients = to.map((recipient) => ({
            emailAddress: {
                address: recipient.email,
                name: recipient.name || recipient.email,
            },
        }));

        // Prepare email message
        const message = {
            subject,
            body: {
                contentType: "HTML",
                content: htmlBody,
            },
            toRecipients: recipients,
        };

        // Send email using Microsoft Graph API
        // Using /users/{userId}/sendMail endpoint
        await client
            .api(`/users/${fromEmail}/sendMail`)
            .post({
                message,
                saveToSentItems: true,
            });

        console.log(`Email sent successfully to ${to.length} recipient(s)`);
        return { success: true };
    } catch (error) {
        console.error("Failed to send email via Microsoft Graph:", error);

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
