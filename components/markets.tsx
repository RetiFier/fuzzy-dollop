"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { TrendingUp, TrendingDown, RefreshCw, Info, Clock, BarChart2, Activity } from "lucide-react"

// ── Simulated price data generator ─────────────────────────────────────────────
type Candle = { time: number; open: number; high: number; low: number; close: number; volume: number }
type Token = {
  symbol: string; name: string; description: string
  basePrice: number; color: string; colorDim: string
  volatility: number; trend: number
}

const TOKENS: Token[] = [
  { symbol:"dETH", name:"Liquid Staking Token",    description:"Minted 1:1 when depositing ETH. Freely transferable and usable across DeFi.",
    basePrice:2480, color:"#00ff88", colorDim:"rgba(0,255,136,0.12)", volatility:0.018, trend:0.0003 },
  { symbol:"sETH", name:"Liquid Restaking Token",  description:"Minted when staking dETH. Accrues staking rewards and governance power.",
    basePrice:2520, color:"#38bdf8", colorDim:"rgba(56,189,248,0.12)", volatility:0.022, trend:0.0005 },
  { symbol:"ETH",  name:"Ethereum",                description:"Native Ethereum deposited as collateral to mint dETH at a 1:1 ratio.",
    basePrice:2495, color:"#a78bfa", colorDim:"rgba(167,139,250,0.12)", volatility:0.015, trend:0.0002 },
]

function generateHistory(base: number, vol: number, trend: number, points: number): Candle[] {
  const candles: Candle[] = []
  let price = base * (0.85 + Math.random() * 0.08)
  const now = Date.now()
  for (let i = 0; i < points; i++) {
    const t = now - (points - i) * 3600_000
    const chg = (Math.random() - 0.49) * vol + trend
    const open = price
    price = Math.max(price * (1 + chg), base * 0.5)
    const range = price * vol * 0.5
    candles.push({
      time: t, open,
      high: Math.max(open, price) + Math.random() * range,
      low:  Math.min(open, price) - Math.random() * range,
      close: price,
      volume: base * (50 + Math.random() * 200),
    })
  }
  return candles
}

function generateNewCandle(last: Candle, vol: number, trend: number): Candle {
  const chg = (Math.random() - 0.49) * vol + trend
  const open = last.close
  const close = Math.max(open * (1 + chg), last.close * 0.5)
  const range = close * vol * 0.3
  return {
    time: last.time + 3600_000,
    open, close,
    high: Math.max(open, close) + Math.random() * range,
    low:  Math.min(open, close) - Math.random() * range,
    volume: last.volume * (0.7 + Math.random() * 0.6),
  }
}

