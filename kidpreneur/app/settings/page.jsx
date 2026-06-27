"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ImageUpload from '../components/ImageUpload';

const DEFAULT_PROFILE = '/default-profile.png'; // Place a default image in public/

const Page = () => {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    profileImage: '',
    country: '',
    category: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch user profile on mount
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/users/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          setForm({
            fullName: data.name || '',
            username: data.username || '',
            email: data.email || '',
            password: '',
            profileImage: data.profileImage || '',
            country: data.country || '',
            category: data.category || '',
          });
        }
      } catch {}
    };
    fetchProfile();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = url => {
    setForm(f => ({ ...f, profileImage: url }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          name: form.fullName,
          email: form.email,
          country: form.country,
          profileImage: form.profileImage,
          category: form.category,
        }),
      });
      const data = await res.json();
      if (res.ok) setMessage('Profile updated!');
      else setMessage(data.message || 'Update failed.');
    } catch {
      setMessage('Error updating profile.');
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar user={user} />
      <div className="w-screen h-screen flex items-center justify-center">
        <div className='w-[60%] h-[90%] bg-gray-200 flex items-center justify-center rounded-4xl gap-4'>
          <div className="sidebar w-[35%] h-full flex flex-col items-center justify-center gap-4" style={{ padding: '1rem' }}>
            <a href="/settings" className='w-[90%] h-[10vh] bg-white rounded-2xl'>
              <button className='w-full h-full bg-white rounded-2xl'>Edit Profile</button>
            </a>
            <a href="/settings/change-password" className='w-[90%] h-[10vh] bg-white rounded-2xl'>
              <button className='w-full h-full bg-white rounded-2xl'>Change Password</button>
            </a>
            <a href="/settings/bank" className='w-[90%] h-[10vh] bg-white rounded-2xl'>
              <button className='w-full h-full bg-white rounded-2xl'>Bank Details</button>
            </a>
          </div>
          <form onSubmit={handleSubmit} className='w-[65%] h-[90%] bg-gray-200 flex items-center justify-center rounded-4xl flex-col gap-4'>
            <ImageUpload value={form.profileImage || DEFAULT_PROFILE} onChange={handleImageChange} />
            <input
              type="text"
              className="w-[80%] h-[10%] outline-none border-none p-4 rounded-xl bg-white"
              placeholder="Full Name"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
            />
            <input
              type="text"
              className="w-[80%] h-[10%] outline-none border-none p-4 rounded-xl bg-white"
              placeholder="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
            />
            <input
              type="email"
              className="w-[80%] h-[10%] outline-none border-none p-4 rounded-xl bg-white"
              placeholder="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
            <input
              type="password"
              className="w-[80%] h-[10%] outline-none border-none p-4 rounded-xl bg-white"
              placeholder="Password"
              name="password"
              value={form.password}
              onChange={handleChange}
            />
            <div className="buttons flex w-full flex-row gap-4 items-center justify-center">
              <button className='w-[25vh] h-[10vh] bg-black rounded-2xl text-white' type='submit' disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button className='w-[20vh] h-[10vh] rounded-2xl' type='reset'>Undo</button>
            </div>
            {message && <div className="text-center text-sm mt-2">{message}</div>}
          </form>
        </div>
      </div>
    </>
  );
};

export default Page;
