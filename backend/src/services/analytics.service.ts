// src/services/analytics.service.ts
import { PrismaClient, FeedbackRating } from '../../generated/prisma';

const prisma = new PrismaClient();

class AnalyticsService {
  /**
   * Log a conversation interaction
   */
  async logConversation(
    userProfileId: string | null,
    conversationId: string,
    platform: string,
    userMessage: string,
    aiResponse: string
  ) {
    try {
      // NOTE: This will only work once the database schema is updated with the ConversationLog model.
      // If the ConversationLog table does not exist, this operation will fail.
      await prisma.conversationLog.create({
        data: {
          userProfileId,
          conversationId,
          platform,
          userMessage,
          aiResponse,
        },
      });
    } catch (error) {
      console.error('Failed to log conversation:', error);
    }
  }

  /**
   * Record user feedback
   */
  async recordFeedback(
    userProfileId: string | null,
    conversationId: string | null,
    messageId: string | null,
    rating: FeedbackRating,
    comment: string | null
  ) {
    try {
      // NOTE: This will only work once the database schema is updated with the Feedback model.
      // If the Feedback table does not exist, this operation will fail.
      await prisma.feedback.create({
        data: {
          userProfileId,
          conversationId,
          messageId,
          rating,
          comment,
        },
      });
    } catch (error) {
      console.error('Failed to record feedback:', error);
    }
  }

  /**
   * Get conversation logs (for admin dashboard)
   */
  async getConversationLogs(take: number = 100, skip: number = 0) {
    // NOTE: This will only work once the database schema is updated with the ConversationLog model.
    try {
      return await prisma.conversationLog.findMany({
        take,
        skip,
        orderBy: { timestamp: 'desc' },
        include: { userProfile: true },
      });
    } catch (error) {
      console.error('Failed to retrieve conversation logs:', error);
      return [];
    }
  }

  /**
   * Get feedback entries (for admin dashboard)
   */
  async getFeedbackEntries(take: number = 100, skip: number = 0) {
    // NOTE: This will only work once the database schema is updated with the Feedback model.
    try {
      return await prisma.feedback.findMany({
        take,
        skip,
        orderBy: { timestamp: 'desc' },
        include: { userProfile: true },
      });
    } catch (error) {
      console.error('Failed to retrieve feedback entries:', error);
      return [];
    }
  }

  /**
   * Get usage statistics (e.g., total conversations, average response time - placeholder for now)
   */
  async getUsageStats() {
    // NOTE: This will only work once the database schema is updated with the ConversationLog model.
    try {
      const totalConversations = await prisma.conversationLog.count();
      const totalFeedback = await prisma.feedback.count();
      const positiveFeedback = await prisma.feedback.count({ where: { rating: 'POSITIVE' } });

      return {
        totalConversations,
        totalFeedback,
        positiveFeedback,
        // Add more stats as needed
      };
    } catch (error) {
      console.error('Failed to retrieve usage stats:', error);
      return { totalConversations: 0, totalFeedback: 0, positiveFeedback: 0 };
    }
  }
}

export const analyticsService = new AnalyticsService();
