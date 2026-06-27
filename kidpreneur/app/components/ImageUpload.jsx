import React, { useState, useRef } from 'react';
import Image from 'next/image';

const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || '';
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD || '';

const ImageUpload = ({ value, onChange }) => {
  const [preview, setPreview] = useState(value);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setPreview(data.secure_url);
        onChange(data.secure_url);
      }
    } catch (err) {
      alert('Image upload failed. Please set NEXT_PUBLIC_CLOUDINARY_PRESET and NEXT_PUBLIC_CLOUDINARY_CLOUD.');
    }
    setUploading(false);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-[25vh] h-[25vh] rounded-full overflow-hidden bg-white border-2 border-gray-200">
        {preview ? (
          <Image
            src={preview}
            alt="Profile Preview"
            fill
            className="object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/default-profile.png';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <i className="fa-solid fa-user text-6xl text-gray-400"></i>
          </div>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <button
        type="button"
        className="bg-gray-300 rounded-xl px-4 py-2 mt-2"
        onClick={() => fileInputRef.current.click()}
        disabled={uploading}
      >
        {uploading ? 'Uploading...' : 'Change Photo'}
      </button>
    </div>
  );
};

export default ImageUpload;
