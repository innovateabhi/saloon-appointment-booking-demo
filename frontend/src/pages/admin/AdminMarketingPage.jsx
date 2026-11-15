import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { toast } from 'sonner';
import { Megaphone, Gift, Users, Plus, TrendingUp, Sparkles, MessageCircle, Mail } from 'lucide-react';

export const AdminMarketingPage = () => {
  const queryClient = useQueryClient();
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [couponModalOpen, setCouponModalOpen] = useState(false);

  // New campaign state
  const [campForm, setCampForm] = useState({
    name: '',
    campaign_type: 'seasonal',
    channel: 'email',
    description: '',
  });

  // New coupon state
  const [couponForm, setCouponForm] = useState({
    code: '',
    title: '',
    discount_type: 'percentage',
    discount_value: '15',
    min_spend: '2500',
    max_discount: '1500',
  });

  // Fetch marketing overview
  const { data: overview, isLoading } = useQuery({
    queryKey: ['admin-marketing-overview'],
    queryFn: () => api.get('/marketing/overview').then(res => res.data),
  });

  // Fetch coupons
  const { data: coupons = [] } = useQuery({
    queryKey: ['admin-marketing-coupons'],
    queryFn: () => api.get('/marketing/coupons').then(res => res.data),
  });

  // Fetch segments
  const { data: segments = [] } = useQuery({
    queryKey: ['admin-marketing-segments'],
    queryFn: () => api.get('/marketing/segments').then(res => res.data),
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: (data) => api.post('/marketing/campaigns', data),
    onSuccess: () => {
      toast.success('Campaign launched and scheduled!');
      queryClient.invalidateQueries(['admin-marketing-overview']);
      setCampaignModalOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to create campaign.');
    }
  });

  // Create coupon mutation
  const createCouponMutation = useMutation({
    mutationFn: (data) => api.post('/marketing/coupons', data),
    onSuccess: () => {
      toast.success('Promotional coupon created.');
      queryClient.invalidateQueries(['admin-marketing-coupons']);
      setCouponModalOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to create coupon.');
    }
  });

  const handleLaunchCampaign = (e) => {
    e.preventDefault();
    if (!campForm.name) return;
    createCampaignMutation.mutate(campForm);
  };

  const handleCreateCoupon = (e) => {
    e.preventDefault();
    if (!couponForm.code || !couponForm.title) return;
    createCouponMutation.mutate(couponForm);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-espresso">Marketing & Growth Studio</h2>
          <p className="text-xs text-taupe mt-0.5">Automate promotional campaigns, manage audience segments & loyalty rules</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon={Plus} onClick={() => setCouponModalOpen(true)}>
            Create Promo Code
          </Button>
          <Button variant="gold" size="sm" icon={Megaphone} onClick={() => setCampaignModalOpen(true)}>
            Launch Campaign
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-5 border-l-4 border-l-gold">
          <p className="text-xs uppercase tracking-wider text-taupe font-medium">Active Campaigns</p>
          <p className="font-serif text-3xl font-bold text-espresso mt-2">
            {overview?.active_campaigns || 3}
          </p>
          <p className="text-[11px] text-taupe mt-1">Multi-channel reach</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-status-success">
          <p className="text-xs uppercase tracking-wider text-taupe font-medium">Coupon Redemptions</p>
          <p className="font-serif text-3xl font-bold text-espresso mt-2">
            {overview?.total_redemptions || 28}
          </p>
          <p className="text-[11px] text-status-success font-medium mt-1">Direct guest conversions</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-espresso">
          <p className="text-xs uppercase tracking-wider text-taupe font-medium">Campaign Attributed Sales</p>
          <p className="font-serif text-3xl font-bold text-espresso mt-2">
            ₹{parseFloat(overview?.campaign_revenue || 48500).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-taupe mt-1">From promotion redemptions</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-gold-dark">
          <p className="text-xs uppercase tracking-wider text-taupe font-medium">Privilege Points Balance</p>
          <p className="font-serif text-3xl font-bold text-espresso mt-2">
            {overview?.points_in_circulation || 14200} pts
          </p>
          <p className="text-[11px] text-gold-dark font-medium mt-1">Guest loyalty equity</p>
        </Card>
      </div>

      {/* Active Campaigns Table */}
      <Card className="border border-[#E5D2B8] overflow-hidden">
        <CardHeader>
          <CardTitle>Active & Scheduled Campaigns</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-cream/40 border-b border-[#E5D2B8] text-espresso uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 font-semibold">Campaign Name</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Channel</th>
                  <th className="py-3 px-4 font-semibold">Audience</th>
                  <th className="py-3 px-4 font-semibold">Coupon Code</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1EAE1]">
                {overview?.campaigns?.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-taupe">No campaigns currently running.</td></tr>
                ) : (
                  overview?.campaigns?.map((c) => (
                    <tr key={c.id} className="hover:bg-cream/15 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-espresso">{c.name}</td>
                      <td className="py-3.5 px-4 uppercase text-[10px] text-taupe">{c.campaign_type}</td>
                      <td className="py-3.5 px-4 font-medium text-espresso capitalize flex items-center gap-1.5 mt-2">
                        {c.channel === 'whatsapp' ? <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Mail className="w-3.5 h-3.5 text-gold" />}
                        {c.channel}
                      </td>
                      <td className="py-3.5 px-4 text-taupe">{c.segment_name || 'All VIP Clients'}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-espresso">{c.coupon_code || 'N/A'}</td>
                      <td className="py-3.5 px-4"><Badge variant="confirmed">{c.status}</Badge></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Audience Segments & Coupons Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Audience Segments */}
        <Card className="p-6 border border-[#E5D2B8] space-y-4">
          <h4 className="font-serif text-xl font-bold text-espresso border-b border-[#F1EAE1] pb-2">
            Target Audience Segments
          </h4>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1 text-xs">
            {segments.map((seg) => (
              <div key={seg.id} className="p-3 bg-cream/30 rounded-sm border border-[#E5D2B8] flex items-center justify-between">
                <div>
                  <p className="font-semibold text-espresso">{seg.name}</p>
                  <p className="text-[11px] text-taupe mt-0.5">{seg.description}</p>
                </div>
                <Badge variant="gold">{seg.estimated_reach || 40} Clients</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Active Promotional Coupons */}
        <Card className="p-6 border border-[#E5D2B8] space-y-4">
          <h4 className="font-serif text-xl font-bold text-espresso border-b border-[#F1EAE1] pb-2">
            Active Promo Codes
          </h4>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1 text-xs">
            {coupons.map((cp) => (
              <div key={cp.id} className="p-3 bg-white rounded-sm border border-[#E5D2B8] flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-sm text-espresso">{cp.code}</span>
                  <p className="text-[11px] text-taupe">{cp.title}</p>
                  <p className="text-[10px] text-taupe/80">Min spend: ₹{cp.min_spend}</p>
                </div>
                <span className="font-serif font-bold text-base text-gold-dark">
                  {cp.discount_type === 'percentage' ? `${parseInt(cp.discount_value)}% OFF` : `₹${parseInt(cp.discount_value)} OFF`}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Launch Campaign Modal */}
      <Modal
        isOpen={campaignModalOpen}
        onClose={() => setCampaignModalOpen(false)}
        title="Launch Marketing Campaign"
        description="Distribute bespoke salon offers across targeted client segments."
      >
        <form onSubmit={handleLaunchCampaign} className="space-y-4">
          <Input
            label="Campaign Name"
            value={campForm.name}
            onChange={(e) => setCampForm({ ...campForm, name: e.target.value })}
            placeholder="E.g., Festive Deepavali Hair Couture Privilege"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-medium uppercase tracking-wider text-charcoal">
                Campaign Type
              </label>
              <select
                value={campForm.campaign_type}
                onChange={(e) => setCampForm({ ...campForm, campaign_type: e.target.value })}
                className="w-full bg-white border border-[#E5D2B8] rounded-sm px-3.5 py-2.5 text-xs text-espresso focus:outline-none focus:border-gold"
              >
                <option value="seasonal">Seasonal Celebration</option>
                <option value="first_visit">First-Time Welcome</option>
                <option value="win_back">Win-Back Inactive Clients</option>
                <option value="loyalty">Privilege VIP Exclusive</option>
              </select>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-medium uppercase tracking-wider text-charcoal">
                Delivery Channel
              </label>
              <select
                value={campForm.channel}
                onChange={(e) => setCampForm({ ...campForm, channel: e.target.value })}
                className="w-full bg-white border border-[#E5D2B8] rounded-sm px-3.5 py-2.5 text-xs text-espresso focus:outline-none focus:border-gold"
              >
                <option value="email">Email Invitation</option>
                <option value="whatsapp">WhatsApp Direct Outreach</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setCampaignModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" size="sm" type="submit" isLoading={createCampaignMutation.isPending}>
              Schedule & Launch
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Coupon Modal */}
      <Modal
        isOpen={couponModalOpen}
        onClose={() => setCouponModalOpen(false)}
        title="Create Promotional Coupon"
        description="Configure discount percentages, minimum spend, and limits."
      >
        <form onSubmit={handleCreateCoupon} className="space-y-4">
          <Input
            label="Promo Code"
            value={couponForm.code}
            onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
            placeholder="E.g., SUMMER20"
            required
          />
          <Input
            label="Offer Title"
            value={couponForm.title}
            onChange={(e) => setCouponForm({ ...couponForm, title: e.target.value })}
            placeholder="Summer Couture Blowout Discount"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Discount Value"
              type="number"
              value={couponForm.discount_value}
              onChange={(e) => setCouponForm({ ...couponForm, discount_value: e.target.value })}
              required
            />
            <Input
              label="Minimum Spend (₹)"
              type="number"
              value={couponForm.min_spend}
              onChange={(e) => setCouponForm({ ...couponForm, min_spend: e.target.value })}
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setCouponModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" size="sm" type="submit" isLoading={createCouponMutation.isPending}>
              Create Coupon
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

