import { motion } from 'framer-motion'
import { Users, IndianRupee, Star } from 'lucide-react'
import './Fleet.css'

const vehicles = [
  {
    img: 'https://images.pexels.com/photos/14261311/pexels-photo-14261311.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    name: 'Mini',
    type: 'Hatchback',
    seats: 4,
    base: 80,
    perKm: 14,
    examples: 'WagonR · Alto · Tiago',
    popular: false,
    accentClass: 'fleet__accent--green',
  },
  {
    img: 'https://images.pexels.com/photos/14261311/pexels-photo-14261311.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    name: 'Sedan',
    type: 'Sedan',
    seats: 4,
    base: 120,
    perKm: 16,
    examples: 'Dzire · Etios · Aura',
    popular: true,
    accentClass: 'fleet__accent--purple',
  },
  {
    img: 'https://images.pexels.com/photos/14261311/pexels-photo-14261311.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    name: 'SUV',
    type: 'SUV / MUV',
    seats: 7,
    base: 180,
    perKm: 22,
    examples: 'Ertiga · Innova · Marazzo',
    popular: false,
    accentClass: 'fleet__accent--blue',
  },
  {
    img: 'https://images.pexels.com/photos/14261311/pexels-photo-14261311.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    name: 'Premium',
    type: 'Luxury',
    seats: 4,
    base: 250,
    perKm: 28,
    examples: 'Innova Crysta · BYD e6',
    popular: false,
    accentClass: 'fleet__accent--yellow',
  },
  {
    img: 'https://images.pexels.com/photos/13082172/pexels-photo-13082172.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    name: 'Auto',
    type: 'Auto Rickshaw',
    seats: 3,
    base: 30,
    perKm: 10,
    examples: 'Bajaj RE · Piaggio Ape',
    popular: false,
    accentClass: 'fleet__accent--yellow',
  },
  {
    img: 'https://images.pexels.com/photos/36875809/pexels-photo-36875809.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    name: 'Bike',
    type: 'Two-Wheeler',
    seats: 1,
    base: 20,
    perKm: 7,
    examples: 'Pulsar · Apache · Activa',
    popular: false,
    accentClass: 'fleet__accent--blue',
  },
]

export default function Fleet() {
  return (
    <section id="fleet" className="section section-alt">
      <div className="container">
        <motion.div
          className="fleet__header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="section-tag tag-blue"><Star size={13} /> Our Fleet</span>
          <h2 className="section-title">Choose Your Perfect Ride</h2>
          <p className="section-sub">
            Six vehicle types to match every need and budget in Tiruppur.
          </p>
        </motion.div>

        <div className="fleet__grid">
          {vehicles.map((v, i) => (
            <motion.div
              key={i}
              className={`fleet__card ${v.popular ? 'fleet__card--pop' : ''}`}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              whileHover={{ y: -5 }}
            >
              {v.popular && (
                <div className="fleet__popular-ribbon">Most Popular</div>
              )}
              <div className="fleet__img-wrap">
                <img src={v.img} alt={v.name} loading="lazy" />
              </div>
              <div className={`fleet__color-bar ${v.accentClass}`} />
              <div className="fleet__info">
                <div className="fleet__name-row">
                  <div>
                    <h3 className="fleet__name">{v.name}</h3>
                    <span className="fleet__type">{v.type}</span>
                  </div>
                  <div className="fleet__seats">
                    <Users size={13} /> {v.seats}
                  </div>
                </div>
                <div className="fleet__pricing">
                  <div className="fleet__price-item">
                    <IndianRupee size={13} />
                    <span className="fleet__price-val">{v.base}</span>
                    <span className="fleet__price-lbl">base</span>
                  </div>
                  <span className="fleet__price-sep">+</span>
                  <div className="fleet__price-item">
                    <IndianRupee size={13} />
                    <span className="fleet__price-val">{v.perKm}</span>
                    <span className="fleet__price-lbl">/km</span>
                  </div>
                </div>
                <p className="fleet__examples">{v.examples}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
