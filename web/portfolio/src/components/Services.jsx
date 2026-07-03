import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import carImage from '../assets/car_image.jpeg'
import './Services.css'

const services = [
  {
    img: carImage,
    tag: 'Most Popular',
    tagClass: 'tag-purple',
    title: 'Car Rides',
    desc: 'AC sedans, SUVs and premium cars for city travel, airport drops, and outstation trips.',
    features: ['One Way & Round Trip', 'Airport Pickup / Drop', 'Outstation Available'],
    accent: 'purple',
    startFrom: '₹100',
  },
  {
    img: 'https://images.pexels.com/photos/20321317/pexels-photo-20321317.jpeg',
    tag: 'Best Value',
    tagClass: 'tag-yellow',
    title: 'Auto Rickshaw',
    desc: 'Quick, affordable autos for short distances within Tiruppur city. No bargaining, fixed fares.',
    features: ['Fixed Metered Fare', 'No Bargaining', 'Short City Rides'],
    accent: 'yellow',
    startFrom: '₹80',
  },
  {
    img: 'https://images.pexels.com/photos/30754807/pexels-photo-30754807.jpeg',
    tag: 'Fastest',
    tagClass: 'tag-blue',
    title: 'Bike Taxi',
    desc: 'Beat traffic with two-wheeler rides. Perfect for solo commuters who need speed.',
    features: ['2-Min Pickup', 'Beat Traffic', 'Helmet Provided'],
    accent: 'blue',
    startFrom: '₹23',
  },
  {
    img: 'https://images.pexels.com/photos/5794231/pexels-photo-5794231.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    tag: 'Instant',
    tagClass: 'tag-green',
    title: 'Ping — Instant Ride',
    desc: 'One-tap booking. We match you with the nearest available vehicle in seconds. No waiting.',
    features: ['Nearest Driver', 'Any Vehicle Type', 'Real-Time Match'],
    accent: 'green',
    startFrom: '₹23',
  },
]

export default function Services() {
  return (
    <section id="services" className="section section-white">
      <div className="container">
        <motion.div
          className="svc__header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="section-tag tag-purple"><Zap size={13} /> Our Services</span>
          <h2 className="section-title">Every Ride You Need</h2>
          <p className="section-sub">
            Cars, autos, bikes, and instant ping rides — all in one app, only in Tiruppur.
          </p>
        </motion.div>

        <div className="svc__grid">
          {services.map((s, i) => (
            <motion.div
              className="svc__card"
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -6 }}
            >
              <div className="svc__img-wrap">
                <img src={s.img} alt={s.title} className="svc__img" loading="lazy" />
                <span className={`section-tag ${s.tagClass} svc__badge`}>{s.tag}</span>
                <div className="svc__price-pill">From {s.startFrom}</div>
              </div>
              <div className="svc__body">
                <h3 className="svc__title">{s.title}</h3>
                <p className="svc__desc">{s.desc}</p>
                <ul className="svc__features">
                  {s.features.map((f, j) => (
                    <li key={j}><span className={`svc__dot svc__dot--${s.accent}`} />{f}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
