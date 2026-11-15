import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { toast } from 'sonner';
import {
  Settings,
  Save,
  Globe,
  Building,
  Clock,
  CalendarOff,
  ShieldAlert,
  Plus,
  Trash2,
  CheckCircle2,
  Sliders,
  DollarSign,
  Share2
} from 'lucide-react';

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

export const AdminSettingsPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'hours' | 'closures' | 'policies' | 'cms'

  // Master State from server
  const [salonData, setSalonData] = useState({
    name: 'AURELIA — Salon & Beauty Studio',
    phone: '+91 98765 43210',
    email: 'concierge@aureliasalon.com',
    address: '42 Crescent Avenue, Jubilee Hills',
    city: 'Hyderabad',
    state: 'Telangana',
    postal_code: '500033',
    timezone: 'Asia/Kolkata',
    currency_code: 'INR'
  });

  const [settingsMap, setSettingsMap] = useState({
    tagline: 'Luxury Hair, Skincare & Wellness Atelier',
    hero_title: 'Bespoke Beauty & Editorial Elegance',
    hero_subtitle: 'Experience artisanal hair couture, organic botanical facials, and tailored wellness rituals curated by master artists.',
    about_narrative: 'AURELIA was established to elevate personal care into an art form. Rooted in timeless European aesthetic sensibilities and enriched with organic botanical formulations.',
    booking_notice_hours: '2',
    booking_horizon_days: '60',
    cancellation_cutoff_hours: '4',
    tax_percentage: '18',
    allow_guest_booking: '1',
    cancellation_policy: 'Appointments may be rescheduled or cancelled up to 4 hours in advance at zero charge. Late cancellations or unattended sessions forfeit loyalty points and may require an advance deposit for future reservations.',
    booking_policy: 'Please arrive 10 minutes prior to your bespoke session to enjoy a complimentary herbal infusion. All appointments carry a 15-minute grace period.',
    instagram_url: 'https://instagram.com/aurelia.salon',
    facebook_url: 'https://facebook.com/aurelia.salon',
    whatsapp_phone: '+919876543210'
  });

  const [businessHours, setBusinessHours] = useState([]);
  const [closures, setClosures] = useState([]);

  // New Closure Modal State
  const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);
  const [newClosure, setNewClosure] = useState({
    closure_date: '',
    reason: '',
    is_full_day: 1,
    start_time: '09:00:00',
    end_time: '20:00:00'
  });

  // Query full settings
  const { data: fullSettings, isLoading } = useQuery({
    queryKey: ['admin-full-settings'],
    queryFn: () => api.get('/admin/settings/full').then(res => res.data),
  });

  useEffect(() => {
    if (fullSettings) {
      if (fullSettings.salon) {
        setSalonData(prev => ({ ...prev, ...fullSettings.salon }));
      }
      if (fullSettings.settings) {
        setSettingsMap(prev => ({ ...prev, ...fullSettings.settings }));
      }
      if (fullSettings.business_hours && Array.isArray(fullSettings.business_hours)) {
        setBusinessHours(fullSettings.business_hours);
      }
      if (fullSettings.closures && Array.isArray(fullSettings.closures)) {
        setClosures(fullSettings.closures);
      }
    }
  }, [fullSettings]);

  // Save Full Settings Mutation
  const saveMutation = useMutation({
    mutationFn: (payload) => api.put('/admin/settings/full', payload),
    onSuccess: () => {
      toast.success('Studio configuration and policies published live!');
      queryClient.invalidateQueries(['admin-full-settings']);
      queryClient.invalidateQueries(['public-salon']);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to save settings.');
    }
  });

  // Add Closure Mutation
  const addClosureMutation = useMutation({
    mutationFn: (closure) => api.post('/admin/settings/closures', closure),
    onSuccess: () => {
      toast.success('Studio holiday closure added.');
      setIsClosureModalOpen(false);
      setNewClosure({
        closure_date: '',
        reason: '',
        is_full_day: 1,
        start_time: '09:00:00',
        end_time: '20:00:00'
      });
      queryClient.invalidateQueries(['admin-full-settings']);
    },
    onError: (err) => toast.error(err.message || 'Failed to add closure')
  });

  // Delete Closure Mutation
  const deleteClosureMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/settings/closures/${id}`),
    onSuccess: () => {
      toast.success('Closure removed.');
      queryClient.invalidateQueries(['admin-full-settings']);
    },
    onError: (err) => toast.error(err.message || 'Failed to delete closure')
  });

  const handleHourToggle = (dow) => {
    setBusinessHours(prev =>
      prev.map(h => (h.day_of_week === dow ? { ...h, is_open: h.is_open ? 0 : 1 } : h))
    );
  };

  const handleHourChange = (dow, field, value) => {
    setBusinessHours(prev =>
      prev.map(h => (h.day_of_week === dow ? { ...h, [field]: value } : h))
    );
  };

  const handleSubmitAll = (e) => {
    e.preventDefault();
    saveMutation.mutate({
      salon: salonData,
      settings: settingsMap,
      business_hours: businessHours
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-espresso">Studio Settings & Brand Administration</h2>
          <p className="text-xs text-taupe mt-0.5">Control salon identity, weekly operating hours, holiday closures, policies, and website CMS</p>
        </div>

        <Button
          type="button"
          variant="gold"
          size="sm"
          icon={Save}
          isLoading={saveMutation.isPending}
          onClick={handleSubmitAll}
        >
          Publish All Changes
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E5D2B8] gap-4 overflow-x-auto pb-px">
        {[
          { key: 'profile', label: 'Salon Profile & Contact', icon: Building },
          { key: 'hours', label: 'Operating Schedule', icon: Clock },
          { key: 'closures', label: 'Holiday Closures', icon: CalendarOff },
          { key: 'policies', label: 'Booking & Policies', icon: ShieldAlert },
          { key: 'cms', label: 'Website CMS & Social', icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-gold text-espresso font-semibold bg-champagne/15'
                  : 'border-transparent text-taupe hover:text-espresso'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-gold' : 'text-taupe'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="py-20 text-center"><Spinner size="lg" /></div>
      ) : (
        <form onSubmit={handleSubmitAll} className="space-y-6">
          {/* TAB 1: SALON PROFILE & CONTACT */}
          {activeTab === 'profile' && (
            <Card className="p-6 border border-[#E5D2B8] space-y-5 bg-white">
              <h3 className="font-serif text-lg font-semibold text-espresso border-b border-[#F1EAE1] pb-2 flex items-center gap-2">
                <Building className="w-5 h-5 text-gold" /> Salon Business & Atelier Contact
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Studio Legal Name"
                  value={salonData.name || ''}
                  onChange={(e) => setSalonData({ ...salonData, name: e.target.value })}
                  required
                />
                <Input
                  label="Brand Tagline"
                  value={settingsMap.tagline || ''}
                  onChange={(e) => setSettingsMap({ ...settingsMap, tagline: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Concierge Phone"
                  value={salonData.phone || ''}
                  onChange={(e) => setSalonData({ ...salonData, phone: e.target.value })}
                  required
                />
                <Input
                  label="Official Email"
                  type="email"
                  value={salonData.email || ''}
                  onChange={(e) => setSalonData({ ...salonData, email: e.target.value })}
                  required
                />
              </div>

              <Input
                label="Physical Atelier Street Address"
                value={salonData.address || ''}
                onChange={(e) => setSalonData({ ...salonData, address: e.target.value })}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="City"
                  value={salonData.city || ''}
                  onChange={(e) => setSalonData({ ...salonData, city: e.target.value })}
                  required
                />
                <Input
                  label="State / Province"
                  value={salonData.state || ''}
                  onChange={(e) => setSalonData({ ...salonData, state: e.target.value })}
                  required
                />
                <Input
                  label="PIN / Postal Code"
                  value={salonData.postal_code || ''}
                  onChange={(e) => setSalonData({ ...salonData, postal_code: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#F1EAE1]">
                <Input
                  label="Timezone"
                  value={salonData.timezone || 'Asia/Kolkata'}
                  onChange={(e) => setSalonData({ ...salonData, timezone: e.target.value })}
                />
                <Input
                  label="Currency (Code)"
                  value={salonData.currency || salonData.currency_code || 'INR'}
                  disabled
                  helperText="Default currency symbol is ₹ (INR)"
                />
              </div>
            </Card>
          )}

          {/* TAB 2: OPERATING SCHEDULE */}
          {activeTab === 'hours' && (
            <Card className="p-6 border border-[#E5D2B8] space-y-5 bg-white">
              <div>
                <h3 className="font-serif text-lg font-semibold text-espresso flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gold" /> Weekly Business Hours & Slot Window
                </h3>
                <p className="text-xs text-taupe mt-1">Configure open days and service window. Unchecked days will show as Closed on the public booking engine.</p>
              </div>

              <div className="border border-[#E5D2B8] rounded-sm divide-y divide-[#F1EAE1] overflow-hidden">
                {businessHours.map((h) => {
                  const dayName = DAYS_OF_WEEK[h.day_of_week] || `Day ${h.day_of_week}`;
                  const isOpen = Number(h.is_open) === 1;
                  return (
                    <div key={h.day_of_week} className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${isOpen ? 'bg-white' : 'bg-gray-50/70'}`}>
                      <div className="flex items-center gap-3 w-40">
                        <input
                          type="checkbox"
                          id={`day-${h.day_of_week}`}
                          checked={isOpen}
                          onChange={() => handleHourToggle(h.day_of_week)}
                          className="w-4 h-4 text-gold rounded border-gray-300 focus:ring-gold"
                        />
                        <label htmlFor={`day-${h.day_of_week}`} className="text-sm font-semibold text-espresso cursor-pointer select-none">
                          {dayName}
                        </label>
                      </div>

                      {isOpen ? (
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <div className="flex items-center gap-1.5 text-xs text-taupe">
                            <span>Opens:</span>
                            <input
                              type="time"
                              value={h.open_time.slice(0, 5)}
                              onChange={(e) => handleHourChange(h.day_of_week, 'open_time', `${e.target.value}:00`)}
                              className="bg-white border border-[#E5D2B8] rounded-xs px-2 py-1 text-xs text-espresso font-mono focus:outline-none focus:border-gold"
                            />
                          </div>

                          <span className="text-taupe">—</span>

                          <div className="flex items-center gap-1.5 text-xs text-taupe">
                            <span>Closes:</span>
                            <input
                              type="time"
                              value={h.close_time.slice(0, 5)}
                              onChange={(e) => handleHourChange(h.day_of_week, 'close_time', `${e.target.value}:00`)}
                              className="bg-white border border-[#E5D2B8] rounded-xs px-2 py-1 text-xs text-espresso font-mono focus:outline-none focus:border-gold"
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold uppercase tracking-wider text-taupe/80 bg-gray-100 px-3 py-1 rounded-xs">
                          Studio Closed
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* TAB 3: HOLIDAY CLOSURES */}
          {activeTab === 'closures' && (
            <Card className="p-6 border border-[#E5D2B8] space-y-5 bg-white">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-espresso flex items-center gap-2">
                    <CalendarOff className="w-5 h-5 text-gold" /> Special Studio Closures & Holidays
                  </h3>
                  <p className="text-xs text-taupe mt-0.5">Dates where the salon is closed for maintenance, festive holidays, or private atelier events</p>
                </div>

                <Button
                  type="button"
                  variant="gold"
                  size="xs"
                  icon={Plus}
                  onClick={() => setIsClosureModalOpen(true)}
                >
                  Schedule Holiday Closure
                </Button>
              </div>

              {closures.length === 0 ? (
                <div className="p-10 text-center border border-dashed border-[#E5D2B8] rounded-sm">
                  <CalendarOff className="w-8 h-8 text-gold/60 mx-auto mb-2" />
                  <p className="text-sm font-medium text-espresso">No upcoming studio closures scheduled.</p>
                  <p className="text-xs text-taupe mt-0.5">Add holidays or maintenance days to block out client bookings.</p>
                </div>
              ) : (
                <div className="border border-[#E5D2B8] rounded-sm divide-y divide-[#F1EAE1] overflow-hidden">
                  {closures.map((closure) => (
                    <div key={closure.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[#FDFBF7] transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-espresso bg-champagne/30 px-2 py-0.5 rounded-xs border border-gold/30">
                            {closure.closure_date}
                          </span>
                          <span className="font-serif font-semibold text-espresso text-sm">{closure.reason}</span>
                        </div>
                        <p className="text-[11px] text-taupe">
                          {Number(closure.is_full_day) === 1 ? 'All-Day Full Closure' : `Partial Closure (${closure.start_time} - ${closure.end_time})`}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete holiday closure on ${closure.closure_date}?`)) {
                            deleteClosureMutation.mutate(closure.id);
                          }
                        }}
                        className="text-taupe hover:text-rose-600 transition-colors p-2"
                        title="Delete Closure"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* TAB 4: BOOKING & CANCELLATION POLICIES */}
          {activeTab === 'policies' && (
            <Card className="p-6 border border-[#E5D2B8] space-y-5 bg-white">
              <h3 className="font-serif text-lg font-semibold text-espresso border-b border-[#F1EAE1] pb-2 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-gold" /> Booking Windows, Tax & Cancellation Protocol
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Advance Notice Required (Hours)"
                  type="number"
                  value={settingsMap.booking_notice_hours || '2'}
                  onChange={(e) => setSettingsMap({ ...settingsMap, booking_notice_hours: e.target.value })}
                  helperText="Minimum lead time clients must book before slot"
                />
                <Input
                  label="Booking Horizon (Days)"
                  type="number"
                  value={settingsMap.booking_horizon_days || '60'}
                  onChange={(e) => setSettingsMap({ ...settingsMap, booking_horizon_days: e.target.value })}
                  helperText="How many days in advance slots can be booked"
                />
                <Input
                  label="Cancellation Cutoff (Hours)"
                  type="number"
                  value={settingsMap.cancellation_cutoff_hours || '4'}
                  onChange={(e) => setSettingsMap({ ...settingsMap, cancellation_cutoff_hours: e.target.value })}
                  helperText="Free cancellation cutoff prior to start time"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#F1EAE1]">
                <Input
                  label="Standard GST / Tax Rate (%)"
                  type="number"
                  step="0.5"
                  value={settingsMap.tax_percentage || '18'}
                  onChange={(e) => setSettingsMap({ ...settingsMap, tax_percentage: e.target.value })}
                  helperText="Calculated automatically on subtotal during checkout"
                />

                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-medium uppercase tracking-wider text-charcoal">
                    Allow Guest / Walk-in Booking
                  </label>
                  <select
                    value={settingsMap.allow_guest_booking || '1'}
                    onChange={(e) => setSettingsMap({ ...settingsMap, allow_guest_booking: e.target.value })}
                    className="w-full bg-white border border-[#E5D2B8] rounded-sm p-2 text-xs text-espresso focus:outline-none focus:border-gold"
                  >
                    <option value="1">Enabled (Guests can reserve with Phone & Email)</option>
                    <option value="0">Disabled (Requires full registered account)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 text-left pt-2 border-t border-[#F1EAE1]">
                <label className="block text-xs font-medium uppercase tracking-wider text-charcoal">
                  Official Cancellation & Rescheduling Policy (Publicly Displayed)
                </label>
                <textarea
                  rows={3}
                  value={settingsMap.cancellation_policy || ''}
                  onChange={(e) => setSettingsMap({ ...settingsMap, cancellation_policy: e.target.value })}
                  className="w-full bg-white border border-[#E5D2B8] rounded-sm p-3 text-xs text-espresso focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-medium uppercase tracking-wider text-charcoal">
                  Studio Etiquette & Booking Protocol
                </label>
                <textarea
                  rows={3}
                  value={settingsMap.booking_policy || ''}
                  onChange={(e) => setSettingsMap({ ...settingsMap, booking_policy: e.target.value })}
                  className="w-full bg-white border border-[#E5D2B8] rounded-sm p-3 text-xs text-espresso focus:outline-none focus:border-gold"
                />
              </div>
            </Card>
          )}

          {/* TAB 5: WEBSITE CMS & SOCIAL */}
          {activeTab === 'cms' && (
            <Card className="p-6 border border-[#E5D2B8] space-y-5 bg-white">
              <h3 className="font-serif text-lg font-semibold text-espresso border-b border-[#F1EAE1] pb-2 flex items-center gap-2">
                <Globe className="w-5 h-5 text-gold" /> Public Website Headlines & Social Footprint
              </h3>

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-medium uppercase tracking-wider text-charcoal">
                  Homepage Hero Headline
                </label>
                <input
                  type="text"
                  value={settingsMap.hero_title || ''}
                  onChange={(e) => setSettingsMap({ ...settingsMap, hero_title: e.target.value })}
                  className="w-full bg-white border border-[#E5D2B8] rounded-sm p-2.5 text-xs text-espresso focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-medium uppercase tracking-wider text-charcoal">
                  Hero Subtitle Narrative
                </label>
                <textarea
                  rows={2}
                  value={settingsMap.hero_subtitle || ''}
                  onChange={(e) => setSettingsMap({ ...settingsMap, hero_subtitle: e.target.value })}
                  className="w-full bg-white border border-[#E5D2B8] rounded-sm p-2.5 text-xs text-espresso focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-medium uppercase tracking-wider text-charcoal">
                  About Atelier Brand Story
                </label>
                <textarea
                  rows={4}
                  value={settingsMap.about_narrative || ''}
                  onChange={(e) => setSettingsMap({ ...settingsMap, about_narrative: e.target.value })}
                  className="w-full bg-white border border-[#E5D2B8] rounded-sm p-3 text-xs text-espresso focus:outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#F1EAE1]">
                <Input
                  label="Instagram URL"
                  value={settingsMap.instagram_url || ''}
                  onChange={(e) => setSettingsMap({ ...settingsMap, instagram_url: e.target.value })}
                  placeholder="https://instagram.com/..."
                />
                <Input
                  label="Facebook Page URL"
                  value={settingsMap.facebook_url || ''}
                  onChange={(e) => setSettingsMap({ ...settingsMap, facebook_url: e.target.value })}
                  placeholder="https://facebook.com/..."
                />
                <Input
                  label="WhatsApp Helpline Number"
                  value={settingsMap.whatsapp_phone || ''}
                  onChange={(e) => setSettingsMap({ ...settingsMap, whatsapp_phone: e.target.value })}
                  placeholder="+919876543210"
                />
              </div>
            </Card>
          )}

          <div className="flex justify-end pt-4 border-t border-[#E5D2B8]">
            <Button
              type="submit"
              variant="gold"
              size="lg"
              icon={Save}
              isLoading={saveMutation.isPending}
            >
              Save & Publish Configuration
            </Button>
          </div>
        </form>
      )}

      {/* MODAL: ADD CLOSURE */}
      {isClosureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/60 backdrop-blur-xs p-4">
          <Card className="max-w-md w-full p-6 bg-white border border-[#E5D2B8] shadow-2xl relative">
            <h3 className="font-serif text-lg font-bold text-espresso border-b border-[#F1EAE1] pb-3 flex items-center gap-2">
              <CalendarOff className="w-5 h-5 text-gold" /> Schedule Studio Holiday Closure
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addClosureMutation.mutate(newClosure);
              }}
              className="space-y-4 mt-4"
            >
              <Input
                label="Closure Date"
                type="date"
                value={newClosure.closure_date}
                onChange={(e) => setNewClosure({ ...newClosure, closure_date: e.target.value })}
                required
              />

              <Input
                label="Holiday / Closure Reason"
                placeholder="e.g. Diwali Festival, Studio Renovation"
                value={newClosure.reason}
                onChange={(e) => setNewClosure({ ...newClosure, reason: e.target.value })}
                required
              />

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-medium uppercase tracking-wider text-charcoal">
                  Closure Duration
                </label>
                <div className="flex items-center gap-4 text-xs text-espresso">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="closure_type"
                      checked={newClosure.is_full_day === 1}
                      onChange={() => setNewClosure({ ...newClosure, is_full_day: 1 })}
                      className="text-gold"
                    />
                    Full Day Closure
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="closure_type"
                      checked={newClosure.is_full_day === 0}
                      onChange={() => setNewClosure({ ...newClosure, is_full_day: 0 })}
                      className="text-gold"
                    />
                    Partial Day Hours
                  </label>
                </div>
              </div>

              {newClosure.is_full_day === 0 && (
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Closed From"
                    type="time"
                    value={newClosure.start_time.slice(0, 5)}
                    onChange={(e) => setNewClosure({ ...newClosure, start_time: `${e.target.value}:00` })}
                  />
                  <Input
                    label="Closed Until"
                    type="time"
                    value={newClosure.end_time.slice(0, 5)}
                    onChange={(e) => setNewClosure({ ...newClosure, end_time: `${e.target.value}:00` })}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-[#F1EAE1]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsClosureModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  size="sm"
                  isLoading={addClosureMutation.isPending}
                >
                  Schedule Closure
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
export default AdminSettingsPage;
