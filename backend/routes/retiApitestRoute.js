const express = require("express");
const { getTokenInfo, getBalance } = require("../controllers/retiApitestController");

const router = express.Router();

// GET /api/reti-apitest/token-info         — fetch ERC-20 token details
// GET /api/reti-apitest/balance/:address    — fetch token balance for a wallet

router.route("/token-info").get(getTokenInfo);
router.route("/balance/:address").get(getBalance);

module.exports = router;
