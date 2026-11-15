import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Calendar, Users, TrendingUp, Scissors, Plus, Sparkles, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboardPage = () => {
  const { data: summary, isLoading: sumLoading } = useQuery({
    queryKey: ['admin-dashboard-summary'],
    queryFn: () => api.get('/admin/dashboard').then(res => res.data),
  });

  const { data: recentAppointments = [] } = useQuery({
    queryKey: ['admin-dashboard-recent'],
    queryFn: () => api.get('/admin/appointments?page=1&per_page=5').then(res => res.data?.data || []),
  });

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-sm border border-[#E5D2B8] shadow-sm">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-semibold">
            Salon Command Center
          </span>
          <h2 className="font-serif text-2xl font-semibold text-espresso">
            AURELIA — Salon & Beauty Studio Operations
          </h2>
          <p className="text-xs text-taupe mt-1">
            Studio operational status: Open & Active • {summary?.total_customers || 45} Registered Clients
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/walkin">
            <Button variant="gold" size="md" icon={Plus}>
              Quick Walk-In
            </Button>
          </Link>
          <Link to="/admin/calendar">
            <Button variant="outline" size="md" icon={Calendar}>
              Live Schedule
            </Button>
          </Link>
        </div>
      </div>

      {sumLoading ? (
        <div className="py-12 text-center"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* KPI Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card className="p-5 border-l-4 border-l-gold">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-taupe font-medium">Today's Bookings</p>
                <Calendar className="w-5 h-5 text-gold" />
              </div>
              <p className="font-serif text-3xl font-bold text-espresso mt-2">
                {summary?.today_bookings || 0}
              </p>
              <p className="text-[11px] text-status-success font-medium mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {summary?.today_completed || 0} completed today
              </p>
            </Card>

            <Card className="p-5 border-l-4 border-l-status-success">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-taupe font-medium">Today's Collections</p>
                <TrendingUp className="w-5 h-5 text-status-success" />
              </div>
              <p className="font-serif text-3xl font-bold text-espresso mt-2">
                ₹{parseFloat(summary?.today_revenue || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-taupe font-medium mt-1">
                Month to date: ₹{parseFloat(summary?.month_revenue || 0).toLocaleString('en-IN')}
              </p>
            </Card>

            <Card className="p-5 border-l-4 border-l-espresso">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-taupe font-medium">Total Clients</p>
                <Users className="w-5 h-5 text-espresso" />
              </div>
              <p className="font-serif text-3xl font-bold text-espresso mt-2">
                {summary?.total_customers || 45}
              </p>
              <p className="text-[11px] text-taupe font-medium mt-1">
                Registered profiles & CRM
              </p>
            </Card>

            <Card className="p-5 border-l-4 border-l-gold-dark">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-taupe font-medium">Pending Approvals</p>
                <Clock className="w-5 h-5 text-gold-dark" />
              </div>
              <p className="font-serif text-3xl font-bold text-espresso mt-2">
                {summary?.pending_approvals || 0}
              </p>
              <p className="text-[11px] text-amber-700 font-medium mt-1">
                Needs studio attention
              </p>
            </Card>
          </div>

          {/* Popular Services & Stylist Productivity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6 border border-[#E5D2B8] space-y-4">
              <h4 className="font-serif text-lg font-bold text-espresso border-b border-[#F1EAE1] pb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold" /> Most Popular Treatments
              </h4>
              <div className="space-y-3">
                {summary?.popular_services?.map((ps, idx) => (
                  <div key={idx} className="p-3 bg-cream/30 rounded-sm border border-[#E5D2B8] flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-espresso">{ps.name}</p>
                      <p className="text-[10px] text-taupe">{ps.bookings_count} bookings</p>
                    </div>
                    <span className="font-serif font-bold text-sm text-espresso">
                      ₹{parseFloat(ps.total_revenue).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 border border-[#E5D2B8] space-y-4">
              <h4 className="font-serif text-lg font-bold text-espresso border-b border-[#F1EAE1] pb-2 flex items-center gap-2">
                <Scissors className="w-4 h-4 text-gold" /> Stylist Productivity
              </h4>
              <div className="space-y-3">
                {summary?.staff_productivity?.map((sp, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-sm border border-[#E5D2B8] flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-espresso">{sp.stylist_name}</p>
                      <p className="text-[10px] text-gold-dark font-medium">★ {sp.rating_avg} rating</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-espresso block">{sp.appointments_count} completed</span>
                      <span className="font-serif font-bold text-xs text-taupe">₹{parseFloat(sp.total_volume).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Recent Appointments Preview */}
          <Card className="border border-[#E5D2B8] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Studio Appointments</CardTitle>
                <p className="text-xs text-taupe mt-0.5">Live appointments from database</p>
              </div>
              <Link to="/admin/appointments">
                <Button variant="ghost" size="sm">
                  View All Directory
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[#F1EAE1] text-xs">
                {recentAppointments.length === 0 ? (
                  <div className="p-6 text-center text-taupe">No appointments found.</div>
                ) : (
                  recentAppointments.map((appt) => (
                    <div key={appt.id} className="p-4 flex items-center justify-between hover:bg-cream/15 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-14 text-center py-1 bg-cream/70 rounded-sm border border-gold/30">
                          <span className="font-mono font-bold text-xs text-espresso block">
                            {appt.start_time?.substring(0, 5)}
                          </span>
                          <span className="text-[10px] text-taupe">{appt.appointment_date}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-espresso">{appt.customer_name}</p>
                          <p className="text-taupe">
                            {appt.services?.map(s => s.name).join(', ')} • {appt.stylist_name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={appt.status}>{appt.status.replace('_', ' ')}</Badge>
                        <span className="font-serif font-bold text-espresso">
                          ₹{parseFloat(appt.total_amount).toLocaleString('en-IN')}
                        </span>
                      </div>
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
