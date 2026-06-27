'use client';
import React, { useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import Island2 from "../../../components/Island2Canvas";
import SeaCanvas from "../../../components/SeaCanvas";
import AirplaneCanvas from "../../../components/a2c";
import "../../../globals.css";
import { API_BASE } from '../../../../lib/api';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [type1, setType1] = useState('password');
  const [type2, setType2] = useState('password');
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const router = useRouter();
  const params = useParams();
  const { token } = params;

  // Toggle password visibility
  const toggleVisibility = (currentType, setType, ref) => {
    if (currentType === 'password') {
      setType('text');
      ref.current.classList.remove('fa-eye');
      ref.current.classList.add('fa-eye-slash');
    } else {
      setType('password');
      ref.current.classList.add('fa-eye');
      ref.current.classList.remove('fa-eye-slash');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || 'Password has been reset successfully.');
        router.push('/auth/login');
      } else {
        toast.error(data.message || 'Failed to reset password.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Background Elements */}
      <div className="absolute inset-0 w-full h-full z-0">
        <SeaCanvas />
        <Island2 />
        <AirplaneCanvas />
      </div>
      
      {/* Form Container */}
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl z-10 p-8">
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-6 py-4">
          <div className="text-3xl font-semibold text-amber-500 font-[cursive] mb-2">
            Reset Password
          </div>
          
          <p className="text-center text-gray-600 mb-4">
            Create a strong new password for your account.
          </p>

          <div className="w-full space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">New Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={type1}
                  className="w-full px-4 py-3 pr-10 rounded-xl bg-white border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility(type1, setType1, ref1)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <i ref={ref1} className="fa-solid fa-eye" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={type2}
                  className="w-full px-4 py-3 pr-10 rounded-xl bg-white border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility(type2, setType2, ref2)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <i ref={ref2} className="fa-solid fa-eye" />
                </button>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resetting...
              </>
            ) : 'Reset Password'}
          </button>

          <div className="w-full pt-4 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              <a href="/auth/login" className="font-medium text-blue-500 hover:underline">
                Back to Login
              </a>
            </p>
          </div>
        </form>
      </div>
      
      {/* Background 3D Scenes */}
      <SeaCanvas />
      <Island2 />
      <AirplaneCanvas />
    </div>
  );
};

export default ResetPasswordPage;
