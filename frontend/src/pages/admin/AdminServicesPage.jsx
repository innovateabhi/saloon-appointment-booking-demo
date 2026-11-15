import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { toast } from 'sonner';
import { Scissors, Plus, Clock, Search } from 'lucide-react';

export const AdminServicesPage = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category_id: 1,
    price: '',
    duration_minutes: 60,
    buffer_minutes: 10,
    description: '',
  });

  // Fetch services
  const { data: services = [], isLoading } = useQuery({
    queryKey: ['admin-services'],
    queryFn: () => api.get('/admin/services').then(res => res.data),
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => api.get('/public/categories').then(res => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (newSrv) => api.post('/admin/services', newSrv),
    onSuccess: () => {
      toast.success('Service created successfully.');
      queryClient.invalidateQueries(['admin-services']);
      setModalOpen(false);
      setFormData({ name: '', category_id: 1, price: '', duration_minutes: 60, buffer_minutes: 10, description: '' });
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to create service.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      toast.error('Service name and price are required.');
      return;
    }
    createMutation.mutate(formData);
  };

  const filtered = services.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-espresso">Service Menu & Rituals</h2>
          <p className="text-xs text-taupe mt-0.5">Manage pricing, treatment duration, and qualified stylists</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search treatments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white border border-[#E5D2B8] rounded-sm px-3.5 py-1.5 text-xs text-espresso focus:outline-none focus:border-gold"
          />
          <Button variant="gold" size="sm" icon={Plus} onClick={() => setModalOpen(true)}>
            Add Service
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center"><Spinner size="lg" /></div>
      ) : (
        <Card className="border border-[#E5D2B8] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-cream/40 border-b border-[#E5D2B8] text-espresso uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 font-semibold">Service Name</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Duration</th>
                  <th className="py-3 px-4 font-semibold">Buffer</th>
                  <th className="py-3 px-4 font-semibold">Price (INR)</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1EAE1]">
                {filtered.map((srv) => (
                  <tr key={srv.id} className="hover:bg-cream/15 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-espresso">{srv.name}</td>
                    <td className="py-3.5 px-4 text-taupe">{srv.category_name}</td>
                    <td className="py-3.5 px-4 font-mono">{srv.duration_minutes}m</td>
                    <td className="py-3.5 px-4 font-mono">{srv.buffer_minutes}m</td>
                    <td className="py-3.5 px-4 font-serif font-bold text-espresso">
                      ₹{parseFloat(srv.price).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Service Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Atelier Service"
        description="Add a bespoke treatment to the salon's active menu."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Service Title"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="E.g., Diamond Microdermabrasion Facial"
            required
          />

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-medium uppercase tracking-wider text-charcoal/80">
              Service Category
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
              className="w-full bg-white border border-[#E5D2B8] rounded-sm px-3.5 py-2.5 text-xs text-espresso focus:outline-none focus:border-gold"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Price (₹)"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="3500"
              required
            />
            <Input
              label="Duration (mins)"
              type="number"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
              placeholder="60"
              required
            />
            <Input
              label="Buffer (mins)"
              type="number"
              value={formData.buffer_minutes}
              onChange={(e) => setFormData({ ...formData, buffer_minutes: parseInt(e.target.value) })}
              placeholder="10"
              required
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-medium uppercase tracking-wider text-charcoal/80">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white border border-[#E5D2B8] rounded-sm p-3 text-xs text-espresso focus:outline-none focus:border-gold"
              placeholder="Describe treatment steps, key organic ingredients..."
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" size="sm" type="submit" isLoading={createMutation.isPending}>
              Save Service
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

