import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import './Testimonials.css'

const items = [
  {
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=70&auto=format&fit=crop&crop=face',
    name: 'Priya Murugan',
    role: 'Daily Commuter, Tiruppur',
    rating: 5,
    text: 'JK Taxi transformed my daily commute. The bike taxi option is super fast and affordable. I never worry about being late anymore!',
  },
  {
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=70&auto=format&fit=crop&crop=face',
    name: 'Rajesh Kumar',
    role: 'Business Owner, Tiruppur',
    rating: 5,
    text: 'I use the sedan service for all my client meetings. Professional drivers, spotless cars, and always on time. Worth every rupee.',
  },
  {
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=70&auto=format&fit=crop&crop=face',
    name: 'Lakshmi Devi',
    role: 'Homemaker',
    rating: 5,
    text: 'The OTP and SOS features give me so much confidence riding alone at night. My family can also track me live. Truly safe!',
  },
  {
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=80&q=70&auto=format&fit=crop&crop=face',
    name: 'Karthik Selvam',
    role: 'Engineering Student',
    rating: 5,
    text: 'Best auto booking in Tiruppur! No more haggling with auto drivers. Fixed fares, instant booking, and the Ping feature is brilliant.',
  },
]

export default function Testimonials() {
  return (
    <section id="about" className="section section-alt">
      <div className="container">
        <motion.div
          className="testi__header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="section-tag tag-yellow"><Star size={13} /> Testimonials</span>
          <h2 className="section-title">Loved by Tiruppur</h2>
          <p className="section-sub">Join thousands of happy riders who trust JK Taxi every day.</p>
        </motion.div>

        <div className="testi__grid">
          {items.map((t, i) => (
            <motion.div
              key={i}
              className="testi__card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -4 }}
            >
              <div className="testi__quote-icon"><Quote size={18} /></div>
              <div className="testi__stars">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} size={14} fill="currentColor" />
                ))}
              </div>
              <p className="testi__text">"{t.text}"</p>
              <div className="testi__author">
                <img src={t.avatar} alt={t.name} className="testi__avatar" loading="lazy" />
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Aggregate rating */}
        <motion.div
          className="testi__aggregate"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <div className="testi__agg-stars">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={24} fill="currentColor" />
            ))}
          </div>
          <div className="testi__agg-val">4.9 / 5</div>
          <p>Based on 1,200+ reviews across Tiruppur</p>
        </motion.div>
      </div>
    </section>
  )
}
