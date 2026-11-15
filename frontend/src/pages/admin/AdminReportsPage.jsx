import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { BarChart3, Download, TrendingUp, Scissors, CreditCard } from 'lucide-react';

export const AdminReportsPage = () => {
  const { data: reports, isLoading } = useQuery({
    queryKey: ['admin-reports-full'],
    queryFn: () => api.get('/admin/reports').then(res => res.data),
  });

  const handleExportCsv = () => {
    window.location.href = 'http://localhost/aurelia-salon/backend/public/api/v1/admin/reports/export';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-espresso">Financial & Operational Analytics</h2>
          <p className="text-xs text-taupe mt-0.5">Real-time revenue performance, stylist productivity, and audit records</p>
        </div>
        <Button variant="gold" size="sm" icon={Download} onClick={handleExportCsv}>
          Export Master CSV
        </Button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* Stylist Productivity & Revenue Attribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6 border border-[#E5D2B8] space-y-4">
              <h4 className="font-serif text-xl font-bold text-espresso border-b border-[#F1EAE1] pb-2 flex items-center gap-2">
                <Scissors className="w-5 h-5 text-gold" /> Stylist Revenue Attribution
              </h4>
              <div className="space-y-3">
                {reports?.by_stylist?.map((st, idx) => (
                  <div key={idx} className="p-3 bg-cream/30 rounded-sm border border-[#E5D2B8] flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-espresso">{st.stylist_name}</p>
                      <p className="text-[10px] text-taupe">{st.total_services} Completed Rituals</p>
                    </div>
                    <span className="font-serif font-bold text-base text-espresso">
                      ₹{parseFloat(st.total_revenue).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Payment Method Breakdown */}
            <Card className="p-6 border border-[#E5D2B8] space-y-4">
              <h4 className="font-serif text-xl font-bold text-espresso border-b border-[#F1EAE1] pb-2 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gold" /> Payment Collections Breakdown
              </h4>
              <div className="space-y-3">
                {reports?.payment_methods?.map((m, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-sm border border-[#E5D2B8] flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold uppercase tracking-wider text-espresso">{m.payment_method}</p>
                      <p className="text-[10px] text-taupe">{m.count} Settlements</p>
                    </div>
                    <span className="font-serif font-bold text-base text-espresso">
                      ₹{parseFloat(m.total).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

