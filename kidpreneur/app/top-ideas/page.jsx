import React from 'react'
import Navbar from "../components/Navbar"
import Airplane from '../components/AirplaneCanvas'
import LetsgetStarted from "../components/LetsGetStarted"

const page = () => {
  return (
    <>
     <Navbar/> 
      <div className="w-screen max-w-screen gap-4 max-h-max min-h-screen flex flex-col items-center justify-center overflow-scroll ">
           <span className="text-[5vh] w-[80%] text-center font-bold mt-[20%] ">
Ideas That are Now Inspirations
         </span>
  <div className="idea flex items-center justify-end ">
          <div className="w-[20vh] h-[20vh] rounded-4xl bg-gray-200 "></div>
          <div className="w-[65vh] h-[45vh] rounded-4xl bg-gray-200 " style={{padding:"1rem"}}>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Molestiae dignissimos odit ex numquam. Neque!</div>

  </div>

    <div className="idea flex items-center justify-end ">
          <div className="w-[20vh] h-[20vh] rounded-4xl bg-gray-200 "></div>
          <div className="w-[65vh] h-[45vh] rounded-4xl bg-gray-200 " style={{padding:"1rem"}}>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Molestiae dignissimos odit ex numquam. Neque!</div>

  </div>
<Airplane/>

<LetsgetStarted/>
  
        </div>
    </>
  )
}

export default page
