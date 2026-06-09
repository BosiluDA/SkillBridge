const express  = require('express');
const Review   = require('../models/Review');
const Exchange = require('../models/Exchange');
const { protect } = require('../middleware/auth');
const { updateUserScores } = require('../utils/scoring');
const router   = express.Router();

// POST /api/reviews  - submit a review after exchange completed
router.post('/', protect, async (req, res) => {
  try {
    const { exchangeId, rating, comment } = req.body;
    if (!exchangeId || !rating)
      return res.status(400).json({ success: false, message: 'exchangeId and rating are required' });

    const exchange = await Exchange.findById(exchangeId);
    if (!exchange)
      return res.status(404).json({ success: false, message: 'Exchange not found' });
    if (exchange.status !== 'completed')
      return res.status(400).json({ success: false, message: 'Can only review completed exchanges' });

    const isParty = [exchange.sender.toString(), exchange.receiver.toString()]
      .includes(req.user._id.toString());
    if (!isParty)
      return res.status(403).json({ success: false, message: 'Not authorised' });

    // Reviewee = the other person
    const revieweeId = exchange.sender.toString() === req.user._id.toString()
      ? exchange.receiver
      : exchange.sender;

    // Prevent duplicate review
    const existing = await Review.findOne({ exchange: exchangeId, reviewer: req.user._id });
    if (existing)
      return res.status(400).json({ success: false, message: 'You already reviewed this exchange' });

    const review = await Review.create({
      exchange: exchangeId, reviewer: req.user._id,
      reviewee: revieweeId, rating, comment
    });

    // Recalculate trust scores for the reviewee
    await updateUserScores(revieweeId);

    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/reviews/user/:id  - all reviews for a user
router.get('/user/:id', protect, async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.id })
      .populate('reviewer', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
