import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { Calendar as CalendarIcon, Clock, User, Scissors, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

export const AdminCalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStaffFilter, setSelectedStaffFilter] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Fetch stylists
  const { data: stylists = [] } = useQuery({
    queryKey: ['admin-staff-list'],
    queryFn: () => api.get('/admin/staff').then(res => res.data),
  });

  // Fetch calendar events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['admin-calendar', currentDate, selectedStaffFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('start', currentDate);
      params.append('end', currentDate);
      if (selectedStaffFilter) params.append('staff_id', selectedStaffFilter);
      return api.get(`/admin/calendar?${params.toString()}`).then(res => res.data);
    },
  });

  const handlePrevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const hours = [
    '09:00:00', '10:00:00', '11:00:00', '12:00:00', '13:00:00',
    '14:00:00', '15:00:00', '16:00:00', '17:00:00', '18:00:00', '19:00:00'
  ];

  return (
    <div className="space-y-6">
      {/* Calendar Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-sm border border-[#E5D2B8] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 border border-[#E5D2B8] rounded-sm p-1">
            <button onClick={handlePrevDay} className="p-1 hover:bg-cream rounded-sm" aria-label="Previous Day">
              <ChevronLeft className="w-4 h-4 text-espresso" />
            </button>
            <span className="font-serif font-bold text-base px-3 text-espresso">
              {new Date(currentDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <button onClick={handleNextDay} className="p-1 hover:bg-cream rounded-sm" aria-label="Next Day">
              <ChevronRight className="w-4 h-4 text-espresso" />
            </button>
          </div>
          <button
            onClick={() => setCurrentDate(new Date().toISOString().split('T')[0])}
            className="px-3 py-1.5 border border-[#E5D2B8] text-xs font-semibold rounded-sm hover:border-gold"
          >
            Today
          </button>
        </div>

        {/* Filter by Stylist */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-taupe" />
          <select
            value={selectedStaffFilter}
            onChange={(e) => setSelectedStaffFilter(e.target.value)}
            className="bg-white border border-[#E5D2B8] rounded-sm px-3 py-1.5 text-xs text-espresso focus:outline-none focus:border-gold"
          >
            <option value="">All Stylists Schedule</option>
            {stylists.map((st) => (
              <option key={st.id} value={st.id}>
                {st.first_name} {st.last_name} ({st.title})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Visual Timeline Grid */}
      <Card className="border border-[#E5D2B8] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <CardTitle>Daily Schedule Overview ({events.length} Bookings)</CardTitle>
          <div className="flex items-center gap-2 text-[10px] uppercase font-semibold">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Completed</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> In Service</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" /> Confirmed</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-20 text-center"><Spinner size="lg" /></div>
          ) : events.length === 0 ? (
            <div className="py-16 text-center text-xs text-taupe">
              No appointments scheduled for this date.
            </div>
          ) : (
            <div className="divide-y divide-[#F1EAE1] max-h-[600px] overflow-y-auto">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => setSelectedAppointment(evt)}
                  className="p-4 flex items-center justify-between hover:bg-cream/20 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 text-center py-1 bg-cream/70 rounded-sm border border-gold/30">
                      <span className="font-mono font-bold text-xs text-espresso block">
                        {evt.start_time.substring(0, 5)}
                      </span>
                      <span className="text-[10px] text-taupe">{evt.end_time.substring(0, 5)}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-base text-espresso">{evt.customer_name}</span>
                        <Badge variant={evt.status}>{evt.status.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-xs text-taupe mt-0.5">
                        {evt.service_names} • Stylist: <strong className="text-espresso font-medium">{evt.stylist_name}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-espresso block">
                      {evt.booking_reference}
                    </span>
                    <span className="font-serif font-bold text-sm text-espresso">
                      ₹{parseFloat(evt.total_amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appointment Detail Modal */}
      <Modal
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        title="Appointment Record"
        description={`Reference: ${selectedAppointment?.booking_reference}`}
      >
        {selectedAppointment && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-cream/30 rounded-sm border border-[#E5D2B8] space-y-2">
              <div className="flex justify-between">
                <span className="text-taupe">Guest Name:</span>
                <span className="font-bold text-espresso">{selectedAppointment.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-taupe">Assigned Artist:</span>
                <span className="font-bold text-espresso">{selectedAppointment.stylist_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-taupe">Timing:</span>
                <span className="font-bold text-espresso">{selectedAppointment.appointment_date} ({selectedAppointment.start_time} - {selectedAppointment.end_time})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-taupe">Treatments:</span>
                <span className="font-bold text-espresso text-right">{selectedAppointment.service_names}</span>
              </div>
              <div className="flex justify-between border-t border-[#E5D2B8] pt-2">
                <span className="text-taupe font-semibold">Total Amount:</span>
                <span className="font-serif font-bold text-base text-espresso">₹{parseFloat(selectedAppointment.total_amount).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="gold" size="sm" onClick={() => setSelectedAppointment(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

