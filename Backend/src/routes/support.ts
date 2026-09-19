import { Router, Response } from 'express';
import { SupportTicket, Organization, User, Notification } from '../models';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { logAuditEvent } from '../services/auditLogger';
import { getIO, emitToUser } from '../config/socket';

const router = Router();

// POST /api/support/tickets — Organization sends a warning, reclamation, or note to Super Admin
router.post(
  '/tickets',
  authenticateToken,
  requireRole(['organization', 'admin']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { type, priority, subject, message } = req.body;

      if (!subject?.trim() || !message?.trim()) {
        return res.status(400).json({
          ok: false,
          error: { code: 'INVALID_INPUT', message: 'Sujet et message requis.' },
        });
      }

      const validTypes = ['warning', 'reclamation', 'note', 'assistance'];
      const ticketType = validTypes.includes(type) ? type : 'note';

      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      const ticketPriority = validPriorities.includes(priority) ? priority : 'medium';

      // Find organization owned by user
      const org = await Organization.findOne({ userId: req.user!.userId });
      const user = await User.findById(req.user!.userId);

      const orgName = org?.name || user?.name || 'Organisation';
      const orgEmail = org?.email || user?.email || req.user!.email;

      const ticket = await SupportTicket.create({
        orgId: org?._id || req.user!.userId,
        userId: req.user!.userId,
        orgName,
        orgEmail,
        type: ticketType,
        priority: ticketPriority,
        subject: subject.trim(),
        message: message.trim(),
        status: 'unread',
      });

      // Find super admin users to notify
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await Notification.create({
          userId: admin._id,
          type: 'admin_support_alert',
          payload: {
            ticketId: ticket._id,
            orgName,
            orgEmail,
            type: ticketType,
            priority: ticketPriority,
            subject: ticket.subject,
            message: ticket.message.slice(0, 140),
            createdAt: ticket.createdAt,
          },
          channel: 'in_app',
        });
        emitToUser(admin._id, 'admin:support_alert', {
          ticketId: ticket._id,
          orgName,
          type: ticketType,
          priority: ticketPriority,
          subject: ticket.subject,
        });
      }

      // Broadcast to any active admin socket listeners
      try {
        const io = getIO();
        io.emit('admin:support_notification', {
          ticketId: ticket._id,
          orgName,
          type: ticketType,
          priority: ticketPriority,
          subject: ticket.subject,
        });
      } catch {
        // Socket may not be initialized in test mode
      }

      await logAuditEvent('support.ticket_created', String(ticket._id), {
        orgName,
        type: ticketType,
        priority: ticketPriority,
      });

      return res.status(201).json({
        ok: true,
        data: ticket,
      });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  }
);

// GET /api/support/tickets/mine — Organization views its submitted tickets
router.get(
  '/tickets/mine',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tickets = await SupportTicket.find({ userId: req.user!.userId })
        .sort({ createdAt: -1 })
        .lean();

      return res.json({
        ok: true,
        data: tickets,
      });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  }
);

// GET /api/support/tickets/admin — Super Admin views all tickets with filtering
router.get(
  '/tickets/admin',
  authenticateToken,
  requireRole(['admin']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { type, status, priority, search } = req.query;

      const filter: any = {};
      if (type && type !== 'all' && type !== 'undefined' && type !== 'null') {
        filter.type = type;
      }
      if (status && status !== 'all' && status !== 'undefined' && status !== 'null') {
        filter.status = status;
      }
      if (priority && priority !== 'all' && priority !== 'undefined' && priority !== 'null') {
        filter.priority = priority;
      }
      if (
        search &&
        typeof search === 'string' &&
        search.trim() !== '' &&
        search.trim() !== 'undefined' &&
        search.trim() !== 'null'
      ) {
        const cleanSearch = search.trim();
        filter.$or = [
          { orgName: { $regex: cleanSearch, $options: 'i' } },
          { subject: { $regex: cleanSearch, $options: 'i' } },
          { message: { $regex: cleanSearch, $options: 'i' } },
        ];
      }

      const [tickets, totalCount, unreadCount, warningsCount, resolvedCount] = await Promise.all([
        SupportTicket.find(filter).sort({ createdAt: -1 }).limit(100).lean(),
        SupportTicket.countDocuments(),
        SupportTicket.countDocuments({ status: 'unread' }),
        SupportTicket.countDocuments({ type: 'warning' }),
        SupportTicket.countDocuments({ status: 'resolved' }),
      ]);

      return res.json({
        ok: true,
        data: {
          tickets,
          metrics: {
            total: totalCount,
            unread: unreadCount,
            warnings: warningsCount,
            resolved: resolvedCount,
          },
        },
      });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  }
);

// GET /api/support/tickets/admin/unread-count — Notification Bell Telemetry
router.get(
  '/tickets/admin/unread-count',
  authenticateToken,
  requireRole(['admin']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const [unreadCount, urgentCount, recentTickets] = await Promise.all([
        SupportTicket.countDocuments({ status: 'unread' }),
        SupportTicket.countDocuments({ status: 'unread', priority: { $in: ['high', 'urgent'] } }),
        SupportTicket.find().sort({ createdAt: -1 }).limit(8).lean(),
      ]);

      return res.json({
        ok: true,
        data: {
          unreadCount,
          urgentCount,
          recentTickets,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  }
);

// PATCH /api/support/tickets/:id/admin-reply — Super Admin updates status & sends reply
router.patch(
  '/tickets/:id/admin-reply',
  authenticateToken,
  requireRole(['admin']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { adminReply, status } = req.body;

      const updateData: any = {};
      if (adminReply !== undefined) {
        updateData.adminReply = adminReply.trim();
        updateData.repliedAt = new Date();
      }
      if (status && ['unread', 'in_progress', 'resolved'].includes(status)) {
        updateData.status = status;
        if (status === 'resolved') {
          updateData.resolvedAt = new Date();
        }
      }

      const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, updateData, { new: true });

      if (!ticket) {
        return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Ticket non trouvé' } });
      }

      // Notify the organization user
      await Notification.create({
        userId: ticket.userId,
        type: 'admin_support_reply',
        payload: {
          ticketId: ticket._id,
          subject: ticket.subject,
          status: ticket.status,
          adminReply: ticket.adminReply,
          repliedAt: ticket.repliedAt,
        },
        channel: 'in_app',
      });

      emitToUser(ticket.userId, 'notification:new', {
        title: 'Réponse de la gouvernance VOLUNOVA',
        message: `Votre demande "${ticket.subject}" a été mise à jour : ${ticket.status}`,
      });

      await logAuditEvent('support.ticket_replied', String(ticket._id), {
        status: ticket.status,
        hasReply: !!adminReply,
      });

      return res.json({
        ok: true,
        data: ticket,
      });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  }
);

export default router;
