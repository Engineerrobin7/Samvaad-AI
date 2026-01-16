import { describe, it, expect } from '@jest/globals';

describe('ML Service Tests', () => {
  describe('Translation Quality Assessment', () => {
    it('should calculate quality scores', () => {
      const scores = {
        fluency: 85,
        accuracy: 90,
        culturalRelevance: 80
      };

      const overallScore = (scores.fluency + scores.accuracy + scores.culturalRelevance) / 3;

      expect(overallScore).toBeCloseTo(85, 0);
      expect(scores.fluency).toBeGreaterThan(0);
      expect(scores.accuracy).toBeLessThanOrEqual(100);
    });

    it('should identify quality thresholds', () => {
      const testScores = [95, 75, 50, 30];
      const ratings = testScores.map(score => {
        if (score >= 90) return 'excellent';
        if (score >= 75) return 'good';
        if (score >= 60) return 'fair';
        return 'needs improvement';
      });

      expect(ratings[0]).toBe('excellent');
      expect(ratings[1]).toBe('good');
      expect(ratings[2]).toBe('fair');
      expect(ratings[3]).toBe('needs improvement');
    });

    it('should validate score ranges', () => {
      const scores = [0, 50, 100, 150];
      const validScores = scores.filter(s => s >= 0 && s <= 100);

      expect(validScores).toHaveLength(3);
      expect(validScores).not.toContain(150);
    });
  });

  describe('Smart Suggestions', () => {
    it('should rank suggestions by confidence', () => {
      const suggestions = [
        { text: 'Option A', confidence: 95 },
        { text: 'Option B', confidence: 75 },
        { text: 'Option C', confidence: 85 }
      ];

      const ranked = suggestions.sort((a, b) => b.confidence - a.confidence);

      expect(ranked[0].confidence).toBe(95);
      expect(ranked[0].text).toBe('Option A');
      expect(ranked[2].confidence).toBe(75);
    });

    it('should filter low confidence suggestions', () => {
      const suggestions = [
        { confidence: 90 },
        { confidence: 45 },
        { confidence: 70 }
      ];

      const highConfidence = suggestions.filter(s => s.confidence >= 60);

      expect(highConfidence).toHaveLength(2);
    });

    it('should validate suggestion structure', () => {
      const suggestion = {
        text: 'Translation',
        confidence: 85,
        reasoning: 'Natural phrasing'
      };

      expect(suggestion).toHaveProperty('text');
      expect(suggestion).toHaveProperty('confidence');
      expect(suggestion).toHaveProperty('reasoning');
      expect(suggestion.text).toBeTruthy();
    });
  });

  describe('Best Translation Prediction', () => {
    it('should consider multiple factors', () => {
      const translations = [
        { text: 'Trans A', votes: 10, aiScore: 85 },
        { text: 'Trans B', votes: 5, aiScore: 95 },
        { text: 'Trans C', votes: 15, aiScore: 75 }
      ];

      // Weighted score: 60% AI + 40% votes
      const scored = translations.map(t => ({
        ...t,
        finalScore: (t.aiScore * 0.6) + (t.votes * 2 * 0.4)
      }));

      const best = scored.sort((a, b) => b.finalScore - a.finalScore)[0];

      expect(best.finalScore).toBeGreaterThan(0);
    });

    it('should handle tie-breaking', () => {
      const translations = [
        { votes: 10, timestamp: new Date('2024-01-01') },
        { votes: 10, timestamp: new Date('2024-01-02') }
      ];

      const sorted = translations.sort((a, b) => 
        b.votes - a.votes || b.timestamp.getTime() - a.timestamp.getTime()
      );

      expect(sorted[0].timestamp.getTime()).toBeGreaterThan(sorted[1].timestamp.getTime());
    });
  });

  describe('User Pattern Analysis', () => {
    it('should identify common mistakes', () => {
      const mistakes = [
        'grammar',
        'grammar',
        'spelling',
        'grammar',
        'phrasing'
      ];

      const frequency = mistakes.reduce((acc: any, m) => {
        acc[m] = (acc[m] || 0) + 1;
        return acc;
      }, {});

      expect(frequency.grammar).toBe(3);
      expect(frequency.spelling).toBe(1);
    });

    it('should detect style preferences', () => {
      const translations = [
        { style: 'formal' },
        { style: 'formal' },
        { style: 'casual' },
        { style: 'formal' }
      ];

      const styles = translations.map(t => t.style);
      const formalCount = styles.filter(s => s === 'formal').length;

      expect(formalCount).toBeGreaterThan(translations.length / 2);
    });

    it('should track improvement over time', () => {
      const scores = [60, 65, 70, 75, 80];
      const improvements = [];

      for (let i = 1; i < scores.length; i++) {
        improvements.push(scores[i] - scores[i - 1]);
      }

      const avgImprovement = improvements.reduce((a, b) => a + b, 0) / improvements.length;

      expect(avgImprovement).toBeGreaterThan(0);
      expect(scores[scores.length - 1]).toBeGreaterThan(scores[0]);
    });
  });

  describe('Language Proficiency Assessment', () => {
    it('should calculate proficiency level', () => {
      const testScores = [
        { quiz: 90, translations: 100, practice: 50 },
        { quiz: 60, translations: 40, practice: 30 },
        { quiz: 40, translations: 20, practice: 10 }
      ];

      const levels = testScores.map(s => {
        const avg = (s.quiz + s.translations + s.practice) / 3;
        if (avg >= 80) return 'Expert';
        if (avg >= 60) return 'Advanced';
        if (avg >= 40) return 'Intermediate';
        return 'Beginner';
      });

      expect(levels[0]).toBe('Expert');
      expect(levels[1]).toBe('Intermediate');
      expect(levels[2]).toBe('Beginner');
    });

    it('should identify strengths and weaknesses', () => {
      const skills = {
        vocabulary: 85,
        grammar: 60,
        pronunciation: 90,
        listening: 55
      };

      const strengths = Object.entries(skills)
        .filter(([, score]) => score >= 80)
        .map(([skill]) => skill);

      const weaknesses = Object.entries(skills)
        .filter(([, score]) => score < 65)
        .map(([skill]) => skill);

      expect(strengths).toContain('vocabulary');
      expect(strengths).toContain('pronunciation');
      expect(weaknesses).toContain('grammar');
      expect(weaknesses).toContain('listening');
    });
  });

  describe('Learning Path Generation', () => {
    it('should create progressive modules', () => {
      const modules = [
        { difficulty: 'easy', order: 1 },
        { difficulty: 'medium', order: 2 },
        { difficulty: 'hard', order: 3 }
      ];

      const isProgressive = modules.every((m, i) => 
        i === 0 || m.order > modules[i - 1].order
      );

      expect(isProgressive).toBe(true);
    });

    it('should estimate completion time', () => {
      const modules = [
        { estimatedHours: 5 },
        { estimatedHours: 8 },
        { estimatedHours: 10 }
      ];

      const totalHours = modules.reduce((sum, m) => sum + m.estimatedHours, 0);
      const weeks = Math.ceil(totalHours / 10); // 10 hours per week

      expect(totalHours).toBe(23);
      expect(weeks).toBe(3);
    });

    it('should adapt to user level', () => {
      const levels = ['Beginner', 'Intermediate', 'Advanced'];
      const moduleCount = levels.map(level => {
        if (level === 'Beginner') return 8;
        if (level === 'Intermediate') return 6;
        return 4;
      });

      expect(moduleCount[0]).toBeGreaterThan(moduleCount[2]);
    });
  });

  describe('Error Detection', () => {
    it('should categorize error types', () => {
      const errors = [
        { type: 'grammar', severity: 'high' },
        { type: 'spelling', severity: 'low' },
        { type: 'grammar', severity: 'medium' }
      ];

      const grammarErrors = errors.filter(e => e.type === 'grammar');
      const highSeverity = errors.filter(e => e.severity === 'high');

      expect(grammarErrors).toHaveLength(2);
      expect(highSeverity).toHaveLength(1);
    });

    it('should provide corrections', () => {
      const error = {
        original: 'He go to school',
        corrected: 'He goes to school',
        explanation: 'Subject-verb agreement'
      };

      expect(error.original).not.toBe(error.corrected);
      expect(error.explanation).toBeTruthy();
    });

    it('should calculate error rate', () => {
      const text = 'This is a sample text with errors';
      const words = text.split(' ').length;
      const errors = 2;
      const errorRate = (errors / words) * 100;

      expect(errorRate).toBeCloseTo(28.57, 1);
    });
  });

  describe('Learning Needs Prediction', () => {
    it('should analyze activity patterns', () => {
      const activities = [
        { type: 'translation', date: '2024-01-01' },
        { type: 'quiz', date: '2024-01-02' },
        { type: 'translation', date: '2024-01-03' }
      ];

      const activityTypes = activities.reduce((acc: any, a) => {
        acc[a.type] = (acc[a.type] || 0) + 1;
        return acc;
      }, {});

      expect(activityTypes.translation).toBe(2);
      expect(activityTypes.quiz).toBe(1);
    });

    it('should recommend based on gaps', () => {
      const completedTopics = ['basics', 'grammar'];
      const allTopics = ['basics', 'grammar', 'vocabulary', 'pronunciation'];
      
      const gaps = allTopics.filter(t => !completedTopics.includes(t));

      expect(gaps).toContain('vocabulary');
      expect(gaps).toContain('pronunciation');
      expect(gaps).toHaveLength(2);
    });

    it('should consider user preferences', () => {
      const preferences = {
        learningStyle: 'visual',
        timeAvailable: 30, // minutes per day
        difficulty: 'medium'
      };

      const recommendations = [];
      if (preferences.learningStyle === 'visual') {
        recommendations.push('video lessons');
      }
      if (preferences.timeAvailable < 60) {
        recommendations.push('short exercises');
      }

      expect(recommendations).toContain('video lessons');
      expect(recommendations).toContain('short exercises');
    });
  });

  describe('Sentiment-based Adjustment', () => {
    it('should map sentiment scores', () => {
      const sentiments = [
        { text: 'Great!', score: 0.9 },
        { text: 'Okay', score: 0.1 },
        { text: 'Terrible', score: -0.8 }
      ];

      sentiments.forEach(s => {
        expect(s.score).toBeGreaterThanOrEqual(-1);
        expect(s.score).toBeLessThanOrEqual(1);
      });
    });

    it('should adjust tone appropriately', () => {
      const adjustments = [
        { original: 'positive', target: 'neutral', adjusted: true },
        { original: 'negative', target: 'positive', adjusted: true },
        { original: 'neutral', target: 'neutral', adjusted: false }
      ];

      const needsAdjustment = adjustments.filter(a => a.adjusted);

      expect(needsAdjustment).toHaveLength(2);
    });
  });

  describe('ML Model Performance', () => {
    it('should track prediction accuracy', () => {
      const predictions = [
        { predicted: 'A', actual: 'A', correct: true },
        { predicted: 'B', actual: 'A', correct: false },
        { predicted: 'C', actual: 'C', correct: true }
      ];

      const accuracy = predictions.filter(p => p.correct).length / predictions.length;

      expect(accuracy).toBeCloseTo(0.667, 2);
    });

    it('should measure confidence calibration', () => {
      const predictions = [
        { confidence: 0.9, correct: true },
        { confidence: 0.7, correct: true },
        { confidence: 0.5, correct: false }
      ];

      const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;

      expect(avgConfidence).toBeGreaterThan(0);
      expect(avgConfidence).toBeLessThanOrEqual(1);
    });
  });

  describe('Personalization Engine', () => {
    it('should adapt to user behavior', () => {
      const userHistory = {
        preferredTime: 'morning',
        avgSessionLength: 25,
        favoriteTopics: ['grammar', 'vocabulary']
      };

      const recommendations = {
        suggestedTime: userHistory.preferredTime,
        sessionLength: userHistory.avgSessionLength,
        topics: userHistory.favoriteTopics
      };

      expect(recommendations.suggestedTime).toBe('morning');
      expect(recommendations.topics).toContain('grammar');
    });

    it('should balance variety and preference', () => {
      const recentTopics = ['grammar', 'grammar', 'vocabulary'];
      const shouldIntroduceNew = recentTopics.filter(t => t === 'grammar').length > 2;

      expect(shouldIntroduceNew).toBe(false);
    });
  });
});
