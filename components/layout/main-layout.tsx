"use client"

import type React from "react"
import { useWeb3 } from "@/components/web3-provider"
import { Wallet, Shield, Zap, TrendingUp } from "lucide-react"
import { useState, useEffect } from "react"
import { CoinVaultLogo } from "@/components/CoinVault-logo"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { connectWallet, isConnected } = useWeb3()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  return (
    <div className="min-h-screen">
      {!isConnected ? (
        <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 relative">
          {/* Ambient glows */}
          <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full pointer-events-none"
            style={{ background:"radial-gradient(circle,rgba(0,255,136,0.05) 0%,transparent 70%)", filter:"blur(40px)" }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
            style={{ background:"radial-gradient(circle,rgba(56,189,248,0.06) 0%,transparent 70%)", filter:"blur(40px)" }} />

          <div className="relative text-center max-w-lg">
            <div className="flex justify-center mb-8">
              <div className="p-6 rounded-2xl animate-float"
                style={{ background:"var(--green-dim)", border:"1px solid rgba(0,255,136,0.15)" }}>
                <CoinVaultLogo size="lg" />
              </div>
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4 mono" style={{ color:"var(--green)" }}>
              Multi-Chain Staking Infrastructure
            </p>
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily:"'Clash Display',sans-serif", color:"var(--text)", letterSpacing:"-0.02em" }}>
              Connect your wallet to start staking
            </h2>
            <p className="text-base mb-8 leading-relaxed" style={{ color:"var(--text-2)" }}>
              Native staking, liquid staking, and restaking across multiple chains. Earn rewards, mint LSTs and LRTs, and participate in governance.
            </p>
            <button onClick={connectWallet}
              className="connect-button inline-flex items-center gap-2 px-8 py-4 text-base mb-10">
              <Wallet className="h-5 w-5" />Connect Wallet
            </button>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { icon:Shield,     label:"Native Staking",    color:"var(--green)" },
                { icon:Zap,        label:"Liquid Restaking",  color:"#38bdf8" },
                { icon:TrendingUp, label:"Optimized Yield",   color:"#a78bfa" },
              ].map(({ icon:Icon, label, color }) => (
                <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                  style={{ background:"var(--surface)", border:"1px solid var(--border)", color:"var(--text-2)" }}>
                  <Icon className="h-3.5 w-3.5" style={{ color }} />{label}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="page-container">{children}</div>
      )}
    </div>
  )
}
