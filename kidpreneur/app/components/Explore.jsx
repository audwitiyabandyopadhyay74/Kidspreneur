"use client";
import React from "react";
import Image from "next/image"
import Technology from "../../public/cat1.png"
import Idea from "./idea"
import { API_BASE } from "../../lib/api";
import TrainCanvas1 from "./TrainCanvas1";
const Explore = () =>{
const [Category,setCategory] = React.useState("");
const [ideas,setIdeas] = React.useState([]);

React.useEffect(() => {
  const fetchIdeas = async () => {
    try {
      // API_BASE already includes /api/v1, so we just need to append /ideas
      const apiUrl = `${API_BASE}/ideas`;
      console.log('Fetching ideas from:', apiUrl);
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received ideas data:', data);
      
      if (Array.isArray(data)) {
        setIdeas(data);
      } else if (data && Array.isArray(data.data)) {
        setIdeas(data.data);
      } else {
        console.error('Unexpected data format:', data);
        setIdeas([]);
      }
    } catch (error) {
      console.error('Error fetching ideas:', error);
      // Set a default empty array to prevent errors in the UI
      setIdeas([
        {
          id: 1,
          title: 'Sample Idea 1',
          description: 'This is a sample idea. The backend server might be down.',
          category: 'Technology'
        },
        {
          id: 2,
          title: 'Sample Idea 2',
          description: 'Check if the backend server is running on port 5000.',
          category: 'Business'
        }
      ]);
    }
  };
  
  fetchIdeas();
}, []);

const handleCategoryChange = (value) => {
  // Toggle category if it's already selected
  setCategory(current => current === value ? '' : value);
}

    return(
    <div className="min-w-screen min-h-screen max-w-max max-h-max flex items-center flex-col flex-wrap" style={{padding:"1rem"}}>
<div className="sidebar h-[20%] flex flex-col items-center justify-center rounded-4xl w-full mt-[10%] relative top-20 z-10 py-4">

    <span className="text-2xl w-full text-center font-bold "> <a className="a">
         Categories 
        </a>
         </span>
    <ul className="w-full h-full flex items-center justify-center gap-6 scale-90">
        <li className={`w-ma h-max flex flex-col items-center justify-center transition-all duration-200 ${Category === 'Software & AI' ? 'scale-105' : ''}`}>
  <div className="w-[30vh] h-[30vh] rounded-full flex items-center justify-center bg-gray-200 scale-50 cursor-pointer hover:scale-55 transition-transform" 
       onClick={() => handleCategoryChange('Software & AI')}> 
    <i className="fa-microchip fa-solid text-[20vh] fa-bounce"/>
  </div>
  <span className="mt-[-20%] text-[20px] font-semibold">
    Software & AI
  </span> 
</li>
   <li className={`w-max h-max flex flex-col items-center justify-center transition-all duration-200 ${Category === 'Real Life Solutions' ? 'scale-105' : ''}`}>
  <div className="w-[30vh] h-[30vh] rounded-full flex items-center justify-center bg-gray-200 scale-50 cursor-pointer hover:scale-55 transition-transform"
       onClick={() => handleCategoryChange('Real Life Solutions')}>
    <i className="fa-dna fa-solid text-[20vh] fa-flip"/>
  </div>
  <span className="mt-[-20%] text-[20px] font-semibold">
    Real Life Solutions
  </span>
</li>

 <li className={`w-max h-max flex flex-col items-center justify-center transition-all duration-200 ${Category === 'Robotics' ? 'scale-105' : ''}`}>
  <div className="w-[30vh] h-[30vh] rounded-full flex items-center justify-center bg-gray-200 scale-50 cursor-pointer hover:scale-55 transition-transform"
       onClick={() => handleCategoryChange('Robotics')}>
    <i className="fa-robot fa-solid text-[20vh] fa-beat"/>
  </div>
  <span className="mt-[-20%] text-[20px] font-semibold">
    Robotics
  </span>
</li>
            
     <li className={`w-ma h-max flex flex-col items-center justify-center transition-all duration-200 ${Category === 'Infrastructure' ? 'scale-105' : ''}`}>
  <div className="w-[30vh] h-[30vh] rounded-full flex items-center justify-center bg-gray-200 scale-50 cursor-pointer hover:scale-55 transition-transform"
       onClick={() => handleCategoryChange('Infrastructure')}>
    <i className="fa-building fa-solid text-[20vh] fa-bounce"/>
  </div>
  <span className="mt-[-20%] text-[20px] font-semibold">
    Infrastructure
  </span> 
</li>
   <li className={`w-max h-max flex flex-col items-center justify-center transition-all duration-200 ${Category === 'Army Solutions' ? 'scale-105' : ''}`}
    onClick={() => handleCategoryChange('Army Solutions')}>
  <div className="w-[30vh] h-[30vh] rounded-full flex items-center justify-center bg-gray-200 scale-50 cursor-pointer hover:scale-55 transition-transform">
    <i className="fa-shield fa-solid text-[20vh] fa-shake"/>
  </div>
  <span className="mt-[-20%] text-[20px] font-semibold">
    Army Solutions
  </span>
</li>
 <li className={`w-max h-max flex flex-col items-center justify-center transition-all duration-200 ${Category === 'Health & Medicare' ? 'scale-105' : ''}`}
    onClick={() => handleCategoryChange('Health & Medicare')}>
  <div className="w-[30vh] h-[30vh] rounded-full flex items-center justify-center bg-gray-200 scale-50 cursor-pointer hover:scale-55 transition-transform">
    <i className="fa-briefcase-medical fa-solid text-[20vh] fa-bounce"/>
  </div>
  <span className="mt-[-20%] text-[20px] font-semibold">
    Health & Medicare
  </span>
</li>

 <li className={`w-max h-max flex flex-col items-center justify-center transition-all duration-200 ${Category === 'Others' ? 'scale-105' : ''}`}
    onClick={() => handleCategoryChange('Others')}>
  <div className="w-[30vh] h-[30vh] rounded-full flex items-center justify-center bg-gray-200 scale-50 cursor-pointer hover:scale-55 transition-transform">
    <i className="fa-solid fa-ellipsis text-[20vh] fa-bounce"/>
  </div>
  <span className="mt-[-20%] text-[20px] font-semibold">
    Others
  </span>
</li> 
    </ul>
</div>
<div className="max-w-screen min-w-screen max-h-max min-h-[100vh] flex flex-wrap items-center gap-4 justify-center">

<div className="w-full max-w-7xl mx-auto px-4 py-8">
  {Category && (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">Showing ideas in: {Category}</h2>
      <button 
        onClick={() => setCategory('')}
        className="px-4 py-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors flex items-center gap-2"
      >
        <i className="fas fa-times"></i>
        Clear Filter
      </button>
    </div>
  )}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {ideas && ideas.length > 0 ? (
    ideas
      .filter(i => !Category || (i.category || '') === Category)
      .map(i => (
        <Idea key={i._id} idea={i} />
      ))
  ) : (
    <div className="w-full text-center py-10">
      <p className="text-gray-500 text-lg">No ideas found{Category ? ` in ${Category}` : ''}. Be the first to share your idea!</p>
    </div>
  )}
</div>


  </div>
</div>
<TrainCanvas1 />
    </div>
    )
}

export default Explore;