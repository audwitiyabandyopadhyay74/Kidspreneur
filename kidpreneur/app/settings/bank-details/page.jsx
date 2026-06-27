"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { toast } from 'react-toastify';
import { API_BASE } from '../../../lib/api';

const Page = () => {
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/auth/login';
      return;
    }

    const fetchBankDetails = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/settings/bank-details`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          const details = data.bankDetails || data; // handle either shape
          setBankName(details.bankName || '');
          setAccountNumber(details.accountNumber || '');
          setIfscCode(details.ifscCode || '');
        } else {
          toast.error('Failed to fetch bank details');
        }
      } catch (error) {
        toast.error('Error fetching bank details:' + error.message);
      }
    };

    fetchBankDetails();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_BASE}/api/settings/bank-details`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bankName, accountNumber, ifscCode }),
      });

      if (res.ok) {
        toast.success('Bank details updated successfully!');
      } else {
        const errData = await res.json();
        toast.error(errData.message || 'Failed to update details.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="w-screen h-screen flex items-center justify-center">
        <div className='w-[60%] h-[90%] bg-gray-200 flex items-center justify-center rounded-4xl gap-4'>
                 <div className='w-[60%] h-[90%] bg-gray-200 flex items-center justify-center rounded-4xl  gap-4' >
<div className="sidebar w-[35%] h-full flex flex-col items-center justify-center gap-4" style={{padding:"1rem"}} >
   <a href="/settings"  className='w-[90%] h-[10vh] bg-white rounded-2xl'>
    <button className='w-full h-full bg-white rounded-2xl'>Edit Profile </button>
   
   </a>
<a href="/settings/change-password" className='w-[90%] h-[10vh] bg-white rounded-2xl'>
    <button className='w-full h-full bg-white rounded-2xl'>Change Password</button>

</a>
<a href="/settings/bank-details" className='w-[90%] h-[10vh] bg-white rounded-2xl'>
    <button className='w-full h-full bg-white rounded-2xl'>Bank Details</button>

</a>
</div>
</div>
          <form onSubmit={handleSubmit} className='w-[65%] h-[90%] bg-gray-200 flex items-center justify-center rounded-4xl flex-col gap-4'>
            <h2 className="text-2xl font-bold mb-4">Bank Account Details</h2>
            
            <input
              type="text"
              className="w-[80%] h-[10%] outline-none border-none p-4 rounded-xl bg-white"
              placeholder="Bank Name"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
            />

            <input
              type="text"
              className="w-[80%] h-[10%] outline-none border-none p-4 rounded-xl bg-white"
              placeholder="Account Number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />

            <input
              type="text"
              className="w-[80%] h-[10%] outline-none border-none p-4 rounded-xl bg-white"
              placeholder="IFSC Code"
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value)}
            />

            <div className="buttons flex w-full flex-row gap-4 items-center justify-center">
              <button className='w-[25vh] h-[10vh] bg-black rounded-2xl text-white' type='submit'>Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Page;
