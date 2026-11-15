import React, { useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from 'sonner';
import api from '../../services/api';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare } from 'lucide-react';

export const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in your name, email, and message.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/public/contact', formData);
      toast.success('Thank you. The Aurelia concierge desk will reach out shortly.');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to submit inquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-12 md:py-20 space-y-16">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <Badge variant="gold">Concierge Desk</Badge>
        <h1 className="font-serif text-4xl sm:text-6xl text-espresso">
          Connect with the Atelier
        </h1>
        <p className="text-sm sm:text-base text-taupe max-w-2xl mx-auto leading-relaxed">
          For bespoke bridal packages, private salon hire, or appointment inquiries, our dedicated concierge team is at your service.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Contact Details Card */}
          <div className="space-y-6">
            <Card className="p-8 border border-[#E5D2B8] space-y-6">
              <h3 className="font-serif text-2xl font-semibold text-espresso">
                AURELIA — Luxury Hair & Beauty Studio
              </h3>
              
              <div className="space-y-4 text-xs text-taupe">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-espresso block font-medium">Studio Location</strong>
                    <span>42 Royale Boulevard, Indiranagar, Bengaluru, Karnataka, 560038</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gold shrink-0" />
                  <div>
                    <strong className="text-espresso block font-medium">Telephone Direct</strong>
                    <span>+91 98765 43210</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gold shrink-0" />
                  <div>
                    <strong className="text-espresso block font-medium">Concierge Email</strong>
                    <span>concierge@aurelia-salon.com</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <Clock className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-espresso block font-medium">Operating Schedule</strong>
                    <span>Monday – Saturday: 9:00 AM – 8:00 PM</span>
                    <span className="block mt-0.5">Sunday: 10:00 AM – 7:00 PM</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Interactive Inquiry Form */}
          <Card className="p-8 border border-gold/40 shadow-luxury">
            <h3 className="font-serif text-2xl font-semibold text-espresso mb-2">
              Send a Concierge Message
            </h3>
            <p className="text-xs text-taupe mb-6">
              We respond to all bespoke requests and private consultations within 2 business hours.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Eleanor Vane"
                  required
                />
                <Input
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 00000"
                />
              </div>

              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="eleanor@luxury.test"
                required
              />

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-medium uppercase tracking-wider text-charcoal/80">
                  Your Message or Special Request
                </label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Please describe your desired services or preferred timing..."
                  className="w-full bg-white border border-[#E5D2B8] rounded-sm p-3 text-xs text-espresso focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="gold"
                size="md"
                className="w-full"
                isLoading={submitting}
                icon={Send}
              >
                Submit Concierge Inquiry
              </Button>
            </form>
          </Card>

        </div>
      </div>
    </div>
  );
};

