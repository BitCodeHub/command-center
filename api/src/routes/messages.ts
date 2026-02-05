// Phase 1: Agent-to-Agent Messaging API
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Send a message
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      fromAgentId,
      toAgentId,
      message,
      messageType = 'message',
      priority = 'normal',
      threadId,
      mentions = [],
      attachments = [],
      parentMessageId
    } = req.body;

    if (!fromAgentId || !message) {
      return res.status(400).json({ error: 'fromAgentId and message are required' });
    }

    const newMessage = await prisma.agentMessage.create({
      data: {
        fromAgentId,
        toAgentId,
        message,
        messageType,
        priority,
        threadId,
        mentions,
        attachments,
        parentMessageId
      }
    });

    // Also log to activity feed
    await prisma.activityLog.create({
      data: {
        type: 'message',
        agentId: fromAgentId,
        title: `${fromAgentId} → ${toAgentId || 'broadcast'}: ${message.substring(0, 50)}...`,
        description: message,
        metadata: {
          messageId: newMessage.id,
          messageType,
          priority,
          toAgentId
        }
      }
    });

    res.json({ success: true, message: newMessage });
  } catch (error: any) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message', details: error.message });
  }
});

// Get messages for an agent (inbox)
router.get('/inbox/:agentId', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const { unreadOnly = false, limit = 50, offset = 0 } = req.query;

    let where: any = {
      OR: [
        { toAgentId: agentId },
        { toAgentId: null }, // Broadcast messages
        { mentions: { has: agentId } } // Messages where agent is mentioned
      ]
    };

    if (unreadOnly === 'true') {
      where.readBy = {
        not: { has: agentId }
      };
    }

    const messages = await prisma.agentMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset)
    });

    const total = await prisma.agentMessage.count({ where });

    res.json({
      success: true,
      messages,
      total,
      unread: messages.filter(m => !m.readBy.includes(agentId)).length
    });
  } catch (error: any) {
    console.error('Error fetching inbox:', error);
    res.status(500).json({ error: 'Failed to fetch inbox', details: error.message });
  }
});

// Get messages sent by an agent (outbox)
router.get('/outbox/:agentId', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const messages = await prisma.agentMessage.findMany({
      where: { fromAgentId: agentId },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset)
    });

    const total = await prisma.agentMessage.count({
      where: { fromAgentId: agentId }
    });

    res.json({ success: true, messages, total });
  } catch (error: any) {
    console.error('Error fetching outbox:', error);
    res.status(500).json({ error: 'Failed to fetch outbox', details: error.message });
  }
});

// Get thread messages
router.get('/thread/:threadId', async (req: Request, res: Response) => {
  try {
    const { threadId } = req.params;

    const messages = await prisma.agentMessage.findMany({
      where: { threadId },
      orderBy: { createdAt: 'asc' }
    });

    res.json({ success: true, messages, count: messages.length });
  } catch (error: any) {
    console.error('Error fetching thread:', error);
    res.status(500).json({ error: 'Failed to fetch thread', details: error.message });
  }
});

// Mark message as read
router.post('/:messageId/read', async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const { agentId } = req.body;

    if (!agentId) {
      return res.status(400).json({ error: 'agentId is required' });
    }

    const message = await prisma.agentMessage.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (!message.readBy.includes(agentId)) {
      await prisma.agentMessage.update({
        where: { id: messageId },
        data: {
          readBy: { push: agentId }
        }
      });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error marking as read:', error);
    res.status(500).json({ error: 'Failed to mark as read', details: error.message });
  }
});

// Add reaction to message
router.post('/:messageId/react', async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const { agentId, emoji } = req.body;

    if (!agentId || !emoji) {
      return res.status(400).json({ error: 'agentId and emoji are required' });
    }

    const message = await prisma.agentMessage.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const reactions = message.reactions as Record<string, string[]> || {};
    if (!reactions[emoji]) {
      reactions[emoji] = [];
    }
    if (!reactions[emoji].includes(agentId)) {
      reactions[emoji].push(agentId);
    }

    await prisma.agentMessage.update({
      where: { id: messageId },
      data: { reactions }
    });

    res.json({ success: true, reactions });
  } catch (error: any) {
    console.error('Error adding reaction:', error);
    res.status(500).json({ error: 'Failed to add reaction', details: error.message });
  }
});

// Get all messages (for Command Center feed)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { limit = 100, offset = 0, type, priority } = req.query;

    let where: any = {};
    if (type) where.messageType = type;
    if (priority) where.priority = priority;

    const messages = await prisma.agentMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset)
    });

    const total = await prisma.agentMessage.count({ where });

    res.json({ success: true, messages, total });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages', details: error.message });
  }
});

export default router;
