const express  = require('express');
const Message  = require('../models/Message');
const Exchange = require('../models/Exchange');
const { protect } = require('../middleware/auth');
const router   = express.Router();

// POST /api/messages  - send a message
router.post('/', protect, async (req, res) => {
  try {
    const { exchangeId, text } = req.body;
    if (!exchangeId || !text)
      return res.status(400).json({ success: false, message: 'exchangeId and text are required' });

    const exchange = await Exchange.findById(exchangeId);
    if (!exchange) return res.status(404).json({ success: false, message: 'Exchange not found' });

    const isParty = [exchange.sender.toString(), exchange.receiver.toString()]
      .includes(req.user._id.toString());
    if (!isParty)
      return res.status(403).json({ success: false, message: 'Not authorised' });

    const message = await Message.create({ exchange: exchangeId, sender: req.user._id, text });
    const populated = await message.populate('sender', 'name');
    res.status(201).json({ success: true, message: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/messages/:exchangeId  - get all messages for an exchange
router.get('/:exchangeId', protect, async (req, res) => {
  try {
    const exchange = await Exchange.findById(req.params.exchangeId);
    if (!exchange) return res.status(404).json({ success: false, message: 'Exchange not found' });

    const isParty = [exchange.sender.toString(), exchange.receiver.toString()]
      .includes(req.user._id.toString());
    if (!isParty) return res.status(403).json({ success: false, message: 'Not authorised' });

    const messages = await Message.find({ exchange: req.params.exchangeId })
      .populate('sender', 'name')
      .sort({ createdAt: 1 });
    res.json({ success: true, count: messages.length, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
