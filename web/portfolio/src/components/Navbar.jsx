import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Phone, ArrowRight } from 'lucide-react'
import './Navbar.css'
import logoImg from '../assets/jk_taxi_logo_v2_c_1_us_4800_rbg.png'

const LINKS = [
  { label: 'Services',     href: '#services'     },
  { label: 'Fleet',        href: '#fleet'        },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing',      href: '#pricing'      },
  { label: 'Safety',       href: '#safety'       },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <header className="nb">
        <div className="nb-inner">

          <a href="#" className="nb-logo" onClick={close}>
            <img src={logoImg} alt="JK Taxi" className="nb-logo-img" />
          </a>

          <nav className="nb-links">
            {LINKS.map(l => (
              <a key={l.href} href={l.href} className="nb-lnk">{l.label}</a>
            ))}
          </nav>

          <div className="nb-right">
            <a href="tel:+9104214433435" className="nb-tel">
              <Phone size={14} strokeWidth={2.5} />
              0421 4433435
            </a>
            <a href="#download" className="nb-book">Book a Ride</a>
          </div>

          <button className="nb-ham" onClick={() => setOpen(v => !v)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div className="nb-mask"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }} onClick={close}
            />
            <motion.aside className="nb-drawer"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25, ease: [0.4,0,0.2,1] }}
            >
              <div className="nb-drawer-hd">
                <a href="#" className="nb-logo" onClick={close}>
                  <img src={logoImg} alt="JK Taxi" className="nb-logo-img" />
                </a>
                <button className="nb-drawer-close" onClick={close}><X size={18}/></button>
              </div>
              <nav className="nb-drawer-nav">
                {LINKS.map((l, i) => (
                  <motion.a key={l.href} href={l.href} className="nb-drawer-lnk" onClick={close}
                    initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }}
                    transition={{ delay: 0.05 + i * 0.05 }}
                  >
                    {l.label}
                    <ArrowRight size={14} className="nb-arr" />
                  </motion.a>
                ))}
              </nav>
              <div className="nb-drawer-ft">
                <a href="tel:+9104214433435" className="nb-drawer-call">
                  <Phone size={16}/> 0421 4433435
                </a>
                <a href="#download" className="nb-drawer-book" onClick={close}>
                  Book a Ride
                </a>
                <p className="nb-drawer-note">Available 24/7 across Tiruppur</p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
