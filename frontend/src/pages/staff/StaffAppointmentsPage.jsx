import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { toast } from 'sonner';
import { Calendar, Clock, User, Phone, CheckCircle, Play, CheckCheck, XCircle } from 'lucide-react';

export const StaffAppointmentsPage = () => {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch staff appointments
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['staff-appointments', selectedDate],
    queryFn: () => api.get(`/staff/appointments?date=${selectedDate}`).then(res => res.data),
  });

  // Status transition mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status, mark_paid }) => api.patch(`/staff/appointments/${id}/status`, { status, mark_paid }),
    onSuccess: () => {
      toast.success('Appointment status updated.');
      queryClient.invalidateQueries(['staff-appointments']);
      queryClient.invalidateQueries(['staff-dashboard']);
    },
    onError: (err) => {
      toast.error(err.message || 'Status transition failed.');
    }
  });

  const handleUpdateStatus = (id, newStatus, markPaid = false) => {
    statusMutation.mutate({ id, status: newStatus, mark_paid: markPaid });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-espresso">Assigned Client Appointments</h2>
          <p className="text-xs text-taupe mt-0.5">Mark guest arrival, commence service, and log completion</p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white border border-[#E5D2B8] rounded-sm px-3 py-1.5 text-xs text-espresso focus:outline-none focus:border-gold"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center"><Spinner size="lg" /></div>
      ) : appointments.length === 0 ? (
        <Card className="p-12 text-center border border-[#E5D2B8]">
          <Calendar className="w-10 h-10 text-taupe mx-auto mb-3" />
          <h3 className="font-serif text-xl text-espresso">No assigned appointments on {selectedDate}</h3>
          <p className="text-xs text-taupe mt-1">Enjoy your prep time or explore upcoming client records.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <Card key={appt.id} className="p-6 border border-[#E5D2B8] hover:border-gold/60 transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-espresso">{appt.booking_reference}</span>
                    <Badge variant={appt.status}>{appt.status.replace('_', ' ')}</Badge>
                    <Badge variant={appt.payment_status === 'paid' ? 'confirmed' : 'pending'}>
                      {appt.payment_status}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-serif text-xl font-bold text-espresso">
                      {appt.customer_first_name} {appt.customer_last_name}
                    </h3>
                    <p className="text-xs text-taupe mt-0.5">
                      {appt.services?.map(s => s.name).join(' + ')} ({appt.total_duration_minutes} mins)
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-taupe">
                    <span className="flex items-center gap-1.5 text-espresso font-medium">
                      <Clock className="w-3.5 h-3.5 text-gold" /> {appt.start_time} – {appt.end_time}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-gold" /> {appt.customer_phone}
                    </span>
                    <span className="font-serif font-bold text-sm text-espresso">
                      ₹{parseFloat(appt.total_amount).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {appt.customer_notes && (
                    <div className="p-2.5 bg-amber-50/50 rounded-sm border border-amber-200/60 text-[11px] text-amber-900">
                      <strong>Client Note:</strong> {appt.customer_notes}
                    </div>
                  )}
                </div>

                {/* Workflow Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
                  {appt.status === 'confirmed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus(appt.id, 'checked_in')}
                      isLoading={statusMutation.isPending}
                    >
                      Mark Checked In
                    </Button>
                  )}

                  {(appt.status === 'confirmed' || appt.status === 'checked_in') && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Play}
                      onClick={() => handleUpdateStatus(appt.id, 'in_service')}
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
                      onClick={() => handleUpdateStatus(appt.id, 'completed', true)}
                      isLoading={statusMutation.isPending}
                    >
                      Complete Service
                    </Button>
                  )}

                  {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-status-error hover:bg-red-50"
                      onClick={() => handleUpdateStatus(appt.id, 'no_show')}
                    >
                      No Show
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

