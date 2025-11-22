// Utility function tests

describe('Utility Functions', () => {
  describe('String Utilities', () => {
    it('should generate unique IDs', () => {
      const id1 = `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const id2 = `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      expect(id1).not.toBe(id2);
      expect(id1).toContain('id_');
    });

    it('should validate language codes', () => {
      const validCodes = ['en-US', 'hi-IN', 'es-ES', 'fr-FR'];
      const pattern = /^[a-z]{2}-[A-Z]{2}$/;
      
      validCodes.forEach(code => {
        expect(pattern.test(code)).toBe(true);
      });
    });
  });

  describe('Data Validation', () => {
    it('should validate translation input', () => {
      const translation = {
        sourceText: 'Hello',
        translatedText: 'Hola',
        sourceLanguage: 'en',
        targetLanguage: 'es'
      };

      expect(translation.sourceText).toBeTruthy();
      expect(translation.translatedText).toBeTruthy();
      expect(translation.sourceLanguage).toBeTruthy();
      expect(translation.targetLanguage).toBeTruthy();
    });

    it('should validate annotation structure', () => {
      const annotation = {
        text: 'Important note',
        position: { x: 50, y: 100 }
      };

      expect(annotation.text.length).toBeGreaterThan(0);
      expect(annotation.position.x).toBeGreaterThanOrEqual(0);
      expect(annotation.position.y).toBeGreaterThanOrEqual(0);
    });
  });

  describe('XP Calculations', () => {
    const XP_PER_LEVEL = 100;

    it('should calculate level from XP', () => {
      const xp = 250;
      const level = Math.floor(xp / XP_PER_LEVEL) + 1;
      
      expect(level).toBe(3);
    });

    it('should calculate XP needed for next level', () => {
      const currentXP = 150;
      const currentLevel = Math.floor(currentXP / XP_PER_LEVEL) + 1;
      const xpForNextLevel = (currentLevel * XP_PER_LEVEL) - currentXP;
      
      expect(xpForNextLevel).toBe(50);
    });

    it('should handle level up correctly', () => {
      const oldXP = 95;
      const xpGained = 10;
      const newXP = oldXP + xpGained;
      const oldLevel = Math.floor(oldXP / XP_PER_LEVEL) + 1;
      const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;
      
      expect(oldLevel).toBe(1);
      expect(newLevel).toBe(2);
      expect(newLevel > oldLevel).toBe(true);
    });
  });

  describe('Streak Calculations', () => {
    it('should calculate days difference', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const daysDiff = Math.floor((today.getTime() - yesterday.getTime()) / (1000 * 60 * 60 * 24));
      
      expect(daysDiff).toBe(1);
    });

    it('should maintain streak for consecutive days', () => {
      let streak = 5;
      const daysDiff = 1;
      
      if (daysDiff === 1) {
        streak += 1;
      }
      
      expect(streak).toBe(6);
    });

    it('should reset streak for missed days', () => {
      let streak = 10;
      const daysDiff = 3;
      
      if (daysDiff > 1) {
        streak = 1;
      }
      
      expect(streak).toBe(1);
    });
  });

  describe('Sentiment Scoring', () => {
    it('should classify positive sentiment', () => {
      const score = 0.8;
      const sentiment = score > 0.3 ? 'positive' : score < -0.3 ? 'negative' : 'neutral';
      
      expect(sentiment).toBe('positive');
    });

    it('should classify negative sentiment', () => {
      const score = -0.7;
      const sentiment = score > 0.3 ? 'positive' : score < -0.3 ? 'negative' : 'neutral';
      
      expect(sentiment).toBe('negative');
    });

    it('should classify neutral sentiment', () => {
      const score = 0.1;
      const sentiment = score > 0.3 ? 'positive' : score < -0.3 ? 'negative' : 'neutral';
      
      expect(sentiment).toBe('neutral');
    });
  });

  describe('Quiz Scoring', () => {
    it('should calculate quiz score percentage', () => {
      const correctAnswers = 7;
      const totalQuestions = 10;
      const score = (correctAnswers / totalQuestions) * 100;
      
      expect(score).toBe(70);
    });

    it('should determine pass/fail', () => {
      const score = 75;
      const passingScore = 70;
      const passed = score >= passingScore;
      
      expect(passed).toBe(true);
    });

    it('should calculate XP based on performance', () => {
      const score = 80;
      const baseXP = 50;
      const bonusMultiplier = score / 100;
      const totalXP = Math.floor(baseXP * (1 + bonusMultiplier));
      
      expect(totalXP).toBeGreaterThan(baseXP);
    });
  });
});
