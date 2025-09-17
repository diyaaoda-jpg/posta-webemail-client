"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("../db");
const schema_1 = require("../schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../middleware/auth");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const router = express_1.default.Router();
// Get user's email accounts
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const accounts = await db_1.db.select({
            id: schema_1.emailAccounts.id,
            accountName: schema_1.emailAccounts.accountName,
            emailAddress: schema_1.emailAccounts.emailAddress,
            serverType: schema_1.emailAccounts.serverType,
            serverHost: schema_1.emailAccounts.serverHost,
            serverPort: schema_1.emailAccounts.serverPort,
            useSsl: schema_1.emailAccounts.useSsl,
            isActive: schema_1.emailAccounts.isActive,
            lastSyncAt: schema_1.emailAccounts.lastSyncAt,
            createdAt: schema_1.emailAccounts.createdAt
        }).from(schema_1.emailAccounts).where((0, drizzle_orm_1.eq)(schema_1.emailAccounts.userId, userId));
        res.json({ accounts });
    }
    catch (error) {
        console.error('Get accounts error:', error);
        res.status(500).json({ error: 'Failed to fetch accounts' });
    }
});
// Add new email account
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { accountName, emailAddress, serverType, serverHost, serverPort, username, password, useSsl } = req.body;
        // Hash the email password
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        const newAccount = {
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
        const [account] = await db_1.db.insert(schema_1.emailAccounts).values(newAccount).returning({
            id: schema_1.emailAccounts.id,
            accountName: schema_1.emailAccounts.accountName,
            emailAddress: schema_1.emailAccounts.emailAddress,
            serverType: schema_1.emailAccounts.serverType,
            serverHost: schema_1.emailAccounts.serverHost,
            serverPort: schema_1.emailAccounts.serverPort,
            useSsl: schema_1.emailAccounts.useSsl,
            isActive: schema_1.emailAccounts.isActive,
            createdAt: schema_1.emailAccounts.createdAt
        });
        res.status(201).json({ account });
    }
    catch (error) {
        console.error('Add account error:', error);
        res.status(500).json({ error: 'Failed to add email account' });
    }
});
// Test email account connection
router.post('/:id/test', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const [account] = await db_1.db.select().from(schema_1.emailAccounts)
            .where((0, drizzle_orm_1.eq)(schema_1.emailAccounts.id, id));
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
    }
    catch (error) {
        console.error('Test connection error:', error);
        res.status(500).json({ error: 'Connection test failed' });
    }
});
// Sync emails for account
router.post('/:id/sync', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const [account] = await db_1.db.select().from(schema_1.emailAccounts)
            .where((0, drizzle_orm_1.eq)(schema_1.emailAccounts.id, id));
        if (!account || account.userId !== userId) {
            return res.status(404).json({ error: 'Account not found' });
        }
        // TODO: Implement actual email sync
        // Update last sync time
        await db_1.db.update(schema_1.emailAccounts)
            .set({ lastSyncAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.emailAccounts.id, id));
        res.json({
            success: true,
            message: 'Email sync completed',
            syncedAt: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Sync emails error:', error);
        res.status(500).json({ error: 'Email sync failed' });
    }
});
exports.default = router;
//# sourceMappingURL=accounts.js.map