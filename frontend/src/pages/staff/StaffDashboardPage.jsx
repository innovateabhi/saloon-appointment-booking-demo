import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, Scissors, Play, CheckCheck, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export const StaffDashboardPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: staffData, isLoading } = useQuery({
    queryKey: ['staff-dashboard-live'],
    queryFn: () => api.get('/staff/dashboard').then(res => res.data),
  });

  const todayAppointments = staffData?.today_appointments || [];
  const stats = staffData?.stats || { total_today: 0, completed_today: 0, pending_today: 0 };

  const statusMutation = useMutation({
    mutationFn: ({ id, status, mark_paid }) => api.patch(`/staff/appointments/${id}/status`, { status, mark_paid }),
    onSuccess: () => {
      toast.success('Status updated successfully.');
      queryClient.invalidateQueries(['staff-dashboard-live']);
    },
    onError: (err) => {
      toast.error(err.message || 'Status transition failed.');
    }
  });

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-sm border border-[#E5D2B8] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-semibold">
            Stylist Workbench
          </span>
          <h2 className="font-serif text-2xl font-semibold text-espresso">
            Welcome, {user?.first_name} {user?.last_name}
          </h2>
          <p className="text-xs text-taupe mt-1">
            {user?.staff_title || 'Stylist'} • Today's Schedule: 9:30 AM – 6:30 PM (Break: 1:30 PM – 2:30 PM)
          </p>
        </div>
        <Link to="/staff/calendar">
          <Button variant="gold" size="md" icon={Calendar}>
            Open My Schedule
          </Button>
        </Link>
      </div>

      {/* Staff Shift Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="p-5 border-l-4 border-l-gold">
          <p className="text-xs uppercase tracking-wider text-taupe font-medium">Assigned Today</p>
          <p className="font-serif text-3xl font-bold text-espresso mt-2">
            {stats.total_today} Clients
          </p>
          <p className="text-[11px] text-taupe mt-1">Scheduled appointments</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-status-success">
          <p className="text-xs uppercase tracking-wider text-taupe font-medium">Completed</p>
          <p className="font-serif text-3xl font-bold text-espresso mt-2">
            {stats.completed_today}
          </p>
          <p className="text-[11px] text-status-success font-medium mt-1">Services finished</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-espresso">
          <p className="text-xs uppercase tracking-wider text-taupe font-medium">Remaining Today</p>
          <p className="font-serif text-3xl font-bold text-espresso mt-2">
            {stats.pending_today}
          </p>
          <p className="text-[11px] text-taupe mt-1">Pending clients</p>
        </Card>
      </div>

      {/* Actionable Today's Roster */}
      <Card className="border border-[#E5D2B8] overflow-hidden">
        <CardHeader>
          <CardTitle>Today's Assigned Appointments</CardTitle>
          <p className="text-xs text-taupe mt-0.5">Check-in arriving guests, start treatment, and record completion</p>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 text-center"><Spinner size="lg" /></div>
          ) : todayAppointments.length === 0 ? (
            <div className="p-8 text-center text-xs text-taupe">
              No assigned appointments for you today.
            </div>
          ) : (
            <div className="divide-y divide-[#F1EAE1] text-xs">
              {todayAppointments.map((appt) => (
                <div key={appt.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-cream/15 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-14 text-center py-1 bg-cream rounded-sm border border-gold/30">
                      <span className="font-serif font-bold text-sm text-espresso block">
                        {appt.start_time?.substring(0, 5)}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-taupe">
                        {appt.end_time?.substring(0, 5)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-espresso text-sm">
                          {appt.customer_first_name} {appt.customer_last_name}
                        </span>
                        <Badge variant={appt.status}>{appt.status.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-taupe mt-0.5">
                        {appt.services?.map(s => s.name).join(' + ')} ({appt.total_duration_minutes} mins)
                      </p>
                      {appt.customer_phone && (
                        <p className="text-[11px] text-taupe/80 mt-0.5">Tel: {appt.customer_phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {appt.status === 'confirmed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => statusMutation.mutate({ id: appt.id, status: 'checked_in' })}
                        isLoading={statusMutation.isPending}
                      >
                        Check In
                      </Button>
                    )}
                    {(appt.status === 'confirmed' || appt.status === 'checked_in') && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Play}
                        onClick={() => statusMutation.mutate({ id: appt.id, status: 'in_service' })}
                        isLoading={statusMutation.isPending}
                      >
                        Start Service
                      </Button>
                    )}
                    {appt.status === 'in_service' && (
                      <Button
                        variant="gold"
                        size="sm"
                        icon={CheckCheck}
                        onClick={() => statusMutation.mutate({ id: appt.id, status: 'completed', mark_paid: true })}
                        isLoading={statusMutation.isPending}
                      >
                        Complete Service
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
