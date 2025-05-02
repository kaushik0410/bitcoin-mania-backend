const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    hashrate: { 
        type: Number, 
        default: 0 
    },
    balance: { 
        type: Number, 
        default: 0 
    },
    walletAddress: { 
        type: String, 
        default: '' 
    },
    freeMiningToday: {
        type: Number,
        default: 0,
    },
    freeMiningDate: {
        type: String, 
        default: new Date().toDateString() 
    },
    adsWatchedToday: { 
        type: Number, 
        default: 0 
    },
    adsWatchedDate: { 
        type: String, 
        default: new Date().toDateString() 
    },
    miningSessions: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "MiningSession" 
    }],
    referralCode: { 
        type: String, 
        unique: true 
    },
    referredBy: { 
        type: String,
        default: null
    },
});

module.exports = mongoose.model('User', UserSchema);
