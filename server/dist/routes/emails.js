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
const router = express_1.default.Router();
// Get emails for an account
router.get('/account/:accountId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { accountId } = req.params;
        const { page = 1, limit = 50, search = '', folder = 'INBOX' } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        let query = db_1.db.select().from(schema_1.emailMessages)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.emailMessages.accountId, accountId), (0, drizzle_orm_1.eq)(schema_1.emailMessages.folderName, folder), (0, drizzle_orm_1.eq)(schema_1.emailMessages.isDeleted, false)))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.emailMessages.receivedAt))
            .limit(Number(limit))
            .offset(offset);
        // Add search if provided
        if (search) {
            query = db_1.db.select().from(schema_1.emailMessages)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.emailMessages.accountId, accountId), (0, drizzle_orm_1.eq)(schema_1.emailMessages.folderName, folder), (0, drizzle_orm_1.eq)(schema_1.emailMessages.isDeleted, false), (0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(schema_1.emailMessages.subject, `%${search}%`), (0, drizzle_orm_1.like)(schema_1.emailMessages.textBody, `%${search}%`), (0, drizzle_orm_1.like)(schema_1.emailMessages.fromAddress, `%${search}%`))))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.emailMessages.receivedAt))
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
    }
    catch (error) {
        console.error('Get emails error:', error);
        res.status(500).json({ error: 'Failed to fetch emails' });
    }
});
// Get single email with attachments
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const [email] = await db_1.db.select().from(schema_1.emailMessages).where((0, drizzle_orm_1.eq)(schema_1.emailMessages.id, id));
        if (!email) {
            return res.status(404).json({ error: 'Email not found' });
        }
        const attachments = await db_1.db.select().from(schema_1.emailAttachments)
            .where((0, drizzle_orm_1.eq)(schema_1.emailAttachments.messageId, id));
        res.json({
            ...email,
            attachments
        });
    }
    catch (error) {
        console.error('Get email error:', error);
        res.status(500).json({ error: 'Failed to fetch email' });
    }
});
// Mark email as read/unread
router.patch('/:id/read', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { isRead } = req.body;
        await db_1.db.update(schema_1.emailMessages)
            .set({ isRead: isRead, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.emailMessages.id, id));
        res.json({ success: true });
    }
    catch (error) {
        console.error('Update read status error:', error);
        res.status(500).json({ error: 'Failed to update read status' });
    }
});
// Mark email as flagged/unflagged
router.patch('/:id/flag', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { isFlagged } = req.body;
        await db_1.db.update(schema_1.emailMessages)
            .set({ isFlagged: isFlagged, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.emailMessages.id, id));
        res.json({ success: true });
    }
    catch (error) {
        console.error('Update flag status error:', error);
        res.status(500).json({ error: 'Failed to update flag status' });
    }
});
// Delete email (soft delete)
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.db.update(schema_1.emailMessages)
            .set({ isDeleted: true, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.emailMessages.id, id));
        res.json({ success: true });
    }
    catch (error) {
        console.error('Delete email error:', error);
        res.status(500).json({ error: 'Failed to delete email' });
    }
});
exports.default = router;
//# sourceMappingURL=emails.js.map