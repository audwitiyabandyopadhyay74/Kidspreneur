"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import { API_BASE } from "../../../lib/api";
import Navbar from "../../components/Navbar";
import Image from "next/image";

export default function UserProfilePage() {
  const params = useParams();
  const username = params?.username; // safe access
  const [user, setUser] = useState(null);
  const [userIdeas, setUserIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [editingIdea, setEditingIdea] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", category: "" });

  useEffect(() => {
    if (!username) return;
    fetchUserProfile();
    const open = () => setShowModal(true);
    if (typeof window !== 'undefined') window.addEventListener('open-create-idea', open);
    return () => { if (typeof window !== 'undefined') window.removeEventListener('open-create-idea', open); };
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      const usersRes = await fetch(`${API_BASE}/api/users`);
      if (!usersRes.ok) {
        toast.error("Failed to fetch user data");
        return;
      }

      const users = await usersRes.json();
      const foundUser = users.find((u) => u.username === username);

      if (!foundUser) {
        toast.error("User not found");
        return;
      }

      setUser(foundUser);

      // Determine if current user follows this profile
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const meRes = await fetch(`${API_BASE}/api/users/profile`, { headers: { Authorization: `Bearer ${token}` } });
          if (meRes.ok) {
            const me = await meRes.json();
            const followingIds = (me.following || []).map(id => (typeof id === 'string' ? id : id?._id || String(id)));
            setIsFollowing(followingIds.includes(foundUser._id));
            setIsOwner(me._id === foundUser._id);
          }
        } catch {}
      }

      // Load all ideas and filter by this user's id
      const ideasRes = await fetch(`${API_BASE}/api/ideas`);
      if (ideasRes.ok) {
        const ideas = await ideasRes.json();
        const filteredIdeas = ideas.filter((idea) => {
          const creatorId = typeof idea.createdBy === 'string' ? idea.createdBy : idea.createdBy?._id;
          return creatorId === foundUser._id;
        });
        setUserIdeas(filteredIdeas);
      }
    } catch (error) {
      toast.error("Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="w-screen h-screen flex items-center justify-center">
          <div className="text-2xl">Loading...</div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="w-screen h-screen flex items-center justify-center">
          <div className="text-2xl text-red-500">User not found</div>
        </div>
      </>
    );
  }

  const totalLikes = userIdeas.reduce((sum, idea) => sum + (idea.likes?.length || 0), 0);
  const followersCount = user?.followers?.length || 0;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) { toast.error('Login required'); return; }
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('category', form.category);
      if (imageFile) fd.append('image', imageFile);
      const res = await fetch(`${API_BASE}/api/ideas`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (res.ok) {
        setUserIdeas([data, ...userIdeas]);
        setShowForm(false); setShowModal(false); setForm({ title: "", description: "", category: "" }); setImagePreview(''); setImageFile(null);
        toast.success('Idea created');
      } else {
        toast.error(data.message || 'Failed to create idea');
      }
    } catch { toast.error('Failed to create idea'); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingIdea) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE}/api/ideas/${editingIdea._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: form.title, description: form.description, category: form.category })
      });
      const updated = await res.json();
      if (res.ok) {
        setUserIdeas(userIdeas.map(i => i._id === updated._id ? updated : i));
        setEditingIdea(null); setShowForm(false); setForm({ title: "", description: "", category: "" });
        toast.success('Idea updated');
      } else {
        toast.error(updated.message || 'Failed to update idea');
      }
    } catch { toast.error('Failed to update idea'); }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE}/api/ideas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUserIdeas(userIdeas.filter(i => i._id !== id));
        toast.success(data.message || 'Idea deleted');
      } else {
        toast.error(data.message || 'Failed to delete idea');
      }
    } catch { toast.error('Failed to delete idea'); }
  };

  return (
    <>
      <Navbar />
      <div className="w-screen min-h-screen bg-white">
        <div className="max-w-6xl mx-auto p-8">
          <div className="flex items-center gap-6">
            <div className="w-28 h-28 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-xl">
              {user.name?.charAt(0) || 'U'}
            </div>
            <div className="flex items-center gap-8 flex-wrap">
              <div className="text-left">
                <div className="text-gray-800 font-medium">{user.username}</div>
                <div className="text-sm text-gray-500">{followersCount} Followers</div>
              </div>
              <div>
                <FollowButton
                  isFollowing={isFollowing}
                  onToggle={async () => {
                    const token = localStorage.getItem('token');
                    if (!token) { toast.error('Please login to follow users'); return; }
                    try {
                      const endpoint = isFollowing ? 'unfollow' : 'follow';
                      const res = await fetch(`${API_BASE}/api/users/${user._id}/${endpoint}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
                      const data = await res.json();
                      if (res.ok) { setIsFollowing(!isFollowing); toast.success(data.message || (isFollowing ? 'Unfollowed' : 'Followed')); }
                      else { toast.error(data.message || 'Action failed'); }
                    } catch { toast.error('Action failed'); }
                  }}
                />
              </div>
              <div className="text-left">
                <div className="text-sm text-gray-500">₹{user.funding || 0}</div>
                <div className="text-sm text-gray-500">Fundings</div>
              </div>
              <div className="text-left">
                <div className="text-sm text-gray-500">{totalLikes}</div>
                <div className="text-sm text-gray-500">Likes</div>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-6">Ideas of {user.name}</h2>

          {isOwner && (
            <div className="mb-4">
              <button className="px-4 py-2 rounded-md bg-amber-500 text-white" onClick={() => { setShowModal(true); setEditingIdea(null); setForm({ title: '', description: '', category: '' }); setImagePreview(''); }}>
                + New Idea
              </button>
            </div>
          )}

          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white w-full max-w-4xl rounded-3xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">{editingIdea ? 'Edit Idea' : 'Create New Idea'}</h3>
                  <form onSubmit={editingIdea ? handleUpdate : handleCreate} className="flex flex-col gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">Idea Title</label>
                      <input className="w-full border rounded-lg p-3" name="title" placeholder="Enter your amazing idea title..." value={form.title} onChange={handleChange} required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">Description</label>
                      <textarea className="w-full border rounded-lg p-3 h-40" name="description" placeholder="Describe your idea in detail. What problem does it solve? How does it work? What makes it unique?" value={form.description} onChange={handleChange} required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1">Category</label>
                      <select className="w-full border rounded-lg p-3" name="category" value={form.category} onChange={handleChange} required>
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
                      <button className="flex-1 h-12 rounded-xl bg-gray-200" type="button" onClick={() => { setShowModal(false); setEditingIdea(null); }}>Cancel</button>
                      <button className="flex-1 h-12 rounded-xl bg-amber-500 text-white" type="submit">{editingIdea ? 'Save Changes' : 'Create Idea'}</button>
                    </div>
                  </form>
                </div>
                <div className="md:col-span-1 bg-gray-200 rounded-2xl flex flex-col items-center justify-center p-4">
                  <div className="w-full h-64 bg-gray-300 rounded-xl mb-4 flex items-center justify-center text-gray-600">
                    {imagePreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imagePreview} alt="preview" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span>idea_image</span>
                    )}
                  </div>
                  <label className="bg-red-500 text-white rounded-full px-4 py-2 cursor-pointer">
                    Upload Image
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const url = URL.createObjectURL(f);
                      setImagePreview(url);
                      setImageFile(f);
                    }} />
                  </label>
                </div>
              </div>
            </div>
          )}

          {userIdeas.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No ideas yet</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userIdeas.map((idea) => (
                <div key={idea._id} className="bg-gray-100 rounded-xl p-4 flex flex-col gap-3">
                  <div className="text-lg font-semibold">{idea.title}</div>
                  <div className="text-sm text-gray-600 line-clamp-3">{idea.description}</div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1"><i className="fa-solid fa-thumbs-up" /> {idea.likes?.length || 0}</span>
                      <span className="flex items-center gap-1"><i className="fa-solid fa-comment" /> {idea.comments?.length || 0}</span>
                    </div>
                    <a href={`/idea/${idea._id}`} className="text-amber-600">View</a>
                  </div>
                  {isOwner && (
                    <div className="flex gap-2">
                      <button className="px-3 py-1 rounded-md bg-white border" onClick={() => { setEditingIdea(idea); setShowForm(true); setForm({ title: idea.title, description: idea.description, category: idea.category || '' }); }}>Edit</button>
                      <button className="px-3 py-1 rounded-md bg-red-500 text-white" onClick={() => handleDelete(idea._id)}>Delete</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function FollowButton({ isFollowing, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`px-4 py-2 rounded-full border ${isFollowing ? 'bg-gray-100 text-gray-700' : 'bg-amber-500 text-white'} hover:opacity-90`}
    >
      {isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
}
