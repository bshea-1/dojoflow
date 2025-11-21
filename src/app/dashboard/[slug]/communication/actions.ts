"use server";

import { createClient } from "@/lib/supabase/server";

export async function sendEmail(
    recipients: string[],
    subject: string,
    body: string,
    attachments: { name: string; type: string; size: number }[]
) {
    // Mock email sending
    console.log("Sending Email:", {
        recipients,
        subject,
        body,
        attachments,
    });

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return { success: true };
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
