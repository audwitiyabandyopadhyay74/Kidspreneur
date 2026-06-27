"use client";
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Image from "next/image";
import { toast } from 'react-toastify';
import { API_BASE } from "../../lib/api";
import AirplaneCanvas from "../components/AirplaneCanvas";
import RocketCanvas1 from "../components/RocketCanvas1";

const Page = () => {
  const [user, setUser] = useState(null);
  const [myIdeas, setMyIdeas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [editingIdea, setEditingIdea] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", category: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiFetch('/api/users/profile');
        setUser(data.data || data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Error is already handled by apiFetch
      }
    };

    const fetchMyIdeas = async () => {
      try {
        const data = await apiFetch('/api/ideas/my-ideas');
        setMyIdeas(Array.isArray(data) ? data : (data.data || []));
      } catch (error) {
        console.error('Error fetching ideas:', error);
        toast.error('Failed to load your ideas');
      }
    };

    fetchProfile();
    fetchMyIdeas();
    const open = () => setShowModal(true);
    if (typeof window !== 'undefined') window.addEventListener('open-create-idea', open);
    return () => { if (typeof window !== 'undefined') window.removeEventListener('open-create-idea', open); };
  }, []);

  const totalLikes = myIdeas.reduce((sum, idea) => sum + (idea.likes?.length || 0), 0);
  const followersCount = user?.followers?.length || 0;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('category', form.category);
      if (imageFile) fd.append('image', imageFile);
      
      const data = await apiFetch('/api/ideas', {
        method: 'POST',
        body: fd,
        headers: {
          // Let the browser set the content-type with boundary
          'Accept': 'application/json'
        }
      });
      
      setMyIdeas([data, ...myIdeas]);
      setShowForm(false);
      setShowModal(false);
      setForm({ title: "", description: "", category: "" });
      setImagePreview('');
      setImageFile(null);
      toast.success('Idea created');
      window.dispatchEvent(new CustomEvent('idea-created'));
    } catch (error) {
      console.error('Error creating idea:', error);
      toast.error(error.message || 'Failed to create idea');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('category', form.category);
      if (imageFile) fd.append('image', imageFile);
      
      const updated = await apiFetch(`/api/ideas/${editingIdea._id}`, {
        method: 'PUT',
        body: fd,
        headers: {
          // Let the browser set the content-type with boundary
          'Accept': 'application/json'
        }
      });
      
      setMyIdeas(myIdeas.map(i => i._id === updated._id ? updated : i));
      setEditingIdea(null);
      setShowForm(false);
      setForm({ title: "", description: "", category: "" });
      setImagePreview('');
      setImageFile(null);
      toast.success('Idea updated');
      window.dispatchEvent(new CustomEvent('idea-updated'));
    } catch (error) {
      console.error('Error updating idea:', error);
      toast.error(error.message || 'Failed to update idea');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this idea?')) return;
    
    try {
      const data = await apiFetch(`/api/ideas/${id}`, {
        method: 'DELETE'
      });
      
      setMyIdeas(myIdeas.filter(i => i._id !== id));
      toast.success(data.message || 'Idea deleted');
    } catch (error) {
      console.error('Error deleting idea:', error);
      toast.error(error.message || 'Failed to delete idea');
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      <Navbar />
      {/* 3D Models in Background */}
      <div className="fixed top-1/4 -left-20 w-64 h-64 opacity-30 z-0">
        <AirplaneCanvas />
      </div>
      <div className="fixed bottom-1/4 -right-20 w-72 h-72 opacity-30 z-0">
        <RocketCanvas1 />
      </div>
      
      <div className="pt-20 px-4 md:px-8 max-w-7xl mx-auto relative z-10">
        <div className="max-w-6xl mx-auto p-8">
          <div className="flex items-center gap-6">
            {user?.profileImage ? (
              <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-200">
                <Image
                  src={user.profileImage}
                  alt={user.name || 'User'}
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-28 h-28 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-xl">
                {user.name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="flex items-center gap-8 flex-wrap">
              <div className="text-left">
                <div className="text-gray-800 font-medium">{user.username}</div>
                <div className="text-sm text-gray-500">{followersCount} Followers</div>
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

          <div className="mb-4">
            <button className="px-4 py-2 rounded-md bg-amber-500 text-white" onClick={() => { setShowModal(true); setEditingIdea(null); setForm({ title: '', description: '', category: '' }); setImagePreview(''); setImageFile(null); }}>
              + New Idea
            </button>
          </div>

          {(showModal || showForm) && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white w-full max-w-4xl rounded-3xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    {editingIdea ? 'Edit Idea' : 'Create New Idea'}
                  </h3>
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
                      <button className="flex-1 h-12 rounded-xl bg-gray-200" type="button" onClick={() => { setShowModal(false); setShowForm(false); setEditingIdea(null); setForm({ title: '', description: '', category: '' }); setImagePreview(''); setImageFile(null); }}>Cancel</button>
                      <button className="flex-1 h-12 rounded-xl bg-amber-500 text-white" type="submit">
                        {editingIdea ? 'Update Idea' : 'Create Idea'}
                      </button>
                    </div>
                  </form>
                </div>
                <div className="md:col-span-1 bg-gray-200 rounded-2xl flex flex-col items-center justify-center p-4">
                  <div className="w-full h-64 bg-gray-300 rounded-xl mb-4 flex items-center justify-center text-gray-600">
                    {imagePreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imagePreview} alt="preview" className="max-h-full max-w-full object-contain" />
                    ) : editingIdea?.image?.url ? (
                      <Image
                        src={editingIdea.image.url}
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

          {myIdeas.length === 0 ? (
            <div key="no-ideas" className="text-center py-20 text-gray-500">No ideas yet</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myIdeas.map((idea) => (
                <div key={idea._id} className="bg-gray-100 rounded-xl p-4 flex flex-col gap-3">
                  <div className="w-full h-40 rounded-lg overflow-hidden">
                    <Image
                      src={idea?.image?.url || "/cat1.png"}
                      alt={idea.title || "Idea image"}
                      width={640}
                      height={320}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-lg font-semibold break-words line-clamp-2">{idea.title}</div>
                  <div className="text-sm text-gray-600 line-clamp-3">{idea.description}</div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1"><i className="fa-solid fa-thumbs-up" /> {idea.likes?.length || 0}</span>
                      <span className="flex items-center gap-1"><i className="fa-solid fa-comment" /> {idea.comments?.length || 0}</span>
                    </div>
                    <a href={`/idea/${idea._id}`} className="text-amber-600">View</a>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 rounded-md bg-white border" onClick={() => { setEditingIdea(idea); setShowForm(true); setForm({ title: idea.title, description: idea.description, category: idea.category || '' }); setImagePreview(''); setImageFile(null); }}>Edit</button>
                    <button className="px-3 py-1 rounded-md bg-red-500 text-white" onClick={() => handleDelete(idea._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
