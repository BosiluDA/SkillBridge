const Review = require('../models/Review');

// Recency decay weight
const recencyWeight = (createdAt) => {
  const daysAgo = (Date.now() - new Date(createdAt)) / (1000 * 60 * 60 * 24);
  if (daysAgo <= 30)  return 1.0;
  if (daysAgo <= 60)  return 0.9;
  if (daysAgo <= 90)  return 0.7;
  if (daysAgo <= 180) return 0.4;
  return 0.2;
};

// Simple average (Group A)
const calcSimpleScore = (reviews) => {
  if (!reviews.length) return 0;
  const sum = reviews.reduce((t, r) => t + r.rating, 0);
  return parseFloat(((sum / reviews.length) * 20).toFixed(1)); // scale to 0-100
};

// Weighted score (Group B)
// Formula: Score = (Recency x 0.4) + (ReviewerTrust x 0.4) + (Completion x 0.2)
const calcWeightedScore = async (userId, reviews, completedExchanges, totalExchanges) => {
  if (!reviews.length) return 0;

  // --- Recency-weighted rating ---
  let recencySum = 0, recencyTotal = 0;
  for (const r of reviews) {
    const w = recencyWeight(r.createdAt);
    recencySum   += r.rating * w;
    recencyTotal += w;
  }
  const recencyRating = recencySum / recencyTotal; // 1-5

  // --- Reviewer-trust-weighted rating ---
  const User = require('../models/User');
  let trustSum = 0, trustTotal = 0;
  for (const r of reviews) {
    const reviewer = await User.findById(r.reviewer);
    const reviewerTrust = reviewer ? (reviewer.simpleScore || 50) / 100 : 0.5;
    trustSum   += r.rating * reviewerTrust;
    trustTotal += reviewerTrust;
  }
  const trustRating = trustTotal > 0 ? trustSum / trustTotal : recencyRating;

  // --- Completion rate ---
  const completionRate = totalExchanges > 0
    ? completedExchanges / totalExchanges
    : 0;

  // --- Final score (scaled to 0-100) ---
  const raw = (recencyRating * 0.4) + (trustRating * 0.4) + (completionRate * 5 * 0.2);
  return parseFloat((raw * 20).toFixed(1));
};

// Recalculate and save both scores for a user
const updateUserScores = async (userId) => {
  const User     = require('../models/User');
  const user     = await User.findById(userId);
  if (!user) return;

  const reviews  = await Review.find({ reviewee: userId });

  user.simpleScore   = calcSimpleScore(reviews);
  user.weightedScore = await calcWeightedScore(
    userId, reviews,
    user.completedExchanges,
    user.totalExchanges
  );
  await user.save();
};

module.exports = { calcSimpleScore, calcWeightedScore, updateUserScores };
