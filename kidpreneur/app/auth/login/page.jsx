"use client"
import React, { useRef, useState } from "react";
import Island2 from "../../components/Island2Canvas";
import SeaCanvas from "../../components/SeaCanvas";
import AirplaneCanvas from "../../components/a2c";
import "../../globals.css"
import { toast } from 'react-toastify';
import { API_BASE } from '../../../lib/api';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const [type, setType] = useState("password");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const ref = useRef(null);

  // Toggle password visibility
  const toggleVisibility = (e) => {
    e.preventDefault();
    if (type === "password") {
      setType("text");
      ref.current.classList.remove("fa-eye");
      ref.current.classList.add("fa-eye-splash");
    } else {
      setType("password");
      ref.current.classList.add("fa-eye");
      ref.current.classList.remove("fa-eye-splash");
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Sending login request to:', `${API_BASE}/api/auth/login`);
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      // First, get the raw response text
      const responseText = await response.text();
      console.log('Raw login response:', responseText);
      
      // Try to parse it as JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed login response:', data);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error('Invalid response from server');
      }

      if (response.ok) {
        // Extract token from response - the token is at the root level of the response
        const token = data.token;
        
        if (!token) {
          console.error('No authentication token found in response:', data);
          throw new Error('No authentication token received from server');
        }
        
        console.log('Storing token in localStorage');
        localStorage.setItem('token', token);
        
        // Store user data in localStorage for immediate access
        if (data.data && data.data.user) {
          localStorage.setItem('user', JSON.stringify(data.data.user));
        }
        
        // Notify other components about auth state change
        console.log('Dispatching auth state change events');
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('authStateChange', { 
          detail: { 
            isAuthenticated: true,
            user: data.data?.user
          } 
        }));
        
        toast.success('Login successful!');
        
        // Use a small timeout to ensure state updates propagate
        setTimeout(() => {
          // Force a full page reload to ensure all components get the new auth state
          window.location.href = '/explore';
        }, 100);
      } else {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-screen max-h-[100vh] flex items-center justify-center flex-col">
      <div
        className="w-[30%] h-[70%] bg-gray-200 rounded-4xl z-100 fixed"
        style={{ padding: "1rem", marginTop: "15%" }}
      >
        <form onSubmit={handleSubmit} className="w-full h-full flex items-center justify-center flex-col gap-4 z-100">
          <div className="logo-text text-2xl font-semibold text-amber-500 font-[cursive]">
            Login
          </div>

          <input
            type="email"
            className="w-[80%] h-[10%] outline-none border-none p-4 rounded-xl bg-white"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="flex items-center max-w-[80%] min-w-[80%] max-h-[10%] min-h-[10%]">
            <input
              type={type}
              className="min-w-full min-h-full outline-none border-none p-4 rounded-xl bg-white z-0"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <i
              ref={ref}
              className="fa-solid fa-eye ml-[-10%] z-10 cursor-pointer"
              onClick={toggleVisibility}
            />
          </div>

          <span className="text-[15px] w-[80%] text-right">
            <a href="/auth/forget-password" className="text-blue-500">
              Forgot Password?
            </a>
          </span>

          <button
            type="submit"
            className="w-[40%] h-[6vh] rounded-md bg-white hover:scale-110 cursor-pointer"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <span className="text-[15px] w-[80%] text-center">
            Don't have an account?{" "}
            <a href="/auth/signup" className="text-blue-500">
              Sign up
            </a>
          </span>

          <span className="text-[15px] w-[80%] text-center">
            Or With
          </span>

          <div className="text-[15px] w-[80%] flex items-center justify-center h-[10vh]" style={{padding:"1rem"}}>
            <div id="social-button" className="flex items-center justify-center gap-[-10px]" onClick={() => window.location.href = `${API_BASE}/api/auth/google`}>
              <button className="w-[10vh] h-[10vh] border rounded-full z-1 bg-white">
                <i className="fa-brands fa-google text-2xl"/>
              </button>
              <div id="tooth-clip-button" className="bg-white w-[10vh] h-[5vh] z-[-1] ml-[-5px] text-bold rounded-r-full flex items-center justify-center">
                Google
              </div>
            </div>
            
          </div>
        </form>
      </div>

      {/* Background 3D Scenes */}
      <SeaCanvas />
      <Island2 scale={2} />
      <AirplaneCanvas />

      {/* Background 3D Scenes
      <SeaCanvas />
      <Island2 />
      <AirplaneCanvas /> */}
    </div>
  );
};

export default LoginPage;
