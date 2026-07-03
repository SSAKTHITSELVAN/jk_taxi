import { useState } from 'react'
import { motion } from 'framer-motion'
import { Car, Bus, Bike, Zap, MapPin, ArrowRight, Phone, ChevronDown } from 'lucide-react'
import './Hero.css'
import heroVideo from '../assets/hero_section_background.mp4'

const VEHS = [
  { id:'car',  Icon:Car,  label:'Car',   sub:'Mini · Sedan · SUV',  price:'From ₹100' },
  { id:'auto', Icon:Bus,  label:'Auto',  sub:'Auto Rickshaw',        price:'From ₹80'  },
  { id:'bike', Icon:Bike, label:'Bike',  sub:'Two-Wheeler Taxi',     price:'From ₹23'  },
  { id:'ping', Icon:Zap,  label:'Ping',  sub:'Nearest Available',    price:'Instant'   },
]

const STATS = [
  { val:'1000+', lbl:'Rides'  },
  { val:'200+',  lbl:'Riders' },
  { val:'24/7',  lbl:'Available' },
]

export default function Hero() {
  const [tab, setTab] = useState('car')

  return (
    <section className="hr">

      {/* ─── Full-screen background video ─── */}
      <div className="hr-bg" aria-hidden="true">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="hr-bg-video"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        {/* Purple gradient overlay — the key visual */}
        <div className="hr-bg-overlay">
          {/* Animated floating shapes */}
          <div className="hr-shape hr-shape-1" />
          <div className="hr-shape hr-shape-2" />
          <div className="hr-shape hr-shape-3" />
          <div className="hr-shape hr-shape-4" />
          <div className="hr-shape hr-shape-5" />
        </div>
      </div>

      {/* ─── Content wrapper (centres everything) ─── */}
      <div className="hr-body">

        {/* Label above headline */}
        <motion.p className="hr-label"
          initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.4 }}
        >
          <span className="hr-label-dot" />
          Your Trusted Ride Service
        </motion.p>

        {/* Main headline */}
        <motion.h1 className="hr-headline"
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.5, delay:0.08 }}
        >
          Ride Smarter<br />
          <span className="hr-headline-yellow">JK Taxi</span>
        </motion.h1>

        <motion.p className="hr-subtext"
          initial={{ opacity:0 }} animate={{ opacity:1 }}
          transition={{ duration:0.5, delay:0.18 }}
        >
          Book cars, autos and bike taxis in seconds. Professional drivers, upfront fares, available day and night.
        </motion.p>

        {/* ─── White Booking Card ─── */}
        <motion.div className="hr-card"
          initial={{ opacity:0, y:28 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.6, delay:0.22 }}
        >

          {/* Vehicle type tabs */}
          <div className="hr-tabs">
            {VEHS.map(({ id, Icon, label, sub, price }) => (
              <button
                key={id}
                className={`hr-tab${tab === id ? ' hr-tab-active' : ''}`}
                onClick={() => setTab(id)}
              >
                <Icon size={22} strokeWidth={1.8} className="hr-tab-icon" />
                <span className="hr-tab-label">{label}</span>
                <span className="hr-tab-sub">{sub}</span>
                <span className="hr-tab-price">{price}</span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="hr-card-divider" />

          {/* Route row */}
          <div className="hr-route">
            <div className="hr-route-field">
              <span className="hr-dot hr-dot-green" />
              <div className="hr-route-info">
                <label>Pickup Location</label>
                <span>Your current location, Tiruppur</span>
              </div>
            </div>

            <div className="hr-route-mid">
              <div className="hr-route-vline" />
              <button className="hr-swap" title="Swap">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M5 2L2 5l3 3V6h7V4H5V2ZM11 14l3-3-3-3v2H4v2h7v2Z" fill="currentColor"/>
                </svg>
              </button>
              <div className="hr-route-vline" />
            </div>

            <div className="hr-route-field">
              <span className="hr-dot hr-dot-purple" />
              <div className="hr-route-info">
                <label>Drop-off Location</label>
                <span className="hr-placeholder">Where are you going?</span>
              </div>
            </div>

            <a href="#download" className="hr-search-btn">
              <ArrowRight size={20} strokeWidth={2.5} />
              <span className="hr-search-btn-txt">Find a Ride</span>
            </a>
          </div>

        </motion.div>

        {/* CTA links below card */}
        <motion.div className="hr-ctas"
          initial={{ opacity:0 }} animate={{ opacity:1 }}
          transition={{ delay:0.4, duration:0.4 }}
        >
          <a href="#download" className="hr-cta-main">
            Download App &amp; Book Now
            <ArrowRight size={16} strokeWidth={2.5} />
          </a>
          <a href="tel:+9104214433435" className="hr-cta-call">
            <Phone size={15} strokeWidth={2.5} />
            Call 0421 4433435
          </a>
        </motion.div>

        {/* Stats row */}
        <motion.div className="hr-stats"
          initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:0.5, duration:0.5 }}
        >
          {STATS.map((s, i) => (
            <div className="hr-stat" key={i}>
              <strong>{s.val}</strong>
              <span>{s.lbl}</span>
            </div>
          ))}
        </motion.div>

      </div>

      {/* Scroll cue */}
      <motion.a href="#services" className="hr-scroll"
        animate={{ y:[0,7,0] }} transition={{ duration:1.8, repeat:Infinity }}
        aria-label="Scroll down"
      >
        <ChevronDown size={22} />
      </motion.a>

    </section>
  )
}
