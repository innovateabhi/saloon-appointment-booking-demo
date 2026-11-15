import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

export const StaffCalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['staff-calendar', currentDate],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('start', currentDate);
      params.append('end', currentDate);
      return api.get(`/staff/calendar?${params.toString()}`).then(res => res.data);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-5 rounded-sm border border-[#E5D2B8] shadow-sm">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-espresso">My Daily Schedule</h2>
          <p className="text-xs text-taupe mt-0.5">Assigned appointments and break intervals</p>
        </div>

        <div className="flex items-center gap-1 border border-[#E5D2B8] rounded-sm p-1">
          <button onClick={handlePrevDay} className="p-1 hover:bg-cream rounded-sm" aria-label="Previous Day">
            <ChevronLeft className="w-4 h-4 text-espresso" />
          </button>
          <span className="font-serif font-bold text-sm px-3 text-espresso">
            {new Date(currentDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
          <button onClick={handleNextDay} className="p-1 hover:bg-cream rounded-sm" aria-label="Next Day">
            <ChevronRight className="w-4 h-4 text-espresso" />
          </button>
        </div>
      </div>

      <Card className="border border-[#E5D2B8]">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-20 text-center"><Spinner size="lg" /></div>
          ) : events.length === 0 ? (
            <div className="py-16 text-center text-xs text-taupe">
              No appointments scheduled for you on this date.
            </div>
          ) : (
            <div className="divide-y divide-[#F1EAE1]">
              {events.map((evt) => (
                <div key={evt.id} className="p-5 flex items-center justify-between hover:bg-cream/20">
                  <div className="flex items-center gap-4">
                    <div className="w-16 text-center py-1.5 bg-cream/70 rounded-sm border border-gold/30">
                      <span className="font-mono font-bold text-xs text-espresso block">{evt.start_time.substring(0, 5)}</span>
                      <span className="text-[10px] text-taupe">{evt.end_time.substring(0, 5)}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-base text-espresso">{evt.customer_name}</span>
                        <Badge variant={evt.status}>{evt.status.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-xs text-taupe mt-0.5">{evt.service_names}</p>
                    </div>
                  </div>

                  <span className="font-mono text-xs font-bold text-espresso">{evt.booking_reference}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

