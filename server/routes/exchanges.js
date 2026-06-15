const express   = require('express');
const Exchange  = require('../models/Exchange');
const User      = require('../models/User');
const { protect } = require('../middleware/auth');
const router    = express.Router();

// POST /api/exchanges  - send a request
router.post('/', protect, async (req, res) => {
  try {
    const { receiverId, skillWanted, skillOffered, message } = req.body;
    if (!receiverId || !skillWanted || !skillOffered)
      return res.status(400).json({ success: false, message: 'receiverId, skillWanted and skillOffered are required' });

    if (receiverId === req.user._id.toString())
      return res.status(400).json({ success: false, message: 'You cannot send a request to yourself' });

    const exchange = await Exchange.create({
      sender: req.user._id, receiver: receiverId,
      skillWanted, skillOffered, message
    });
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalExchanges: 1 } });

    const populated = await exchange.populate(['sender','receiver'], 'name email');
    res.status(201).json({ success: true, exchange: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/exchanges  - all exchanges for logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    };
    if (status) filter.status = status;

    const exchanges = await Exchange.find(filter)
      .populate('sender receiver', 'name email simpleScore weightedScore assignedGroup')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: exchanges.length, exchanges });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/exchanges/:id - single exchange
router.get('/:id', protect, async (req, res) => {
  try {
    const exchange = await Exchange.findById(req.params.id)
      .populate('sender receiver', 'name email');
    if (!exchange) return res.status(404).json({ success: false, message: 'Exchange not found' });
    res.json({ success: true, exchange });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/exchanges/:id/status  - accept / decline / complete
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['accepted','active','declined','completed'];
    if (!allowed.includes(status))
      return res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(', ')}` });

    const exchange = await Exchange.findById(req.params.id);
    if (!exchange) return res.status(404).json({ success: false, message: 'Exchange not found' });

    const isParty = [exchange.sender.toString(), exchange.receiver.toString()]
      .includes(req.user._id.toString());
    if (!isParty)
      return res.status(403).json({ success: false, message: 'Not authorised' });

    exchange.status = status;
    if (status === 'completed') {
      exchange.completedAt = Date.now();
      await User.findByIdAndUpdate(exchange.sender,   { $inc: { completedExchanges: 1 } });
      await User.findByIdAndUpdate(exchange.receiver, { $inc: { completedExchanges: 1 } });
    }
    await exchange.save();
    res.json({ success: true, exchange });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
