import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Phone, Mail, Clock, Globe, Share2, Compass } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-espresso text-ivory/80 pt-16 pb-12 border-t border-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-ivory/10">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center text-gold border border-gold/40">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-serif text-2xl tracking-[0.2em] font-semibold text-ivory">
                AURELIA
              </span>
            </div>
            <p className="text-xs text-taupe leading-relaxed">
              An atelier dedicated to the art of bespoke hairdressing, clinical aesthetic therapies, and meditative salon rituals.
            </p>
            <div className="flex items-center space-x-3 pt-2 text-gold">
              <a href="#instagram" className="w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center hover:bg-gold hover:text-espresso transition-colors" aria-label="Social">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#share" className="w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center hover:bg-gold hover:text-espresso transition-colors" aria-label="Share">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="#explore" className="w-8 h-8 rounded-full border border-gold/30 flex items-center justify-center hover:bg-gold hover:text-espresso transition-colors" aria-label="Explore">
                <Compass className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-gold">The Salon</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/services" className="hover:text-gold transition-colors">Haute Services Menu</Link></li>
              <li><Link to="/team" className="hover:text-gold transition-colors">Our Master Stylists</Link></li>
              <li><Link to="/gallery" className="hover:text-gold transition-colors">Visual Lookbook</Link></li>
              <li><Link to="/offers" className="hover:text-gold transition-colors">Seasonal Packages</Link></li>
              <li><Link to="/about" className="hover:text-gold transition-colors">Heritage & Philosophy</Link></li>
              <li><Link to="/book" className="text-gold hover:underline">Reserve Online</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-gold">Concierge Desk</h4>
            <ul className="space-y-3 text-xs text-taupe">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <span>42 Royale Boulevard, Indiranagar, Bengaluru, 560038</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold shrink-0" />
                <span>concierge@aurelia-salon.com</span>
              </li>
            </ul>
          </div>

          {/* Operating Hours */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-gold">Atelier Hours</h4>
            <div className="space-y-2 text-xs text-taupe">
              <div className="flex items-center justify-between py-1 border-b border-ivory/5">
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gold" /> Monday – Friday</span>
                <span className="font-medium text-ivory">9:00 AM – 8:00 PM</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-ivory/5">
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gold" /> Saturday</span>
                <span className="font-medium text-ivory">9:00 AM – 8:00 PM</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-ivory/5">
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gold" /> Sunday</span>
                <span className="font-medium text-ivory">10:00 AM – 7:00 PM</span>
              </div>
            </div>
            <p className="text-[11px] text-taupe/80 italic mt-2">
              Advance booking recommended for hair couture and aesthetic rituals.
            </p>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-taupe space-y-3 sm:space-y-0">
          <p>© {new Date().getFullYear()} AURELIA Salon & Beauty Studio. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <span className="hover:text-gold cursor-pointer">Booking Policy</span>
            <span className="hover:text-gold cursor-pointer">Cancellation Rules</span>
            <span className="hover:text-gold cursor-pointer">Privacy Charter</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
