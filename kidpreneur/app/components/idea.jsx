"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { API_BASE } from "../../lib/api";

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Idea = ({ idea }) => {
  // Guard against missing idea prop
  if (!idea) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg text-center text-gray-500">
        No idea data
      </div>
    );
  }

  // Safe initial states with fallbacks
  const [likes, setLikes] = useState(idea?.likes?.length || 0);
  const [dislikes, setDislikes] = useState(idea?.dislikes?.length || 0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(idea?.comments || []);
  const [fundAmount, setFundAmount] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', category: '' });
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    loadRazorpayScript();
    
    // Fetch current user data and follow status
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE}/api/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const userData = await res.json();
          setCurrentUser(userData);
          
          // Check if current user follows the idea author
          const authorId = idea?.createdBy?._id;
          if (authorId) {
            const followingIds = (userData.following || []).map(id => 
              String(typeof id === 'string' ? id : id?._id || id)
            );
            setIsFollowing(followingIds.includes(String(authorId)));
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [idea?.createdBy?._id]);

  const handleAction = async (action) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/ideas/${idea._id}/${action}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
      });

      if (res.ok) {
        const updatedIdea = await res.json();
        setLikes(updatedIdea?.likes?.length || 0);
        setDislikes(updatedIdea?.dislikes?.length || 0);
      } else {
        // silently ignore UI toast for like/dislike per requirement
      }
    } catch (error) {
      // no toast
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to comment.");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please enter a comment.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/ideas/${idea._id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: comment }),
      });

      if (res.ok) {
        const updatedIdea = await res.json();
        setComments(updatedIdea?.comments || []);
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

  const handleFollowToggle = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to follow users');
      return;
    }

    const authorId = idea?.createdBy?._id;
    if (!authorId) {
      toast.error('Author information not available');
      return;
    }

    try {
      const endpoint = isFollowing ? 'unfollow' : 'follow';
      const res = await fetch(`${API_BASE}/api/users/${authorId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setIsFollowing(!isFollowing);
        toast.success(data.message || (isFollowing ? 'Unfollowed' : 'Followed'));
        
        // Dispatch follow action notification
        window.dispatchEvent(new CustomEvent('follow-action', {
          detail: {
            action: isFollowing ? 'unfollow' : 'follow',
            username: idea?.createdBy?.name || idea?.createdBy?.username || 'User'
          }
        }));
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Failed to follow/unfollow user');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to follow/unfollow user');
    }
  };

  const handleEditClick = () => {
    setEditForm({
      title: idea.title || '',
      description: idea.description || '',
      category: idea.category || ''
    });
    setImagePreview('');
    setImageFile(null);
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to edit ideas');
      return;
    }

    try {
      const fd = new FormData();
      fd.append('title', editForm.title);
      fd.append('description', editForm.description);
      fd.append('category', editForm.category);
      if (imageFile) fd.append('image', imageFile);
      
      const res = await fetch(`${API_BASE}/api/ideas/${idea._id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      
      const updated = await res.json();
      if (res.ok) {
        // Update the idea prop by calling a callback if provided
        if (window.updateIdeaCallback) {
          window.updateIdeaCallback(updated);
        }
        setShowEditModal(false);
        setEditForm({ title: '', description: '', category: '' });
        setImagePreview('');
        setImageFile(null);
        toast.success('Idea updated successfully');
      } else {
        toast.error(updated.message || 'Failed to update idea');
      }
    } catch (error) {
      console.error('Error updating idea:', error);
      toast.error('Failed to update idea');
    }
  };

  const handleFundIdea = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to fund an idea.");
      return;
    }

    if (!fundAmount || fundAmount <= 0) {
      toast.error("Please enter a valid amount to fund.");
      return;
    }

    try {
      // Step 1: Check bank details
      const checkBankDetailsRes = await fetch(
        `${API_BASE}/api/ideas/${idea._id}/fund`,
        {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: parseFloat(fundAmount) }),
        }
      );

      const checkBankDetailsData = await checkBankDetailsRes.json();

      if (!checkBankDetailsRes.ok) {
        toast.error(
          checkBankDetailsData.message || "Failed to check bank details."
        );
        return;
      }

      // Step 2: Create Razorpay order
      const createOrderRes = await fetch(
        `${API_BASE}/api/payments/create-order`,
        {
          method: "POST",
        headers: {
            "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(fundAmount),
          ideaId: idea._id,
            ideaCreatorId: checkBankDetailsData.ideaCreatorId,
        }),
        }
      );

      const orderData = await createOrderRes.json();

      if (!createOrderRes.ok) {
        toast.error(orderData.message || "Failed to create payment order.");
        return;
      }

      // Step 3: Open Razorpay popup
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Kidpreneur",
        description: `Funding for idea: ${idea.title}`,
        order_id: orderData.id,
        handler: async function (response) {
          // Step 4: Verify payment
          const verifyPaymentRes = await fetch(
            `${API_BASE}/api/payments/verify-payment`,
            {
              method: "POST",
            headers: {
                "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
            }
          );

          const verifyPaymentData = await verifyPaymentRes.json();

          if (
            verifyPaymentRes.ok &&
            verifyPaymentData.status === "success"
          ) {
            toast.success("Payment successful! Thank you for funding.");
          } else {
            toast.error(
              verifyPaymentData.message || "Payment verification failed."
            );
          }
        },
        prefill: {
          name: idea?.createdBy?.name || "",
          email: idea?.createdBy?.email || "",
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

  return (
    <div
      className="min-w-[50vh] max-w-[40vh] min-h-[60vh] max-h-max mt-[10%] bg-gray-200 rounded-4xl flex items-center justify-start flex-col gap-4 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => window.location.href = `/idea/${idea._id}`}
    >
      <Image
        src={idea?.image?.url || "/cat1.png"}
        width={400}
        height={200}
        className="w-full h-[35%] rounded-4xl object-cover"
        alt={idea.title || "Idea image"}
      />
      <span className="text-2xl font-bold w-full h-max text-center hover:text-amber-500 transition-colors break-words line-clamp-2 px-3">
        {idea.title || "Untitled Idea"}
      </span>
      <p className="max-w-full min-w-full h-max p-4">
        {idea.description || "No description available."}
      </p>

      {/* User Info Section */}
      <div className="w-full px-4 py-3 border-t border-gray-300 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {/* User Profile Picture */}
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            {idea?.createdBy?.profileImage ? (
              <Image
                src={idea.createdBy.profileImage}
                alt={idea.createdBy.name || 'User'}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                {idea?.createdBy?.name?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          
          {/* Username */}
          <span className="text-gray-700 font-medium truncate">
            {idea?.createdBy?.name || idea?.createdBy?.username || 'Unknown User'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {(() => {
            const isOwner = currentUser && idea?.createdBy?._id && String(idea.createdBy._id) === String(currentUser._id);
            const isOtherUser = currentUser && idea?.createdBy?._id && String(idea.createdBy._id) !== String(currentUser._id);
            
            if (isOwner) {
              return (
                <span className="text-sm text-gray-500 italic">You</span>
              );
            } else if (isOtherUser) {
              return (
                <button
                  onClick={(e) => { e.stopPropagation(); handleFollowToggle(); }}
                  className={`follow-button flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    isFollowing 
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
                      : 'bg-amber-500 hover:bg-amber-600 text-white'
                  }`}
                >
                  <i className={`fa-solid ${isFollowing ? 'fa-user-minus' : 'fa-user-plus'}`}></i>
                  <span>{isFollowing ? 'Unfollow' : 'Follow'}</span>
                </button>
              );
            }
            return null;
          })()}
        </div>
      </div>

      {/* Like / Dislike / Fund / Edit */}
      <div
        className="support-and-like flex w-full gap-2 justify-center p-4 flex-wrap"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => handleAction("like")}
          className="like flex items-center gap-2 px-3 py-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
        >
          <i className="fa-solid fa-thumbs-up"></i>
          <span className="font-semibold">{likes}</span>
        </button>
        <button
          onClick={() => handleAction("dislike")}
          className="dislike flex items-center gap-2 px-3 py-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
        >
          <i className="fa-solid fa-thumbs-down"></i>
          <span className="font-semibold">{dislikes}</span>
        </button>
        {currentUser && idea?.createdBy?._id && String(idea.createdBy._id) === String(currentUser._id) ? (
          <button
            onClick={(e) => { e.stopPropagation(); handleEditClick(); }}
            className="edit-button flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors bg-blue-500 hover:bg-blue-600 text-white"
          >
            <i className="fa-solid fa-edit"></i>
            <span>Edit</span>
          </button>
        ) : null}
        <button
          onClick={(e) => { e.stopPropagation(); const el = document.getElementById(`fund-input-${idea._id}`); if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none'; }}
          className="fund-button flex items-center gap-2 px-3 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors"
        >
          <i className="fa-solid fa-coins"></i>
          <span className="font-semibold">Fund</span>
        </button>
      </div>

         {/* Fund amount input */}
      <div className="w-full px-4 mb-4" style={{display:'none'}} id={`fund-input-${idea._id}`} onClick={(e)=>e.stopPropagation()}>
        <input
          type="number"
          placeholder="Amount to fund"
          value={fundAmount}
          onChange={(e) => setFundAmount(e.target.value)}
          className="w-full p-2 border rounded"
          min="1"
        />
        <button onClick={handleFundIdea} className="w-full mt-2 p-2 bg-green-500 text-white rounded">Proceed to Pay</button>
      </div>

      {/* Comments Section */}
      <div className="w-full px-4 hidden" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleComment}>
          <input
            type="text"
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="w-full p-2 mt-2 text-white bg-indigo-500 rounded"
          >
            Comment
          </button>
        </form>
        <div className="mt-4 space-y-2">
          {comments.map((c, index) => (
            <div key={index} className="p-3 bg-gray-100 rounded-lg">
              <p className="text-gray-800">{c.text}</p>
              <small className="text-gray-500">
                <i className="fa-solid fa-user mr-1"></i>
                {c.user?.createdBy?.name || "Anonymous"}
              </small>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={(e) => { if (e.target === e.currentTarget) setShowEditModal(false); }}>
          <div className="bg-white w-full max-w-4xl rounded-3xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6" onClick={(e) => e.stopPropagation()}>
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Edit Idea</h3>
              <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Idea Title</label>
                  <input 
                    className="w-full border rounded-lg p-3" 
                    name="title" 
                    placeholder="Enter your amazing idea title..." 
                    value={editForm.title} 
                    onChange={handleEditChange} 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Description</label>
                  <textarea 
                    className="w-full border rounded-lg p-3 h-40" 
                    name="description" 
                    placeholder="Describe your idea in detail. What problem does it solve? How does it work? What makes it unique?" 
                    value={editForm.description} 
                    onChange={handleEditChange} 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Category</label>
                  <select 
                    className="w-full border rounded-lg p-3" 
                    name="category" 
                    value={editForm.category} 
                    onChange={handleEditChange} 
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Software & AI">Software & AI</option>
                    <option value="Real Life Solutions">Real Life Solutions</option>
                    <option value="Robotics">Robotics</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Army Solutions">Army Solutions</option>
                    <option value="Health & Medicare">Health & Medicare</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button 
                    className="flex-1 h-12 rounded-xl bg-gray-200" 
                    type="button" 
                    onClick={() => { setShowEditModal(false); setEditForm({ title: '', description: '', category: '' }); setImagePreview(''); setImageFile(null); }}
                  >
                    Cancel
                  </button>
                  <button className="flex-1 h-12 rounded-xl bg-amber-500 text-white" type="submit">
                    Update Idea
                  </button>
                </div>
              </form>
            </div>
            <div className="md:col-span-1 bg-gray-200 rounded-2xl flex flex-col items-center justify-center p-4">
              <div className="w-full h-64 bg-gray-300 rounded-xl mb-4 flex items-center justify-center text-gray-600">
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt="preview" className="max-h-full max-w-full object-contain" />
                ) : idea?.image?.url ? (
                  <Image
                    src={idea.image.url}
                    alt="Current idea image"
                    width={300}
                    height={200}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span>idea_image</span>
                )}
              </div>
              <label className="bg-red-500 text-white rounded-full px-4 py-2 cursor-pointer">
                Upload New Image
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const url = URL.createObjectURL(f);
                    setImagePreview(url);
                    setImageFile(f);
                  }} 
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Idea;
