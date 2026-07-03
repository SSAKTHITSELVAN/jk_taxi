import { motion } from 'framer-motion'
import { IndianRupee, Check, Info } from 'lucide-react'
import './Pricing.css'

const plans = [
  {
    icon: '🏍️ / 🛺',
    name: 'Bike & Auto',
    tagline: 'Budget rides',
    base: 23,
    baseLabel: 'Bike from',
    perKm: '₹13 – ₹21 / km',
    color: 'yellow',
    features: ['Starting from ₹23 (Bike)', 'Starting from ₹80 (Auto)', 'Best for short city rides', 'Quickest option in traffic', 'No AC, budget-friendly'],
    cta: 'Book Bike / Auto',
    popular: false,
  },
  {
    icon: '🚙',
    name: 'Sedan',
    tagline: 'Most recommended',
    base: 100,
    baseLabel: 'From',
    perKm: '₹23 / km',
    color: 'purple',
    features: ['Base fare: ₹100', '₹23 per km', 'Full AC comfort', 'City & airport rides', 'Outstation available'],
    cta: 'Book Sedan',
    popular: true,
  },
  {
    icon: '🚐',
    name: 'SUV',
    tagline: 'Group rides',
    base: 100,
    baseLabel: 'From',
    perKm: '₹26 / km',
    color: 'blue',
    features: ['SUV from ₹100', 'Up to 7 seats', 'Extra luggage space', 'Full AC comfort', 'Outstation available'],
    cta: 'Book SUV',
    popular: false,
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="section section-white">
      <div className="container">
        <motion.div
          className="pricing__header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="section-tag tag-yellow"><IndianRupee size={13} /> Pricing</span>
          <h2 className="section-title">Clear, Honest Fares</h2>
          <p className="section-sub">
            No surge pricing surprises. No hidden charges. See the exact fare before you book.
          </p>
        </motion.div>

        <div className="pricing__grid">
          {plans.map((p, i) => (
            <motion.div
              key={i}
              className={`pricing__card pricing__card--${p.color} ${p.popular ? 'pricing__card--pop' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              whileHover={{ y: -8 }}
            >
              {p.popular && (
                <div className="pricing__pop-label">Recommended</div>
              )}
              <div className="pricing__top">
                <div className="pricing__tagline">{p.tagline}</div>
                <h3 className="pricing__name">{p.name}</h3>
                <div className="pricing__amount">
                  <span className="pricing__base-label">{p.baseLabel}</span>
                  <span className="pricing__currency">₹</span>
                  <span className="pricing__val">{p.base}</span>
                </div>
                <div className="pricing__perkm">{p.perKm}</div>
              </div>
              <ul className="pricing__list">
                {p.features.map((f, j) => (
                  <li key={j}>
                    <Check size={14} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a href="#download" className={`btn btn-md pricing__btn pricing__btn--${p.color}`}>
                {p.cta}
              </a>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="pricing__note"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <Info size={15} />
          <span>Night surcharge 15% (10 PM – 6 AM) · Platform fee ₹20 · GST 5% applies to all rides · Toll & waiting charges as applicable</span>
        </motion.div>
      </div>
    </section>
  )
}
