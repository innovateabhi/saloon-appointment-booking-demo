import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { toast } from 'sonner';
import {
  Scissors,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Gift,
  Download,
  Check
} from 'lucide-react';

export const BookingWizardPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Wizard Step State (1 to 7)
  const [currentStep, setCurrentStep] = useState(1);

  // Booking Data State
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState(null); // null = Any Available
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Client Details State
  const [clientDetails, setClientDetails] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    customer_notes: '',
    marketing_opt_in_email: true,
    marketing_opt_in_whatsapp: true,
  });

  // Coupon State
  const [couponCode, setCouponCode] = useState(searchParams.get('coupon') || '');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Sync user details if logged in
  useEffect(() => {
    if (user) {
      setClientDetails(prev => ({
        ...prev,
        first_name: user.first_name || prev.first_name,
        last_name: user.last_name || prev.last_name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  // Fetch Services
  const { data: allServices = [], isLoading: srvLoading } = useQuery({
    queryKey: ['public-services'],
    queryFn: () => api.get('/public/services').then((res) => res.data),
  });

  // Fetch Stylists
  const { data: allStylists = [], isLoading: staffLoading } = useQuery({
    queryKey: ['public-staff'],
    queryFn: () => api.get('/public/staff').then((res) => res.data),
  });

  // Pre-select service from URL query param if present
  useEffect(() => {
    const sId = searchParams.get('service');
    if (sId && allServices.length > 0) {
      const found = allServices.find(s => s.id === parseInt(sId));
      if (found && !selectedServices.some(s => s.id === found.id)) {
        setSelectedServices([found]);
      }
    }
  }, [searchParams, allServices]);

  // Pre-select stylist from URL if present
  useEffect(() => {
    const stId = searchParams.get('staff_id');
    if (stId) {
      setSelectedStaffId(parseInt(stId));
    }
  }, [searchParams]);

  // Fetch Available Slots dynamically
  const serviceIdsParam = selectedServices.map(s => s.id).join(',');
  const { data: availableSlots = [], isLoading: slotsLoading, refetch: refetchSlots } = useQuery({
    queryKey: ['slots', selectedDate, serviceIdsParam, selectedStaffId],
    queryFn: () => {
      if (!selectedDate || selectedServices.length === 0) return [];
      const params = new URLSearchParams();
      params.append('date', selectedDate);
      params.append('services', serviceIdsParam);
      if (selectedStaffId) params.append('staff_id', selectedStaffId);
      return api.get(`/public/availability?${params.toString()}`).then((res) => res.data);
    },
    enabled: selectedServices.length > 0 && !!selectedDate,
  });

  // Calculation helpers
  const totalDuration = selectedServices.reduce((sum, s) => sum + parseInt(s.duration_minutes), 0);
  const subtotal = selectedServices.reduce((sum, s) => sum + parseFloat(s.price), 0);
  const discountAmount = appliedCoupon ? appliedCoupon.discount_amount : 0.00;
  const taxable = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(taxable * 0.18 * 100) / 100;
  const grandTotal = Math.round((taxable + taxAmount) * 100) / 100;

  // Toggle service in basket
  const toggleService = (srv) => {
    const exists = selectedServices.some(s => s.id === srv.id);
    if (exists) {
      setSelectedServices(selectedServices.filter(s => s.id !== srv.id));
    } else {
      setSelectedServices([...selectedServices, srv]);
    }
    setSelectedSlot(null); // Reset chosen slot on service change
  };

  // Validate Coupon
  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setValidatingCoupon(true);
    try {
      const res = await api.post('/marketing/validate-coupon', {
        code: couponCode,
        subtotal: subtotal,
      });
      setAppliedCoupon(res.data);
      toast.success(`Coupon ${res.data.code} applied! Saved ₹${res.data.discount_amount}`);
    } catch (err) {
      setAppliedCoupon(null);
      toast.error(err.message || 'Invalid coupon code');
    } finally {
      setValidatingCoupon(false);
    }
  };

  // Final Submit Booking
  const handleConfirmBooking = async () => {
    if (selectedServices.length === 0 || !selectedDate || !selectedSlot) {
      toast.error('Please complete all booking steps.');
      return;
    }

    if (!clientDetails.first_name || !clientDetails.phone) {
      toast.error('Please provide your name and contact phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        service_ids: selectedServices.map(s => s.id),
        staff_id: selectedSlot.stylist?.id || selectedStaffId,
        appointment_date: selectedDate,
        start_time: selectedSlot.time_raw,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        first_name: clientDetails.first_name,
        last_name: clientDetails.last_name,
        email: clientDetails.email,
        phone: clientDetails.phone,
        customer_notes: clientDetails.customer_notes,
        marketing_opt_in_email: clientDetails.marketing_opt_in_email,
        marketing_opt_in_whatsapp: clientDetails.marketing_opt_in_whatsapp,
      };

      const res = await api.post('/bookings', payload);
      setConfirmedBooking(res.data);
      setCurrentStep(7); // Jump to confirmation
      toast.success('Your reservation has been confirmed!');
    } catch (err) {
      toast.error(err.message || 'Booking submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Download ICS Calendar File
  const handleDownloadCalendar = () => {
    if (!confirmedBooking) return;
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Aurelia Luxury Salon//Booking//EN
BEGIN:VEVENT
SUMMARY:AURELIA Salon: ${confirmedBooking.stylist_name}
DESCRIPTION:Treatments: ${confirmedBooking.services?.map(s => s.name).join(', ')}. Reference: ${confirmedBooking.booking_reference}
LOCATION:42 Royale Boulevard, Indiranagar, Bengaluru
DTSTART:${confirmedBooking.appointment_date.replace(/-/g, '')}T${confirmedBooking.start_time.replace(/:/g, '')}
DTEND:${confirmedBooking.appointment_date.replace(/-/g, '')}T${confirmedBooking.end_time.replace(/:/g, '')}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `Aurelia_${confirmedBooking.booking_reference}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="py-8 md:py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Wizard Step Bar */}
      {currentStep < 7 && (
        <div className="space-y-4 text-center">
          <Badge variant="gold">Bespoke Atelier Booking</Badge>
          <h1 className="font-serif text-3xl sm:text-4xl text-espresso">
            {currentStep === 1 && 'Step 1: Select Desired Treatments'}
            {currentStep === 2 && 'Step 2: Choose Your Master Stylist'}
            {currentStep === 3 && 'Step 3: Pick Date & Time Slot'}
            {currentStep === 4 && 'Step 4: Confirm Timing & Capacity'}
            {currentStep === 5 && 'Step 5: Client Details & Preferences'}
            {currentStep === 6 && 'Step 6: Review & Finalize Reservation'}
          </h1>

          {/* Stepper Progress Indicators */}
          <div className="flex items-center justify-center gap-2 max-w-md mx-auto pt-2">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  s === currentStep
                    ? 'bg-gold'
                    : s < currentStep
                    ? 'bg-espresso'
                    : 'bg-[#E5D2B8]/60'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Wizard Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Interactive Column (Step Content) */}
        <div className={currentStep === 7 ? 'lg:col-span-3' : 'lg:col-span-2 space-y-6'}>
          
          {/* STEP 1: Select Treatments */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-taupe">
                You may select multiple treatments for a sequential luxury experience.
              </p>
              {srvLoading ? (
                <div className="py-12 text-center"><Spinner /></div>
              ) : (
                <div className="space-y-3 max-h-[550px] overflow-y-auto pr-2">
                  {allServices.map((srv) => {
                    const isSelected = selectedServices.some(s => s.id === srv.id);
                    return (
                      <div
                        key={srv.id}
                        onClick={() => toggleService(srv)}
                        className={`p-4 rounded-sm border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-gold/10 border-gold shadow-sm'
                            : 'bg-white border-[#E5D2B8] hover:border-gold/60'
                        }`}
                      >
                        <div className="space-y-1 pr-4">
                          <span className="text-[9px] uppercase tracking-wider text-gold font-semibold">
                            {srv.category_name}
                          </span>
                          <h4 className="font-serif font-bold text-base text-espresso">
                            {srv.name}
                          </h4>
                          <p className="text-xs text-taupe line-clamp-1">{srv.description}</p>
                          <span className="text-[11px] text-taupe flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3 text-gold" /> {srv.duration_minutes} mins
                          </span>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-serif font-bold text-lg text-espresso block">
                            ₹{parseFloat(srv.price).toLocaleString('en-IN')}
                          </span>
                          <span className={`inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm ${
                            isSelected ? 'bg-gold text-white' : 'border border-[#E5D2B8] text-taupe'
                          }`}>
                            {isSelected ? 'Selected' : '+ Add'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <Button
                  variant="gold"
                  size="md"
                  disabled={selectedServices.length === 0}
                  onClick={() => setCurrentStep(2)}
                  icon={ArrowRight}
                >
                  Continue to Stylist ({selectedServices.length})
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Select Stylist */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <p className="text-xs text-taupe">
                Choose a dedicated master artist or select <em>Any Available Stylist</em> for maximum scheduling flexibility.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Option: Any Available */}
                <div
                  onClick={() => setSelectedStaffId(null)}
                  className={`p-5 rounded-sm border cursor-pointer transition-all ${
                    selectedStaffId === null
                      ? 'bg-gold/10 border-gold shadow-sm ring-1 ring-gold'
                      : 'bg-white border-[#E5D2B8] hover:border-gold/60'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-cream border border-gold/40 flex items-center justify-center text-gold mb-3">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif font-bold text-lg text-espresso">Any Available Artist</h4>
                  <p className="text-xs text-taupe mt-1">
                    Assigns the earliest available certified stylist on your requested date.
                  </p>
                </div>

                {/* Individual Stylists */}
                {allStylists.map((st) => {
                  const isSelected = selectedStaffId === st.id;
                  return (
                    <div
                      key={st.id}
                      onClick={() => setSelectedStaffId(st.id)}
                      className={`p-5 rounded-sm border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-gold/10 border-gold shadow-sm ring-1 ring-gold'
                          : 'bg-white border-[#E5D2B8] hover:border-gold/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 rounded-full bg-espresso text-gold flex items-center justify-center font-serif font-bold text-sm">
                          {st.first_name[0]}
                        </div>
                        <span className="text-[11px] text-gold font-medium">★ {st.rating_avg}</span>
                      </div>
                      <h4 className="font-serif font-bold text-lg text-espresso">{st.first_name} {st.last_name}</h4>
                      <p className="text-[11px] text-taupe mt-0.5">{st.title}</p>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="ghost" size="md" onClick={() => setCurrentStep(1)} icon={ArrowLeft}>
                  Back
                </Button>
                <Button variant="gold" size="md" onClick={() => setCurrentStep(3)} icon={ArrowRight}>
                  Select Date & Time
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3 & 4: Date & Smart Slot Selection */}
          {(currentStep === 3 || currentStep === 4) && (
            <div className="space-y-6">
              {/* Date Input with Quick Shortcuts */}
              <div className="space-y-3">
                <label className="block text-xs uppercase tracking-wider font-semibold text-charcoal">
                  Appointment Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSlot(null);
                  }}
                  className="w-full bg-white border border-[#E5D2B8] rounded-sm p-3 text-xs text-espresso focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                />

                {/* Quick Date Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                  {[-1, 0, 1, 2, 3, 4].map((offset) => {
                    if (offset < 0) return null;
                    const d = new Date();
                    d.setDate(d.getDate() + offset);
                    const iso = d.toISOString().split('T')[0];
                    const label = offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                    return (
                      <button
                        key={offset}
                        type="button"
                        onClick={() => {
                          setSelectedDate(iso);
                          setSelectedSlot(null);
                        }}
                        className={`px-3 py-1.5 rounded-sm border whitespace-nowrap transition-colors ${
                          selectedDate === iso
                            ? 'bg-espresso text-ivory border-espresso font-semibold'
                            : 'bg-white border-[#E5D2B8] text-espresso hover:border-gold'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slot Picker */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-charcoal">
                    Available Atelier Slots ({selectedDate})
                  </label>
                  <span className="text-[11px] text-taupe">Total treatment: {totalDuration} mins</span>
                </div>

                {slotsLoading ? (
                  <div className="py-12 text-center bg-white border border-[#E5D2B8] p-6 rounded-sm">
                    <Spinner size="md" />
                    <p className="text-xs uppercase tracking-widest text-taupe mt-2">Checking Stylist Schedules...</p>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="p-8 text-center bg-white border border-[#E5D2B8] rounded-sm space-y-2">
                    <p className="font-serif text-lg text-espresso">No available slots for this date</p>
                    <p className="text-xs text-taupe">All stylists are fully booked or the salon is closed. Please select another date.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
                    {availableSlots.map((slot, idx) => {
                      const isChosen = selectedSlot?.time_raw === slot.time_raw;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-3 text-center rounded-sm border transition-all text-xs font-semibold ${
                            isChosen
                              ? 'bg-gold text-white border-gold shadow-sm ring-2 ring-gold/40'
                              : 'bg-white text-espresso border-[#E5D2B8] hover:border-gold hover:bg-gold/10'
                          }`}
                        >
                          <span className="block font-mono text-sm">{slot.time}</span>
                          <span className="block text-[10px] font-normal opacity-80 truncate mt-0.5">
                            {slot.stylist?.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="ghost" size="md" onClick={() => setCurrentStep(2)} icon={ArrowLeft}>
                  Back
                </Button>
                <Button
                  variant="gold"
                  size="md"
                  disabled={!selectedSlot}
                  onClick={() => setCurrentStep(5)}
                  icon={ArrowRight}
                >
                  Enter Client Details
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: Client Information */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <p className="text-xs text-taupe">
                Provide your contact details to receive instant reservation confirmation and calendar invites.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={clientDetails.first_name}
                    onChange={(e) => setClientDetails({ ...clientDetails, first_name: e.target.value })}
                    placeholder="Eleanor"
                    required
                  />
                  <Input
                    label="Last Name"
                    value={clientDetails.last_name}
                    onChange={(e) => setClientDetails({ ...clientDetails, last_name: e.target.value })}
                    placeholder="Vane"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Contact Phone"
                    type="tel"
                    value={clientDetails.phone}
                    onChange={(e) => setClientDetails({ ...clientDetails, phone: e.target.value })}
                    placeholder="+91 98765 00000"
                    required
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    value={clientDetails.email}
                    onChange={(e) => setClientDetails({ ...clientDetails, email: e.target.value })}
                    placeholder="eleanor@luxury.test"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-medium uppercase tracking-wider text-charcoal/80">
                    Consultation Notes / Allergies (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={clientDetails.customer_notes}
                    onChange={(e) => setClientDetails({ ...clientDetails, customer_notes: e.target.value })}
                    placeholder="E.g., sensitive scalp, allergic to lavender, preferred beverage..."
                    className="w-full bg-white border border-[#E5D2B8] rounded-sm p-3 text-xs text-espresso focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                  />
                </div>

                <div className="pt-2 space-y-2">
                  <label className="flex items-center gap-2 text-xs text-taupe cursor-pointer">
                    <input
                      type="checkbox"
                      checked={clientDetails.marketing_opt_in_whatsapp}
                      onChange={(e) => setClientDetails({ ...clientDetails, marketing_opt_in_whatsapp: e.target.checked })}
                      className="rounded border-[#E5D2B8] text-gold focus:ring-gold"
                    />
                    <span>Receive instant WhatsApp appointment confirmation & concierge reminders.</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="ghost" size="md" onClick={() => setCurrentStep(4)} icon={ArrowLeft}>
                  Back
                </Button>
                <Button
                  variant="gold"
                  size="md"
                  disabled={!clientDetails.first_name || !clientDetails.phone}
                  onClick={() => setCurrentStep(6)}
                  icon={ArrowRight}
                >
                  Review Summary
                </Button>
              </div>
            </div>
          )}

          {/* STEP 6: Review Summary & Submit */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <Card className="p-6 border border-[#E5D2B8] space-y-4">
                <h3 className="font-serif text-2xl font-semibold text-espresso">
                  Reservation Review
                </h3>

                <div className="divide-y divide-[#F1EAE1] text-xs">
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-taupe">Date & Time</span>
                    <span className="font-medium text-espresso">
                      {selectedDate} at {selectedSlot?.time}
                    </span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-taupe">Master Stylist</span>
                    <span className="font-medium text-espresso">
                      {selectedSlot?.stylist?.name || 'Any Certified Artist'}
                    </span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-taupe">Guest Name</span>
                    <span className="font-medium text-espresso">
                      {clientDetails.first_name} {clientDetails.last_name}
                    </span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-taupe">Contact</span>
                    <span className="font-medium text-espresso">{clientDetails.phone}</span>
                  </div>
                </div>

                {/* Promo Code Input */}
                <div className="pt-2">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-charcoal mb-1.5">
                    Have a Privilege Promo Code?
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="E.g. AURELIA10"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 bg-white border border-[#E5D2B8] rounded-sm px-3.5 py-2 text-xs uppercase tracking-wider focus:outline-none focus:border-gold"
                    />
                    <Button variant="outline" size="sm" onClick={handleApplyCoupon} isLoading={validatingCoupon}>
                      Apply Code
                    </Button>
                  </div>
                  {appliedCoupon && (
                    <p className="text-[11px] text-status-success font-medium mt-1.5 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> {appliedCoupon.title} applied (-₹{appliedCoupon.discount_amount})
                    </p>
                  )}
                </div>
              </Card>

              <div className="pt-4 flex justify-between">
                <Button variant="ghost" size="md" onClick={() => setCurrentStep(5)} icon={ArrowLeft}>
                  Back
                </Button>
                <Button
                  variant="gold"
                  size="lg"
                  onClick={handleConfirmBooking}
                  isLoading={isSubmitting}
                >
                  Confirm & Lock Reservation
                </Button>
              </div>
            </div>
          )}

          {/* STEP 7: Instant Confirmation */}
          {currentStep === 7 && confirmedBooking && (
            <Card className="p-8 sm:p-12 border border-gold/60 shadow-luxury text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-status-success mx-auto flex items-center justify-center border border-status-success/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <Badge variant="gold">Reservation Confirmed</Badge>
                <h2 className="font-serif text-3xl sm:text-4xl text-espresso">
                  We Look Forward to Welcoming You
                </h2>
                <p className="text-xs text-taupe max-w-md mx-auto">
                  Your atelier reservation is registered with our concierge team. A confirmation summary has been logged.
                </p>
              </div>

              <div className="p-6 bg-cream/40 border border-[#E5D2B8] rounded-sm max-w-md mx-auto text-left space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#F1EAE1]">
                  <span className="text-taupe uppercase tracking-wider text-[10px]">Reference Code</span>
                  <span className="font-mono font-bold text-espresso text-sm">{confirmedBooking.booking_reference}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-taupe">Date & Time:</span>
                  <span className="font-semibold text-espresso">{confirmedBooking.appointment_date} at {confirmedBooking.start_time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-taupe">Master Stylist:</span>
                  <span className="font-semibold text-espresso">{confirmedBooking.stylist_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-taupe">Total Amount:</span>
                  <span className="font-serif font-bold text-sm text-espresso">₹{parseFloat(confirmedBooking.total_amount).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button variant="outline" size="md" icon={Download} onClick={handleDownloadCalendar}>
                  Add to Calendar (ICS)
                </Button>
                {isAuthenticated ? (
                  <Link to="/customer/appointments">
                    <Button variant="gold" size="md">
                      Go to My Appointments
                    </Button>
                  </Link>
                ) : (
                  <Link to="/">
                    <Button variant="gold" size="md">
                      Return to Homepage
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          )}

        </div>

        {/* Right Sticky Basket Summary (Steps 1-6) */}
        {currentStep < 7 && (
          <div className="lg:col-span-1 sticky top-24">
            <Card className="p-6 border border-[#E5D2B8] bg-white shadow-sm space-y-5">
              <h4 className="font-serif text-lg font-bold text-espresso border-b border-[#F1EAE1] pb-3">
                Reservation Basket
              </h4>

              {selectedServices.length === 0 ? (
                <p className="text-xs text-taupe italic">No treatments selected yet.</p>
              ) : (
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {selectedServices.map((srv) => (
                    <div key={srv.id} className="flex items-center justify-between text-xs pb-2 border-b border-[#F1EAE1]/60">
                      <div>
                        <p className="font-semibold text-espresso">{srv.name}</p>
                        <p className="text-[10px] text-taupe">{srv.duration_minutes} mins</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-espresso">₹{parseFloat(srv.price).toLocaleString('en-IN')}</span>
                        {currentStep === 1 && (
                          <button onClick={() => toggleService(srv)} className="text-taupe hover:text-status-error p-0.5">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Running Duration & Totals */}
              <div className="pt-2 border-t border-[#F1EAE1] space-y-2 text-xs">
                <div className="flex items-center justify-between text-taupe">
                  <span>Total Duration</span>
                  <span className="font-medium text-espresso">{totalDuration} mins</span>
                </div>
                <div className="flex items-center justify-between text-taupe">
                  <span>Subtotal</span>
                  <span className="font-medium text-espresso">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex items-center justify-between text-status-success font-medium">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-taupe">
                  <span>Taxes (18% GST)</span>
                  <span className="font-medium text-espresso">₹{taxAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#F1EAE1] text-sm">
                  <span className="font-bold text-espresso">Estimated Total</span>
                  <span className="font-serif font-bold text-xl text-espresso">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {selectedSlot && (
                <div className="p-3 bg-cream/40 rounded-sm text-xs text-taupe space-y-1">
                  <p><strong className="text-espresso">Time:</strong> {selectedDate} at {selectedSlot.time}</p>
                  <p><strong className="text-espresso">Artist:</strong> {selectedSlot.stylist?.name}</p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

