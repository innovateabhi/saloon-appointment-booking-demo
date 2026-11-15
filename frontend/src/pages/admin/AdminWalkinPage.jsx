import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { toast } from 'sonner';
import { Scissors, PlusCircle, CheckCircle, Clock } from 'lucide-react';

export const AdminWalkinPage = () => {
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [staffId, setStaffId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch services
  const { data: services = [] } = useQuery({
    queryKey: ['admin-services-list'],
    queryFn: () => api.get('/admin/services').then(res => res.data),
  });

  // Fetch stylists
  const { data: stylists = [] } = useQuery({
    queryKey: ['admin-staff-list'],
    queryFn: () => api.get('/admin/staff').then(res => res.data),
  });

  const toggleService = (srv) => {
    if (selectedServices.some(s => s.id === srv.id)) {
      setSelectedServices(selectedServices.filter(s => s.id !== srv.id));
    } else {
      setSelectedServices([...selectedServices, srv]);
    }
  };

  const totalDuration = selectedServices.reduce((sum, s) => sum + parseInt(s.duration_minutes), 0);
  const subtotal = selectedServices.reduce((sum, s) => sum + parseFloat(s.price), 0);
  const tax = Math.round(subtotal * 0.18 * 100) / 100;
  const total = subtotal + tax;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName || !phone || selectedServices.length === 0) {
      toast.error('Please provide guest name, phone, and select at least one treatment.');
      return;
    }

    setIsSubmitting(true);
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const dateStr = now.toISOString().split('T')[0];

    try {
      const payload = {
        first_name: firstName,
        last_name: lastName || 'Guest',
        phone: phone,
        service_ids: selectedServices.map(s => s.id),
        staff_id: staffId ? parseInt(staffId) : null,
        appointment_date: dateStr,
        start_time: timeStr,
        source: 'walk_in',
      };

      const res = await api.post('/admin/appointments', payload);
      toast.success(`Walk-in booked! Reference: ${res.data.booking_reference}`);
      queryClient.invalidateQueries(['admin-appointments']);
      queryClient.invalidateQueries(['admin-dashboard']);

      // Reset form
      setFirstName('');
      setLastName('');
      setPhone('');
      setSelectedServices([]);
      setStaffId('');
    } catch (err) {
      toast.error(err.message || 'Failed to register walk-in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-espresso">Rapid Walk-In Terminal</h2>
        <p className="text-xs text-taupe mt-0.5">Register arrival, assign active chair, and initiate instant treatment</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Guest Info & Chair Assignment */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 border border-[#E5D2B8] space-y-4">
            <h4 className="font-serif text-lg font-bold text-espresso border-b border-[#F1EAE1] pb-2">
              Guest Identity
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Guest First Name"
                required
              />
              <Input
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Guest Last Name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 00000"
                required
              />

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-medium uppercase tracking-wider text-charcoal/80">
                  Assign Stylist / Chair
                </label>
                <select
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  className="w-full bg-white border border-[#E5D2B8] rounded-sm px-3.5 py-2.5 text-xs text-espresso focus:outline-none focus:border-gold"
                >
                  <option value="">Any Available Chair</option>
                  {stylists.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.first_name} {st.last_name} ({st.title})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Treatment Selection Grid */}
          <Card className="p-6 border border-[#E5D2B8] space-y-4">
            <h4 className="font-serif text-lg font-bold text-espresso border-b border-[#F1EAE1] pb-2">
              Select Treatments
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {services.map((srv) => {
                const isSelected = selectedServices.some(s => s.id === srv.id);
                return (
                  <div
                    key={srv.id}
                    onClick={() => toggleService(srv)}
                    className={`p-3 rounded-sm border cursor-pointer text-xs transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-gold/15 border-gold shadow-sm font-semibold'
                        : 'bg-white border-[#E5D2B8] hover:border-gold'
                    }`}
                  >
                    <div>
                      <p className="text-espresso">{srv.name}</p>
                      <p className="text-[10px] text-taupe">{srv.duration_minutes}m</p>
                    </div>
                    <span className="font-serif font-bold text-espresso">
                      ₹{parseFloat(srv.price).toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Bill Preview & Submit */}
        <div className="md:col-span-1 space-y-4">
          <Card className="p-6 border border-[#E5D2B8] space-y-4">
            <h4 className="font-serif text-lg font-bold text-espresso border-b border-[#F1EAE1] pb-2">
              Walk-in Bill
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-taupe">
                <span>Selected:</span>
                <span className="font-medium text-espresso">{selectedServices.length} items</span>
              </div>
              <div className="flex justify-between text-taupe">
                <span>Est. Duration:</span>
                <span className="font-medium text-espresso">{totalDuration} mins</span>
              </div>
              <div className="flex justify-between text-taupe">
                <span>Subtotal:</span>
                <span className="font-medium text-espresso">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-taupe">
                <span>Tax (18%):</span>
                <span className="font-medium text-espresso">₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#F1EAE1] text-sm">
                <span className="font-bold text-espresso">Total Due:</span>
                <span className="font-serif font-bold text-xl text-espresso">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <Button
              type="submit"
              variant="gold"
              size="lg"
              className="w-full mt-4"
              isLoading={isSubmitting}
            >
              Start Walk-In Service
            </Button>
          </Card>
        </div>
      </form>
    </div>
  );
};

