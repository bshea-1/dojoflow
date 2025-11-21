"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Paperclip, X, File as FileIcon, Send } from "lucide-react";
import { toast } from "sonner";
import { sendEmail, sendSms } from "@/app/dashboard/[slug]/communication/actions";

interface ComposeMessageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    recipients: { name: string; email?: string; phone?: string }[];
    defaultTab?: "email" | "sms";
}

export function ComposeMessageDialog({
    open,
    onOpenChange,
    recipients,
    defaultTab = "email",
}: ComposeMessageDialogProps) {
    const [activeTab, setActiveTab] = useState<"email" | "sms">(defaultTab);
    const [subject, setSubject] = useState("");
    const [emailBody, setEmailBody] = useState("");
    const [smsBody, setSmsBody] = useState("");
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isSending, setIsSending] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync activeTab with defaultTab prop changes
    useEffect(() => {
        setActiveTab(defaultTab);
    }, [defaultTab]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachments((prev) => [...prev, ...Array.from(e.target.files!)]
            );
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSend = async () => {
        setIsSending(true);
        try {
            const attachmentMeta = attachments.map(f => ({
                name: f.name,
                type: f.type,
                size: f.size
            }));

            if (activeTab === "email") {
                const validRecipients = recipients.filter(r => r.email).map(r => r.email!);
                if (validRecipients.length === 0) {
                    toast.error("No valid email recipients selected.");
                    return;
                }
                await sendEmail(validRecipients, subject, emailBody, attachmentMeta);
                toast.success(`Email sent to ${validRecipients.length} recipients.`);
            } else {
                const validRecipients = recipients.filter(r => r.phone).map(r => r.phone!);
                if (validRecipients.length === 0) {
                    toast.error("No valid phone recipients selected.");
                    return;
                }
                await sendSms(validRecipients, smsBody, attachmentMeta);
                toast.success(`SMS sent to ${validRecipients.length} recipients.`);
            }
            onOpenChange(false);
            // Reset form
            setSubject("");
            setEmailBody("");
            setSmsBody("");
            setAttachments([]);
        } catch (error) {
            toast.error("Failed to send message.");
            console.error(error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Compose Message</DialogTitle>
                    <DialogDescription>
                        Sending to {recipients.length} recipient{recipients.length !== 1 ? "s" : ""}.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "email" | "sms")}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="email">Email</TabsTrigger>
                        <TabsTrigger value="sms">SMS</TabsTrigger>
                    </TabsList>

                    <div className="mt-4 space-y-4">
                        <TabsContent value="email" className="space-y-4 mt-0">
                            <div className="space-y-2">
                                <Label>Subject</Label>
                                <Input
                                    placeholder="Enter subject..."
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Message</Label>
                                <RichTextEditor
                                    value={emailBody}
                                    onChange={setEmailBody}
                                    placeholder="Type your email here..."
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="sms" className="space-y-4 mt-0">
                            <div className="space-y-2">
                                <Label>Message</Label>
                                <Textarea
                                    placeholder="Type your SMS here..."
                                    value={smsBody}
                                    onChange={(e) => setSmsBody(e.target.value)}
                                    className="min-h-[150px]"
                                />
                                <p className="text-xs text-muted-foreground text-right">
                                    {smsBody.length} characters
                                </p>
                            </div>
                        </TabsContent>

                        {/* Attachments Section */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Attachments</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Paperclip className="h-3 w-3 mr-2" />
                                    Attach File
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    multiple
                                    onChange={handleFileSelect}
                                />
                            </div>

                            {attachments.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {attachments.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-xs group"
                                        >
                                            <FileIcon className="h-3 w-3 text-muted-foreground" />
                                            <span className="max-w-[150px] truncate">{file.name}</span>
                                            <button
                                                onClick={() => removeAttachment(index)}
                                                className="text-muted-foreground hover:text-destructive"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </Tabs>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSend} disabled={isSending}>
                        {isSending ? (
                            "Sending..."
                        ) : (
                            <>
                                <Send className="h-4 w-4 mr-2" />
                                Send {activeTab === "email" ? "Email" : "SMS"}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
