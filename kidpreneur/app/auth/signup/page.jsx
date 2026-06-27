"use client";
import React, { useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { API_BASE } from '../../../lib/api';
import Island2 from "../../components/Island2Canvas";
import SeaCanvas from "../../components/SeaCanvas";
import AirplaneCanvas from "../../components/a2c";
import "../../globals.css"

const Page = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // const [username, setUsername] = useState(''); // unused - username is not used in the form
  const router = useRouter();

  const [type1, setType1] = useState("password");
  const [loading, setLoading] = useState(false);
  const [type2, setType2] = useState("password");
  const ref1 = useRef(null);
  const ref2 = useRef(null);

  const toggleVisibility = (currentType, setType, ref) => {
    if (currentType === "password") {
      setType("text");
      ref.current.classList.remove("fa-eye");
      ref.current.classList.add("fa-eye-slash");
    } else {
      setType("password");
      ref.current.classList.add("fa-eye");
      ref.current.classList.remove("fa-eye-slash");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast.error("Passwords don't match!");
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting signup with API base:', API_BASE);
      const response = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ 
          name, 
          username, 
          email, 
          password, 
          passwordConfirm: confirmPassword,
          country 
        }),
      });

      const data = await response.json();
      console.log('Signup response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create account');
      }

      // If we get here, the request was successful
      const token = data.token || (data.data && data.data.token);
      if (!token) {
        throw new Error('No authentication token received');
      }
      
      // Store the token and notify other components
      localStorage.setItem('token', token);
      // Notify other components about auth state change
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('authStateChange'));
      
      toast.success('Account created successfully!');
      // Force a full page reload to ensure all components get the new auth state
      window.location.href = '/profile';
    } catch (err) {
      const errorMsg = err.message || 'Failed to sign up';
      console.error('Signup error:', errorMsg);
      toast.error(errorMsg);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    window.location.href = `${API_BASE}/api/auth/${provider}`;
  };

  return (
    <div className="max-w-screen max-h-[100vh] flex items-center justify-center flex-col">
      <div
        className="w-[30%] h-[80%] bg-gray-200 rounded-4xl  z-100 fixed"
        style={{ padding: "1rem", marginTop:"17.5%"}}
      >
        <form onSubmit={handleSignup} className=" w-full h-full flex items-center justify-center flex-col gap-4 z-100">
          <div className="logo-text text-2xl font-semibold text-amber-500 font-[cursive]">
            Sign up
          </div>

          <input
            type="text"
            className="w-[80%] h-[10%] outline-none border-none p-4 rounded-xl bg-white"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="text"
            className="w-[80%] h-[10%] outline-none border-none p-4 rounded-xl bg-white"
            placeholder="Country Name"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
          />
          <input
            type="email"
            className="w-[80%] h-[10%] outline-none border-none p-4 rounded-xl bg-white"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            className="w-[80%] h-[10%] outline-none border-none p-4 rounded-xl bg-white"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <div className="flex items-center max-w-[80%] min-w-[80%] max-h-[10%] min-h-[10%]">
            <input
              type={type1}
              className="min-w-full min-h-full outline-none border-none p-4 rounded-xl bg-white z-0"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <i
              ref={ref1}
              className="fa-solid fa-eye ml-[-10%] z-10 cursor-pointer"
              onClick={() => toggleVisibility(type1, setType1, ref1)}
            />
          </div>

          <div className="flex items-center max-w-[80%] min-w-[80%] max-h-[10%] min-h-[10%]">
            <input
              type={type2}
              className="min-w-full min-h-full outline-none border-none p-4 rounded-xl bg-white z-0"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <i
              ref={ref2}
              className="fa-solid fa-eye ml-[-10%] z-10 cursor-pointer"
              onClick={() => toggleVisibility(type2, setType2, ref2)}
            />
          </div>

          <span className="text-[15px] w-[80%] text-center">
            Have an Account?{" "}
            <a href="/auth/login" className="text-blue-500">
              Login
            </a>
          </span>

          <button
            type="submit"
            className="w-[40%] h-[8vh] rounded-md bg-white hover:scale-110 cursor-pointer flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Sign up'
            )}
          </button>
          <span className="text-[15px] w-[80%] text-center">
            Or With
          </span>
          <div className="text-[15px] w-[80%] flex items-center justify-center h-[10vh]" style={{padding:"1rem"}}>
            <div id="social-button" className="flex items-center justify-center gap-[-10px]" onClick={() => handleSocialLogin('google')}>
              <button className="w-[10vh] h-[10vh] border rounded-full z-1 bg-white "><i className="fa-brands fa-google text-2xl"/></button>
              <div id="tooth-clip-button" className=" bg-white w-[10vh] h-[5vh] z-[-1] ml-[-5px] text-bold rounded-r-full flex items-center justify-center">Google</div>
            </div>
            

          </div>
        </form>
      </div>

      {/* Background 3D Scenes */}
      <SeaCanvas />
      <Island2 scale={2} />
      <AirplaneCanvas />
    </div>
  );
};

export default Page;
