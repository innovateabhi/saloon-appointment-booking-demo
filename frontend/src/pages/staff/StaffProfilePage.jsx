import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { User, Scissors, Star, Mail, Phone } from 'lucide-react';

export const StaffProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-espresso">Stylist Credentials & Profile</h2>
        <p className="text-xs text-taupe mt-0.5">Your official studio credentials, title, and verified ratings</p>
      </div>

      <Card className="p-8 border border-[#E5D2B8] space-y-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-espresso text-gold flex items-center justify-center font-serif font-bold text-2xl border border-gold/40">
            {user?.first_name?.[0]}
          </div>
          <div>
            <h3 className="font-serif text-2xl font-bold text-espresso">{user?.first_name} {user?.last_name}</h3>
            <p className="text-xs text-gold-dark font-medium">{user?.staff_title || 'Creative Director & Master Stylist'}</p>
            <Badge variant="confirmed" className="mt-1">Active Stylist Roster</Badge>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-[#F1EAE1] text-xs text-taupe">
          <div className="flex justify-between py-1">
            <span className="font-medium text-espresso flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gold" /> Email Address</span>
            <span>{user?.email}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="font-medium text-espresso flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gold" /> Mobile Contact</span>
            <span>{user?.phone}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="font-medium text-espresso flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-gold" /> Average Client Rating</span>
            <span className="font-bold text-gold-dark">4.95 ★★★★★</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

