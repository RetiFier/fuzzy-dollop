"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Github, Twitter, Globe, Zap } from "lucide-react"
import { CoinVaultLogo } from "@/components/CoinVault-logo"

export function Footer() {
  const [mounted, setMounted] = useState(false)
  const [year, setYear] = useState(new Date().getFullYear())
  useEffect(() => { setMounted(true); setYear(new Date().getFullYear()) }, [])

  const navigation = [
    { name:"Dashboard",   href:"/" },
    { name:"Markets",     href:"/markets" },
    { name:"Deposit",     href:"/deposit" },
    { name:"Stake",       href:"/stake" },
    { name:"Leaderboard", href:"/leaderboard" },
    { name:"Governance",  href:"/governance" },
  ]
  const resources = [
    { name:"Documentation", href:"#" },
    { name:"FAQ",           href:"#" },
    { name:"Audit Reports", href:"#" },
    { name:"Terms",         href:"#" },
  ]

  return (
    <footer style={{ background:"rgba(8,12,18,0.98)", borderTop:"1px solid var(--border)" }}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <CoinVaultLogo size="sm" showText textColor="text-white" />
            <p className="text-sm mt-4 leading-relaxed" style={{ color:"var(--text-2)" }}>
              Decentralized multi-chain staking infrastructure. Earn rewards through native staking, liquid staking, and restaking.
            </p>
            <div className="flex gap-3 mt-5">
              {[Github, Twitter, Globe].map((Icon, i) => (
                <a key={i} href="#" className="h-9 w-9 rounded-lg flex items-center justify-center transition-all"
                  style={{ background:"var(--surface)", border:"1px solid var(--border)", color:"var(--text-3)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor="rgba(0,255,136,0.3)"; (e.currentTarget as HTMLElement).style.color="var(--green)" }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor="var(--border)"; (e.currentTarget as HTMLElement).style.color="var(--text-3)" }}>
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color:"var(--text-3)" }}>Protocol</h3>
            <ul className="space-y-2.5">
              {navigation.map(item => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm transition-colors" style={{ color:"var(--text-2)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color="var(--green)" }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color="var(--text-2)" }}>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color:"var(--text-3)" }}>Resources</h3>
            <ul className="space-y-2.5">
              {resources.map(item => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm transition-colors" style={{ color:"var(--text-2)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color="var(--text)" }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color="var(--text-2)" }}>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color:"var(--text-3)" }}>Stay Updated</h3>
            <p className="text-sm mb-4 leading-relaxed" style={{ color:"var(--text-2)" }}>
              Protocol updates, governance alerts, and yield opportunities.
            </p>
            <div className="flex gap-2">
              <input type="email" placeholder="your@email.com"
                className="flex-1 px-3 py-2 rounded-lg text-sm outline-none mono"
                style={{ background:"var(--surface)", border:"1px solid var(--border)", color:"var(--text)" }} />
              <button className="px-3 py-2 rounded-lg transition-all"
                style={{ background:"var(--green)", color:"#080c12" }}>
                <Zap className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3"
          style={{ borderTop:"1px solid var(--border)" }}>
          <p className="text-xs mono" style={{ color:"var(--text-3)" }}>
            {mounted && <>&copy; {year} CoinVault Protocol. All rights reserved.</>}
          </p>
          <div className="flex items-center gap-4 text-xs mono" style={{ color:"var(--text-3)" }}>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />All systems operational
            </span>
            <span>Holesky Testnet</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
