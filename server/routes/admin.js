const express   = require('express');
const User      = require('../models/User');
const Exchange  = require('../models/Exchange');
const Review    = require('../models/Review');
const { protect, adminOnly } = require('../middleware/auth');
const router    = express.Router();

// All admin routes require auth + admin flag
router.use(protect, adminOnly);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalExchanges, completedExchanges,
           pendingExchanges, totalReviews,
           groupAUsers, groupBUsers] = await Promise.all([
      User.countDocuments(),
      Exchange.countDocuments(),
      Exchange.countDocuments({ status: 'completed' }),
      Exchange.countDocuments({ status: 'pending' }),
      Review.countDocuments(),
      User.countDocuments({ assignedGroup: 'A' }),
      User.countDocuments({ assignedGroup: 'B' })
    ]);

    res.json({
      success: true,
      totalUsers,
      totalExchanges,
      completedExchanges,
      pendingExchanges,
      totalReviews,
      groupA: groupAUsers,
      groupB: groupBUsers
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/exchanges
router.get('/exchanges', async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    const filter = status ? { status } : {};
    const exchanges = await Exchange.find(filter)
      .populate('requester receiver', 'name email assignedGroup')
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    res.json({ success: true, count: exchanges.length, exchanges });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/export
router.get('/export', async (req, res) => {
  try {
    const exchanges = await Exchange.find({ status: 'completed' })
      .populate('requester receiver', 'name email assignedGroup simpleScore weightedScore');

    const rows = exchanges.map(e => ({
      exchangeId:       e._id,
      requesterName:    e.requester?.name,
      requesterEmail:   e.requester?.email,
      requesterGroup:   e.requester?.assignedGroup,
      receiverName:     e.receiver?.name,
      receiverEmail:    e.receiver?.email,
      receiverGroup:    e.receiver?.assignedGroup,
      message:          e.message,
      status:           e.status,
      createdAt:        e.createdAt,
      completedAt:      e.completedAt
    }));

    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;