// src/components/admin/analytics-dashboard.tsx
"use client"

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ConversationLog {
  id: string;
  userProfileId: string | null;
  conversationId: string;
  platform: string;
  userMessage: string;
  aiResponse: string;
  timestamp: string;
  userProfile?: { name: string | null };
}

interface FeedbackEntry {
  id: string;
  userProfileId: string | null;
  conversationId: string | null;
  messageId: string | null;
  rating: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  comment: string | null;
  timestamp: string;
  userProfile?: { name: string | null };
}

interface UsageStats {
  totalConversations: number;
  totalFeedback: number;
  positiveFeedback: number;
}

export default function AnalyticsDashboard() {
  const { token } = useAuth();
  const [conversationLogs, setConversationLogs] = useState<ConversationLog[]>([]);
  const [feedbackEntries, setFeedbackEntries] = useState<FeedbackEntry[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [logsRes, feedbackRes, statsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/conversations`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/feedback`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/stats`, { headers }),
        ]);

        if (!logsRes.ok) throw new Error('Failed to fetch conversation logs.');
        if (!feedbackRes.ok) throw new Error('Failed to fetch feedback entries.');
        if (!statsRes.ok) throw new Error('Failed to fetch usage stats.');

        setConversationLogs(await logsRes.json());
        setFeedbackEntries(await feedbackRes.json());
        setUsageStats(await statsRes.json());

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  if (isLoading) return <p>Loading analytics data...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Usage Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          {usageStats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-md">
                <h3 className="text-lg font-semibold">Total Conversations</h3>
                <p className="text-2xl">{usageStats.totalConversations}</p>
              </div>
              <div className="p-4 border rounded-md">
                <h3 className="text-lg font-semibold">Total Feedback</h3>
                <p className="text-2xl">{usageStats.totalFeedback}</p>
              </div>
              <div className="p-4 border rounded-md">
                <h3 className="text-lg font-semibold">Positive Feedback</h3>
                <p className="text-2xl">{usageStats.positiveFeedback}</p>
              </div>
            </div>
          ) : (
            <p>No usage statistics available.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Conversation Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {conversationLogs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Platform</TableHead>
                  <TableHead>User Message</TableHead>
                  <TableHead>AI Response</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conversationLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.platform}</TableCell>
                    <TableCell>{log.userMessage}</TableCell>
                    <TableCell>{log.aiResponse}</TableCell>
                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>No conversation logs available.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          {feedbackEntries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbackEntries.map((feedback) => (
                  <TableRow key={feedback.id}>
                    <TableCell>{feedback.rating}</TableCell>
                    <TableCell>{feedback.comment || 'N/A'}</TableCell>
                    <TableCell>{feedback.conversationId ? 'Chat' : 'N/A'}</TableCell>
                    <TableCell>{new Date(feedback.timestamp).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>No feedback entries available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
