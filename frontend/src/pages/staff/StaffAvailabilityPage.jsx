import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { toast } from 'sonner';
import { Clock, Calendar, Send } from 'lucide-react';

export const StaffAvailabilityPage = () => {
  const queryClient = useQueryClient();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const { data: availability, isLoading } = useQuery({
    queryKey: ['staff-availability-details'],
    queryFn: () => api.get('/staff/availability').then(res => res.data),
  });

  const leaveMutation = useMutation({
    mutationFn: (data) => api.post('/staff/leave', data),
    onSuccess: () => {
      toast.success('Leave request submitted to salon owner.');
      queryClient.invalidateQueries(['staff-availability-details']);
      setStartDate('');
      setEndDate('');
      setReason('');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to submit leave.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
      toast.error('Please fill in start date, end date, and reason.');
      return;
    }
    leaveMutation.mutate({ start_date: startDate, end_date: endDate, reason });
  };

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-espresso">My Shift Roster & Leave Requests</h2>
        <p className="text-xs text-taupe mt-0.5">View regular working hours and submit planned absence notices</p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Working Shifts */}
          <Card className="p-6 border border-[#E5D2B8] space-y-4">
            <h4 className="font-serif text-lg font-bold text-espresso border-b border-[#F1EAE1] pb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gold" /> Weekly Shift Hours
            </h4>
            <div className="divide-y divide-[#F1EAE1] text-xs">
              {availability?.shifts?.map((s) => (
                <div key={s.id} className="py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-espresso">{daysOfWeek[s.day_of_week]}</span>
                  {s.is_working ? (
                    <span className="font-mono text-espresso">{s.start_time.substring(0, 5)} - {s.end_time.substring(0, 5)}</span>
                  ) : (
                    <Badge variant="default">Rostered Off</Badge>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Leave Request Form */}
          <Card className="p-6 border border-gold/40 shadow-sm space-y-4">
            <h4 className="font-serif text-lg font-bold text-espresso border-b border-[#F1EAE1] pb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gold" /> Request Leave of Absence
            </h4>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
                <Input
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-medium uppercase tracking-wider text-charcoal/80">
                  Reason for Absence
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="E.g., Masterclass in Milan, personal leave..."
                  className="w-full bg-white border border-[#E5D2B8] rounded-sm p-3 text-xs text-espresso focus:outline-none focus:border-gold"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="gold"
                size="md"
                className="w-full"
                isLoading={leaveMutation.isPending}
                icon={Send}
              >
                Submit Leave Notice
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

