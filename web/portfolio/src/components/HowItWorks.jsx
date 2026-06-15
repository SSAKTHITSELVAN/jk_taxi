import { motion } from 'framer-motion'
import { Smartphone, MapPin, Car, CreditCard } from 'lucide-react'
import './HowItWorks.css'

const steps = [
  {
    icon: <Smartphone size={26} />,
    num: '1',
    title: 'Download the App',
    desc: 'Install JK Taxi on Android or iOS. Sign up with your phone number and verify with OTP in seconds.',
    color: '#8B5CF6',
  },
  {
    icon: <MapPin size={26} />,
    num: '2',
    title: 'Set Your Location',
    desc: 'Enter pickup and drop-off. Choose from Car, Auto, or Bike. See fare before you confirm.',
    color: '#2196F3',
  },
  {
    icon: <Car size={26} />,
    num: '3',
    title: 'Driver On The Way',
    desc: 'We match you with the nearest driver. Track them live. Share your OTP to start the ride.',
    color: '#F59E0B',
  },
  {
    icon: <CreditCard size={26} />,
    num: '4',
    title: 'Arrive & Pay',
    desc: 'Reach your destination safely. Pay by Cash, UPI, or Card. Rate your driver in seconds.',
    color: '#10B981',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section section-purple">
      <div className="container">
        <motion.div
          className="hiw__header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="section-tag tag-purple">How It Works</span>
          <h2 className="section-title">Book a Ride in 4 Steps</h2>
          <p className="section-sub">Getting a ride has never been easier. From app open to arrival in minutes.</p>
        </motion.div>

        <div className="hiw__grid">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              className="hiw__card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
            >
              {/* connector line (desktop) */}
              {i < steps.length - 1 && (
                <div className="hiw__connector" aria-hidden />
              )}

              <div className="hiw__num" style={{ background: s.color }}>{s.num}</div>
              <div className="hiw__icon" style={{ color: s.color, background: `${s.color}14` }}>
                {s.icon}
              </div>
              <h3 className="hiw__title">{s.title}</h3>
              <p className="hiw__desc">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Banner */}
        <motion.div
          className="hiw__banner"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <img
            src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=900&q=75&auto=format&fit=crop"
            alt="Driver with passenger"
            className="hiw__banner-img"
            loading="lazy"
          />
          <div className="hiw__banner-overlay" />
          <div className="hiw__banner-content">
            <h3>Serving all of Tiruppur</h3>
            <p>Kumaran Road · Avinashi Road · Palladam Road · RS Puram · and everywhere in between</p>
            <a href="#download" className="btn btn-white btn-md">Book Now</a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
