import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Sparkles, Calendar, Scissors, Award, Clock, ArrowRight, Star, Heart } from 'lucide-react';

export const HomePage = () => {
  const { data: salonData } = useQuery({
    queryKey: ['public-salon'],
    queryFn: () => api.get('/public/salon').then((res) => res.data),
  });

  const { data: services = [] } = useQuery({
    queryKey: ['public-services-featured'],
    queryFn: () => api.get('/public/services').then((res) => res.data?.slice(0, 3) || []),
  });

  const { data: stylists = [] } = useQuery({
    queryKey: ['public-staff-featured'],
    queryFn: () => api.get('/public/staff').then((res) => res.data?.slice(0, 3) || []),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['public-reviews-featured'],
    queryFn: () => api.get('/public/reviews').then((res) => res.data?.slice(0, 3) || []),
  });

  const heroTitle = salonData?.settings?.hero_title || 'Where Modern Luxury Meets the Art of Bespoke Beauty.';
  const heroSubtitle = salonData?.settings?.hero_subtitle || 'Welcome to AURELIA. An exclusive atelier dedicated to master precision cutting, multidimensional couture color, and restorative holistic skin wellness.';

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-28 md:pb-36 bg-gradient-to-b from-cream/40 via-ivory to-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Badge variant="gold" className="mb-6">
            Haute Coiffure & Bespoke Aesthetics
          </Badge>
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal text-espresso max-w-4xl mx-auto leading-tight">
            {heroTitle}
          </h1>
          <p className="mt-6 text-sm sm:text-base text-taupe max-w-2xl mx-auto font-sans leading-relaxed">
            {heroSubtitle}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/book">
              <Button variant="gold" size="lg" className="w-full sm:w-auto shadow-luxury hover:shadow-luxury-hover">
                Reserve Appointment
              </Button>
            </Link>
            <Link to="/services">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Explore Treatment Menu
              </Button>
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto border-t border-b border-[#E5D2B8]/60 py-8">
            <div>
              <p className="font-serif text-3xl font-semibold text-espresso">12+</p>
              <p className="text-[11px] uppercase tracking-widest text-taupe mt-1">Years of Heritage</p>
            </div>
            <div>
              <p className="font-serif text-3xl font-semibold text-espresso">5</p>
              <p className="text-[11px] uppercase tracking-widest text-taupe mt-1">Master Artists</p>
            </div>
            <div>
              <p className="font-serif text-3xl font-semibold text-espresso">4.95</p>
              <p className="text-[11px] uppercase tracking-widest text-taupe mt-1">Client Rating</p>
            </div>
            <div>
              <p className="font-serif text-3xl font-semibold text-espresso">100%</p>
              <p className="text-[11px] uppercase tracking-widest text-taupe mt-1">Organic Botanical Care</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Treatments */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold block mb-2">
              Signature Rituals
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-espresso">
              Crafted for Discernment & Elegance
            </h2>
          </div>
          <Link to="/services" className="mt-4 md:mt-0 inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-gold hover:text-gold-dark">
            <span>View Full Treatment Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((srv) => (
            <Card key={srv.id} hover className="p-8 border border-[#E5D2B8] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center text-gold mb-6 border border-gold/30">
                  <Scissors className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-espresso mb-2">
                  {srv.name}
                </h3>
                <p className="text-xs text-taupe leading-relaxed mb-6">
                  {srv.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#F1EAE1] flex items-center justify-between text-xs">
                <span className="text-taupe flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {srv.duration_minutes} mins</span>
                <span className="font-serif font-semibold text-base text-espresso">
                  ₹{parseFloat(srv.price).toLocaleString('en-IN')}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Master Stylists Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold block mb-2">
              The Atelier Artists
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-espresso">
              Master Stylists & Dermal Experts
            </h2>
          </div>
          <Link to="/team" className="mt-4 md:mt-0 inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-gold hover:text-gold-dark">
            <span>Meet All Artists</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stylists.map((st) => (
            <Card key={st.id} hover className="overflow-hidden border border-[#E5D2B8] flex flex-col justify-between">
              <div className="h-44 bg-espresso text-ivory p-6 flex flex-col justify-between">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gold uppercase tracking-wider font-semibold">{st.experience_years} Years Exp</span>
                  <span className="text-gold font-medium">★ {st.rating_avg}</span>
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-ivory">{st.first_name} {st.last_name}</h3>
                  <p className="text-xs text-taupe">{st.title}</p>
                </div>
              </div>
              <div className="p-6">
                <p className="text-xs text-taupe leading-relaxed line-clamp-3 mb-4">
                  {st.bio}
                </p>
                <Link to={`/book?staff_id=${st.id}`}>
                  <Button variant="gold" size="sm" className="w-full">
                    Book with {st.first_name}
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Verified Client Reviews */}
      {reviews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold block mb-2">
              Verified Client Words
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-espresso">
              Experiences of Pure Indulgence
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((rev) => (
              <Card key={rev.id} className="p-8 border border-[#E5D2B8] flex flex-col justify-between bg-white shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-gold">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-xs text-espresso leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="pt-4 border-t border-[#F1EAE1] mt-6 flex justify-between items-center text-xs">
                  <span className="font-bold text-espresso">{rev.customer_first_name} {rev.customer_last_name}</span>
                  <span className="text-[10px] text-taupe uppercase">Artist: {rev.stylist_name}</span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Booking CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-espresso text-ivory rounded-sm p-10 md:p-16 border border-gold/30 shadow-luxury relative overflow-hidden text-center">
          <div className="max-w-2xl mx-auto relative z-10 space-y-6">
            <span className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">
              Personalized Atelier Experience
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-ivory">
              Your Transformation Awaits
            </h2>
            <p className="text-xs sm:text-sm text-taupe leading-relaxed">
              Book your signature session online in less than 2 minutes. Choose your favorite master stylist, select your preferred time slot, and experience the luxury of Aurelia.
            </p>
            <div className="pt-2">
              <Link to="/book">
                <Button variant="gold" size="lg">
                  Start Your Reservation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
