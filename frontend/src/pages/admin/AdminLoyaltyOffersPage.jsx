import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { toast } from 'sonner';
import {
  Gift,
  Award,
  Plus,
  Copy,
  Share2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Users,
  Search,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Save,
  Sliders,
  DollarSign
} from 'lucide-react';

export const AdminLoyaltyOffersPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('coupons'); // 'coupons' | 'rules' | 'clients' | 'ledger'
  const [searchClient, setSearchClient] = useState('');
  const [selectedTierFilter, setSelectedTierFilter] = useState('all');

  // Coupon Creation Modal state
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    title: '',
    discount_type: 'percentage',
    discount_value: 10,
    min_spend: 300,
    max_discount: 200,
    usage_limit: 200,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
  });

  // Manual Points Adjustment Modal state
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState(null);
  const [adjustData, setAdjustData] = useState({
    type: 'credit',
    points: 100,
    reason: 'VIP Atelier Anniversary Goodwill Credit'
  });

  // Queries
  const { data: coupons = [], isLoading: isLoadingCoupons } = useQuery({
    queryKey: ['marketing-coupons'],
    queryFn: () => api.get('/marketing/coupons').then(res => res.data),
  });

  const { data: loyaltyAccounts = [], isLoading: isLoadingLoyalty } = useQuery({
    queryKey: ['admin-loyalty-accounts'],
    queryFn: () => api.get('/marketing/loyalty').then(res => res.data),
  });

  const { data: ledger = [], isLoading: isLoadingLedger } = useQuery({
    queryKey: ['admin-loyalty-ledger'],
    queryFn: () => api.get('/marketing/loyalty/ledger').then(res => res.data),
  });

  const { data: rules = {}, isLoading: isLoadingRules } = useQuery({
    queryKey: ['admin-loyalty-rules'],
    queryFn: () => api.get('/marketing/loyalty/rules').then(res => res.data),
  });

  const [rulesForm, setRulesForm] = useState(null);

  // Sync rules form state
  React.useEffect(() => {
    if (rules && Object.keys(rules).length > 0) {
      setRulesForm(rules);
    }
  }, [rules]);

  // Mutations
  const createCouponMutation = useMutation({
    mutationFn: (data) => api.post('/marketing/coupons', data),
    onSuccess: () => {
      toast.success('Promotional coupon created successfully!');
      setIsCouponModalOpen(false);
      queryClient.invalidateQueries(['marketing-coupons']);
    },
    onError: (err) => toast.error(err.message || 'Failed to create coupon')
  });

  const toggleCouponMutation = useMutation({
    mutationFn: (id) => api.patch(`/marketing/coupons/${id}/toggle`),
    onSuccess: () => {
      toast.success('Coupon status updated.');
      queryClient.invalidateQueries(['marketing-coupons']);
    },
    onError: (err) => toast.error(err.message || 'Failed to toggle coupon')
  });

  const deleteCouponMutation = useMutation({
    mutationFn: (id) => api.delete(`/marketing/coupons/${id}`),
    onSuccess: () => {
      toast.success('Coupon removed.');
      queryClient.invalidateQueries(['marketing-coupons']);
    },
    onError: (err) => toast.error(err.message || 'Failed to delete coupon')
  });

  const adjustPointsMutation = useMutation({
    mutationFn: (payload) => api.post('/marketing/loyalty/adjust', payload),
    onSuccess: (res) => {
      toast.success(res.message || 'Loyalty points adjusted successfully!');
      setIsAdjustModalOpen(false);
      queryClient.invalidateQueries(['admin-loyalty-accounts']);
      queryClient.invalidateQueries(['admin-loyalty-ledger']);
    },
    onError: (err) => toast.error(err.message || 'Failed to adjust points')
  });

  const updateRulesMutation = useMutation({
    mutationFn: (data) => api.put('/marketing/loyalty/rules', data),
    onSuccess: () => {
      toast.success('Loyalty program rules saved successfully.');
      queryClient.invalidateQueries(['admin-loyalty-rules']);
    },
    onError: (err) => toast.error(err.message || 'Failed to update rules')
  });

  // Statistics
  const activeCouponsCount = coupons.filter(c => Number(c.is_active) === 1).length;
  const totalPointsInCirculation = loyaltyAccounts.reduce((acc, curr) => acc + (Number(curr.points_balance) || 0), 0);
  const platinumCount = loyaltyAccounts.filter(a => a.tier === 'Platinum').length;
  const goldCount = loyaltyAccounts.filter(a => a.tier === 'Gold').length;
  const silverCount = loyaltyAccounts.filter(a => a.tier === 'Silver').length;

  // Filtered Clients
  const filteredClients = loyaltyAccounts.filter(c => {
    const matchesSearch = 
      (c.customer_name || '').toLowerCase().includes(searchClient.toLowerCase()) ||
      (c.phone || '').includes(searchClient) ||
      (c.customer_code || '').toLowerCase().includes(searchClient.toLowerCase());
    const matchesTier = selectedTierFilter === 'all' || c.tier === selectedTierFilter;
    return matchesSearch && matchesTier;
  });

  // Share Coupon on WhatsApp
  const shareCouponWhatsApp = (c) => {
    const text = encodeURIComponent(
      `✨ Exclusive Luxury Offer from AURELIA Salon & Studio ✨\n\n` +
      `Use Promo Code: *${c.code}* to get ${c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `₹${c.discount_value} OFF`} on your next appointment!\n` +
      `Min spend: ₹${c.min_spend} | Valid until: ${c.end_date}\n\n` +
      `Book your bespoke session now: http://localhost:5173/book`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Promo code "${code}" copied to clipboard!`);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-espresso">Loyalty Privilege & Promotional Offers</h2>
          <p className="text-xs text-taupe mt-0.5">Manage salon discount codes, reward tier rules, and client loyalty accounts</p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'coupons' && (
            <Button
              variant="gold"
              size="sm"
              icon={Plus}
              onClick={() => setIsCouponModalOpen(true)}
            >
              New Promo Offer
            </Button>
          )}
        </div>
      </div>

      {/* KPI Metric Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-[#E5D2B8]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-taupe">Active Promotions</p>
              <h3 className="text-2xl font-serif font-bold text-espresso mt-1">{activeCouponsCount} <span className="text-xs text-taupe font-sans font-normal">/ {coupons.length}</span></h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-champagne/40 flex items-center justify-center text-gold">
              <Gift className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-[#E5D2B8]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-taupe">Points In Circulation</p>
              <h3 className="text-2xl font-serif font-bold text-gold mt-1">{totalPointsInCirculation.toLocaleString()} <span className="text-xs text-taupe font-sans font-normal">pts</span></h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center text-gold">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-[#E5D2B8]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-taupe">Privilege Members</p>
              <h3 className="text-2xl font-serif font-bold text-espresso mt-1">{loyaltyAccounts.length}</h3>
              <p className="text-[10px] text-taupe mt-0.5">{platinumCount} Plat • {goldCount} Gold • {silverCount} Silv</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-champagne/40 flex items-center justify-center text-espresso">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-[#E5D2B8]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-taupe">Redemption Rate</p>
              <h3 className="text-2xl font-serif font-bold text-espresso mt-1">1 pt = ₹1.00</h3>
              <p className="text-[10px] text-emerald-700 mt-0.5 font-medium">10% spend cashback</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-[#E5D2B8] gap-4 overflow-x-auto pb-px">
        {[
          { key: 'coupons', label: 'Offers & Coupons', icon: Gift },
          { key: 'rules', label: 'Tier & Earning Rules', icon: Sliders },
          { key: 'clients', label: 'Client Privilege Directory', icon: Award },
          { key: 'ledger', label: 'Points Audit Ledger', icon: Clock },
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

      {/* TAB 1: OFFERS & COUPONS */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-lg font-semibold text-espresso">Active & Seasonal Studio Promotions</h3>
            <span className="text-xs text-taupe">{coupons.length} total coupons configured</span>
          </div>

          {isLoadingCoupons ? (
            <div className="py-16 text-center"><Spinner size="lg" /></div>
          ) : coupons.length === 0 ? (
            <div className="p-12 text-center bg-white border border-[#E5D2B8] rounded-sm">
              <Gift className="w-8 h-8 text-gold mx-auto mb-2 opacity-60" />
              <p className="text-sm font-medium text-espresso">No promotional coupons created yet.</p>
              <p className="text-xs text-taupe mt-1">Create your first client discount code to drive bookings.</p>
              <Button
                variant="gold"
                size="sm"
                className="mt-4"
                icon={Plus}
                onClick={() => setIsCouponModalOpen(true)}
              >
                Create Promo Code
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map((coupon) => {
                const isActive = Number(coupon.is_active) === 1;
                return (
                  <Card key={coupon.id} className={`p-5 border transition-all ${isActive ? 'border-[#E5D2B8] bg-white shadow-xs' : 'border-gray-200 bg-gray-50/70 opacity-75'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold tracking-wider px-2.5 py-1 bg-champagne/30 text-espresso border border-gold/40 rounded-xs">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => copyCode(coupon.code)}
                            title="Copy Code"
                            className="text-taupe hover:text-gold transition-colors p-1"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h4 className="font-serif font-semibold text-espresso mt-2 text-base">{coupon.title}</h4>
                      </div>

                      <Badge variant={isActive ? 'emerald' : 'gray'}>
                        {isActive ? 'Live' : 'Paused'}
                      </Badge>
                    </div>

                    <div className="my-3 pt-3 border-t border-[#F1EAE1] space-y-1.5 text-xs">
                      <div className="flex justify-between text-taupe">
                        <span>Discount:</span>
                        <span className="font-semibold text-gold">
                          {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% Off` : `₹${Number(coupon.discount_value).toLocaleString()} Flat Off`}
                        </span>
                      </div>
                      <div className="flex justify-between text-taupe">
                        <span>Minimum Spend:</span>
                        <span className="text-espresso font-medium">₹{Number(coupon.min_spend).toLocaleString()}</span>
                      </div>
                      {coupon.max_discount && (
                        <div className="flex justify-between text-taupe">
                          <span>Max Discount:</span>
                          <span className="text-espresso font-medium">₹{Number(coupon.max_discount).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-taupe">
                        <span>Redemptions:</span>
                        <span className="text-espresso font-medium">{coupon.times_used || 0} / {coupon.usage_limit || '∞'}</span>
                      </div>
                      <div className="flex justify-between text-taupe">
                        <span>Valid Until:</span>
                        <span className="text-espresso font-medium">{coupon.end_date}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#F1EAE1] flex items-center justify-between gap-2">
                      <button
                        onClick={() => toggleCouponMutation.mutate(coupon.id)}
                        className="text-xs font-medium text-taupe hover:text-espresso flex items-center gap-1.5 transition-colors"
                      >
                        {isActive ? (
                          <>
                            <ToggleRight className="w-4 h-4 text-emerald-600" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4 text-gray-400" />
                            <span>Activate</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="xs"
                          icon={Share2}
                          onClick={() => shareCouponWhatsApp(coupon)}
                          title="Share to Clients via WhatsApp"
                          className="text-emerald-700 hover:bg-emerald-50"
                        >
                          WhatsApp
                        </Button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Delete coupon "${coupon.code}"?`)) {
                              deleteCouponMutation.mutate(coupon.id);
                            }
                          }}
                          className="text-taupe hover:text-rose-600 transition-colors p-1.5 rounded-sm"
                          title="Delete Coupon"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TIER & EARNING RULES */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          <Card className="p-6 border border-[#E5D2B8] max-w-4xl bg-white">
            <h3 className="font-serif text-lg font-semibold text-espresso border-b border-[#F1EAE1] pb-3 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-gold" /> Aurelia Privilege Program Configuration
            </h3>

            {isLoadingRules || !rulesForm ? (
              <div className="py-12 text-center"><Spinner /></div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateRulesMutation.mutate(rulesForm);
                }}
                className="space-y-6 mt-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal border-b pb-1">Points Economics</h4>
                    <Input
                      label="Spend for 1 Point (INR)"
                      type="number"
                      value={rulesForm.earn_rate_inr || '10'}
                      onChange={(e) => setRulesForm({ ...rulesForm, earn_rate_inr: e.target.value })}
                      helperText="Default ₹10 per 1 point (translates to 10% value back to customer)"
                    />
                    <Input
                      label="Point Redemption Value (INR)"
                      type="number"
                      step="0.1"
                      value={rulesForm.redemption_value_inr || '1.00'}
                      onChange={(e) => setRulesForm({ ...rulesForm, redemption_value_inr: e.target.value })}
                      helperText="Default 1 Point = ₹1.00 deduction at checkout"
                    />
                    <Input
                      label="New Client Welcome Points"
                      type="number"
                      value={rulesForm.welcome_points || '50'}
                      onChange={(e) => setRulesForm({ ...rulesForm, welcome_points: e.target.value })}
                      helperText="Granted automatically on registration / first appointment"
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal border-b pb-1">Tier Thresholds (Lifetime Points)</h4>
                    <Input
                      label="Silver Tier Minimum Points"
                      type="number"
                      value={rulesForm.silver_threshold || '0'}
                      onChange={(e) => setRulesForm({ ...rulesForm, silver_threshold: e.target.value })}
                      helperText="Entry level for all registered patrons"
                    />
                    <Input
                      label="Gold Tier Minimum Points"
                      type="number"
                      value={rulesForm.gold_threshold || '500'}
                      onChange={(e) => setRulesForm({ ...rulesForm, gold_threshold: e.target.value })}
                      helperText="Requires ₹5,000 lifetime spend"
                    />
                    <Input
                      label="Platinum Tier Minimum Points"
                      type="number"
                      value={rulesForm.platinum_threshold || '1500'}
                      onChange={(e) => setRulesForm({ ...rulesForm, platinum_threshold: e.target.value })}
                      helperText="Requires ₹15,000 lifetime spend"
                    />
                  </div>
                </div>

                <div className="p-4 bg-champagne/20 border border-gold/30 rounded-sm">
                  <h5 className="font-serif font-semibold text-espresso text-sm flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-gold" /> Tier Benefits Matrix
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2 text-xs text-charcoal">
                    <div className="p-2.5 bg-white/80 rounded-xs border border-[#E5D2B8]">
                      <span className="font-bold text-gray-700">Silver Patron:</span>
                      <p className="text-[11px] text-taupe mt-1">10% points earning on all services, online booking access, automated appointment reminders.</p>
                    </div>
                    <div className="p-2.5 bg-white/80 rounded-xs border border-[#E5D2B8]">
                      <span className="font-bold text-amber-700">Gold VIP:</span>
                      <p className="text-[11px] text-taupe mt-1">Priority slot scheduling, 1.25x points acceleration, complimentary birthday blowout service.</p>
                    </div>
                    <div className="p-2.5 bg-white/80 rounded-xs border border-[#E5D2B8]">
                      <span className="font-bold text-purple-800">Platinum Atelier:</span>
                      <p className="text-[11px] text-taupe mt-1">Dedicated master stylist preference, complimentary champagne & wellness beverage, zero cancellation penalties.</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="gold"
                    size="md"
                    icon={Save}
                    isLoading={updateRulesMutation.isPending}
                  >
                    Save Program Rules
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}

      {/* TAB 3: CLIENT DIRECTORY & POINTS ADJUSTMENT */}
      {activeTab === 'clients' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-taupe" />
                <input
                  type="text"
                  placeholder="Search client name, phone..."
                  value={searchClient}
                  onChange={(e) => setSearchClient(e.target.value)}
                  className="w-full bg-white border border-[#E5D2B8] pl-8 pr-3 py-1.5 text-xs text-espresso rounded-sm focus:outline-none focus:border-gold"
                />
              </div>

              <select
                value={selectedTierFilter}
                onChange={(e) => setSelectedTierFilter(e.target.value)}
                className="bg-white border border-[#E5D2B8] px-3 py-1.5 text-xs text-espresso rounded-sm focus:outline-none focus:border-gold"
              >
                <option value="all">All Tiers</option>
                <option value="Platinum">Platinum ({platinumCount})</option>
                <option value="Gold">Gold ({goldCount})</option>
                <option value="Silver">Silver ({silverCount})</option>
              </select>
            </div>

            <p className="text-xs text-taupe">{filteredClients.length} patrons found</p>
          </div>

          {isLoadingLoyalty ? (
            <div className="py-16 text-center"><Spinner size="lg" /></div>
          ) : (
            <div className="bg-white border border-[#E5D2B8] rounded-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] border-b border-[#E5D2B8] text-taupe font-medium">
                    <tr>
                      <th className="py-3 px-4">Patron Details</th>
                      <th className="py-3 px-4">Tier Status</th>
                      <th className="py-3 px-4 text-right">Available Points</th>
                      <th className="py-3 px-4 text-right">Lifetime Earned</th>
                      <th className="py-3 px-4 text-right">Redeemed</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1EAE1]">
                    {filteredClients.map((client) => {
                      const tierColor = client.tier === 'Platinum' ? 'bg-purple-100 text-purple-900 border-purple-200' :
                                        client.tier === 'Gold' ? 'bg-amber-100 text-amber-900 border-amber-200' :
                                        'bg-gray-100 text-gray-800 border-gray-200';
                      return (
                        <tr key={client.id} className="hover:bg-[#FDFBF7] transition-colors">
                          <td className="py-3 px-4">
                            <p className="font-semibold text-espresso">{client.customer_name}</p>
                            <p className="text-[11px] text-taupe">{client.phone} • <span className="font-mono">{client.customer_code}</span></p>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-xs border ${tierColor}`}>
                              {client.tier}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-gold text-sm">
                            {Number(client.points_balance).toLocaleString()} pts
                          </td>
                          <td className="py-3 px-4 text-right text-taupe font-mono">
                            {Number(client.lifetime_earned).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right text-taupe font-mono">
                            {Number(client.lifetime_redeemed).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Button
                              variant="outline"
                              size="xs"
                              icon={Sliders}
                              onClick={() => {
                                setAdjustTarget(client);
                                setAdjustData({
                                  type: 'credit',
                                  points: 100,
                                  reason: 'VIP Atelier Anniversary Goodwill Credit'
                                });
                                setIsAdjustModalOpen(true);
                              }}
                            >
                              Adjust Points
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: POINTS AUDIT LEDGER */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-lg font-semibold text-espresso">Loyalty Points Activity Ledger</h3>
            <p className="text-xs text-taupe">Audit history of points earned, redeemed & staff adjustments</p>
          </div>

          {isLoadingLedger ? (
            <div className="py-16 text-center"><Spinner size="lg" /></div>
          ) : ledger.length === 0 ? (
            <div className="p-12 text-center bg-white border border-[#E5D2B8] rounded-sm">
              <Clock className="w-8 h-8 text-gold mx-auto mb-2 opacity-60" />
              <p className="text-sm font-medium text-espresso">No loyalty transactions recorded yet.</p>
            </div>
          ) : (
            <div className="bg-white border border-[#E5D2B8] rounded-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] border-b border-[#E5D2B8] text-taupe font-medium">
                    <tr>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Patron</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4 text-right">Points (+/-)</th>
                      <th className="py-3 px-4 text-right">Resulting Balance</th>
                      <th className="py-3 px-4">Description / Reason</th>
                      <th className="py-3 px-4">Booking Ref</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1EAE1]">
                    {ledger.map((item) => {
                      const isPositive = Number(item.points) > 0;
                      return (
                        <tr key={item.id} className="hover:bg-[#FDFBF7] transition-colors">
                          <td className="py-3 px-4 text-taupe whitespace-nowrap">
                            {new Date(item.created_at).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-espresso">{item.customer_name}</span>
                            <span className="text-[10px] text-taupe block">{item.phone}</span>
                          </td>
                          <td className="py-3 px-4 capitalize">
                            <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-xs ${
                              item.transaction_type === 'earned' ? 'bg-emerald-50 text-emerald-700' :
                              item.transaction_type === 'redeemed' ? 'bg-rose-50 text-rose-700' :
                              'bg-amber-50 text-amber-700'
                            }`}>
                              {item.transaction_type}
                            </span>
                          </td>
                          <td className={`py-3 px-4 text-right font-mono font-bold ${
                            isPositive ? 'text-emerald-700' : 'text-rose-600'
                          }`}>
                            {isPositive ? `+${item.points}` : item.points}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-espresso font-semibold">
                            {item.balance_after} pts
                          </td>
                          <td className="py-3 px-4 text-espresso max-w-xs truncate">
                            {item.description}
                          </td>
                          <td className="py-3 px-4 text-taupe font-mono">
                            {item.booking_reference || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: CREATE PROMO COUPON */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/60 backdrop-blur-xs p-4">
          <Card className="max-w-lg w-full p-6 bg-white border border-[#E5D2B8] shadow-2xl relative">
            <h3 className="font-serif text-lg font-bold text-espresso border-b border-[#F1EAE1] pb-3 flex items-center gap-2">
              <Gift className="w-5 h-5 text-gold" /> Create Promotional Coupon
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createCouponMutation.mutate(newCoupon);
              }}
              className="space-y-4 mt-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Promo Code"
                  placeholder="e.g. GLOW20"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  required
                />
                <Input
                  label="Offer Title"
                  placeholder="e.g. Festive Glow Discount"
                  value={newCoupon.title}
                  onChange={(e) => setNewCoupon({ ...newCoupon, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-medium uppercase tracking-wider text-charcoal">
                    Discount Type
                  </label>
                  <select
                    value={newCoupon.discount_type}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discount_type: e.target.value })}
                    className="w-full bg-white border border-[#E5D2B8] rounded-sm p-2 text-xs text-espresso focus:outline-none focus:border-gold"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Cash Amount (₹)</option>
                  </select>
                </div>

                <Input
                  label={newCoupon.discount_type === 'percentage' ? 'Discount %' : 'Discount Amount (₹)'}
                  type="number"
                  value={newCoupon.discount_value}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Min Spend (₹)"
                  type="number"
                  value={newCoupon.min_spend}
                  onChange={(e) => setNewCoupon({ ...newCoupon, min_spend: parseFloat(e.target.value) || 0 })}
                />
                <Input
                  label="Max Discount Cap (₹)"
                  type="number"
                  placeholder="Optional"
                  value={newCoupon.max_discount || ''}
                  onChange={(e) => setNewCoupon({ ...newCoupon, max_discount: e.target.value ? parseFloat(e.target.value) : null })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Usage Limit"
                  type="number"
                  value={newCoupon.usage_limit}
                  onChange={(e) => setNewCoupon({ ...newCoupon, usage_limit: parseInt(e.target.value) || 100 })}
                />
                <Input
                  label="Expiry Date"
                  type="date"
                  value={newCoupon.end_date}
                  onChange={(e) => setNewCoupon({ ...newCoupon, end_date: e.target.value })}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#F1EAE1]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCouponModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  size="sm"
                  isLoading={createCouponMutation.isPending}
                >
                  Publish Coupon
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL: MANUAL POINTS ADJUSTMENT */}
      {isAdjustModalOpen && adjustTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/60 backdrop-blur-xs p-4">
          <Card className="max-w-md w-full p-6 bg-white border border-[#E5D2B8] shadow-2xl relative">
            <h3 className="font-serif text-lg font-bold text-espresso border-b border-[#F1EAE1] pb-3 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-gold" /> Adjust Client Loyalty Points
            </h3>

            <div className="mt-3 p-3 bg-champagne/20 rounded-xs border border-gold/30 text-xs">
              <p className="font-semibold text-espresso">{adjustTarget.customer_name}</p>
              <p className="text-taupe">{adjustTarget.phone} • Tier: <span className="font-semibold text-charcoal">{adjustTarget.tier}</span></p>
              <p className="text-gold font-bold mt-1">Current Balance: {Number(adjustTarget.points_balance).toLocaleString()} Points</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                adjustPointsMutation.mutate({
                  customer_id: adjustTarget.customer_id,
                  type: adjustData.type,
                  points: parseInt(adjustData.points),
                  reason: adjustData.reason
                });
              }}
              className="space-y-4 mt-4"
            >
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-medium uppercase tracking-wider text-charcoal">
                  Adjustment Action
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustData({ ...adjustData, type: 'credit' })}
                    className={`py-2 px-3 text-xs font-medium rounded-sm border flex items-center justify-center gap-1.5 transition-colors ${
                      adjustData.type === 'credit'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold'
                        : 'border-gray-200 bg-white text-taupe'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                    Credit Points (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustData({ ...adjustData, type: 'debit' })}
                    className={`py-2 px-3 text-xs font-medium rounded-sm border flex items-center justify-center gap-1.5 transition-colors ${
                      adjustData.type === 'debit'
                        ? 'border-rose-600 bg-rose-50 text-rose-800 font-bold'
                        : 'border-gray-200 bg-white text-taupe'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4 text-rose-600" />
                    Debit Points (-)
                  </button>
                </div>
              </div>

              <Input
                label="Points Amount"
                type="number"
                min="1"
                value={adjustData.points}
                onChange={(e) => setAdjustData({ ...adjustData, points: e.target.value })}
                required
              />

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-medium uppercase tracking-wider text-charcoal">
                  Reason & Audit Note
                </label>
                <textarea
                  rows={2}
                  value={adjustData.reason}
                  onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                  placeholder="e.g. VIP birthday bonus, compensation for delay..."
                  className="w-full bg-white border border-[#E5D2B8] rounded-sm p-2 text-xs text-espresso focus:outline-none focus:border-gold"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#F1EAE1]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAdjustModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  size="sm"
                  isLoading={adjustPointsMutation.isPending}
                >
                  Confirm Adjustment
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
export default AdminLoyaltyOffersPage;

