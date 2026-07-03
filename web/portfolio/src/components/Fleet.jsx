import { motion } from 'framer-motion'
import { Users, IndianRupee, Star } from 'lucide-react'
import miniCar from '../assets/mini_car.jpeg'
import carImage from '../assets/car_image.jpeg'
import suvErtica from '../assets/suv_ertica.png'
import './Fleet.css'

const vehicles = [
  {
    img: miniCar,
    name: 'Mini',
    type: 'Hatchback',
    seats: 4,
    base: 100,
    perKm: 20,
    examples: 'WagonR · Alto · Tiago',
    popular: false,
    accentClass: 'fleet__accent--green',
  },
  {
    img: carImage,
    name: 'Sedan',
    type: 'Sedan',
    seats: 4,
    base: 100,
    perKm: 20,
    examples: 'Dzire · Etios · Aura',
    popular: true,
    accentClass: 'fleet__accent--purple',
  },
  {
    img: suvErtica,
    name: 'SUV',
    type: 'SUV / MUV',
    seats: 7,
    base: 150,
    perKm: 25,
    examples: 'Ertiga · Innova · Marazzo',
    popular: false,
    accentClass: 'fleet__accent--blue',
  },
  {
    img: 'https://images.pexels.com/photos/20321317/pexels-photo-20321317.jpeg',
    name: 'Auto',
    type: 'Auto Rickshaw',
    seats: 3,
    base: 80,
    perKm: 21,
    examples: 'Bajaj RE · Piaggio Ape',
    popular: false,
    accentClass: 'fleet__accent--yellow',
  },
  {
    img: 'https://images.pexels.com/photos/30754807/pexels-photo-30754807.jpeg',
    name: 'Bike',
    type: 'Two-Wheeler',
    seats: 1,
    base: 23,
    perKm: 13,
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
            Five vehicle types to match every need and budget in Tiruppur.
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
