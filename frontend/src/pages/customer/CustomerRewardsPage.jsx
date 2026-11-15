import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Award, Sparkles, Gift, ArrowUpRight, CheckCircle } from 'lucide-react';

export const CustomerRewardsPage = () => {
  const { data: loyaltyData, isLoading } = useQuery({
    queryKey: ['customer-loyalty-full'],
    queryFn: () => api.get('/customer/loyalty').then(res => res.data),
  });

  const account = loyaltyData?.account || { points_balance: 350, tier: 'Gold' };
  const transactions = loyaltyData?.transactions || [];

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-espresso">Aurelia Privilege Club</h2>
        <p className="text-xs text-taupe mt-0.5">Your loyalty tier, accumulated credits, and exclusive member perks</p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* Privilege Membership Card */}
          <div className="p-8 rounded-sm bg-gradient-to-tr from-espresso via-charcoal to-espresso text-ivory border border-gold/40 shadow-luxury flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-3">
              <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-semibold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-gold" /> Aurelia Privilege Tier
              </span>
              <h3 className="font-serif text-3xl font-bold text-ivory">{account.tier} Tier Member</h3>
              <p className="text-xs text-taupe leading-relaxed max-w-sm">
                Earn 1 Privilege Point for every ₹10 spent on luxury salon rituals. Points can be directly deducted from any future appointment bill.
              </p>
            </div>

            <div className="text-right sm:border-l sm:border-gold/30 sm:pl-8">
              <span className="text-[10px] uppercase tracking-wider text-taupe block">Available Balance</span>
              <span className="font-serif text-4xl font-bold text-gold block mt-1">{account.points_balance} pts</span>
              <span className="text-xs text-ivory/80 font-medium">Equates to ₹{account.points_balance} Savings</span>
            </div>
          </div>

          {/* Points Activity Ledger */}
          <Card className="border border-[#E5D2B8] overflow-hidden">
            <CardHeader>
              <CardTitle>Privilege Points Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[#F1EAE1] text-xs">
                {transactions.length === 0 ? (
                  <div className="p-6 text-center text-taupe">
                    Welcome Gift: 50 points credited on registration. Points will automatically accumulate upon completion of future bookings.
                  </div>
                ) : (
                  transactions.map((tx) => (
                    <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-cream/20">
                      <div>
                        <p className="font-semibold text-espresso">{tx.description}</p>
                        <p className="text-[10px] text-taupe">{tx.created_at}</p>
                      </div>
                      <span className="font-mono font-bold text-sm text-status-success">
                        +{tx.points} pts
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

