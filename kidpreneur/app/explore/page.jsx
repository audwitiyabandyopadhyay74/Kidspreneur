"use client";
import React, { useState, useEffect } from "react";
import Explorecomponent from "../components/Explore";
import { toast } from 'react-toastify';
import { API_BASE } from "../../lib/api";
import { useCreateIdea } from '../contexts/CreateIdeaContext';

const Explore = () => {
  const [showModal, setShowModal] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", category: "" });

  const { isOpen, closeModal } = useCreateIdea();
  
  // Sync local state with context
  useEffect(() => {
    setShowModal(isOpen);
  }, [isOpen]);

  // Handle modal close
  const handleClose = () => {
    closeModal();
    setShowModal(false);
  };

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
        setShowModal(false); setForm({ title: "", description: "", category: "" }); setImagePreview(''); setImageFile(null);
        toast.success('Idea created');
        window.location.reload(); // Refresh to show new idea
      } else { toast.error(data.message || 'Failed to create idea'); }
    } catch { toast.error('Failed to create idea'); }
  };

  return (
    <>
      <Explorecomponent/>
      
      {showModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white w-full max-w-4xl rounded-3xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            <i className="fa-solid fa-times text-xl"></i>
          </button>
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Create New Idea</h3>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
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
                <button 
                  className="flex-1 h-12 rounded-xl bg-gray-200 hover:bg-gray-300 transition-colors" 
                  type="button" 
                  onClick={handleClose}
                >
                  Cancel
                </button>
                <button className="flex-1 h-12 rounded-xl bg-amber-500 text-white" type="submit">Create Idea</button>
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
  </>)
}
export default Explore;