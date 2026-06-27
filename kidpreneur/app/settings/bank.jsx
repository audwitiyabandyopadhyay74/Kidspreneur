import React, { useState } from 'react';

const BankDetailsPage = ({ user, onUpdate: _onUpdate }) => {
  // onUpdate parameter received but only conditionally called
  const [bankName, setBankName] = useState(user?.bankName || '');
  const [accountNumber, setAccountNumber] = useState(user?.accountNumber || '');
  const [ifsc, setIfsc] = useState(user?.ifsc || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/settings/bank`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ bankName, accountNumber, ifsc }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Bank details updated!');
        if (onUpdate) onUpdate(data);
      } else {
        setMessage(data.message || 'Failed to update.');
      }
    } catch (err) {
      setMessage('Error updating bank details.');
    }
    setLoading(false);
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-md flex flex-col gap-4 w-[400px]">
        <h2 className="text-xl font-bold mb-2">Update Bank Details</h2>
        <input
          type="text"
          placeholder="Bank Name"
          className="p-3 rounded-xl border"
          value={bankName}
          onChange={e => setBankName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Account Number"
          className="p-3 rounded-xl border"
          value={accountNumber}
          onChange={e => setAccountNumber(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="IFSC Code"
          className="p-3 rounded-xl border"
          value={ifsc}
          onChange={e => setIfsc(e.target.value)}
          required
        />
        <button type="submit" className="bg-black text-white rounded-xl p-3 mt-2" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </button>
        {message && <div className="text-center text-sm mt-2">{message}</div>}
      </form>
    </div>
  );
};

export default BankDetailsPage;
