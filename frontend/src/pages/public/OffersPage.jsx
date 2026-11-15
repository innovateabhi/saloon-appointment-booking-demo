import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { toast } from 'sonner';
import { Gift, Copy, Sparkles, Clock, Check } from 'lucide-react';

export const OffersPage = () => {
  const navigate = useNavigate();

  const { data: offers = [], isLoading } = useQuery({
    queryKey: ['public-offers'],
    queryFn: () => api.get('/public/offers').then((res) => res.data),
  });

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon code ${code} copied to clipboard!`);
  };

  const handleRedeem = (code) => {
    navigate(`/book?coupon=${code}`);
  };

  return (
    <div className="py-12 md:py-20 space-y-16">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <Badge variant="gold">Exclusive Studio Privileges</Badge>
        <h1 className="font-serif text-4xl sm:text-6xl text-espresso">
          Seasonal Privileges & Curated Packages
        </h1>
        <p className="text-sm sm:text-base text-taupe max-w-2xl mx-auto leading-relaxed">
          Enjoy seasonal credits and introductory invitations designed to introduce you to our signature hair couture and clinical dermal therapies.
        </p>
      </div>

      {/* Offers Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="py-20 text-center">
            <Spinner size="lg" />
            <p className="text-xs uppercase tracking-widest text-taupe mt-3">Loading Offers...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {offers.map((offer) => (
              <Card key={offer.id} hover className="p-8 border border-gold/40 shadow-luxury flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gold font-semibold flex items-center gap-1.5">
                      <Gift className="w-4 h-4 text-gold" /> Privilege Offer
                    </span>
                    <Badge variant="gold">
                      {offer.discount_type === 'percentage'
                        ? `${parseInt(offer.discount_value)}% SAVINGS`
                        : `FLAT ₹${parseInt(offer.discount_value)} OFF`}
                    </Badge>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-espresso">
                    {offer.title}
                  </h3>

                  <p className="text-xs text-taupe leading-relaxed">
                    Applicable on all eligible treatments with a minimum booking spend of ₹{parseFloat(offer.min_spend).toLocaleString('en-IN')}.
                    {offer.max_discount && ` Maximum savings up to ₹${parseFloat(offer.max_discount).toLocaleString('en-IN')}.`}
                  </p>

                  {/* Promo Code Box */}
                  <div className="p-4 bg-cream/50 rounded-sm border border-[#E5D2B8] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-taupe block">Promo Code</span>
                      <span className="font-mono text-base font-bold text-espresso tracking-widest">{offer.code}</span>
                    </div>
                    <button
                      onClick={() => handleCopyCode(offer.code)}
                      className="px-3 py-1.5 border border-gold/40 rounded-sm text-xs font-semibold text-espresso hover:bg-gold hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy Code
                    </button>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#F1EAE1] flex items-center justify-between">
                  <span className="text-[11px] text-taupe flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gold" /> Valid until {new Date(offer.end_date).toLocaleDateString()}
                  </span>
                  <Button variant="gold" size="sm" onClick={() => handleRedeem(offer.code)}>
                    Redeem & Reserve
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

