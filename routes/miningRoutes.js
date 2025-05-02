const express = require('express');
const router = express.Router();
const { startMining, miningSession, withdraw, adMining, watchAd, freeMining, BTCMinedUpdate, BTCBalance } = require('../controllers/miningController');

router.post('/start-mining', startMining);
router.get('/mining-sessions/:userId', miningSession);
router.post('/withdraw', withdraw);
router.post('/ad-mining', adMining);
router.post('/free-mining', freeMining);
router.post('/watch-ad', watchAd);
router.post('/btc-mined-update', BTCMinedUpdate);
router.get('/btc-balance', BTCBalance);

module.exports = router;
