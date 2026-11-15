import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Award, Sparkles, Clock, Plus, Scissors, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CustomerDashboardPage = () => {
  const { user } = useAuth();

  const { data: customerData, isLoading } = useQuery({
    queryKey: ['customer-dashboard-live'],
    queryFn: () => api.get('/customer/dashboard').then(res => res.data),
  });

  const nextAppt = customerData?.next_appointment;
  const loyalty = customerData?.loyalty || { points_balance: user?.loyalty_points_balance || 350, tier: 'Gold' };
  const recentAppts = customerData?.recent_appointments || [];
  const coupons = customerData?.active_coupons || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-sm border border-[#E5D2B8] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-semibold">
            Member Privilege Lounge
          </span>
          <h2 className="font-serif text-2xl font-semibold text-espresso">
            Welcome, {user?.first_name} {user?.last_name}
          </h2>
          <p className="text-xs text-taupe mt-1">
            Member Code: {user?.customer_code || 'CUST-AUR101'} • Aurelia {loyalty.tier} Tier Member
          </p>
        </div>
        <Link to="/book">
          <Button variant="gold" size="md" icon={Plus}>
            Book New Treatment
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="py-12 text-center"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* Privilege & Loyalty Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Card className="p-5 border-l-4 border-l-gold">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-taupe font-medium">Privilege Points</p>
                <Award className="w-5 h-5 text-gold" />
              </div>
              <p className="font-serif text-3xl font-bold text-espresso mt-2">
                {loyalty.points_balance} pts
              </p>
              <p className="text-[11px] text-gold-dark font-medium mt-1">
                Worth ₹{loyalty.points_balance} towards your next visit
              </p>
            </Card>

            <Card className="p-5 border-l-4 border-l-espresso">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-taupe font-medium">Salon Visits</p>
                <Scissors className="w-5 h-5 text-espresso" />
              </div>
              <p className="font-serif text-3xl font-bold text-espresso mt-2">
                {recentAppts.length} Completed
              </p>
              <p className="text-[11px] text-taupe font-medium mt-1">Verified treatments</p>
            </Card>

            <Card className="p-5 border-l-4 border-l-status-success">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-taupe font-medium">Member Tier</p>
                <Sparkles className="w-5 h-5 text-status-success" />
              </div>
              <p className="font-serif text-3xl font-bold text-espresso mt-2">{loyalty.tier}</p>
              <p className="text-[11px] text-status-success font-medium mt-1">Complimentary scalp wash on each visit</p>
            </Card>
          </div>

          {/* Next Appointment Card */}
          {nextAppt ? (
            <Card className="border border-gold/40 shadow-luxury">
              <CardHeader className="flex flex-row items-center justify-between bg-ivory/50">
                <div>
                  <CardTitle>Next Scheduled Treatment</CardTitle>
                  <p className="text-xs text-taupe mt-0.5">Reference: {nextAppt.booking_reference}</p>
                </div>
                <Badge variant={nextAppt.status}>{nextAppt.status}</Badge>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <h4 className="font-serif text-xl font-semibold text-espresso">
                      {nextAppt.services?.map(s => s.name).join(' + ')}
                    </h4>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-taupe">
                      <span className="flex items-center gap-1.5 font-medium text-espresso">
                        <Calendar className="w-4 h-4 text-gold" /> {nextAppt.appointment_date}
                      </span>
                      <span className="flex items-center gap-1.5 font-medium text-espresso">
                        <Clock className="w-4 h-4 text-gold" /> {nextAppt.start_time} – {nextAppt.end_time}
                      </span>
                      <span>Stylist: <strong>{nextAppt.stylist_name}</strong></span>
                      <span className="font-serif font-bold text-espresso">
                        ₹{parseFloat(nextAppt.total_amount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link to="/customer/appointments">
                      <Button variant="outline" size="sm">
                        Manage Booking
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-8 text-center border border-[#E5D2B8] space-y-3">
              <Calendar className="w-8 h-8 text-taupe mx-auto" />
              <h4 className="font-serif text-lg font-bold text-espresso">No upcoming appointment</h4>
              <p className="text-xs text-taupe max-w-sm mx-auto">
                Treat yourself to an affordable hair cut, refreshing herbal hair spa, or face clean-up.
              </p>
              <Link to="/book">
                <Button variant="gold" size="sm" className="mt-2">
                  Reserve a Treatment
                </Button>
              </Link>
            </Card>
          )}

          {/* Active Privilege Coupons */}
          {coupons.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-serif text-xl font-bold text-espresso">
                Available Member Privilege Offers
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {coupons.map((c) => (
                  <Card key={c.id} className="p-4 border border-[#E5D2B8] bg-white">
                    <span className="font-mono font-bold text-sm text-espresso block">{c.code}</span>
                    <p className="text-xs font-semibold text-gold-dark mt-1">{c.title}</p>
                    <p className="text-[11px] text-taupe mt-0.5">Min spend ₹{c.min_spend}</p>
                    <Link to={`/book?coupon=${c.code}`}>
                      <Button variant="ghost" size="sm" className="w-full mt-3 text-gold">
                        Use in Booking
                      </Button>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
