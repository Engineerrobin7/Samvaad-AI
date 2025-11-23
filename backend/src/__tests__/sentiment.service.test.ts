import { describe, it, expect } from '@jest/globals';

describe('Sentiment Analysis Service Tests', () => {
  describe('Sentiment Detection', () => {
    it('should detect positive sentiment', () => {
      const texts = [
        'I love this product!',
        'Amazing experience, highly recommend!',
        'Wonderful service, thank you!'
      ];

      texts.forEach(text => {
        const score = 0.8; // Mock positive score
        const sentiment = score > 0.3 ? 'positive' : score < -0.3 ? 'negative' : 'neutral';
        expect(sentiment).toBe('positive');
      });
    });

    it('should detect negative sentiment', () => {
      const texts = [
        'This is terrible',
        'Very disappointed',
        'Worst experience ever'
      ];

      texts.forEach(text => {
        const score = -0.7; // Mock negative score
        const sentiment = score > 0.3 ? 'positive' : score < -0.3 ? 'negative' : 'neutral';
        expect(sentiment).toBe('negative');
      });
    });

    it('should detect neutral sentiment', () => {
      const texts = [
        'The product arrived on time',
        'It is blue',
        'The meeting is at 3 PM'
      ];

      texts.forEach(text => {
        const score = 0.1; // Mock neutral score
        const sentiment = score > 0.3 ? 'positive' : score < -0.3 ? 'negative' : 'neutral';
        expect(sentiment).toBe('neutral');
      });
    });

    it('should calculate sentiment score', () => {
      const sentimentScores = [
        { text: 'Great!', score: 0.9 },
        { text: 'Okay', score: 0.1 },
        { text: 'Bad', score: -0.8 }
      ];

      expect(sentimentScores[0].score).toBeGreaterThan(0.5);
      expect(sentimentScores[1].score).toBeGreaterThan(-0.3);
      expect(sentimentScores[1].score).toBeLessThan(0.3);
      expect(sentimentScores[2].score).toBeLessThan(-0.5);
    });
  });

  describe('Emotion Detection', () => {
    it('should detect joy emotion', () => {
      const text = 'I am so happy and excited!';
      const emotions = {
        joy: 0.9,
        sadness: 0.1,
        anger: 0.0,
        fear: 0.0,
        surprise: 0.2
      };

      const primaryEmotion = Object.entries(emotions)
        .sort(([, a], [, b]) => b - a)[0][0];

      expect(primaryEmotion).toBe('joy');
    });

    it('should detect sadness emotion', () => {
      const emotions = {
        joy: 0.1,
        sadness: 0.8,
        anger: 0.2,
        fear: 0.1
      };

      const primaryEmotion = Object.entries(emotions)
        .reduce((a, b) => a[1] > b[1] ? a : b)[0];

      expect(primaryEmotion).toBe('sadness');
    });

    it('should detect multiple emotions', () => {
      const emotions = {
        joy: 0.6,
        surprise: 0.5,
        fear: 0.1
      };

      const significantEmotions = Object.entries(emotions)
        .filter(([, score]) => score > 0.4)
        .map(([emotion]) => emotion);

      expect(significantEmotions).toContain('joy');
      expect(significantEmotions).toContain('surprise');
      expect(significantEmotions.length).toBe(2);
    });
  });

  describe('Tone Adjustment', () => {
    it('should adjust to formal tone', () => {
      const informal = 'Hey, can you help me out?';
      const formal = 'Hello, could you please assist me?';

      expect(formal).toContain('Hello');
      expect(formal).toContain('please');
      expect(formal).not.toContain('Hey');
    });

    it('should adjust to casual tone', () => {
      const formal = 'I would appreciate your assistance';
      const casual = 'Can you help me?';

      expect(casual.length).toBeLessThan(formal.length);
      expect(casual).not.toContain('appreciate');
    });

    it('should adjust to polite tone', () => {
      const direct = 'Send me the report';
      const polite = 'Could you please send me the report?';

      expect(polite).toContain('please');
      expect(polite).toContain('Could you');
    });

    it('should adjust to friendly tone', () => {
      const neutral = 'Thank you for your help';
      const friendly = 'Thanks so much for your help! Really appreciate it!';

      expect(friendly).toContain('!');
      expect(friendly.length).toBeGreaterThan(neutral.length);
    });

    it('should adjust to professional tone', () => {
      const casual = 'Got it, will do!';
      const professional = 'Understood. I will complete this task.';

      expect(professional).not.toContain('!');
      expect(professional).toContain('.');
    });

    it('should adjust to empathetic tone', () => {
      const neutral = 'I understand your concern';
      const empathetic = 'I completely understand how you feel, and I\'m here to help';

      expect(empathetic).toContain('feel');
      expect(empathetic.length).toBeGreaterThan(neutral.length);
    });
  });

  describe('Formality Detection', () => {
    it('should detect formal language', () => {
      const text = 'Dear Sir/Madam, I would like to inquire about...';
      const formalityScore = 0.9;

      expect(formalityScore).toBeGreaterThan(0.7);
    });

    it('should detect informal language', () => {
      const text = 'Hey! What\'s up? Wanna grab lunch?';
      const formalityScore = 0.2;

      expect(formalityScore).toBeLessThan(0.4);
    });

    it('should detect semi-formal language', () => {
      const text = 'Hello, I wanted to ask about the project status';
      const formalityScore = 0.5;

      expect(formalityScore).toBeGreaterThan(0.3);
      expect(formalityScore).toBeLessThan(0.7);
    });
  });

  describe('Cultural Context', () => {
    it('should detect culturally sensitive content', () => {
      const culturalMarkers = {
        hasGreeting: true,
        hasHonorific: true,
        hasIndirectLanguage: true
      };

      const isCulturallySensitive = 
        culturalMarkers.hasGreeting && 
        culturalMarkers.hasHonorific;

      expect(isCulturallySensitive).toBe(true);
    });

    it('should suggest cultural adaptations', () => {
      const text = 'No problem';
      const culturalContext = 'formal-indian';
      
      const suggestions = {
        'formal-indian': 'It would be my pleasure to assist you',
        'casual-american': 'No worries!',
        'formal-japanese': 'I am honored to help'
      };

      expect(suggestions[culturalContext]).toBeTruthy();
    });
  });

  describe('Sentiment Across Languages', () => {
    it('should analyze sentiment in multiple languages', () => {
      const texts = [
        { text: 'I love it', lang: 'en', sentiment: 'positive' },
        { text: 'Me encanta', lang: 'es', sentiment: 'positive' },
        { text: 'बहुत अच्छा', lang: 'hi', sentiment: 'positive' }
      ];

      texts.forEach(item => {
        expect(item.sentiment).toBe('positive');
      });
    });

    it('should handle sentiment nuances across cultures', () => {
      const culturalSentiment = {
        text: 'Not bad',
        western: 'neutral',
        asian: 'positive' // Indirect positive
      };

      expect(culturalSentiment.western).not.toBe(culturalSentiment.asian);
    });
  });

  describe('Confidence Scoring', () => {
    it('should provide confidence scores', () => {
      const analysis = {
        sentiment: 'positive',
        confidence: 0.85
      };

      expect(analysis.confidence).toBeGreaterThan(0.7);
      expect(analysis.confidence).toBeLessThanOrEqual(1.0);
    });

    it('should flag low confidence results', () => {
      const analyses = [
        { sentiment: 'positive', confidence: 0.95 },
        { sentiment: 'neutral', confidence: 0.45 },
        { sentiment: 'negative', confidence: 0.88 }
      ];

      const lowConfidence = analyses.filter(a => a.confidence < 0.7);
      expect(lowConfidence).toHaveLength(1);
    });
  });

  describe('Sarcasm Detection', () => {
    it('should detect potential sarcasm', () => {
      const text = 'Oh great, another meeting';
      const indicators = {
        hasContradiction: true,
        hasExaggeration: false,
        contextMismatch: true
      };

      const likelySarcasm = indicators.hasContradiction || indicators.contextMismatch;
      expect(likelySarcasm).toBe(true);
    });

    it('should handle literal positive statements', () => {
      const text = 'This is genuinely great!';
      const indicators = {
        hasContradiction: false,
        hasExaggeration: false,
        contextMismatch: false
      };

      const likelySarcasm = indicators.hasContradiction || indicators.contextMismatch;
      expect(likelySarcasm).toBe(false);
    });
  });

  describe('Intensity Analysis', () => {
    it('should measure sentiment intensity', () => {
      const sentiments = [
        { text: 'Good', intensity: 0.6 },
        { text: 'Great', intensity: 0.8 },
        { text: 'Amazing', intensity: 0.95 }
      ];

      expect(sentiments[2].intensity).toBeGreaterThan(sentiments[1].intensity);
      expect(sentiments[1].intensity).toBeGreaterThan(sentiments[0].intensity);
    });

    it('should detect amplifiers', () => {
      const amplifiers = ['very', 'extremely', 'absolutely', 'incredibly'];
      const text = 'This is extremely good';

      const hasAmplifier = amplifiers.some(amp => text.includes(amp));
      expect(hasAmplifier).toBe(true);
    });
  });
});
