import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Star, Award, Sparkles, Scissors, Clock, Calendar } from 'lucide-react';

export const TeamPage = () => {
  const navigate = useNavigate();

  const { data: stylists = [], isLoading } = useQuery({
    queryKey: ['public-staff'],
    queryFn: () => api.get('/public/staff').then((res) => res.data),
  });

  const handleBookWithStylist = (staffId) => {
    navigate(`/book?staff_id=${staffId}`);
  };

  return (
    <div className="py-12 md:py-20 space-y-16">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <Badge variant="gold">Master Artists & Dermal Therapists</Badge>
        <h1 className="font-serif text-4xl sm:text-6xl text-espresso">
          The Aurelia Creative Collective
        </h1>
        <p className="text-sm sm:text-base text-taupe max-w-2xl mx-auto leading-relaxed">
          Our team comprises internationally trained editorial directors, French balayage artisans, and licensed clinical aestheticians dedicated to individualized care.
        </p>
      </div>

      {/* Stylist Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="py-20 text-center">
            <Spinner size="lg" />
            <p className="text-xs uppercase tracking-widest text-taupe mt-3">Loading Stylist Profiles...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stylists.map((st) => (
              <Card key={st.id} hover className="overflow-hidden border border-[#E5D2B8] flex flex-col justify-between">
                <div>
                  {/* Stylist Avatar / Visual Cover */}
                  <div className="h-48 bg-gradient-to-tr from-espresso via-charcoal to-espresso p-6 flex flex-col justify-between text-ivory relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-gold font-semibold">
                        {st.experience_years} Years Mastery
                      </span>
                      <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-sm text-[11px] text-gold">
                        <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                        <span className="font-semibold text-ivory">{st.rating_avg}</span>
                        <span className="text-taupe text-[10px]">({st.reviews_count})</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-serif text-2xl font-bold text-ivory">
                        {st.first_name} {st.last_name}
                      </h3>
                      <p className="text-xs text-gold/90 font-medium mt-0.5">
                        {st.title}
                      </p>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-4">
                    <p className="text-xs text-taupe leading-relaxed">
                      {st.bio}
                    </p>

                    {/* Specialized Treatments Tags */}
                    {st.services && st.services.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <p className="text-[10px] uppercase tracking-wider text-charcoal font-semibold">Signature Expertise:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {st.services.map((srv) => (
                            <span
                              key={srv.id}
                              className="px-2 py-0.5 bg-cream/80 text-espresso text-[10px] rounded-sm border border-[#E5D2B8]/70"
                            >
                              {srv.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 pt-0">
                  <Button
                    variant="gold"
                    size="md"
                    className="w-full"
                    onClick={() => handleBookWithStylist(st.id)}
                  >
                    Reserve with {st.first_name}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

