import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface Annotation {
  id: string;
  documentId: string;
  userId: string;
  text: string;
  position: { x: number; y: number };
  timestamp: Date;
  resolved: boolean;
}

export interface CollaborationSession {
  id: string;
  documentId: string;
  participants: string[];
  annotations: Annotation[];
  createdAt: Date;
}

class CollaborationService {
  private sessions: Map<string, CollaborationSession> = new Map();

  async createSession(documentId: string, userId: string): Promise<CollaborationSession> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: CollaborationSession = {
      id: sessionId,
      documentId,
      participants: [userId],
      annotations: [],
      createdAt: new Date()
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  async addAnnotation(
    sessionId: string,
    userId: string,
    text: string,
    position: { x: number; y: number }
  ): Promise<Annotation> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const annotation: Annotation = {
      id: `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      documentId: session.documentId,
      userId,
      text,
      position,
      timestamp: new Date(),
      resolved: false
    };

    session.annotations.push(annotation);
    return annotation;
  }

  async resolveAnnotation(sessionId: string, annotationId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const annotation = session.annotations.find(a => a.id === annotationId);
    if (!annotation) {
      throw new Error('Annotation not found');
    }

    annotation.resolved = true;
    return true;
  }

  async getSessionAnnotations(sessionId: string): Promise<Annotation[]> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    return session.annotations;
  }

  async generateSummary(sessionId: string): Promise<string> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const annotationsText = session.annotations
      .map(a => `- ${a.text} (by user ${a.userId})`)
      .join('\n');

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Summarize the following collaboration annotations:\n\n${annotationsText}`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  async addParticipant(sessionId: string, userId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (!session.participants.includes(userId)) {
      session.participants.push(userId);
    }

    return true;
  }

  getSession(sessionId: string): CollaborationSession | undefined {
    return this.sessions.get(sessionId);
  }
}

export default new CollaborationService();
