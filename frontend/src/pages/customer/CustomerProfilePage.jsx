import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from 'sonner';
import { User, Lock, Save, Shield } from 'lucide-react';

export const CustomerProfilePage = () => {
  const { user, refreshUser } = useAuth();

  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
  });

  const [passData, setPassData] = useState({
    current_password: '',
    new_password: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put('/auth/profile', profileData);
      toast.success('Profile details updated.');
      refreshUser();
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passData.current_password || !passData.new_password) return;
    setSavingPass(true);
    try {
      await api.put('/auth/password', passData);
      toast.success('Password changed successfully.');
      setPassData({ current_password: '', new_password: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to change password.');
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-espresso">Profile & Security Credentials</h2>
        <p className="text-xs text-taupe mt-0.5">Manage your personal identification, phone number, and account password</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Details Form */}
        <Card className="p-6 border border-[#E5D2B8] space-y-4">
          <h4 className="font-serif text-lg font-bold text-espresso border-b border-[#F1EAE1] pb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-gold" /> Personal Information
          </h4>

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <Input
              label="First Name"
              value={profileData.first_name}
              onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              value={profileData.last_name}
              onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
              required
            />
            <Input
              label="Phone Number"
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              required
            />

            <div className="pt-2">
              <Button type="submit" variant="gold" size="md" className="w-full" isLoading={savingProfile} icon={Save}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Change Password Form */}
        <Card className="p-6 border border-[#E5D2B8] space-y-4">
          <h4 className="font-serif text-lg font-bold text-espresso border-b border-[#F1EAE1] pb-2 flex items-center gap-2">
            <Lock className="w-4 h-4 text-gold" /> Account Security
          </h4>

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <Input
              label="Current Password"
              type="password"
              value={passData.current_password}
              onChange={(e) => setPassData({ ...passData, current_password: e.target.value })}
              required
            />
            <Input
              label="New Password"
              type="password"
              value={passData.new_password}
              onChange={(e) => setPassData({ ...passData, new_password: e.target.value })}
              placeholder="At least 6 characters"
              required
            />

            <div className="pt-2">
              <Button type="submit" variant="outline" size="md" className="w-full" isLoading={savingPass} icon={Shield}>
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

