// src/services/ticket.service.ts
import { PrismaClient, TicketStatus } from '../../../generated/prisma';
import { io } from '../index';
import { aiService } from './ai.service';

const prisma = new PrismaClient();

// Placeholder for routing map - In a real app, this would be dynamic (e.g., from DB or config)
const intentToUserProfileIdMap: { [key: string]: string } = {
  'fee_payment': 'finance_department_id',
  'exam_schedule': 'academics_department_id',
  'admission_query': 'admissions_department_id',
  'course_information': 'academics_department_id',
  'library_query': 'library_staff_id',
  'hostel_information': 'hostel_management_id',
  'document_request': 'admin_staff_id',
  'faculty_contact': 'academics_department_id',
  'event_information': 'student_affairs_id',
  'human_escalation': 'general_support_id',
  'none': 'general_support_id',
  'general_support_id': 'general_support_id', // For escalation
  'manager_support_id': 'manager_support_id', // For escalation
};

class TicketService {
  /**
   * Create a new ticket
   */
  async createTicket(userProfileId: string, subject: string, description: string) {
    // Analyze intent for routing
    const { intent } = await aiService.analyzeIntentAndEntities(`${subject} ${description}`);
    const assignedToUserProfileId = intentToUserProfileIdMap[intent] || intentToUserProfileIdMap['none'];

    const newTicket = await prisma.ticket.create({
      data: {
        userProfileId,
        subject,
        description,
        assignedToUserProfileId, // Assign based on intent
      },
    });
    // Emit a socket event to notify admins
    io.emit('new_ticket', newTicket);
    return newTicket;
  }

  /**
   * Check for overdue tickets and escalate them
   */
  async checkAndEscalateTickets() {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    // Find OPEN tickets older than 24 hours
    const overdueOpenTickets = await prisma.ticket.findMany({
      where: {
        status: 'OPEN',
        createdAt: { lt: twentyFourHoursAgo },
      },
    });

    for (const ticket of overdueOpenTickets) {
      const escalatedTicket = await prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          status: 'IN_PROGRESS', // Move to in progress if open
          assignedToUserProfileId: intentToUserProfileIdMap['general_support_id'],
        },
      });
      io.emit('ticket_escalated', escalatedTicket);
      console.log(`Ticket ${escalatedTicket.id} escalated to general support.`);
    }

    // Find IN_PROGRESS tickets older than 48 hours
    const overdueInProgressTickets = await prisma.ticket.findMany({
      where: {
        status: 'IN_PROGRESS',
        updatedAt: { lt: fortyEightHoursAgo }, // Assuming updatedAt reflects last action
      },
    });

    for (const ticket of overdueInProgressTickets) {
      const escalatedTicket = await prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          assignedToUserProfileId: intentToUserProfileIdMap['manager_support_id'],
        },
      });
      io.emit('ticket_escalated', escalatedTicket);
      console.log(`Ticket ${escalatedTicket.id} escalated to manager support.`);
    }
  }

  /**
   * Get a ticket by its ID
   */
  async getTicketById(ticketId: string) {
    return prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { userProfile: true },
    });
  }

  /**
   * Get all tickets
   */
  async getAllTickets() {
    return prisma.ticket.findMany({
      include: { userProfile: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update the status of a ticket
   */
  async updateTicketStatus(ticketId: string, status: TicketStatus) {
    return prisma.ticket.update({
      where: { id: ticketId },
      data: { status },
    });
  }
}

export const ticketService = new TicketService();
