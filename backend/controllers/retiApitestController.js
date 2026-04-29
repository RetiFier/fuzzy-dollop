const { ethers } = require("ethers");
const asyncErrorHandler = require("../middlewares/helpers/asyncErrorHandler");
const ErrorHandler = require("../utils/errorHandler");


const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
];


const DEFAULT_TOKEN_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const DEFAULT_RPC_URL = "https://ethereum-rpc.publicnode.com";

exports.getTokenInfo = asyncErrorHandler(async (req, res, next) => {
  const tokenAddress = req.query.address || DEFAULT_TOKEN_ADDRESS;
  const rpcUrl = req.query.rpc || DEFAULT_RPC_URL;

  console.log("\n========== RetiApitest ==========");
  console.log(`RPC Provider : ${rpcUrl}`);
  console.log(`Token Address: ${tokenAddress}`);
  console.log("==================================\n");

  let provider;
  try {
    provider = new ethers.JsonRpcProvider(rpcUrl);
  } catch (err) {
    return next(new ErrorHandler("Invalid RPC URL", 400));
  }

  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

  let name, symbol, decimals, totalSupply;
  try {
    [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply(),
    ]);
  } catch (err) {
    console.error("Contract call failed:", err.message);
    return next(
      new ErrorHandler(
        "Failed to read contract. Check the address and RPC URL.",
        502
      )
    );
  }

  const formattedSupply = ethers.formatUnits(totalSupply, decimals);

  const result = {
    name,
    symbol,
    decimals: Number(decimals),
    totalSupply: formattedSupply,
    tokenAddress,
    network: (await provider.getNetwork()).name,
  };

  console.log("Smart Contract Data:");
  console.log(`  Name        : ${result.name}`);
  console.log(`  Symbol      : ${result.symbol}`);
  console.log(`  Decimals    : ${result.decimals}`);
  console.log(`  Total Supply: ${result.totalSupply} ${result.symbol}`);
  console.log(`  Network     : ${result.network}`);
  console.log("\n==================================\n");

  res.status(200).json({ success: true, data: result });
});

exports.getBalance = asyncErrorHandler(async (req, res, next) => {
  const { address } = req.params;
  const tokenAddress = req.query.token || DEFAULT_TOKEN_ADDRESS;
  const rpcUrl = req.query.rpc || DEFAULT_RPC_URL;

  if (!ethers.isAddress(address)) {
    return next(new ErrorHandler("Invalid wallet address", 400));
  }

  console.log("\n========== RetiApitest — Balance ==========");
  console.log(`Wallet       : ${address}`);
  console.log(`Token        : ${tokenAddress}`);
  console.log("============================================\n");

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

  let balance, decimals, symbol;
  try {
    [balance, decimals, symbol] = await Promise.all([
      contract.balanceOf(address),
      contract.decimals(),
      contract.symbol(),
    ]);
  } catch (err) {
    console.error("Balance lookup failed:", err.message);
    return next(new ErrorHandler("Failed to fetch balance", 502));
  }

  const formatted = ethers.formatUnits(balance, decimals);

  console.log(`Balance: ${formatted} ${symbol}\n`);

  res.status(200).json({
    success: true,
    data: {
      wallet: address,
      token: symbol,
      balance: formatted,
      rawBalance: balance.toString(),
    },
  });
});
