import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <div className="footer__logo">
              <span className="footer__logo-mark">JK</span>
              <span className="footer__logo-text">Taxi</span>
            </div>
            <p className="footer__tagline">
              Tiruppur's trusted ride-booking platform. Safe, affordable, and always on time.
            </p>
            <div className="footer__location">
              <MapPin size={14} />
              Tiruppur, Tamil Nadu — India
            </div>
          </div>

          {/* Links */}
          <div className="footer__links">
            <h4>Quick Links</h4>
            <a href="#services">Services</a>
            <a href="#fleet">Our Fleet</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#pricing">Pricing</a>
            <a href="#safety">Safety</a>
            <a href="#download">Download App</a>
          </div>

          <div className="footer__links">
            <h4>Vehicles</h4>
            <a href="#fleet">Mini (Hatchback)</a>
            <a href="#fleet">Sedan</a>
            <a href="#fleet">SUV / MUV</a>
            <a href="#fleet">Premium</a>
            <a href="#fleet">Auto Rickshaw</a>
            <a href="#fleet">Bike Taxi</a>
          </div>

          {/* Contact */}
          <div className="footer__contact">
            <h4>Contact Us</h4>
            <a href="tel:+919876543210" className="footer__contact-item">
              <Phone size={14} />
              +91 98765 43210
            </a>
            <a href="mailto:support@jktaxi.in" className="footer__contact-item">
              <Mail size={14} />
              support@jktaxi.in
            </a>
            <div className="footer__contact-item">
              <Clock size={14} />
              Available 24 / 7
            </div>
            <div className="footer__contact-item">
              <MapPin size={14} />
              Tiruppur, TN 641601
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p>&copy; 2026 JK Taxi · All rights reserved · Made in Tiruppur</p>
          <div className="footer__bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cancellation Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
