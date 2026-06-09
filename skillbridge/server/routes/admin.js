const express   = require('express');
const User      = require('../models/User');
const Exchange  = require('../models/Exchange');
const Review    = require('../models/Review');
const { protect, adminOnly } = require('../middleware/auth');
const router    = express.Router();

// All admin routes require auth + admin flag
router.use(protect, adminOnly);

// GET /api/admin/stats  - overview stats
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalExchanges, completedExchanges,
           activeExchanges, pendingExchanges, abandonedExchanges,
           groupAUsers, groupBUsers] = await Promise.all([
      User.countDocuments(),
      Exchange.countDocuments(),
      Exchange.countDocuments({ status: 'completed' }),
      Exchange.countDocuments({ status: 'active' }),
      Exchange.countDocuments({ status: 'pending' }),
      Exchange.countDocuments({ status: 'declined' }),
      User.countDocuments({ assignedGroup: 'A' }),
      User.countDocuments({ assignedGroup: 'B' })
    ]);

    // Completion rates per group
    const groupAIds = (await User.find({ assignedGroup: 'A' }).select('_id')).map(u => u._id);
    const groupBIds = (await User.find({ assignedGroup: 'B' }).select('_id')).map(u => u._id);

    const groupACompleted = await Exchange.countDocuments({ sender: { $in: groupAIds }, status: 'completed' });
    const groupATotal     = await Exchange.countDocuments({ sender: { $in: groupAIds } });
    const groupBCompleted = await Exchange.countDocuments({ sender: { $in: groupBIds }, status: 'completed' });
    const groupBTotal     = await Exchange.countDocuments({ sender: { $in: groupBIds } });

    res.json({
      success: true,
      stats: {
        users: { total: totalUsers, groupA: groupAUsers, groupB: groupBUsers },
        exchanges: {
          total: totalExchanges, completed: completedExchanges,
          active: activeExchanges, pending: pendingExchanges, abandoned: abandonedExchanges
        },
        completionRates: {
          groupA: groupATotal > 0 ? ((groupACompleted / groupATotal) * 100).toFixed(1) + '%' : '0%',
          groupB: groupBTotal > 0 ? ((groupBCompleted / groupBTotal) * 100).toFixed(1) + '%' : '0%'
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/exchanges  - list all exchanges
router.get('/exchanges', async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    const filter = status ? { status } : {};
    const exchanges = await Exchange.find(filter)
      .populate('sender receiver', 'name email assignedGroup')
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    res.json({ success: true, count: exchanges.length, exchanges });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/users  - list all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/export  - export data as JSON (save as CSV manually)
router.get('/export', async (req, res) => {
  try {
    const exchanges = await Exchange.find({ status: 'completed' })
      .populate('sender receiver', 'name email assignedGroup simpleScore weightedScore');

    const rows = exchanges.map(e => ({
      exchangeId:    e._id,
      senderName:    e.sender.name,
      senderEmail:   e.sender.email,
      senderGroup:   e.sender.assignedGroup,
      receiverName:  e.receiver.name,
      receiverEmail: e.receiver.email,
      receiverGroup: e.receiver.assignedGroup,
      skillWanted:   e.skillWanted,
      skillOffered:  e.skillOffered,
      status:        e.status,
      createdAt:     e.createdAt,
      completedAt:   e.completedAt
    }));

    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
