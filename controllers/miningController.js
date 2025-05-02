const User = require('../models/User'); // Ensure you have the User model imported
const MiningSession = require('../models/MiningSession');

const startMining = async (req, res) => {
    // console.log("inside startMining");
    const { userId, minerType } = req.body;
    const currentTime = new Date();
    let expiresAt;

    if (minerType === 'Free Mining') {
      expiresAt = new Date(currentTime.getTime() + 5 * 60 * 60 * 1000); // 5 hours
    } else if (minerType === 'Ad Mining') {
        expiresAt = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    } else {
        return res.status(400).json({ message: "Invalid minerType" });
    }

    try {
        const newSession = new MiningSession({
            userId,
            minerType,
            startedAt: new Date(),
            expiresAt,
        });

        await newSession.save();

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.miningSessions.push(newSession._id);
        await user.save();

        res.status(200).json({ message: "Mining session started", session: newSession });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const miningSession = async (req, res) => {
    // console.log("inside miningSession");
    const { userId } = req.params;

    try {
        const user = await User.findById(userId).populate("miningSessions");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ miningSessions: user.miningSessions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const withdraw = async (req, res) => {
    // console.log("inside withdraw");
    const { userId, amount, walletAddress } = req.body;
    const MIN_WITHDRAW = 0.0005;
    const MAX_WITHDRAW = 1;
    const NETWORK_FEE = 0.0001;
    // console.log("userId: ", userId)
    // console.log("amount: ", amount)
    // console.log("walletAddress: ", walletAddress)

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (amount < MIN_WITHDRAW || amount > MAX_WITHDRAW) {
          return res.status(400).json({
            success: false,
            message: `Withdrawal amount must be between ${MIN_WITHDRAW} and ${MAX_WITHDRAW} BTC.`,
          });
        }

        const totalDeduction = amount + NETWORK_FEE;

        if (user.balance >= totalDeduction) {
            user.balance -= totalDeduction;
            user.walletAddress = walletAddress;
            await user.save();

            const withdrawal = new Withdrawal({
              userId,
              amount,
              walletAddress,
              networkFee: NETWORK_FEE,
              status: 'pending',
            });

            await withdrawal.save();

            res.json({ success: true, message: `Withdrawal request submitted. Fee: ${NETWORK_FEE} BTC`, balance: user.balance, withdrawalId: withdrawal._id });
        } else {
            res.status(400).json({ success: false, message: 'Insufficient balance' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const adMining = async (req, res) => {
    try {
        // console.log("inside adMining")
        const { userId } = req.body;
        // console.log("userId: " + userId)
        const user = await User.findById(userId);
        // console.log("user: " + user)
        const todayDate = new Date().toDateString();
        // console.log("todayDate: " + todayDate)
        // console.log("user.adsWatchedDate: " + user.adsWatchedDate)
        // console.log("user.adsWatchedToday: " + user.adsWatchedToday)
    
        if (user.adsWatchedDate !== todayDate) {
          // console.log("inside if block")
          user.adsWatchedToday = 0;
          user.adsWatchedDate = todayDate;
          await user.save();
        }
    
        res.json({ adsWatchedToday: user.adsWatchedToday });
      } catch (error) {
        res.status(500).json({ message: 'Server error' });
      }
};

const freeMining = async (req, res) => {
    try {
        // console.log("inside freeMining")
        const { userId } = req.body;
        // console.log("userId: " + userId)
        const user = await User.findById(userId);
        // console.log("user: " + user)
        const todayDate = new Date().toDateString();
        // console.log("todayDate: " + todayDate)
        // console.log("user.freeMiningToday: " + user.freeMiningToday)
        // console.log("user.freeMiningDate: " + user.freeMiningDate)
    
        if (user.freeMiningDate !== todayDate) {
          // console.log("inside if block")
          user.freeMiningToday = 0;
          user.freeMiningDate = todayDate;
          await user.save();
        }
    
        res.json({ freeMiningToday: user.freeMiningToday });
      } catch (error) {
        res.status(500).json({ message: 'Server error' });
      }
};

const watchAd = async (req, res) => {
    try {
        const { userId, minerType } = req.body;
        const user = await User.findById(userId);  // Assuming user is logged in
        const todayDate = new Date().toDateString();

        if (minerType === 'Free Mining') {
          if (user.freeMiningDate !== todayDate) {
            user.freeMiningToday = 0;
            user.freeMiningDate = todayDate;
          }

          if (user.freeMiningToday < 1) {
            user.freeMiningToday += 1;
            await user.save();
            res.json({ success: true, freeMiningToday: user.freeMiningToday });
          } else {
            res.status(400).json({ message: 'Daily ad limit reached' });
          }
        } else {
          // If the date is not today, reset the count
          if (user.adsWatchedDate !== todayDate) {
            user.adsWatchedToday = 0;
            user.adsWatchedDate = todayDate;
          }
      
          if (user.adsWatchedToday < 35) {
            user.adsWatchedToday += 1;
            await user.save();
            res.json({ success: true, adsWatchedToday: user.adsWatchedToday });
          } else {
            res.status(400).json({ message: 'Daily ad limit reached' });
          }
        }
      } catch (error) {
        res.status(500).json({ message: 'Server error' });
      }
};

const BTCMinedUpdate = async (req, res) => {
  try {
    const { userId, minedAmount } = req.body;
    // console.log("BTCMinedUpdate => userId: ", userId)
    // console.log("BTCMinedUpdate => minedAmount: ", minedAmount)

    if (!userId || typeof minedAmount !== 'number') {
      return res.status(400).json({ error: 'userId and minedAmount are required' });
    }

    const updated = await User.findOneAndUpdate(
      { _id: userId },
      { $inc: { balance: minedAmount } },
      { new: true } 
    );
    // console.log("BTCMinedUpdate => updated: ", updated)

    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'Balance updated', newBalance: updated.balance });
  } catch (err) {
    console.error('Error updating BTC balance:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const BTCBalance = async (req, res) => {
  try {
    const { userId } = req.query;
    // console.log("BTCBalance => userId: ", userId)
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const balanceDoc = await User.findById(userId);
    // console.log("balanceDoc: ", balanceDoc)

    if (!balanceDoc) {
      return res.status(200).json({ balance: 0 }); // Default if no record exists
    }

    res.status(200).json({ balance: balanceDoc.balance });
  } catch (err) {
    console.error('Error fetching BTC balance:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { startMining, miningSession, withdraw, adMining, watchAd, freeMining, BTCMinedUpdate, BTCBalance };
