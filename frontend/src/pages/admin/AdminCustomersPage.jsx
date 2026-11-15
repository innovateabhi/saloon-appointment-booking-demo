import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { Search, User, Phone, Mail, Award } from 'lucide-react';

export const AdminCustomersPage = () => {
  const [search, setSearch] = useState('');

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['admin-customers', search],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      return api.get(`/admin/customers?${params.toString()}`).then(res => res.data);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-espresso">Client CRM & Loyalty Profiles</h2>
          <p className="text-xs text-taupe mt-0.5">360-degree guest directory, visit histories, and lifetime investment</p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-taupe absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search client, code, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white border border-[#E5D2B8] rounded-sm pl-9 pr-4 py-1.5 text-xs text-espresso focus:outline-none focus:border-gold shadow-sm"
          />
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
                  <th className="py-3 px-4 font-semibold">Client Code</th>
                  <th className="py-3 px-4 font-semibold">Full Name</th>
                  <th className="py-3 px-4 font-semibold">Contact</th>
                  <th className="py-3 px-4 font-semibold">Tier</th>
                  <th className="py-3 px-4 font-semibold">Visits</th>
                  <th className="py-3 px-4 font-semibold">Privilege Points</th>
                  <th className="py-3 px-4 font-semibold text-right">Lifetime Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1EAE1]">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-cream/15 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-espresso">{c.customer_code}</td>
                    <td className="py-3.5 px-4 font-semibold text-espresso">{c.first_name} {c.last_name}</td>
                    <td className="py-3.5 px-4 text-taupe">
                      <p>{c.phone}</p>
                      <p className="text-[10px] text-taupe/80">{c.email}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={c.loyalty_tier === 'Platinum' ? 'gold' : c.loyalty_tier === 'Gold' ? 'confirmed' : 'default'}>
                        {c.loyalty_tier || 'Silver'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-espresso">{c.total_visits}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-gold-dark">{c.loyalty_points_balance} pts</td>
                    <td className="py-3.5 px-4 font-serif font-bold text-espresso text-right">
                      ₹{parseFloat(c.total_spend).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

