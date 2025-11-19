import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, User } from 'lucide-react';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | ''>('');

  // Password strength checker
  const checkPasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength('');
      return;
    }

    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    
    // Uppercase check
    if (/[A-Z]/.test(password)) strength++;
    
    // Lowercase check
    if (/[a-z]/.test(password)) strength++;
    
    // Number check
    if (/[0-9]/.test(password)) strength++;
    
    // Special character check
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;

    if (strength <= 2) setPasswordStrength('weak');
    else if (strength <= 4) setPasswordStrength('medium');
    else setPasswordStrength('strong');
  };

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => api.put(`/users/${user?.id}`, data),
    onSuccess: () => {
      setProfileMessage('✅ Profile updated successfully!');
      setTimeout(() => setProfileMessage(''), 3000);
    },
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.message || error?.message || 'Unknown error';
      setProfileMessage(`❌ Error: ${errorMsg}`);
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (data: any) => api.post('/auth/change-password', data),
    onSuccess: () => {
      setPasswordMessage('✅ Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setPasswordMessage(''), 3000);
    },
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.message || error?.message || 'Unknown error';
      setPasswordMessage(`❌ Error: ${errorMsg}`);
    },
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
    
    // Check strength when new password changes
    if (name === 'newPassword') {
      checkPasswordStrength(value);
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage('❌ New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordMessage('❌ Password must be at least 8 characters');
      return;
    }

    if (!/[A-Z]/.test(passwordData.newPassword)) {
      setPasswordMessage('❌ Password must contain at least one uppercase letter');
      return;
    }

    if (!/[a-z]/.test(passwordData.newPassword)) {
      setPasswordMessage('❌ Password must contain at least one lowercase letter');
      return;
    }

    if (!/[0-9]/.test(passwordData.newPassword)) {
      setPasswordMessage('❌ Password must contain at least one number');
      return;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordData.newPassword)) {
      setPasswordMessage('❌ Password must contain at least one special character (!@#$%^&* etc)');
      return;
    }

    if (passwordStrength !== 'strong') {
      setPasswordMessage('❌ Password is not strong enough. Please meet all requirements');
      return;
    }

    updatePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleProfileChange}
                  placeholder="First name"
                />
              </div>

              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleProfileChange}
                  placeholder="Last name"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  placeholder="Email address"
                />
              </div>

              {profileMessage && (
                <div className="text-sm mt-2">{profileMessage}</div>
              )}

              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="w-full"
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  className={passwordStrength === 'strong' ? 'border-green-500' : passwordStrength === 'medium' ? 'border-yellow-500' : passwordStrength === 'weak' ? 'border-red-500' : ''}
                />
                
                {/* Password Strength Indicator */}
                {passwordData.newPassword && (
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-1">
                      <div className={`h-1 flex-1 rounded ${passwordStrength === 'weak' ? 'bg-red-500' : passwordStrength === 'medium' ? 'bg-yellow-500' : passwordStrength === 'strong' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div className={`h-1 flex-1 rounded ${passwordStrength === 'medium' || passwordStrength === 'strong' ? (passwordStrength === 'medium' ? 'bg-yellow-500' : 'bg-green-500') : 'bg-gray-300'}`}></div>
                      <div className={`h-1 flex-1 rounded ${passwordStrength === 'strong' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    </div>
                    <p className={`text-xs font-semibold ${passwordStrength === 'weak' ? 'text-red-600' : passwordStrength === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                      Strength: {passwordStrength?.toUpperCase()}
                    </p>
                  </div>
                )}

                {/* Password Requirements */}
                <div className="mt-3 p-3 bg-gray-50 rounded text-xs space-y-1">
                  <p className="font-semibold text-gray-700">Password Requirements:</p>
                  <div className={`flex items-center gap-2 ${passwordData.newPassword.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                    <span>{passwordData.newPassword.length >= 8 ? '✓' : '○'}</span>
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-2 ${/[A-Z]/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                    <span>{/[A-Z]/.test(passwordData.newPassword) ? '✓' : '○'}</span>
                    <span>One uppercase letter (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-2 ${/[a-z]/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                    <span>{/[a-z]/.test(passwordData.newPassword) ? '✓' : '○'}</span>
                    <span>One lowercase letter (a-z)</span>
                  </div>
                  <div className={`flex items-center gap-2 ${/[0-9]/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                    <span>{/[0-9]/.test(passwordData.newPassword) ? '✓' : '○'}</span>
                    <span>One number (0-9)</span>
                  </div>
                  <div className={`flex items-center gap-2 ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                    <span>{/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordData.newPassword) ? '✓' : '○'}</span>
                    <span>One special character (!@#$%^&* etc)</span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                />
              </div>

              {passwordMessage && (
                <div className="text-sm mt-2">{passwordMessage}</div>
              )}

              <Button
                type="submit"
                disabled={updatePasswordMutation.isPending}
                className="w-full"
              >
                {updatePasswordMutation.isPending ? 'Updating...' : 'Change Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="font-medium">{user?.role}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{user?.firstName} {user?.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Account Status</p>
              <p className="font-medium">{user?.isActive ? 'Active' : 'Inactive'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
