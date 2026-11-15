import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Star, Clock, UserCheck, Phone, Mail } from 'lucide-react';

export const AdminStaffPage = () => {
  const { data: staff = [], isLoading } = useQuery({
    queryKey: ['admin-staff-full'],
    queryFn: () => api.get('/admin/staff').then(res => res.data),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-espresso">Stylist & Staff Roster</h2>
        <p className="text-xs text-taupe mt-0.5">Manage master artists, working shifts, and performance metrics</p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((st) => (
            <Card key={st.id} className="p-6 border border-[#E5D2B8] space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-espresso text-gold flex items-center justify-center font-serif font-bold text-base">
                    {st.first_name[0]}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-espresso">{st.first_name} {st.last_name}</h3>
                    <p className="text-[11px] text-gold-dark font-medium">{st.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-gold text-xs font-semibold">
                  <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                  <span>{st.rating_avg}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-taupe pt-2 border-t border-[#F1EAE1]">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gold" />
                  <span>{st.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gold" />
                  <span>{st.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-gold" />
                  <span>{st.experience_years} Years Experience • Active Roster</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

