import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { toast } from 'sonner';
import { CreditCard, Printer, CheckCircle, Search } from 'lucide-react';

export const AdminPaymentsPage = () => {
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['admin-payments-list'],
    queryFn: () => api.get('/admin/payments').then(res => res.data),
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-espresso">Billing & Settlement Ledger</h2>
          <p className="text-xs text-taupe mt-0.5">Track cash, card, and UPI collections, and generate printable tax receipts</p>
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
                  <th className="py-3 px-4 font-semibold">Receipt Reference</th>
                  <th className="py-3 px-4 font-semibold">Booking Ref</th>
                  <th className="py-3 px-4 font-semibold">Guest Client</th>
                  <th className="py-3 px-4 font-semibold">Payment Method</th>
                  <th className="py-3 px-4 font-semibold">Date Settled</th>
                  <th className="py-3 px-4 font-semibold">Amount</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1EAE1]">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-cream/15 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-espresso">{p.payment_reference}</td>
                    <td className="py-3.5 px-4 font-mono text-taupe">{p.booking_reference}</td>
                    <td className="py-3.5 px-4 font-semibold text-espresso">{p.customer_name}</td>
                    <td className="py-3.5 px-4 uppercase font-semibold text-espresso">
                      <span className="px-2 py-0.5 bg-cream rounded-sm border border-[#E5D2B8]">
                        {p.payment_method}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-taupe">{p.created_at}</td>
                    <td className="py-3.5 px-4 font-serif font-bold text-base text-espresso">
                      ₹{parseFloat(p.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="confirmed">Settled</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button variant="outline" size="sm" icon={Printer} onClick={() => setSelectedReceipt(p)}>
                        View Receipt
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Printable Receipt Modal */}
      <Modal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        title="Aurelia Studio Tax Receipt"
        description={`Receipt No: ${selectedReceipt?.payment_reference}`}
      >
        {selectedReceipt && (
          <div className="space-y-6 text-xs" id="printable-receipt">
            {/* Header */}
            <div className="text-center pb-4 border-b border-[#E5D2B8]">
              <h3 className="font-serif text-2xl font-bold tracking-widest text-espresso">AURELIA</h3>
              <p className="text-[10px] uppercase tracking-widest text-taupe">Haute Coiffure & Beauty Studio</p>
              <p className="text-[11px] text-taupe mt-1">42 Royale Boulevard, Indiranagar, Bengaluru, 560038</p>
              <p className="text-[11px] text-taupe">GSTIN: 29AAAAA0000A1Z5 • Tel: +91 98765 43210</p>
            </div>

            {/* Receipt Body */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-taupe">Payment Ref:</span>
                <span className="font-mono font-bold text-espresso">{selectedReceipt.payment_reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-taupe">Booking Ref:</span>
                <span className="font-mono text-espresso">{selectedReceipt.booking_reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-taupe">Guest Name:</span>
                <span className="font-bold text-espresso">{selectedReceipt.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-taupe">Settlement Method:</span>
                <span className="font-semibold uppercase text-espresso">{selectedReceipt.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-taupe">Date & Time:</span>
                <span className="text-espresso">{selectedReceipt.created_at}</span>
              </div>
              <div className="flex justify-between border-t border-[#E5D2B8] pt-3 text-sm">
                <span className="font-bold text-espresso">Amount Settled:</span>
                <span className="font-serif font-bold text-xl text-espresso">
                  ₹{parseFloat(selectedReceipt.amount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-[#F1EAE1]">
              <Button variant="ghost" size="sm" onClick={() => setSelectedReceipt(null)}>
                Close
              </Button>
              <Button variant="gold" size="sm" icon={Printer} onClick={handlePrint}>
                Print Receipt
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

