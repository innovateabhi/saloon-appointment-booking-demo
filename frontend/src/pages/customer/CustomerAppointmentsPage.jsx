import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { toast } from 'sonner';
import { Calendar, Clock, Scissors, Star, AlertTriangle, RefreshCw, XCircle } from 'lucide-react';

export const CustomerAppointmentsPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('upcoming');

  // Modals state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedApptForCancel, setSelectedApptForCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedApptForReview, setSelectedApptForReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Fetch customer appointments
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['customer-appointments', activeTab],
    queryFn: () => api.get(`/customer/appointments?status=${activeTab}`).then(res => res.data),
  });

  // Cancel Mutation
  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }) => api.post(`/bookings/${id}/cancel`, { reason }),
    onSuccess: () => {
      toast.success('Appointment cancelled successfully.');
      queryClient.invalidateQueries(['customer-appointments']);
      setCancelModalOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to cancel appointment.');
    }
  });

  // Review Mutation
  const reviewMutation = useMutation({
    mutationFn: ({ appointment_id, rating, comment }) =>
      api.post('/customer/reviews', { appointment_id, rating, comment }),
    onSuccess: () => {
      toast.success('Thank you! Your verified review has been submitted.');
      queryClient.invalidateQueries(['customer-appointments']);
      setReviewModalOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to submit review.');
    }
  });

  const handleOpenCancel = (appt) => {
    setSelectedApptForCancel(appt);
    setCancelReason('Schedule conflict');
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = () => {
    if (!selectedApptForCancel) return;
    cancelMutation.mutate({
      id: selectedApptForCancel.id,
      reason: cancelReason,
    });
  };

  const handleOpenReview = (appt) => {
    setSelectedApptForReview(appt);
    setReviewRating(5);
    setReviewComment('');
    setReviewModalOpen(true);
  };

  const handleConfirmReview = () => {
    if (!selectedApptForReview) return;
    reviewMutation.mutate({
      appointment_id: selectedApptForReview.id,
      rating: reviewRating,
      comment: reviewComment,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-espresso">My Atelier Reservations</h2>
          <p className="text-xs text-taupe mt-0.5">Manage, reschedule, or review your appointments</p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 bg-cream/60 p-1 rounded-sm border border-[#E5D2B8]">
          {['upcoming', 'completed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-sm text-xs uppercase tracking-wider font-medium capitalize transition-all ${
                activeTab === tab ? 'bg-espresso text-ivory font-semibold shadow-sm' : 'text-espresso/70 hover:text-espresso'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Appointment Cards */}
      {isLoading ? (
        <div className="py-20 text-center"><Spinner size="lg" /></div>
      ) : appointments.length === 0 ? (
        <Card className="p-12 text-center border border-[#E5D2B8]">
          <Calendar className="w-10 h-10 text-taupe mx-auto mb-3" />
          <h3 className="font-serif text-xl text-espresso">No {activeTab} appointments found</h3>
          <p className="text-xs text-taupe mt-1">Book your next bespoke treatment online in minutes.</p>
          <Button variant="gold" size="sm" className="mt-4" onClick={() => window.location.href = '/book'}>
            Book New Treatment
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <Card key={appt.id} className="p-6 border border-[#E5D2B8] hover:border-gold/60 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-espresso">{appt.booking_reference}</span>
                    <Badge variant={appt.status}>{appt.status.replace('_', ' ')}</Badge>
                    <Badge variant={appt.payment_status === 'paid' ? 'confirmed' : 'pending'}>
                      {appt.payment_status}
                    </Badge>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-espresso">
                    {appt.services?.map(s => s.name).join(' + ') || 'Bespoke Atelier Treatment'}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-taupe">
                    <span className="flex items-center gap-1.5 font-medium text-espresso">
                      <Calendar className="w-3.5 h-3.5 text-gold" /> {appt.appointment_date}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium text-espresso">
                      <Clock className="w-3.5 h-3.5 text-gold" /> {appt.start_time} – {appt.end_time} ({appt.total_duration_minutes}m)
                    </span>
                    <span>Artist: <strong>{appt.stylist_name}</strong></span>
                    <span className="font-serif font-bold text-sm text-espresso">
                      ₹{parseFloat(appt.total_amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 md:pt-0">
                  {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-status-error hover:bg-red-50"
                        onClick={() => handleOpenCancel(appt)}
                      >
                        Cancel
                      </Button>
                    </>
                  )}

                  {appt.status === 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Star}
                      onClick={() => handleOpenReview(appt)}
                    >
                      Leave Review
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Appointment"
        description="Please confirm your cancellation request."
      >
        <div className="space-y-4">
          <p className="text-xs text-taupe">
            Are you sure you want to cancel reference <strong>{selectedApptForCancel?.booking_reference}</strong>?
            Appointments cancelled at least 4 hours in advance incur no cancellation charges.
          </p>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wider text-charcoal">
              Reason for Cancellation
            </label>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full bg-white border border-[#E5D2B8] rounded-sm p-3 text-xs text-espresso focus:outline-none focus:border-gold"
              placeholder="E.g., personal emergency, rescheduling to another week..."
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setCancelModalOpen(false)}>
              Keep Appointment
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmCancel}
              isLoading={cancelMutation.isPending}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Review Submission Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Verified Treatment Review"
        description="Share your experience with the Aurelia community."
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wider text-charcoal">
              Rating (1 to 5 Stars)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="p-1"
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      star <= reviewRating ? 'fill-gold text-gold' : 'text-taupe/40'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wider text-charcoal">
              Your Review & Feedback
            </label>
            <textarea
              rows={4}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Describe the treatment result, styling consultation, or salon atmosphere..."
              className="w-full bg-white border border-[#E5D2B8] rounded-sm p-3 text-xs text-espresso focus:outline-none focus:border-gold"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="gold"
              size="sm"
              onClick={handleConfirmReview}
              isLoading={reviewMutation.isPending}
            >
              Submit Review
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

