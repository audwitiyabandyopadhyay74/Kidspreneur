"use client";
import React, { useState } from 'react'
import Navbar from '../../components/Navbar'
import Image from "next/image"
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

const Page = () => {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      toast.error('Please fill all fields')
      return
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match.')
      return
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      toast.error('You are not logged in.')
      router.push('/auth/login')
      return
    }
    try {
      setLoading(true)
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ oldPassword, newPassword })
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || 'Password changed successfully!')
        setOldPassword('')
        setNewPassword('')
        setConfirmNewPassword('')
      } else {
        toast.error(data.message || 'Failed to change password.')
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <>
     <Navbar/>
     <div className="w-screen h-screen flex items-center justify-center">
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
<form className='w-[65%] h-[90%] bg-gray-200 flex items-center justify-center rounded-4xl flex-col gap-4' onSubmit={handleSubmit}>

          <input
            type="password"
            className="w-[80%] h-[10%] outline-none border-none p-4 rounded-xl bg-white"
            placeholder="Old password"
            name="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
   <input
            type="password"
            className="w-[80%] h-[10%] outline-none border-none p-4 rounded-xl bg-white"
            placeholder="New password"
            name="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <input
            type="password"
            className="w-[80%] h-[10%] outline-none border-none p-4 rounded-xl bg-white"
            placeholder="Confirm New password"
            name="fullName"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
          />

<div className="buttons flex w-full flex-row gap-4 items-center justify-center">
<button className='w-[25vh] h-[10vh] bg-black rounded-2xl text-white' type='submit'>{loading ? 'Saving...' : 'Save Changes'}</button>
   <span className="text-[15px] w-[80%] text-right ">
            <div className="a">Forgot The Old Password ?</div>
          </span>
</div>



</form>
</div>
        </div> 
    </>
  )
}

export default Page
