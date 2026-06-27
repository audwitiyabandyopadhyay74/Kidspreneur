"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { API_BASE } from '../../../lib/api';
import Island2 from "../../components/Island2Canvas";
import SeaCanvas from "../../components/SeaCanvas";
import AirplaneCanvas from "../../components/a2c";
import "../../globals.css"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Password reset link sent to your email!');
        router.push('/auth/login');
      } else {
        toast.error(data.message || 'Failed to send reset link');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-screen max-h-[100vh] flex items-center justify-center flex-col">
      <div
        className="w-[30%] h-[60%] bg-gray-200 rounded-4xl z-100 fixed"
        style={{ padding: "1rem", marginTop: "15%" }}
      >
        <form onSubmit={handleSubmit} className="w-full h-full flex items-center justify-center flex-col gap-4 z-100">
          <div className="logo-text text-2xl font-semibold text-amber-500 font-[cursive]">
            Forgot Password
          </div>
          
          <p className="text-center w-[80%] text-gray-600 mb-4">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          
          <input
            type="email"
            className="w-[80%] h-[10%] outline-none border-none p-4 rounded-xl bg-white"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <button 
            type="submit" 
            className="w-[40%] h-[8%] rounded-md bg-white hover:scale-110 cursor-pointer"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
          
          <span className="text-[15px] w-[80%] text-center">
            Remember your password?{' '}
            <a href="/auth/login" className="text-blue-500">
              Login
            </a>
          </span>
          
        
        </form>
      </div>

      {/* Background 3D Scenes */}
      <SeaCanvas />
      <Island2 scale={2} />
      <AirplaneCanvas />
    </div>
  );
}
