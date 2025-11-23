import { Pool } from 'pg';
import pool from '../db/pool.js';

interface CollaborationSession {
  id: string;
  name: string;
  ownerId: string;
  sourceLanguage: string;
  targetLanguage: string;
  createdAt: Date;
  participants: string[];
}

interface Translation {
  id: string;
  sessionId: string;
  sourceText: string;
  translatedText: string;
  userId: string;
  status: 'draft' | 'review' | 'approved';
  votes: number;
  comments: Comment[];
}

interface Comment {
  id: string;
  userId: string;
  text: string;
  timestamp: Date;
}

interface Annotation {
  id: string;
  translationId: string;
  userId: string;
  text: string;
  position: { x: number; y: number };
  timestamp: Date;
}

export class CollaborationService {
  private db: Pool;

  constructor() {
    this.db = pool;
  }

  // Create a new collaboration session
  async createSession(
    name: string,
    ownerId: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<CollaborationSession> {
    const query = `
      INSERT INTO collaboration_sessions (name, owner_id, source_language, target_language)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await this.db.query(query, [name, ownerId, sourceLanguage, targetLanguage]);
    return result.rows[0];
  }

  // Add participant to session
  async addParticipant(sessionId: string, userId: string): Promise<void> {
    const query = `
      INSERT INTO collaboration_participants (session_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (session_id, user_id) DO NOTHING
    `;
    
    await this.db.query(query, [sessionId, userId]);
  }

  // Remove participant from session
  async removeParticipant(sessionId: string, userId: string): Promise<void> {
    const query = `
      DELETE FROM collaboration_participants
      WHERE session_id = $1 AND user_id = $2
    `;
    
    await this.db.query(query, [sessionId, userId]);
  }

  // Get session details with participants
  async getSession(sessionId: string): Promise<CollaborationSession | null> {
    const sessionQuery = `
      SELECT cs.*, 
             array_agg(cp.user_id) as participants
      FROM collaboration_sessions cs
      LEFT JOIN collaboration_participants cp ON cs.id = cp.session_id
      WHERE cs.id = $1
      GROUP BY cs.id
    `;
    
    const result = await this.db.query(sessionQuery, [sessionId]);
    return result.rows[0] || null;
  }

  // Add translation to session
  async addTranslation(
    sessionId: string,
    sourceText: string,
    translatedText: string,
    userId: string
  ): Promise<Translation> {
    const query = `
      INSERT INTO collaboration_translations 
      (session_id, source_text, translated_text, user_id, status, votes)
      VALUES ($1, $2, $3, $4, 'draft', 0)
      RETURNING *
    `;
    
    const result = await this.db.query(query, [sessionId, sourceText, translatedText, userId]);
    return result.rows[0];
  }

  // Update translation status
  async updateTranslationStatus(
    translationId: string,
    status: 'draft' | 'review' | 'approved'
  ): Promise<void> {
    const query = `
      UPDATE collaboration_translations
      SET status = $1, updated_at = NOW()
      WHERE id = $2
    `;
    
    await this.db.query(query, [status, translationId]);
  }

  // Vote on translation
  async voteTranslation(translationId: string, userId: string, vote: 1 | -1): Promise<number> {
    // Record the vote
    const voteQuery = `
      INSERT INTO collaboration_votes (translation_id, user_id, vote)
      VALUES ($1, $2, $3)
      ON CONFLICT (translation_id, user_id) 
      DO UPDATE SET vote = $3
    `;
    
    await this.db.query(voteQuery, [translationId, userId, vote]);

    // Update vote count
    const updateQuery = `
      UPDATE collaboration_translations
      SET votes = (
        SELECT COALESCE(SUM(vote), 0)
        FROM collaboration_votes
        WHERE translation_id = $1
      )
      WHERE id = $1
      RETURNING votes
    `;
    
    const result = await this.db.query(updateQuery, [translationId]);
    return result.rows[0].votes;
  }

  // Add comment to translation
  async addComment(
    translationId: string,
    userId: string,
    text: string
  ): Promise<Comment> {
    const query = `
      INSERT INTO collaboration_comments (translation_id, user_id, text)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await this.db.query(query, [translationId, userId, text]);
    return result.rows[0];
  }

  // Get all translations for a session
  async getSessionTranslations(sessionId: string): Promise<Translation[]> {
    const query = `
      SELECT ct.*,
             json_agg(
               json_build_object(
                 'id', cc.id,
                 'userId', cc.user_id,
                 'text', cc.text,
                 'timestamp', cc.created_at
               )
             ) FILTER (WHERE cc.id IS NOT NULL) as comments
      FROM collaboration_translations ct
      LEFT JOIN collaboration_comments cc ON ct.id = cc.translation_id
      WHERE ct.session_id = $1
      GROUP BY ct.id
      ORDER BY ct.created_at DESC
    `;
    
    const result = await this.db.query(query, [sessionId]);
    return result.rows;
  }

  // Add annotation to translation
  async addAnnotation(
    translationId: string,
    userId: string,
    text: string,
    position: { x: number; y: number }
  ): Promise<Annotation> {
    const query = `
      INSERT INTO collaboration_annotations 
      (translation_id, user_id, text, position_x, position_y)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *, json_build_object('x', position_x, 'y', position_y) as position
    `;
    
    const result = await this.db.query(query, [
      translationId,
      userId,
      text,
      position.x,
      position.y
    ]);
    
    return result.rows[0];
  }

  // Get annotations for translation
  async getAnnotations(translationId: string): Promise<Annotation[]> {
    const query = `
      SELECT id, translation_id, user_id, text,
             json_build_object('x', position_x, 'y', position_y) as position,
             created_at as timestamp
      FROM collaboration_annotations
      WHERE translation_id = $1
      ORDER BY created_at ASC
    `;
    
    const result = await this.db.query(query, [translationId]);
    return result.rows;
  }

  // Get user's active sessions
  async getUserSessions(userId: string): Promise<CollaborationSession[]> {
    const query = `
      SELECT DISTINCT cs.*
      FROM collaboration_sessions cs
      LEFT JOIN collaboration_participants cp ON cs.id = cp.session_id
      WHERE cs.owner_id = $1 OR cp.user_id = $1
      ORDER BY cs.created_at DESC
    `;
    
    const result = await this.db.query(query, [userId]);
    return result.rows;
  }

  // Export session as JSON
  async exportSession(sessionId: string): Promise<any> {
    const session = await this.getSession(sessionId);
    const translations = await this.getSessionTranslations(sessionId);
    
    return {
      session,
      translations,
      exportedAt: new Date()
    };
  }
}

export default new CollaborationService();
