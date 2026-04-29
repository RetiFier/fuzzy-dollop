"use client"

import { useEffect, useState } from "react"
import { useWeb3 } from "@/components/web3-provider"
import { ethers } from "ethers"
import { Wallet, Layers, Users, BarChart3, ArrowDownToLine, ArrowUpFromLine, RefreshCw, TrendingUp, Zap, Shield, LineChart } from "lucide-react"
import Link from "next/link"

export function StakingDashboard() {
  const { stakingDashboardContract, isConnected, account, refreshBalances, ethBalance, dETHBalance, sETHBalance } = useWeb3()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [overview, setOverview] = useState({ totalETHDeposited:"0", totalETHStaked:"0", totalStakers:"0", averageStakeAmount:"0" })
  const [userStats, setUserStats] = useState({ stakedAmount:"0", stakingTimestamp:"0", rank:"0", percentageOfTotal:"0" })

  const fetchData = async () => {
    if (stakingDashboardContract) {
      try {
        setLoading(true)
        let overviewData
        try {
          overviewData = await stakingDashboardContract.getStakingOverview()
        } catch (err) {
          console.error("getStakingOverview reverted:", err)
          try {
            const data = stakingDashboardContract.interface.encodeFunctionData("getStakingOverview", [])
            const p = stakingDashboardContract.provider ?? stakingDashboardContract.signer?.provider
            if (p?.call) await p.call({ to: (stakingDashboardContract as any).target ?? (stakingDashboardContract as any).address, data })
          } catch (e) { console.error("diagnostic failed:", e) }
          throw err
        }
        setOverview({
          totalETHDeposited: ethers.formatEther(overviewData.totalETHDeposited),
          totalETHStaked:    ethers.formatEther(overviewData.totalETHStaked),
          totalStakers:      overviewData.totalStakers.toString(),
          averageStakeAmount:ethers.formatEther(overviewData.averageStakeAmount),
        })
        if (account) {
          const ud = await stakingDashboardContract.getStakerDetails(account)
          setUserStats({
            stakedAmount:      ethers.formatEther(ud.stakedAmount),
            stakingTimestamp:  new Date(Number(ud.stakingTimestamp)*1000).toLocaleDateString(),
            rank:              ud.rank.toString(),
            percentageOfTotal: (Number(ud.percentageOfTotal)/100).toFixed(2),
          })
        }
      } catch (e) { console.error("Error fetching staking data:", e) }
      finally { setLoading(false) }
    }
  }

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { if (mounted) fetchData() }, [stakingDashboardContract, account, isConnected, mounted])

  const handleRefresh = async () => {
    setIsRefreshing(true); await refreshBalances(); await fetchData()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  if (!mounted) return null

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2 mono" style={{ color:"var(--green)" }}>
            Protocol Overview
          </p>
          <h1 className="page-title mb-1">Dashboard</h1>
          <p className="text-sm" style={{ color:"var(--text-2)" }}>Multi-chain staking infrastructure</p>
        </div>
        <button onClick={handleRefresh} disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ background:"var(--surface)", border:"1px solid var(--border)", color:"var(--text-2)" }}>
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing?"animate-spin":""}`} />Refresh
        </button>
      </div>

      {/* Protocol stats hero */}
      <div className="relative rounded-2xl p-6 mb-6 overflow-hidden"
        style={{ background:"linear-gradient(135deg,rgba(0,255,136,0.05) 0%,rgba(56,189,248,0.06) 100%)", border:"1px solid rgba(0,255,136,0.1)" }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background:"radial-gradient(circle,rgba(0,255,136,0.05) 0%,transparent 70%)", transform:"translate(30%,-30%)" }} />
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label:"Total Deposited", val:parseFloat(overview.totalETHDeposited).toFixed(2), unit:"ETH", icon:ArrowDownToLine, color:"var(--green)" },
            { label:"Total Staked",    val:parseFloat(overview.totalETHStaked).toFixed(2),    unit:"ETH", icon:Layers,           color:"#38bdf8" },
            { label:"Total Stakers",   val:overview.totalStakers,                             unit:"users",icon:Users,           color:"#a78bfa" },
            { label:"Avg Stake",       val:parseFloat(overview.averageStakeAmount).toFixed(4),unit:"ETH", icon:TrendingUp,       color:"#fbbf24" },
          ].map((item,i) => (
            <div key={i} className="animate-fade-up" style={{ animationDelay:`${i*60}ms` }}>
              <div className="flex items-center gap-2 mb-2">
                <item.icon className="h-3.5 w-3.5" style={{ color:item.color }} />
                <span className="text-xs" style={{ color:"var(--text-3)" }}>{item.label}</span>
              </div>
              <div className="mono text-xl font-bold" style={{ color:item.color }}>{item.val}</div>
              <div className="text-xs mt-0.5" style={{ color:"var(--text-3)" }}>{item.unit}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Balances */}
      <div className="section-title">Your Balances</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 stagger">
        {[
          { label:"ETH Balance",  sub:"Native",              val:parseFloat(ethBalance  ||"0").toFixed(4), unit:"ETH",  icon:Wallet, color:"#38bdf8" },
          { label:"Available",    sub:"Liquid Staking Token", val:parseFloat(dETHBalance||"0").toFixed(4), unit:"dETH", icon:Shield, color:"var(--green)" },
          { label:"Staked",       sub:"Earning rewards",      val:parseFloat(sETHBalance||"0").toFixed(4), unit:"sETH", icon:Zap,    color:"#a78bfa" },
        ].map((item,i) => (
          <div key={i} className="stat-card animate-fade-up" style={{ animationDelay:`${i*80}ms` }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color:"var(--text-3)" }}>{item.label}</div>
                <div className="text-xs" style={{ color:"var(--text-3)" }}>{item.sub}</div>
              </div>
              <div className="h-9 w-9 rounded-xl flex items-center justify-center"
                style={{ background:`${item.color}18`, border:`1px solid ${item.color}28` }}>
                <item.icon className="h-4 w-4" style={{ color:item.color }} />
              </div>
            </div>
            <div className="mono text-3xl font-bold tracking-tight" style={{ color:item.color }}>{item.val}</div>
            <div className="text-sm font-semibold mt-1" style={{ color:"var(--text-3)" }}>{item.unit}</div>
          </div>
        ))}
      </div>

      {/* User position */}
      {isConnected && parseFloat(userStats.stakedAmount) > 0 && (
        <div className="mb-8">
          <div className="section-title">Your Position</div>
          <div className="glass-card p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label:"Staked",     val:parseFloat(userStats.stakedAmount).toFixed(4)+" ETH" },
                { label:"Rank",       val:`#${userStats.rank}` },
                { label:"Pool Share", val:`${userStats.percentageOfTotal}%` },
                { label:"Since",      val:userStats.stakingTimestamp },
              ].map((item,i) => (
                <div key={i}>
                  <div className="text-xs uppercase tracking-wider mb-1.5" style={{ color:"var(--text-3)" }}>{item.label}</div>
                  <div className="mono text-lg font-bold" style={{ color:"var(--text)" }}>{item.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="section-title">Quick Actions</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label:"Deposit",  href:"/deposit",            icon:ArrowDownToLine, sub:"ETH → dETH" },
          { label:"Withdraw", href:"/deposit?tab=withdraw",icon:ArrowUpFromLine, sub:"dETH → ETH" },
          { label:"Stake",    href:"/stake",              icon:Layers,          sub:"dETH → sETH" },
          { label:"Unstake",  href:"/stake?tab=unstake",  icon:ArrowUpFromLine, sub:"sETH → dETH" },
        ].map((item,i) => (
          <Link key={i} href={item.href} className="action-button flex-col gap-2 py-5">
            <item.icon className="h-5 w-5" />
            <div className="text-center">
              <div className="font-semibold text-sm">{item.label}</div>
              <div className="text-xs mt-0.5 mono" style={{ color:"var(--text-3)" }}>{item.sub}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Markets CTA */}
      <div className="section-title">Market Data</div>
      <Link href="/markets" className="block glass-card p-5 group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center"
              style={{ background:"var(--green-dim)", border:"1px solid rgba(0,255,136,0.2)" }}>
              <LineChart className="h-5 w-5" style={{ color:"var(--green)" }} />
            </div>
            <div>
              <div className="font-semibold" style={{ fontFamily:"'Clash Display',sans-serif", color:"var(--text)" }}>
                Token Price Charts
              </div>
              <div className="text-sm mt-0.5" style={{ color:"var(--text-2)" }}>
                Track dETH &amp; sETH performance, volume, and yield metrics
              </div>
            </div>
          </div>
          <ArrowUpFromLine className="h-4 w-4 rotate-90 transition-transform group-hover:translate-x-1" style={{ color:"var(--green)" }} />
        </div>
      </Link>
    </div>
  )
}
