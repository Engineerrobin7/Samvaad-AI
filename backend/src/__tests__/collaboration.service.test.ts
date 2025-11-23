import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CollaborationService } from '../services/collaboration.service';

// Mock the database pool
jest.mock('../db/pool.js', () => ({
  default: {
    query: jest.fn()
  },
  query: jest.fn()
}));

import pool from '../db/pool.js';

describe('CollaborationService', () => {
  let service: CollaborationService;
  const mockQuery = pool.query as jest.MockedFunction<typeof pool.query>;

  beforeEach(() => {
    service = new CollaborationService();
    jest.clearAllMocks();
  });

  describe('createSession', () => {
    it('should create a new collaboration session', async () => {
      const mockSession = {
        id: 'session-123',
        name: 'Test Session',
        owner_id: 'user-1',
        source_language: 'en',
        target_language: 'hi',
        created_at: new Date()
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockSession] } as any);

      const result = await service.createSession(
        'Test Session',
        'user-1',
        'en',
        'hi'
      );

      expect(result).toEqual(mockSession);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO collaboration_sessions'),
        ['Test Session', 'user-1', 'en', 'hi']
      );
    });

    it('should handle database errors', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      await expect(
        service.createSession('Test', 'user-1', 'en', 'hi')
      ).rejects.toThrow('Database error');
    });
  });

  describe('addParticipant', () => {
    it('should add a participant to a session', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      await service.addParticipant('session-123', 'user-2');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO collaboration_participants'),
        ['session-123', 'user-2']
      );
    });

    it('should handle duplicate participants gracefully', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      await expect(
        service.addParticipant('session-123', 'user-2')
      ).resolves.not.toThrow();
    });
  });

  describe('removeParticipant', () => {
    it('should remove a participant from a session', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      await service.removeParticipant('session-123', 'user-2');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM collaboration_participants'),
        ['session-123', 'user-2']
      );
    });
  });

  describe('getSession', () => {
    it('should return session with participants', async () => {
      const mockSession = {
        id: 'session-123',
        name: 'Test Session',
        participants: ['user-1', 'user-2']
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockSession] } as any);

      const result = await service.getSession('session-123');

      expect(result).toEqual(mockSession);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT cs.*'),
        ['session-123']
      );
    });

    it('should return null for non-existent session', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      const result = await service.getSession('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('addTranslation', () => {
    it('should add a translation to a session', async () => {
      const mockTranslation = {
        id: 'trans-123',
        session_id: 'session-123',
        source_text: 'Hello',
        translated_text: 'नमस्ते',
        user_id: 'user-1',
        status: 'draft',
        votes: 0
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockTranslation] } as any);

      const result = await service.addTranslation(
        'session-123',
        'Hello',
        'नमस्ते',
        'user-1'
      );

      expect(result).toEqual(mockTranslation);
      expect(result.status).toBe('draft');
      expect(result.votes).toBe(0);
    });
  });

  describe('updateTranslationStatus', () => {
    it('should update translation status to review', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      await service.updateTranslationStatus('trans-123', 'review');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE collaboration_translations'),
        ['review', 'trans-123']
      );
    });

    it('should update translation status to approved', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      await service.updateTranslationStatus('trans-123', 'approved');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE collaboration_translations'),
        ['approved', 'trans-123']
      );
    });
  });

  describe('voteTranslation', () => {
    it('should record upvote and return total votes', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] } as any); // Insert vote
      mockQuery.mockResolvedValueOnce({ rows: [{ votes: 5 }] } as any); // Get total

      const votes = await service.voteTranslation('trans-123', 'user-2', 1);

      expect(votes).toBe(5);
      expect(mockQuery).toHaveBeenCalledTimes(2);
    });

    it('should record downvote and return total votes', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] } as any);
      mockQuery.mockResolvedValueOnce({ rows: [{ votes: -2 }] } as any);

      const votes = await service.voteTranslation('trans-123', 'user-2', -1);

      expect(votes).toBe(-2);
    });

    it('should update existing vote', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] } as any);
      mockQuery.mockResolvedValueOnce({ rows: [{ votes: 3 }] } as any);

      const votes = await service.voteTranslation('trans-123', 'user-2', 1);

      expect(votes).toBe(3);
    });
  });

  describe('addComment', () => {
    it('should add a comment to a translation', async () => {
      const mockComment = {
        id: 'comment-123',
        translation_id: 'trans-123',
        user_id: 'user-2',
        text: 'Great translation!',
        created_at: new Date()
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockComment] } as any);

      const result = await service.addComment(
        'trans-123',
        'user-2',
        'Great translation!'
      );

      expect(result).toEqual(mockComment);
      expect(result.text).toBe('Great translation!');
    });
  });

  describe('getSessionTranslations', () => {
    it('should return all translations with comments', async () => {
      const mockTranslations = [
        {
          id: 'trans-1',
          source_text: 'Hello',
          translated_text: 'नमस्ते',
          comments: [{ id: 'c1', text: 'Good!' }]
        },
        {
          id: 'trans-2',
          source_text: 'Goodbye',
          translated_text: 'अलविदा',
          comments: []
        }
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockTranslations } as any);

      const result = await service.getSessionTranslations('session-123');

      expect(result).toHaveLength(2);
      expect(result[0].comments).toHaveLength(1);
    });
  });

  describe('addAnnotation', () => {
    it('should add an annotation with position', async () => {
      const mockAnnotation = {
        id: 'ann-123',
        translation_id: 'trans-123',
        user_id: 'user-1',
        text: 'Check this word',
        position: { x: 50, y: 100 },
        created_at: new Date()
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockAnnotation] } as any);

      const result = await service.addAnnotation(
        'trans-123',
        'user-1',
        'Check this word',
        { x: 50, y: 100 }
      );

      expect(result).toEqual(mockAnnotation);
      expect(result.position.x).toBe(50);
      expect(result.position.y).toBe(100);
    });
  });

  describe('getAnnotations', () => {
    it('should return all annotations for a translation', async () => {
      const mockAnnotations = [
        {
          id: 'ann-1',
          text: 'Note 1',
          position: { x: 10, y: 20 }
        },
        {
          id: 'ann-2',
          text: 'Note 2',
          position: { x: 30, y: 40 }
        }
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockAnnotations } as any);

      const result = await service.getAnnotations('trans-123');

      expect(result).toHaveLength(2);
      expect(result[0].position).toEqual({ x: 10, y: 20 });
    });
  });

  describe('getUserSessions', () => {
    it('should return all sessions for a user', async () => {
      const mockSessions = [
        { id: 'session-1', name: 'Session 1' },
        { id: 'session-2', name: 'Session 2' }
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockSessions } as any);

      const result = await service.getUserSessions('user-1');

      expect(result).toHaveLength(2);
    });
  });

  describe('exportSession', () => {
    it('should export session with all translations', async () => {
      const mockSession = { id: 'session-123', name: 'Test' };
      const mockTranslations = [{ id: 'trans-1' }];

      mockQuery.mockResolvedValueOnce({ rows: [mockSession] } as any);
      mockQuery.mockResolvedValueOnce({ rows: mockTranslations } as any);

      const result = await service.exportSession('session-123');

      expect(result).toHaveProperty('session');
      expect(result).toHaveProperty('translations');
      expect(result).toHaveProperty('exportedAt');
      expect(result.translations).toHaveLength(1);
    });
  });
});
