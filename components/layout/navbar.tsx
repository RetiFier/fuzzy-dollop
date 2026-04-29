"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useWeb3 } from "@/components/web3-provider"
import { Menu, X, Wallet, LogOut, ChevronDown, ExternalLink, Copy, Check, RefreshCw, LineChart } from "lucide-react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CoinVaultLogo } from "@/components/CoinVault-logo"

export function Navbar() {
  const pathname = usePathname()
  const { account, connectWallet, disconnectWallet, isConnected, networkName, refreshBalances, ethBalance, dETHBalance, sETHBalance } = useWeb3()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const navigation = [
    { name: "Dashboard",   href: "/" },
    { name: "Markets",     href: "/markets" },
    { name: "Deposit",     href: "/deposit" },
    { name: "Stake",       href: "/stake" },
    { name: "Leaderboard", href: "/leaderboard" },
    { name: "Governance",  href: "/governance" },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  useEffect(() => { setMobileMenuOpen(false) }, [pathname])

  const copyAddress = () => {
    if (account) { navigator.clipboard.writeText(account); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  }
  const handleRefresh = async () => {
    setIsRefreshing(true); await refreshBalances(); setTimeout(() => setIsRefreshing(false), 1000)
  }

  const shortAddr = account ? `${account.slice(0,6)}...${account.slice(-4)}` : ""

  return (
    <>
      <nav className={`navbar fixed top-0 left-0 right-0 z-50 ${scrolled ? "scrolled" : ""}`}>
        <div className="container mx-auto px-4 py-3">
          {/* Desktop */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/"><CoinVaultLogo size="sm" textColor="text-white" /></Link>
              <div className="flex items-center gap-1">
                {navigation.map(item => (
                  <Link key={item.name} href={item.href} className={`navbar-link ${pathname === item.href ? "active" : ""}`}>
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isConnected && networkName && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium mono"
                  style={{ background:"var(--green-dim)", border:"1px solid rgba(0,255,136,0.2)", color:"var(--green)" }}>
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />{networkName}
                </div>
              )}

              {isConnected ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                      style={{ background:"var(--surface)", border:"1px solid var(--border)", color:"var(--text)" }}>
                      <span className="h-2 w-2 rounded-full bg-green-400" />
                      <span className="mono text-xs">{shortAddr}</span>
                      <ChevronDown className="h-3.5 w-3.5 opacity-40" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72"
                    style={{ background:"#0d1320", border:"1px solid var(--border)", color:"var(--text)" }}>
                    <DropdownMenuLabel className="flex items-center justify-between py-3">
                      <span className="font-semibold">Wallet</span>
                      <span className="text-xs px-2 py-0.5 rounded-full mono"
                        style={{ background:"var(--green-dim)", color:"var(--green)", border:"1px solid rgba(0,255,136,0.2)" }}>
                        Connected
                      </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator style={{ background:"var(--border)" }} />
                    <div className="px-3 py-2">
                      <div className="text-xs uppercase tracking-wider mb-2" style={{ color:"var(--text-3)" }}>Address</div>
                      <div className="flex items-center justify-between p-2 rounded-lg mono text-xs"
                        style={{ background:"rgba(0,0,0,0.3)", color:"var(--text-2)" }}>
                        {shortAddr}
                        <div className="flex gap-1">
                          <button onClick={copyAddress} className="p-1 rounded hover:bg-white/10 transition-colors">
                            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5 opacity-40" />}
                          </button>
                          <a href={`https://holesky.etherscan.io/address/${account}`} target="_blank" rel="noopener noreferrer"
                            className="p-1 rounded hover:bg-white/10 transition-colors">
                            <ExternalLink className="h-3.5 w-3.5 opacity-40" />
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="px-3 py-2 space-y-1">
                      <div className="text-xs uppercase tracking-wider mb-2" style={{ color:"var(--text-3)" }}>Balances</div>
                      {[
                        { label:"ETH",  val: parseFloat(ethBalance  ||"0").toFixed(4), color:"#38bdf8" },
                        { label:"dETH", val: parseFloat(dETHBalance ||"0").toFixed(4), color:"var(--green)" },
                        { label:"sETH", val: parseFloat(sETHBalance ||"0").toFixed(4), color:"#a78bfa" },
                      ].map(b => (
                        <div key={b.label} className="flex justify-between items-center px-2 py-1.5 rounded-lg"
                          style={{ background:"rgba(255,255,255,0.03)" }}>
                          <span className="text-xs" style={{ color:"var(--text-3)" }}>{b.label}</span>
                          <span className="mono text-sm font-semibold" style={{ color:b.color }}>{b.val}</span>
                        </div>
                      ))}
                    </div>
                    <DropdownMenuSeparator style={{ background:"var(--border)" }} />
                    <div className="px-2 py-1 flex gap-2">
                      <button onClick={handleRefresh} disabled={isRefreshing}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium"
                        style={{ background:"var(--surface)", color:"var(--text-2)" }}>
                        <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing?"animate-spin":""}`} />Refresh
                      </button>
                      <button onClick={disconnectWallet}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium"
                        style={{ background:"rgba(248,113,113,0.08)", color:"#f87171" }}>
                        <LogOut className="h-3.5 w-3.5" />Disconnect
                      </button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button onClick={connectWallet} className="connect-button flex items-center gap-2">
                  <Wallet className="h-4 w-4" />Connect Wallet
                </button>
              )}
            </div>
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center justify-between">
            <Link href="/"><CoinVaultLogo size="sm" showText textColor="text-white" /></Link>
            <div className="flex items-center gap-3">
              {isConnected ? (
                <span className="mono text-xs px-3 py-1.5 rounded-lg"
                  style={{ background:"var(--green-dim)", color:"var(--green)", border:"1px solid rgba(0,255,136,0.2)" }}>
                  {shortAddr}
                </span>
              ) : (
                <button onClick={connectWallet} className="connect-button text-sm px-4 py-2">Connect</button>
              )}
              <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-lg transition-all"
                style={{ color:"var(--text-2)" }}>
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile fullscreen */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col animate-fade-in"
          style={{ background:"rgba(8,12,18,0.98)", backdropFilter:"blur(24px)" }}>
          <div className="flex items-center justify-between p-4" style={{ borderBottom:"1px solid var(--border)" }}>
            <CoinVaultLogo size="sm" showText textColor="text-white" />
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg"
              style={{ color:"var(--text-2)" }}>
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 flex flex-col justify-center px-6 gap-2">
            {navigation.map((item, i) => (
              <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-5 py-4 rounded-xl transition-all animate-fade-in"
                style={{
                  animationDelay:`${i*50}ms`,
                  background: pathname===item.href ? "var(--green-dim)" : "var(--surface)",
                  border: `1px solid ${pathname===item.href ? "rgba(0,255,136,0.2)" : "var(--border)"}`,
                  color: pathname===item.href ? "var(--green)" : "var(--text-2)",
                  fontFamily:"'Clash Display', sans-serif",
                  fontWeight:600, fontSize:"1.125rem",
                }}>
                {item.name}
              </Link>
            ))}
          </div>
          {!isConnected && (
            <div className="p-6">
              <button onClick={() => { connectWallet(); setMobileMenuOpen(false); }}
                className="connect-button w-full py-4 flex items-center justify-center gap-2 text-base">
                <Wallet className="h-5 w-5" />Connect Wallet
              </button>
            </div>
          )}
        </div>
      )}
      <div className="h-14" />
    </>
  )
}
