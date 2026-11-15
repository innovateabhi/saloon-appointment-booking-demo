import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { toast } from 'sonner';
import { Search, Filter, Calendar, Clock, Eye, CheckCircle, RefreshCw } from 'lucide-react';

export const AdminAppointmentsPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedAppt, setSelectedAppt] = useState(null);

  // Fetch appointments
  const { data: resData, isLoading } = useQuery({
    queryKey: ['admin-appointments', page, search, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('page', page);
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      return api.get(`/admin/appointments?${params.toString()}`);
    },
  });

  const appointments = resData?.data || [];
  const pagination = resData?.pagination;

  // Status transition mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/admin/appointments/${id}/status`, { status }),
    onSuccess: () => {
      toast.success('Appointment status updated.');
      queryClient.invalidateQueries(['admin-appointments']);
      queryClient.invalidateQueries(['admin-dashboard']);
      setSelectedAppt(null);
    },
    onError: (err) => {
      toast.error(err.message || 'Status transition failed.');
    }
  });

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-espresso">Master Appointment Directory</h2>
          <p className="text-xs text-taupe mt-0.5">Filter, search, and manage studio reservations</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-taupe absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search ref, client, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-[#E5D2B8] rounded-sm pl-9 pr-3 py-1.5 text-xs text-espresso focus:outline-none focus:border-gold"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-[#E5D2B8] rounded-sm px-3 py-1.5 text-xs text-espresso focus:outline-none focus:border-gold"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked_in">Checked In</option>
            <option value="in_service">In Service</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointments Data Table */}
      <Card className="border border-[#E5D2B8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-cream/40 border-b border-[#E5D2B8] text-espresso uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 font-semibold">Reference</th>
                <th className="py-3.5 px-4 font-semibold">Guest Client</th>
                <th className="py-3.5 px-4 font-semibold">Treatments</th>
                <th className="py-3.5 px-4 font-semibold">Artist</th>
                <th className="py-3.5 px-4 font-semibold">Date & Time</th>
                <th className="py-3.5 px-4 font-semibold">Total</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1EAE1]">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center"><Spinner /></td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-taupe">No appointments found.</td>
                </tr>
              ) : (
                appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-cream/15 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-espresso">{appt.booking_reference}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-espresso">{appt.customer_name}</p>
                      <p className="text-[10px] text-taupe">{appt.customer_phone}</p>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-taupe">
                      {appt.services?.map(s => s.name).join(', ')}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-espresso">{appt.stylist_name}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-espresso">{appt.appointment_date}</p>
                      <p className="text-[10px] text-taupe">{appt.start_time} - {appt.end_time}</p>
                    </td>
                    <td className="py-3.5 px-4 font-serif font-bold text-espresso">
                      ₹{parseFloat(appt.total_amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={appt.status}>{appt.status.replace('_', ' ')}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedAppt(appt)} icon={Eye}>
                        Details
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination && pagination.last_page > 1 && (
          <div className="p-4 border-t border-[#F1EAE1] flex items-center justify-between text-xs text-taupe">
            <span>Page {pagination.current_page} of {pagination.last_page} ({pagination.total} records)</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.current_page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.has_more}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Appointment Detail & Status Transition Modal */}
      <Modal
        isOpen={!!selectedAppt}
        onClose={() => setSelectedAppt(null)}
        title="Reservation Details"
        description={`Ref: ${selectedAppt?.booking_reference}`}
      >
        {selectedAppt && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-cream/40 rounded-sm border border-[#E5D2B8] space-y-2">
              <div className="flex justify-between">
                <span className="text-taupe">Guest Name:</span>
                <span className="font-bold text-espresso">{selectedAppt.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-taupe">Phone:</span>
                <span className="font-mono text-espresso">{selectedAppt.customer_phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-taupe">Master Stylist:</span>
                <span className="font-bold text-espresso">{selectedAppt.stylist_name} ({selectedAppt.stylist_title})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-taupe">Scheduled Date:</span>
                <span className="font-medium text-espresso">{selectedAppt.appointment_date} at {selectedAppt.start_time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-taupe">Payment Status:</span>
                <Badge variant={selectedAppt.payment_status === 'paid' ? 'confirmed' : 'pending'}>
                  {selectedAppt.payment_status}
                </Badge>
              </div>
              <div className="flex justify-between border-t border-[#E5D2B8] pt-2">
                <span className="text-taupe font-semibold">Total Amount:</span>
                <span className="font-serif font-bold text-base text-espresso">
                  ₹{parseFloat(selectedAppt.total_amount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Quick Status Transition Actions */}
            <div className="space-y-2 pt-2">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-charcoal">Update Appointment Status:</p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => statusMutation.mutate({ id: selectedAppt.id, status: 'checked_in' })}
                >
                  Check In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => statusMutation.mutate({ id: selectedAppt.id, status: 'in_service' })}
                >
                  In Service
                </Button>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => statusMutation.mutate({ id: selectedAppt.id, status: 'completed' })}
                >
                  Completed
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

