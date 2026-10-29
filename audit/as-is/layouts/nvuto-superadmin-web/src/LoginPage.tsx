import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Form } from './components/ui';
import { Card } from './app/ui/card';
import { sysadminLogin } from './sysadminService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import nvutoHrSvg from './assets/NVUTO HR.svg';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await sysadminLogin({ email, password });
      const responseData = response?.data || (response as any);
      if (responseData) {
        const isSuperAdmin = responseData.is_nvuto_super_admin === true || 
                             responseData.role === 'superadmin' || 
                             responseData.role === 'sysadmin' ||
                             responseData.role === 'nvuto_super_admin';
        if (!isSuperAdmin) {
          throw new Error('Access denied. Superadmin claims required.');
        }
        setUser(responseData);
        addToast('success', 'Sign In Successful', 'Welcome to the Platform Admin Console.');
        navigate('/superadmin/tenants');
      } else {
        throw new Error('Login failed');
      }
    } catch (err: any) {
      const errMsg = err?.message || 'Authentication failed. Please verify credentials.';
      setError(errMsg);
      addToast('error', 'Authentication Failed', errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] font-sans p-6">
      <Card className="max-w-md w-full p-8 bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3">
          <img src={nvutoHrSvg} alt="NVUTO HR Logo" className="h-10 w-auto select-none animate-fade-in" />
          <h2 className="text-2xl font-extrabold text-slate-900 mt-2">Super Admin Sign In</h2>
          <p className="text-sm text-slate-500 text-center">Enter your platform security credentials.</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-[#BE123C] text-sm rounded-lg p-3 font-semibold text-center select-none animate-shake">
            {error}
          </div>
        )}

        <Form onSubmit={handleLoginSubmit} className="flex flex-col gap-5">
          <Input
            id="email-input"
            label="SYSTEM ADMIN EMAIL"
            type="email"
            placeholder="admin@nvuto.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="!bg-white border-slate-300 focus:!border-slate-400"
          />

          <Input
            id="password-input"
            label="SECURITY TOKEN / PASSWORD"
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="!bg-white border-slate-300 focus:!border-slate-400"
          />

          <Button
            type="submit"
            disabled={isSubmitting}
            isLoading={isSubmitting}
            className="w-full bg-[#111184] hover:bg-[#0a0a54] text-white font-bold h-12 shadow-sm rounded-lg border-0 mt-2"
          >
            Authenticate Console
          </Button>
        </Form>
      </Card>
    </div>
  );
};
