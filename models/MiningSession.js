const mongoose = require("mongoose");

const MiningSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  minerType: String, // Type of the miner (e.g., "Free Mining" or "Ad Mining")
  startedAt: Date,
  endedAt: Date,
  status: { type: String, enum: ["active", "completed"], default: "active" }, // active or completed
  adsWatched: { type: Number, default: 0 }, // Track ads watched for ad mining sessions
  expiresAt: { type: Date, required: true, index: { expires: 0 } }
});

const MiningSession = mongoose.model("MiningSession", MiningSessionSchema);

module.exports = MiningSession;