// ── Sparkline SVG ───────────────────────────────────────────────────────────────
function Sparkline({ candles, color, width=120, height=40 }: { candles:Candle[]; color:string; width?:number; height?:number }) {
  if (candles.length < 2) return null
  const prices = candles.map(c => c.close)
  const min = Math.min(...prices), max = Math.max(...prices)
  const range = max - min || 1
  const pts = prices.map((p,i) => {
    const x = (i / (prices.length-1)) * width
    const y = height - ((p - min) / range) * height
    return `${x},${y}`
  }).join(" ")
  const isUp = prices[prices.length-1] >= prices[0]
  const lineColor = isUp ? color : "#f87171"
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={`sg-${color.replace(/[^a-z0-9]/gi,"")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity="0.2" />
          <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Main chart ──────────────────────────────────────────────────────────────────
function PriceChart({ candles, token, range }: { candles:Candle[]; token:Token; range:number }) {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = canvas.current; if (!el) return
    const ctx = el.getContext("2d"); if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    const W = el.offsetWidth, H = el.offsetHeight
    el.width = W * dpr; el.height = H * dpr
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, W, H)

    const slice = candles.slice(-range)
    if (slice.length < 2) return

    const prices = slice.map(c => c.close)
    const vols   = slice.map(c => c.volume)
    const minP = Math.min(...prices) * 0.998
    const maxP = Math.max(...prices) * 1.002
    const maxV = Math.max(...vols)
    const padL=10, padR=10, padT=20, padB=40, volH=40

    const toX = (i:number) => padL + (i / (slice.length-1)) * (W - padL - padR)
    const toY = (p:number) => padT + (1 - (p-minP)/(maxP-minP)) * (H - padT - padB - volH)

    // Grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.05)"
    ctx.lineWidth = 1
    for (let g=0; g<=4; g++) {
      const y = padT + (g/4) * (H - padT - padB - volH)
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke()
      const price = maxP - (g/4) * (maxP - minP)
      ctx.fillStyle = "rgba(255,255,255,0.3)"
      ctx.font = "10px 'IBM Plex Mono'"
      ctx.fillText(`$${price.toFixed(1)}`, W - padR - 52, y - 3)
    }

    // Area fill
    const isUp = slice[slice.length-1].close >= slice[0].close
    const lineC = isUp ? token.color : "#f87171"
    const grad = ctx.createLinearGradient(0, padT, 0, H - padB - volH)
    grad.addColorStop(0, isUp ? "rgba(0,255,136,0.18)" : "rgba(248,113,113,0.15)")
    grad.addColorStop(1, "rgba(0,0,0,0)")
    ctx.beginPath()
    ctx.moveTo(toX(0), toY(slice[0].close))
    slice.forEach((c,i) => ctx.lineTo(toX(i), toY(c.close)))
    ctx.lineTo(toX(slice.length-1), H - padB - volH)
    ctx.lineTo(toX(0), H - padB - volH)
    ctx.closePath()
    ctx.fillStyle = grad; ctx.fill()

    // Price line
    ctx.beginPath()
    ctx.strokeStyle = lineC; ctx.lineWidth = 2
    ctx.lineJoin = "round"; ctx.lineCap = "round"
    slice.forEach((c,i) => { if(i===0) ctx.moveTo(toX(i),toY(c.close)); else ctx.lineTo(toX(i),toY(c.close)) })
    ctx.stroke()

    // Volume bars
    const volY = H - padB
    slice.forEach((c,i) => {
      const bW = Math.max(1, (W - padL - padR) / slice.length - 1)
      const bH = (c.volume / maxV) * volH
      const x = toX(i) - bW/2
      ctx.fillStyle = c.close >= c.open ? "rgba(0,255,136,0.2)" : "rgba(248,113,113,0.2)"
      ctx.fillRect(x, volY - bH, bW, bH)
    })

    // Current price label
    const lastY = toY(slice[slice.length-1].close)
    ctx.fillStyle = lineC
    ctx.beginPath(); ctx.roundRect(W - padR - 70, lastY - 10, 68, 20, 4); ctx.fill()
    ctx.fillStyle = "#080c12"
    ctx.font = "bold 11px 'IBM Plex Mono'"
    ctx.textAlign = "right"
    ctx.fillText(`$${slice[slice.length-1].close.toFixed(2)}`, W - padR - 4, lastY + 4)
    ctx.textAlign = "left"
  }, [candles, range, token])

  return <canvas ref={canvas} style={{ width:"100%", height:"100%" }} />
}

// ── Main component ──────────────────────────────────────────────────────────────
export function Markets() {
  const [histories, setHistories] = useState<Record<string, Candle[]>>({})
  const [selected, setSelected] = useState("dETH")
  const [chartRange, setChartRange] = useState(48)
  const [tab, setTab] = useState<"price"|"volume">("price")
  const [tick, setTick] = useState(0)

  // Init
  useEffect(() => {
    const init: Record<string, Candle[]> = {}
    TOKENS.forEach(t => { init[t.symbol] = generateHistory(t.basePrice, t.volatility, t.trend, 168) })
    setHistories(init)
  }, [])

  // Live tick every 3s
  useEffect(() => {
    const id = setInterval(() => {
      setHistories(prev => {
        const next = { ...prev }
        TOKENS.forEach(t => {
          const h = prev[t.symbol]; if (!h?.length) return
          const last = h[h.length-1]
          const now = Date.now()
          if (now - last.time > 60_000) {
            next[t.symbol] = [...h.slice(-500), generateNewCandle(last, t.volatility, t.trend)]
          } else {
            const upd = { ...last, close: last.close * (1 + (Math.random()-0.5)*0.002) }
            upd.high = Math.max(upd.high, upd.close)
            upd.low  = Math.min(upd.low,  upd.close)
            next[t.symbol] = [...h.slice(0,-1), upd]
          }
        })
        return next
      })
      setTick(t => t+1)
    }, 3000)
    return () => clearInterval(id)
  }, [])

  const ranges = [
    { label:"6H",  val:6   },
    { label:"24H", val:24  },
    { label:"48H", val:48  },
    { label:"7D",  val:168 },
  ]

  const getToken = (sym: string) => TOKENS.find(t => t.symbol === sym)!
  const getPrice = (sym: string) => {
    const h = histories[sym]; if (!h?.length) return 0
    return h[h.length-1].close
  }
  const getChange = (sym: string, hours=24) => {
    const h = histories[sym]; if (!h || h.length < 2) return 0
    const slice = h.slice(-Math.min(hours, h.length))
    return ((slice[slice.length-1].close - slice[0].close) / slice[0].close) * 100
  }
  const getVol24h = (sym: string) => {
    const h = histories[sym]; if (!h?.length) return 0
    return h.slice(-24).reduce((a,c) => a+c.volume, 0)
  }

  const selToken = getToken(selected)
  const selHistory = histories[selected] || []

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest mb-2 mono" style={{ color:"var(--green)" }}>
          Live Market Data
        </p>
        <h1 className="page-title mb-1">Token Markets</h1>
        <p className="text-sm" style={{ color:"var(--text-2)" }}>
          Simulated price feeds for dETH, sETH, and ETH — updated every 3 seconds
        </p>
      </div>

      {/* Disclaimer */}
   
      {/* Token cards row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {TOKENS.map(token => {
          const price  = getPrice(token.symbol)
          const chg24  = getChange(token.symbol, 24)
          const isUp   = chg24 >= 0
          const active = selected === token.symbol
          return (
            <button key={token.symbol} onClick={() => setSelected(token.symbol)}
              className="stat-card text-left transition-all"
              style={{
                borderColor: active ? token.color+"50" : undefined,
                boxShadow:   active ? `0 0 25px ${token.color}15` : undefined,
              }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-bold text-lg mono" style={{ color:token.color, fontFamily:"'IBM Plex Mono',monospace" }}>
                    {token.symbol}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color:"var(--text-3)" }}>{token.name}</div>
                </div>
                <Sparkline candles={selHistory.length > 0 ? (histories[token.symbol]||[]).slice(-24) : []} color={token.color} />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold mono" style={{ color:"var(--text)" }}>
                    ${price > 0 ? price.toFixed(2) : "—"}
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-semibold mt-1 mono`}
                    style={{ color: isUp ? "#00ff88" : "#f87171" }}>
                    {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {isUp ? "+" : ""}{chg24.toFixed(2)}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs" style={{ color:"var(--text-3)" }}>24h Vol</div>
                  <div className="text-sm font-semibold mono" style={{ color:"var(--text-2)" }}>
                    ${(getVol24h(token.symbol)/1000).toFixed(0)}K
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Main chart */}
      <div className="glass-card p-6 mb-6">
        {/* Chart header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl font-bold mono" style={{ color:selToken.color, fontFamily:"'IBM Plex Mono',monospace" }}>
                {selected}
              </span>
              <span className="text-sm" style={{ color:"var(--text-2)" }}>{selToken.name}</span>
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mono"
                style={{ background:"rgba(0,255,136,0.1)", color:"var(--green)", border:"1px solid rgba(0,255,136,0.2)" }}>
                <Activity className="h-3 w-3" />LIVE
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold mono" style={{ color:"var(--text)" }}>
                ${getPrice(selected).toFixed(2)}
              </span>
              {(() => {
                const c = getChange(selected, chartRange)
                const up = c >= 0
                return (
                  <span className="flex items-center gap-1 text-sm font-semibold mono"
                    style={{ color: up ? "#00ff88" : "#f87171" }}>
                    {up ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {up?"+":""}{c.toFixed(2)}%
                  </span>
                )
              })()}
            </div>
          </div>

          {/* Range buttons */}
          <div className="flex items-center gap-2">
            {ranges.map(r => (
              <button key={r.label} onClick={() => setChartRange(r.val)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold mono transition-all"
                style={{
                  background: chartRange===r.val ? selToken.color : "var(--surface)",
                  color:      chartRange===r.val ? "#080c12" : "var(--text-2)",
                  border:     `1px solid ${chartRange===r.val ? selToken.color : "var(--border)"}`,
                }}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Canvas chart */}
        <div style={{ height:320, position:"relative" }}>
          {selHistory.length > 1 ? (
            <PriceChart candles={selHistory} token={selToken} range={chartRange} />
          ) : (
            <div className="flex items-center justify-center h-full" style={{ color:"var(--text-3)" }}>
              <RefreshCw className="h-5 w-5 animate-spin mr-2" />Loading chart data...
            </div>
          )}
        </div>

        {/* Token description */}
        <div className="mt-4 pt-4" style={{ borderTop:"1px solid var(--border)" }}>
          <p className="text-sm" style={{ color:"var(--text-2)" }}>{selToken.description}</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label:"Current Price", val:`$${getPrice(selected).toFixed(2)}`,               icon:BarChart2,  color:"var(--green)" },
          { label:"24h Change",    val:`${getChange(selected,24)>=0?"+":""}${getChange(selected,24).toFixed(2)}%`, icon:TrendingUp, color: getChange(selected,24)>=0?"var(--green)":"#f87171" },
          { label:"7d Change",     val:`${getChange(selected,168)>=0?"+":""}${getChange(selected,168).toFixed(2)}%`,icon:Activity,   color: getChange(selected,168)>=0?"var(--green)":"#f87171" },
          { label:"24h Volume",    val:`$${(getVol24h(selected)/1000).toFixed(0)}K`,      icon:BarChart2,  color:"#38bdf8" },
        ].map((item,i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center gap-2 mb-3">
              <item.icon className="h-3.5 w-3.5" style={{ color:item.color }} />
              <span className="text-xs uppercase tracking-wider" style={{ color:"var(--text-3)" }}>{item.label}</span>
            </div>
            <div className="mono text-xl font-bold" style={{ color:item.color }}>{item.val}</div>
          </div>
        ))}
      </div>

      {/* All tokens table */}
      <div className="section-title">All Markets</div>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom:"1px solid var(--border)" }}>
                {["Token","Price","1H","24H","7D","Volume 24H"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color:"var(--text-3)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOKENS.map((token,i) => {
                const chg1h  = getChange(token.symbol, 1)
                const chg24  = getChange(token.symbol, 24)
                const chg7d  = getChange(token.symbol, 168)
                const active = selected === token.symbol
                return (
                  <tr key={token.symbol} onClick={() => setSelected(token.symbol)}
                    className="cursor-pointer transition-all"
                    style={{
                      borderBottom: i<TOKENS.length-1 ? "1px solid var(--border)" : undefined,
                      background: active ? token.colorDim : undefined,
                    }}
                    onMouseEnter={e => { if(!active)(e.currentTarget as HTMLElement).style.background="var(--surface)" }}
                    onMouseLeave={e => { if(!active)(e.currentTarget as HTMLElement).style.background="" }}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full flex items-center justify-center"
                          style={{ background:token.colorDim, border:`1px solid ${token.color}30` }}>
                          <span className="text-xs font-bold mono" style={{ color:token.color }}>
                            {token.symbol[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold mono text-sm" style={{ color:"var(--text)" }}>{token.symbol}</div>
                          <div className="text-xs" style={{ color:"var(--text-3)" }}>{token.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 mono font-semibold" style={{ color:"var(--text)" }}>
                      ${getPrice(token.symbol).toFixed(2)}
                    </td>
                    {[chg1h, chg24, chg7d].map((chg,j) => (
                      <td key={j} className="px-4 py-4 mono text-sm font-semibold"
                        style={{ color: chg>=0 ? "#00ff88" : "#f87171" }}>
                        {chg>=0?"+":""}{chg.toFixed(2)}%
                      </td>
                    ))}
                    <td className="px-4 py-4 mono text-sm" style={{ color:"var(--text-2)" }}>
                      ${(getVol24h(token.symbol)/1000).toFixed(0)}K
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live indicator */}
      <div className="flex items-center justify-center gap-2 mt-6 text-xs mono" style={{ color:"var(--text-3)" }}>
        <Clock className="h-3.5 w-3.5" />
        <span>Prices update every 3 seconds · Tick #{tick}</span>
      </div>
    </div>
  )
}
