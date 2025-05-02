const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateUniqueReferralCode = async () => {
  // console.log('inside generateUniqueReferralCode')
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  let exists = true;

  while (exists) {
    code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // console.log("code: " + code)
    exists = await User.findOne({ referralCode: code });
    // console.log("exists: " + exists)
  }

  return code;
};


const registerUser = async (req, res) => {
  try {
    // console.log('inside register')
    const { username, email, password, referredBy } = req.body;

    // console.log("username: " + username)
    // console.log("email: " + email)
    // console.log("password: " + password)
    // console.log("referredBy: " + referredBy)

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered.' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      referredBy,
      referralCode: await generateUniqueReferralCode(),
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    // console.log('inside login')
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials.' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ message: 'Login successful.', token, user: { id: user._id, username: user.username, email: user.email, balance: user.balance, walletAddress: user.walletAddress, referralCode: user.referralCode, referredBy: user.referredBy } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    // console.log('inside updateUser')
    const { email, password, walletAddress, id } = req.body;
    // console.log("email: ", email)
    // console.log("password: ", password)
    // console.log("walletAddress: ", walletAddress)
    // console.log("id: ", id)

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (walletAddress) user.walletAddress = walletAddress;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json({ message: 'User details updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const referralCount = async (req, res) => {
  try {
    // console.log("inside referral count")
    const { referralCode } = req.params;
    // console.log("referralCode: ", referralCode)
    
    const count = await User.countDocuments({ referredBy: referralCode });
    // console.log("count: ", count)
    res.json({ count });
  } catch (err) {
    console.error("Error fetching referral count:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { registerUser, loginUser, updateUser, referralCount };
