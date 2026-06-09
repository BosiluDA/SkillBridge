const express  = require('express');
const User     = require('../models/User');
const { protect } = require('../middleware/auth');
const router   = express.Router();

// GET /api/users  - browse all users (search + filter)
router.get('/', protect, async (req, res) => {
  try {
    const { search, skill } = req.query;
    let query = { _id: { $ne: req.user._id } };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { skillsOffered: { $elemMatch: { $regex: search, $options: 'i' } } }
      ];
    }
    if (skill) {
      query.skillsOffered = { $elemMatch: { $regex: skill, $options: 'i' } };
    }

    const users = await User.find(query).select('-password');
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/users/:id  - single user profile
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/users/profile  - update own profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, bio, skillsOffered, skillsWanted } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, skillsOffered, skillsWanted },
      { new: true, runValidators: true }
    ).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// DELETE /api/users/profile  - delete own account
router.delete('/profile', protect, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/users/:id  - delete a specific user by id
router.delete('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) 
      return res.status(404).json({ success: false, message: 'User not found' });

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


module.exports = router;
