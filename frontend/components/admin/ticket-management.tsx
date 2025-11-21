// src/components/admin/ticket-management.tsx
"use client"

import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Ticket {
  id: string;
  userProfileId: string;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  userProfile?: { name: string | null };
}

export default function TicketManagement() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch tickets.');
      }
      const data = await response.json();
      setTickets(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    // Request notification permission
    if (typeof window !== 'undefined' && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, [token]);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');

    socket.on('new_ticket', (newTicket: Ticket) => {
      setTickets((prevTickets) => [newTicket, ...prevTickets]);
      // Add a simple browser notification
      if (Notification.permission === 'granted') {
        new Notification('New Ticket Received', {
          body: newTicket.subject,
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleStatusChange = async (ticketId: string, newStatus: Ticket['status']) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        throw new Error('Failed to update ticket status.');
      }
      // Refresh tickets after update
      fetchTickets();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Human Assistance Tickets</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <p>Loading tickets...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        <div className="space-y-4">
          {tickets.length === 0 && !isLoading && !error && (
            <p>No assistance tickets found.</p>
          )}
          {tickets.map(ticket => (
            <div key={ticket.id} className="border p-4 rounded-md shadow-sm">
              <h3 className="font-semibold">Subject: {ticket.subject}</h3>
              <p className="text-sm text-muted-foreground">From: {ticket.userProfile?.name || ticket.userProfileId}</p>
              <p className="mt-2">{ticket.description}</p>
              <div className="flex items-center justify-between mt-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${ticket.status === 'OPEN' ? 'bg-red-100 text-red-800' : ticket.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                  {ticket.status}
                </span>
                <Select onValueChange={(value: Ticket['status']) => handleStatusChange(ticket.id, value)} value={ticket.status}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Update Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
