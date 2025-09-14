"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Assuming Input component is available

export default function ChatWithPDF() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [inputText, setInputText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [error, setError] = useState<string | null>(null); // New state for error messages

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
      setError(null); // Clear any previous errors
    }
  };

  const handleUpload = async () => {
    if (!pdfFile) {
      setError("Please select a PDF file to upload.");
      return;
    }
    setIsUploading(true);
    setError(null); // Clear any previous errors

    const formData = new FormData();
    formData.append("file", pdfFile);

    try {
      const res = await fetch("/api/pdf/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setIsChatting(true);
        setMessages([{ sender: "system", text: "PDF uploaded. You can now chat about its contents." }]);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to upload PDF.");
        setMessages([{ sender: "system", text: "Failed to upload PDF." }]);
      }
    } catch (err) {
      setError("Network error or server is unreachable. Please try again.");
      setMessages([{ sender: "system", text: "Failed to upload PDF due to a network error." }]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = inputText;
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInputText("");
    setError(null); // Clear any previous errors

    // Add a "thinking" message from the AI
    const thinkingMessage = { sender: "ai", text: "Thinking..." };
    setMessages((prev) => [...prev, thinkingMessage]);

    try {
      const res = await fetch("/api/pdf/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();

      // Replace the "thinking" message with the actual AI reply
      setMessages((prev) =>
        prev.map((msg) =>
          msg === thinkingMessage ? { sender: "ai", text: data.reply } : msg
        )
      );
    } catch (err) {
      setError("Network error or server is unreachable. Please try again.");
      // Replace the "thinking" message with an error message
      setMessages((prev) =>
        prev.map((msg) =>
          msg === thinkingMessage ? { sender: "ai", text: "Error: Could not get a response." } : msg
        )
      );
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Chat with PDF</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <label htmlFor="pdf-upload" className="block mb-2 font-medium">Upload PDF file</label>
      <input
        id="pdf-upload"
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        disabled={isUploading || isChatting}
        title="Select a PDF file to upload"
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      <Button
        onClick={handleUpload}
        disabled={!pdfFile || isUploading || isChatting}
        className="ml-2 mt-2" // Added mt-2 for spacing
        title="Upload selected PDF file"
      >
        {isUploading ? "Uploading..." : "Upload PDF"}
      </Button>
      <div className="mt-6 border rounded p-4 min-h-[200px] bg-muted/30 overflow-y-auto max-h-[400px]"> {/* Added max-h and overflow-y */}
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-2 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
            <span className="font-semibold capitalize">{msg.sender}: </span> {/* Capitalize sender */}
            <span>{msg.text}</span>
          </div>
        ))}
      </div>
      {isChatting && (
        <form onSubmit={handleSendMessage} className="flex gap-2 mt-4">
          <label htmlFor="chat-input" className="sr-only">Chat input</label>
          <Input // Changed from input to Input component
            id="chat-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask something about the PDF..."
            className="flex-1" // Removed redundant styling, assuming Input component handles it
            title="Type your question about the PDF"
            disabled={isUploading} // Disable input during upload
          />
          <Button type="submit" title="Send your message" disabled={isUploading}>Send</Button> {/* Disable button during upload */}
        </form>
      )}
    </div>
  );
}