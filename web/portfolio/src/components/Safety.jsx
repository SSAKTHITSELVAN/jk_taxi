import { motion } from 'framer-motion'
import { Shield, Phone, Lock, MapPin, UserCheck, AlertCircle } from 'lucide-react'
import './Safety.css'

const features = [
  { icon: <Lock size={22} />,       title: 'Ride OTP Verification',     desc: '4-digit OTP per ride. Driver must verify before starting. Prevents unauthorised trips.' },
  { icon: <Phone size={22} />,      title: 'Emergency SOS Button',      desc: 'One tap during any active ride. Instantly alerts your emergency contact and local authorities.' },
  { icon: <UserCheck size={22} />,  title: 'Background-Verified Drivers', desc: 'Every driver is police-verified, licensed, and trained before joining JK Taxi.' },
  { icon: <MapPin size={22} />,     title: 'Live Ride Sharing',         desc: 'Share your live trip location with family. They see your ride in real time until you arrive.' },
  { icon: <AlertCircle size={22} />, title: 'Trip Insurance',            desc: 'Every ride is insured from pickup to drop. You are covered, always.' },
  { icon: <Shield size={22} />,     title: '24 / 7 Customer Support',   desc: 'Call or chat any time of the day. Our support team responds within minutes.' },
]

export default function Safety() {
  return (
    <section id="safety" className="section section-blue">
      <div className="container">
        <div className="safety__layout">
          {/* Left – image */}
          <motion.div
            className="safety__image-col"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="safety__img-wrap">
              <img
                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=700&q=75&auto=format&fit=crop"
                alt="Safe ride"
                loading="lazy"
              />
              <div className="safety__img-badge">
                <Shield size={20} />
                <div>
                  <strong>100% Verified</strong>
                  <span>Drivers</span>
                </div>
              </div>
              <div className="safety__img-stat">
                <strong>0</strong>
                <span>Safety Incidents in 2025</span>
              </div>
            </div>
          </motion.div>

          {/* Right – content */}
          <div className="safety__content-col">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="section-tag tag-green"><Shield size={13} /> Safety First</span>
              <h2 className="section-title">Your Safety Is<br />Our Priority</h2>
              <p className="section-sub" style={{ marginBottom: '32px' }}>
                Multiple layers of protection so every ride in Tiruppur is safe, reliable, and worry-free.
              </p>
            </motion.div>

            <div className="safety__grid">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  className="safety__item"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                >
                  <div className="safety__icon">{f.icon}</div>
                  <div>
                    <h4 className="safety__item-title">{f.title}</h4>
                    <p className="safety__item-desc">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
