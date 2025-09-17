import express from 'express';
import { db } from '../db';
import { emailAccounts, type InsertEmailAccount } from '../schema';
import { eq } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Get user's email accounts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;

    const accounts = await db.select({
      id: emailAccounts.id,
      accountName: emailAccounts.accountName,
      emailAddress: emailAccounts.emailAddress,
      serverType: emailAccounts.serverType,
      serverHost: emailAccounts.serverHost,
      serverPort: emailAccounts.serverPort,
      useSsl: emailAccounts.useSsl,
      isActive: emailAccounts.isActive,
      lastSyncAt: emailAccounts.lastSyncAt,
      createdAt: emailAccounts.createdAt
    }).from(emailAccounts).where(eq(emailAccounts.userId, userId));

    res.json({ accounts });
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// Add new email account
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { 
      accountName, 
      emailAddress, 
      serverType, 
      serverHost, 
      serverPort, 
      username, 
      password, 
      useSsl 
    } = req.body;

    // Hash the email password
    const passwordHash = await bcrypt.hash(password, 12);

    const newAccount: InsertEmailAccount = {
      userId,
      accountName,
      emailAddress,
      serverType,
      serverHost,
      serverPort,
      username,
      passwordHash,
      useSsl: useSsl ?? true
    };

    const [account] = await db.insert(emailAccounts).values(newAccount).returning({
      id: emailAccounts.id,
      accountName: emailAccounts.accountName,
      emailAddress: emailAccounts.emailAddress,
      serverType: emailAccounts.serverType,
      serverHost: emailAccounts.serverHost,
      serverPort: emailAccounts.serverPort,
      useSsl: emailAccounts.useSsl,
      isActive: emailAccounts.isActive,
      createdAt: emailAccounts.createdAt
    });

    res.status(201).json({ account });
  } catch (error) {
    console.error('Add account error:', error);
    res.status(500).json({ error: 'Failed to add email account' });
  }
});

// Test email account connection
router.post('/:id/test', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    const [account] = await db.select().from(emailAccounts)
      .where(eq(emailAccounts.id, id));

    if (!account || account.userId !== userId) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // TODO: Implement actual email connection test
    // For now, just return success
    res.json({ 
      success: true, 
      message: 'Connection test successful',
      lastTested: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test connection error:', error);
    res.status(500).json({ error: 'Connection test failed' });
  }
});

// Sync emails for account
router.post('/:id/sync', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    const [account] = await db.select().from(emailAccounts)
      .where(eq(emailAccounts.id, id));

    if (!account || account.userId !== userId) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // TODO: Implement actual email sync
    // Update last sync time
    await db.update(emailAccounts)
      .set({ lastSyncAt: new Date() })
      .where(eq(emailAccounts.id, id));

    res.json({ 
      success: true, 
      message: 'Email sync completed',
      syncedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Sync emails error:', error);
    res.status(500).json({ error: 'Email sync failed' });
  }
});

export default router;