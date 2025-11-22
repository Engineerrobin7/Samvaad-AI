// Multi-document chat service
import { GoogleGenerativeAI } from '@google/generative-ai';
import pdfParse from 'pdf-parse';
import { promises as fs } from 'fs';

interface Document {
  id: string;
  name: string;
  content: string;
  type: 'pdf' | 'text';
  uploadedAt: Date;
}

interface ChatContext {
  documents: Document[];
  conversationHistory: { role: string; content: string }[];
}

class MultiDocumentService {
  private genAI: GoogleGenerativeAI;
  private contexts: Map<string, ChatContext> = new Map();

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Extract text from PDF
   */
  private async extractPDFText(filePath: string): Promise<string> {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error('Failed to extract PDF text');
    }
  }

  /**
   * Add document to context
   */
  async addDocument(
    sessionId: string,
    filePath: string,
    fileName: string,
    fileType: 'pdf' | 'text'
  ): Promise<Document> {
    try {
      let content: string;

      if (fileType === 'pdf') {
        content = await this.extractPDFText(filePath);
      } else {
        content = await fs.readFile(filePath, 'utf-8');
      }

      const document: Document = {
        id: `${Date.now()}_${fileName}`,
        name: fileName,
        content,
        type: fileType,
        uploadedAt: new Date(),
      };

      // Get or create context
      let context = this.contexts.get(sessionId);
      if (!context) {
        context = {
          documents: [],
          conversationHistory: [],
        };
        this.contexts.set(sessionId, context);
      }

      context.documents.push(document);

      return document;
    } catch (error) {
      console.error('Add document error:', error);
      throw new Error('Failed to add document');
    }
  }

  /**
   * Chat with multiple documents
   */
  async chatWithDocuments(
    sessionId: string,
    question: string,
    language: string = 'en'
  ): Promise<string> {
    try {
      const context = this.contexts.get(sessionId);
      if (!context || context.documents.length === 0) {
        throw new Error('No documents in context');
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      // Build context from all documents
      const documentsContext = context.documents
        .map((doc, idx) => `Document ${idx + 1} (${doc.name}):\n${doc.content}`)
        .join('\n\n---\n\n');

      // Build conversation history
      const historyContext = context.conversationHistory
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      const prompt = `You are a helpful assistant that answers questions based on multiple provided documents in ${language}.

Documents:
${documentsContext}

Previous conversation:
${historyContext}

User question: ${question}

Please provide a comprehensive answer based on the documents. If the answer requires information from multiple documents, synthesize them. If the information is not in the documents, say so clearly.

Answer:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const answer = response.text();

      // Update conversation history
      context.conversationHistory.push(
        { role: 'user', content: question },
        { role: 'assistant', content: answer }
      );

      return answer;
    } catch (error) {
      console.error('Multi-document chat error:', error);
      throw new Error('Failed to chat with documents');
    }
  }

  /**
   * Summarize all documents
   */
  async summarizeDocuments(sessionId: string, language: string = 'en'): Promise<string> {
    try {
      const context = this.contexts.get(sessionId);
      if (!context || context.documents.length === 0) {
        throw new Error('No documents in context');
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const documentsContext = context.documents
        .map((doc, idx) => `Document ${idx + 1} (${doc.name}):\n${doc.content}`)
        .join('\n\n---\n\n');

      const prompt = `Provide a comprehensive summary of the following documents in ${language}. 
Highlight key points, common themes, and important differences between documents.

${documentsContext}

Summary:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;

      return response.text();
    } catch (error) {
      console.error('Summarize documents error:', error);
      throw new Error('Failed to summarize documents');
    }
  }

  /**
   * Compare documents
   */
  async compareDocuments(
    sessionId: string,
    aspect: string,
    language: string = 'en'
  ): Promise<string> {
    try {
      const context = this.contexts.get(sessionId);
      if (!context || context.documents.length < 2) {
        throw new Error('Need at least 2 documents to compare');
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const documentsContext = context.documents
        .map((doc, idx) => `Document ${idx + 1} (${doc.name}):\n${doc.content}`)
        .join('\n\n---\n\n');

      const prompt = `Compare the following documents focusing on: ${aspect}
Provide the comparison in ${language}.

${documentsContext}

Comparison:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;

      return response.text();
    } catch (error) {
      console.error('Compare documents error:', error);
      throw new Error('Failed to compare documents');
    }
  }

  /**
   * Get document list
   */
  getDocuments(sessionId: string): Document[] {
    const context = this.contexts.get(sessionId);
    return context?.documents || [];
  }

  /**
   * Remove document
   */
  removeDocument(sessionId: string, documentId: string): boolean {
    const context = this.contexts.get(sessionId);
    if (!context) return false;

    const initialLength = context.documents.length;
    context.documents = context.documents.filter(doc => doc.id !== documentId);

    return context.documents.length < initialLength;
  }

  /**
   * Clear session
   */
  clearSession(sessionId: string): void {
    this.contexts.delete(sessionId);
  }
}

export const multiDocumentService = new MultiDocumentService();
