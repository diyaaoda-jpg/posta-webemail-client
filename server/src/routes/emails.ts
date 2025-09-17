import express from 'express';
import { db } from '../db';
import { emailMessages, emailAttachments } from '../schema';
import { eq, desc, and, like, or } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get emails for an account
router.get('/account/:accountId', authenticateToken, async (req, res) => {
  try {
    const { accountId } = req.params;
    const { page = 1, limit = 50, search = '', folder = 'INBOX' } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);

    let query = db.select().from(emailMessages)
      .where(
        and(
          eq(emailMessages.accountId, accountId),
          eq(emailMessages.folderName, folder as string),
          eq(emailMessages.isDeleted, false)
        )
      )
      .orderBy(desc(emailMessages.receivedAt))
      .limit(Number(limit))
      .offset(offset);

    // Add search if provided
    if (search) {
      query = db.select().from(emailMessages)
        .where(
          and(
            eq(emailMessages.accountId, accountId),
            eq(emailMessages.folderName, folder as string),
            eq(emailMessages.isDeleted, false),
            or(
              like(emailMessages.subject, `%${search}%`),
              like(emailMessages.textBody, `%${search}%`),
              like(emailMessages.fromAddress, `%${search}%`)
            )
          )
        )
        .orderBy(desc(emailMessages.receivedAt))
        .limit(Number(limit))
        .offset(offset);
    }

    const emails = await query;

    res.json({
      emails,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: emails.length
      }
    });
  } catch (error) {
    console.error('Get emails error:', error);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

// Get single email with attachments
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [email] = await db.select().from(emailMessages).where(eq(emailMessages.id, id));
    
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }

    const attachments = await db.select().from(emailAttachments)
      .where(eq(emailAttachments.messageId, id));

    res.json({
      ...email,
      attachments
    });
  } catch (error) {
    console.error('Get email error:', error);
    res.status(500).json({ error: 'Failed to fetch email' });
  }
});

// Mark email as read/unread
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { isRead } = req.body;

    await db.update(emailMessages)
      .set({ isRead: isRead, updatedAt: new Date() })
      .where(eq(emailMessages.id, id));

    res.json({ success: true });
  } catch (error) {
    console.error('Update read status error:', error);
    res.status(500).json({ error: 'Failed to update read status' });
  }
});

// Mark email as flagged/unflagged
router.patch('/:id/flag', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { isFlagged } = req.body;

    await db.update(emailMessages)
      .set({ isFlagged: isFlagged, updatedAt: new Date() })
      .where(eq(emailMessages.id, id));

    res.json({ success: true });
  } catch (error) {
    console.error('Update flag status error:', error);
    res.status(500).json({ error: 'Failed to update flag status' });
  }
});

// Delete email (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await db.update(emailMessages)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(eq(emailMessages.id, id));

    res.json({ success: true });
  } catch (error) {
    console.error('Delete email error:', error);
    res.status(500).json({ error: 'Failed to delete email' });
  }
});

export default router;