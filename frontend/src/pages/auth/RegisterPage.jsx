import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { Sparkles, Mail, Lock, User, Phone, Gift } from 'lucide-react';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    marketing_opt_in_email: true,
    marketing_opt_in_whatsapp: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register(formData);
      navigate('/customer/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-full bg-espresso flex items-center justify-center text-gold border border-gold/40 shadow-sm transition-transform group-hover:scale-105">
            <Sparkles className="w-6 h-6" />
          </div>
        </Link>
        <h2 className="mt-4 font-serif text-3xl font-semibold tracking-wider text-espresso">
          Join Aurelia Privilege
        </h2>
        <p className="mt-1 text-xs uppercase tracking-[0.25em] text-taupe">
          Exclusive Appointments & Loyalty Privileges
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card glass className="border border-[#E5D2B8] shadow-luxury">
          <CardContent className="p-8">
            {/* Welcome banner */}
            <div className="mb-6 p-3 bg-cream/70 border border-gold/30 rounded-sm flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold shrink-0">
                <Gift className="w-4 h-4" />
              </div>
              <p className="text-[11px] text-espresso leading-snug">
                <span className="font-semibold text-gold-dark">Welcome Gift:</span> Receive 50 complimentary Aurelia Privilege Points upon signing up today!
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-xs text-status-error bg-red-50 border border-status-error/20 rounded-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="First Name"
                  name="first_name"
                  icon={User}
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Eleanor"
                  required
                />
                <Input
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Vane"
                  required
                />
              </div>

              <Input
                label="Email Address"
                name="email"
                type="email"
                icon={Mail}
                value={formData.email}
                onChange={handleChange}
                placeholder="eleanor@example.com"
                required
              />

              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                icon={Phone}
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 00000"
                required
              />

              <Input
                label="Password"
                name="password"
                type="password"
                icon={Lock}
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                required
              />

              <div className="pt-2 space-y-2">
                <label className="flex items-start gap-2.5 text-xs text-taupe cursor-pointer">
                  <input
                    type="checkbox"
                    name="marketing_opt_in_email"
                    checked={formData.marketing_opt_in_email}
                    onChange={handleChange}
                    className="mt-0.5 rounded border-[#E5D2B8] text-gold focus:ring-gold"
                  />
                  <span>Receive bespoke salon invitations & private seasonal packages by email.</span>
                </label>

                <label className="flex items-start gap-2.5 text-xs text-taupe cursor-pointer">
                  <input
                    type="checkbox"
                    name="marketing_opt_in_whatsapp"
                    checked={formData.marketing_opt_in_whatsapp}
                    onChange={handleChange}
                    className="mt-0.5 rounded border-[#E5D2B8] text-gold focus:ring-gold"
                  />
                  <span>Receive WhatsApp booking reminders and direct concierge updates.</span>
                </label>
              </div>

              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="w-full mt-4"
                isLoading={loading}
              >
                Create My Account
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-taupe">
              <span>Already a member? </span>
              <Link to="/login" className="text-gold font-semibold hover:underline">
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

