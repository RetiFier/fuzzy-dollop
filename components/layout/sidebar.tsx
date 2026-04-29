"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useWeb3 } from "@/components/web3-provider"
import { LayoutDashboard, ArrowDownToLine, ArrowUpFromLine, Trophy, Vote, LogOut, LineChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CoinVaultLogo } from "@/components/CoinVault-logo"

export function Sidebar() {
  const pathname = usePathname()
  const { account, isConnected, disconnectWallet } = useWeb3()

  const navigation = [
    { name:"Dashboard",       href:"/",          icon:LayoutDashboard },
    { name:"Markets",         href:"/markets",   icon:LineChart },
    { name:"Deposit/Withdraw",href:"/deposit",   icon:ArrowDownToLine },
    { name:"Stake/Unstake",   href:"/stake",     icon:ArrowUpFromLine },
    { name:"Leaderboard",     href:"/leaderboard",icon:Trophy },
    { name:"Governance",      href:"/governance",icon:Vote },
  ]

  return (
    <div className="sidebar">
      <div className="p-6">
        <Link href="/"><CoinVaultLogo /></Link>
      </div>
      <nav className="mt-4">
        {navigation.map(item => (
          <Link key={item.name} href={item.href}
            className={`sidebar-item ${pathname === item.href ? "active" : ""}`}>
            <item.icon className="h-4.5 w-4.5" />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
      {isConnected && account && (
        <div className="absolute bottom-0 left-0 w-full p-4" style={{ borderTop:"1px solid var(--border)" }}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg mono text-xs"
            style={{ background:"var(--surface)", color:"var(--text-2)" }}>
            <span className="h-2 w-2 rounded-full bg-green-400 flex-shrink-0" />
            <span className="truncate">{`${account.slice(0,6)}...${account.slice(-4)}`}</span>
          </div>
          <Button variant="ghost" className="w-full mt-2 text-sm" style={{ color:"var(--text-2)" }}
            onClick={disconnectWallet}>
            <LogOut className="mr-2 h-4 w-4" />Disconnect
          </Button>
        </div>
      )}
    </div>
  )
}
