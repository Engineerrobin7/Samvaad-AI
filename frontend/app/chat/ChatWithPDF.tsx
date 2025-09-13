"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ChatWithPDF() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [inputText, setInputText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isChatting, setIsChatting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!pdfFile) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", pdfFile);
    const res = await fetch("/api/pdf/upload", {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      setIsChatting(true);
      setMessages([{ sender: "system", text: "PDF uploaded. You can now chat about its contents." }]);
    } else {
      setMessages([{ sender: "system", text: "Failed to upload PDF." }]);
    }
    setIsUploading(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setMessages((prev) => [...prev, { sender: "user", text: inputText }]);
    setInputText("");
    const res = await fetch("/api/pdf/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: inputText }),
    });
    const data = await res.json();
    setMessages((prev) => [...prev, { sender: "ai", text: data.reply }]);
  };

  return (
    <div className="max-w-xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Chat with PDF</h2>
      <label htmlFor="pdf-upload" className="block mb-2 font-medium">Upload PDF file</label>
      <input
        id="pdf-upload"
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        disabled={isUploading || isChatting}
        title="Select a PDF file to upload"
      />
      <Button
        onClick={handleUpload}
        disabled={!pdfFile || isUploading || isChatting}
        className="ml-2"
        title="Upload selected PDF file"
      >
        Upload PDF
      </Button>
      <div className="mt-6 border rounded p-4 min-h-[200px] bg-muted/30">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-2 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
            <span className="font-semibold">{msg.sender}: </span>
            <span>{msg.text}</span>
          </div>
        ))}
      </div>
      {isChatting && (
        <form onSubmit={handleSendMessage} className="flex gap-2 mt-4">
          <label htmlFor="chat-input" className="sr-only">Chat input</label>
          <input
            id="chat-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask something about the PDF..."
            className="flex-1 rounded-md border px-3 py-2 text-sm shadow-sm"
            title="Type your question about the PDF"
          />
          <Button type="submit" title="Send your message">Send</Button>
        </form>
      )}
    </div>
  );
}