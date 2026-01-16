import { RagService } from '../services/rag.service';
import { NlpService } from '../services/nlp.service';

describe('RAG Service Tests', () => {
  let ragService: RagService;
  let nlpService: NlpService;

  beforeAll(() => {
    ragService = new RagService();
    nlpService = new NlpService();
  });

  describe('Text Chunking', () => {
    it('should chunk text correctly with overlap', () => {
      const text = 'a'.repeat(3000);
      const chunks = (ragService as any).chunkText(text, 1000, 200);
      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0].length).toBeLessThanOrEqual(1000);
    });

    it('should handle small text without unnecessary chunking', () => {
      const text = 'This is a small text';
      const chunks = (ragService as any).chunkText(text, 1000, 200);
      expect(chunks.length).toEqual(1);
      expect(chunks[0]).toBe(text);
    });
  });

  describe('RAG Integration', () => {
    it('should instantiate RAG service', () => {
      expect(ragService).toBeDefined();
      expect(ragService.addDocument).toBeDefined();
      expect(ragService.query).toBeDefined();
      expect(ragService.search).toBeDefined();
    });

    it('should have all required methods', () => {
      expect(typeof (ragService as any).chunkText).toBe('function');
      expect(typeof ragService.search).toBe('function');
      expect(typeof ragService.query).toBe('function');
      expect(typeof ragService.addDocument).toBe('function');
    });
  });

  describe('Document Processing Pipeline', () => {
    it('should validate text chunking before embeddings', () => {
      const sampleText = 'This is sample text for RAG testing. ' + 'x'.repeat(2000);
      const chunks = (ragService as any).chunkText(sampleText, 500, 100);
      
      expect(chunks.length).toBeGreaterThan(0);
      chunks.forEach((chunk: string) => {
        expect(chunk.length).toBeGreaterThan(0);
        expect(chunk.length).toBeLessThanOrEqual(500);
      });
    });

    it('should handle various text formats', () => {
      const testCases = [
        'Plain text',
        'Text\nwith\nnewlines',
        'Text with\ttabs',
        'Text with special chars: !@#$%^&*()',
        '123 456 789',
        'Mixed123Text456'
      ];

      testCases.forEach(text => {
        const chunks = (ragService as any).chunkText(text, 100, 20);
        expect(chunks.length).toBeGreaterThan(0);
      });
    });
  });

  describe('System Status', () => {
    it('should report RAG system status', () => {
      const systemStatus = {
        ragServiceInitialized: !!ragService,
        nlpServiceAvailable: !!nlpService,
        geminiApiKey: !!process.env.GEMINI_API_KEY,
        openaiApiKey: !!process.env.OPENAI_API_KEY,
        databaseConnection: true
      };

      expect(systemStatus.ragServiceInitialized).toBe(true);
      expect(systemStatus.nlpServiceAvailable).toBe(true);
      expect(systemStatus).toBeDefined();
    });
  });
});

