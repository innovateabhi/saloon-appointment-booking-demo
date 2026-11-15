import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { Sparkles, Mail, Lock, ShieldCheck, User, Scissors } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const loggedUser = await login(email, password);
      if (from !== '/') {
        navigate(from, { replace: true });
      } else if (loggedUser.role_slug === 'admin' || loggedUser.role_slug === 'owner') {
        navigate('/admin/dashboard', { replace: true });
      } else if (loggedUser.role_slug === 'staff') {
        navigate('/staff/dashboard', { replace: true });
      } else {
        navigate('/customer/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError('');
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
          AURELIA
        </h2>
        <p className="mt-1 text-xs uppercase tracking-[0.25em] text-taupe">
          Salon & Beauty Studio Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card glass className="border border-[#E5D2B8] shadow-luxury">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 text-xs text-status-error bg-red-50 border border-status-error/20 rounded-sm">
                  {error}
                </div>
              )}

              <Input
                label="Email Address"
                type="email"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@aurelia.com"
                required
              />

              <Input
                label="Password"
                type="password"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-taupe">
                  <input
                    type="checkbox"
                    className="rounded border-[#E5D2B8] text-gold focus:ring-gold"
                    defaultChecked
                  />
                  <span>Remember session</span>
                </label>
                <span className="text-gold hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>

              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="w-full mt-2"
                isLoading={loading}
              >
                Sign In to Portal
              </Button>
            </form>

            {/* Quick Demo Switcher */}
            <div className="mt-8 pt-6 border-t border-[#F1EAE1]">
              <p className="text-[11px] font-medium uppercase tracking-wider text-taupe text-center mb-3">
                Quick Demo Access (Click to auto-fill)
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoFill('admin@aurelia.com')}
                  className="p-2 border border-[#E5D2B8] rounded-sm bg-ivory/60 hover:border-gold hover:bg-gold/10 transition-colors text-center"
                >
                  <ShieldCheck className="w-4 h-4 text-gold mx-auto mb-1" />
                  <span className="block text-[10px] font-semibold text-espresso">Owner</span>
                  <span className="block text-[9px] text-taupe truncate">admin@aurelia.com</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoFill('elena.rostova@aurelia.com')}
                  className="p-2 border border-[#E5D2B8] rounded-sm bg-ivory/60 hover:border-gold hover:bg-gold/10 transition-colors text-center"
                >
                  <Scissors className="w-4 h-4 text-gold mx-auto mb-1" />
                  <span className="block text-[10px] font-semibold text-espresso">Stylist</span>
                  <span className="block text-[9px] text-taupe truncate">elena.rostova</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoFill('clara.oswald@example.com')}
                  className="p-2 border border-[#E5D2B8] rounded-sm bg-ivory/60 hover:border-gold hover:bg-gold/10 transition-colors text-center"
                >
                  <User className="w-4 h-4 text-gold mx-auto mb-1" />
                  <span className="block text-[10px] font-semibold text-espresso">Customer</span>
                  <span className="block text-[9px] text-taupe truncate">clara.oswald</span>
                </button>
              </div>
            </div>

            <div className="mt-6 text-center text-xs text-taupe">
              <span>New to Aurelia Studio? </span>
              <Link to="/register" className="text-gold font-semibold hover:underline">
                Create Customer Account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

