"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { API_BASE } from '../../../lib/api';

// Function to load Razorpay script
const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

const IdeaPage = () => {
  const { id } = useParams();
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [fundAmount, setFundAmount] = useState('');

  useEffect(() => {
    if (id) {
      fetchIdea();
    }
  }, [id]);

  const fetchIdea = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/ideas/${id}`);
      if (res.ok) {
        const ideaData = await res.json();
        setIdea(ideaData);
        setLikes(ideaData.likes?.length || 0);
        setDislikes(ideaData.dislikes?.length || 0);
        setComments(ideaData.comments || []);
      } else {
        toast.error('Idea not found');
      }
    } catch (error) {
      toast.error('Failed to fetch idea');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("You must be logged in to do that.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/ideas/${id}/${action}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const updatedIdea = await res.json();
        setLikes(updatedIdea.likes.length);
        setDislikes(updatedIdea.dislikes.length);
        toast.success(`Idea ${action}d!`);
      } else {
        toast.error(`Failed to ${action} the idea`);
      }
    } catch (error) {
      toast.error(`Error on ${action}: ${error.message}`);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("You must be logged in to comment.");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please enter a comment.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/ideas/${id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: comment }),
      });

      if (res.ok) {
        const updatedIdea = await res.json();
        setComments(updatedIdea.comments);
        setComment("");
        toast.success("Comment added successfully!");
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to add comment");
      }
    } catch (error) {
      toast.error(`Error adding comment: ${error.message}`);
    }
  };

  const handleFundIdea = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("You must be logged in to fund an idea.");
      return;
    }

    // Load Razorpay script if not already loaded
    if (!window.Razorpay) {
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error('Failed to load payment gateway. Please try again.');
        return;
      }
    }

    if (!fundAmount || fundAmount <= 0) {
      toast.error("Please enter a valid amount to fund.");
      return;
    }

    try {
      // Step 1: Check if idea creator has bank details
      const checkBankDetailsRes = await fetch(`${API_BASE}/api/ideas/${id}/fund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: parseFloat(fundAmount) }),
      });

      const checkBankDetailsData = await checkBankDetailsRes.json();

      if (!checkBankDetailsRes.ok) {
        toast.error(checkBankDetailsData.message || "Failed to check bank details.");
        return;
      }

      // Step 2: Create Razorpay order
      const createOrderRes = await fetch(`${API_BASE}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(fundAmount),
          ideaId: id,
          ideaCreatorId: checkBankDetailsData.ideaCreatorId,
        }),
      });

      const orderData = await createOrderRes.json();

      if (!createOrderRes.ok) {
        toast.error(orderData.message || "Failed to create payment order.");
        return;
      }

      // Step 3: Open Razorpay popup
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK failed to load. Please refresh the page and try again.');
      }

      // Ensure the Razorpay script is fully loaded
      if (typeof window.Razorpay === 'undefined') {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Kidpreneur",
        description: `Funding for idea: ${idea.title}`,
        order_id: orderData.id,
        handler: async function (response) {
          // Step 4: Verify payment
          const verifyPaymentRes = await fetch(`${API_BASE}/api/payments/verify-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyPaymentData = await verifyPaymentRes.json();

          if (verifyPaymentRes.ok && verifyPaymentData.status === 'success') {
            toast.success("Payment successful! Thank you for funding.");
          } else {
            toast.error(verifyPaymentData.message || "Payment verification failed.");
          }
        },
        prefill: {
          name: idea.createdBy?.name || '',
          email: idea.createdBy?.email || '',
        },
        theme: {
          color: "#3399CC",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      toast.error(`Error funding idea: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <div className="text-2xl text-red-500">Idea not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Idea Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <Image 
            src={idea?.image?.url || "/cat1.png"}
            width={600} 
            height={300} 
            className="w-full h-64 object-cover" 
            alt={idea.title || 'Idea Image'} 
          />
          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">{idea.title}</h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">{idea.description}</p>
              
              {/* Author Info */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {idea.createdBy?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">By {idea.createdBy?.name || 'Unknown'}</p>
                  <p className="text-gray-500 text-sm">@{idea.createdBy?.username || 'user'}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 mb-6">
                <button 
                  onClick={() => handleAction('like')} 
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                >
                  <i className="fa-solid fa-thumbs-up"></i>
                  <span className="font-semibold">{likes}</span>
                </button>
                <button 
                  onClick={() => handleAction('dislike')} 
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                >
                  <i className="fa-solid fa-thumbs-down"></i>
                  <span className="font-semibold">{dislikes}</span>
                </button>
                <button 
                  onClick={handleFundIdea} 
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors"
                >
                  <i className="fa-solid fa-coins"></i>
                  <span className="font-semibold">Fund Idea</span>
                </button>
              </div>

              {/* Funding Input */}
              <div className="mb-6">
                <input
                  type="number"
                  placeholder="Amount to fund (₹)"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  className="w-full max-w-xs p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Comments ({comments.length})</h2>
            
            {/* Comment Form */}
            <form onSubmit={handleComment} className="mb-8">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
                >
                  Comment
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((c, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 mb-2">{c.text}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <i className="fa-solid fa-user"></i>
                    <span>{c.user?.createdBy?.name || 'Anonymous'}</span>
                    <span>•</span>
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    // </div  >
  );
};

export default IdeaPage;
