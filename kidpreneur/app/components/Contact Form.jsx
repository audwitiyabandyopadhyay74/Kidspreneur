"use client";
import React from "react";
import Hyperspeed from "./Hyperspeed";

const ContactForm = () => {
  const [scrollY, setScrollY] = React.useState(0);
  const targetScroll = React.useRef(0);
  const canvas = React.useRef();

  // Smooth scroll interpolation
  const smoothScrollTo = (targetY, duration = 1000) => {
    const startY = window.scrollY;
    const distance = targetY - startY;
    const startTime = performance.now();

    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic

      window.scrollTo(0, startY + distance * ease);

      if (progress < 1) requestAnimationFrame(animateScroll);
    };

    requestAnimationFrame(animateScroll);
  };

  // Listen to normal scroll + smooth wheel scroll
  React.useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault(); // disable native jumpy scroll
      targetScroll.current += e.deltaY;
      targetScroll.current = Math.max(0, targetScroll.current); // clamp to top
      smoothScrollTo(targetScroll.current, 500); // ease to new scroll target
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
      console.log(window.scrollY);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  // console.log(window.scrollY);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    try {
      setSubmitting(true);
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Message sent');
        setName(""); setEmail(""); setPhone(""); setMessage("");
      } else {
        alert(data.message || 'Failed to send message');
      }
    } catch (err) {
      alert('Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  const offset = 100;
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-black">
      <Hyperspeed
        effectOptions={{
          onSpeedUp: () => {},
          onSlowDown: () => {},
          distortion: "turbulentDistortion",
          length: 400,
          roadWidth: 10,
          islandWidth: 2,
          lanesPerRoad: 4,
          fov: 90,
          fovSpeedUp: 150,
          speedUp: 2,
          carLightsFade: 0.4,
          totalSideLightSticks: 20,
          lightPairsPerRoadWay: 40,
          shoulderLinesWidthPercentage: 0.05,
          brokenLinesWidthPercentage: 0.1,
          brokenLinesLengthPercentage: 0.5,
          lightStickWidth: [0.12, 0.5],
          lightStickHeight: [1.3, 1.7],
          movingAwaySpeed: [60, 80],
          movingCloserSpeed: [-120, -160],
          carLightsLength: [400 * 0.03, 400 * 0.2],
          carLightsRadius: [0.05, 0.14],
          carWidthPercentage: [0.3, 0.5],
          carShiftX: [-0.8, 0.8],
          carFloorSeparation: [0, 5],
          colors: {
            roadColor: 0x080808,
            islandColor: 0x0a0a0a,
            background: 0x000000,
            shoulderLines: 0xffffff,
            brokenLines: 0xffffff,
            leftCars: [0xd856bf, 0x6750a2, 0xc247ac],
            rightCars: [0x03b3c3, 0x0e5ea5, 0x324555],
            sticks: 0x03b3c3,
          },
        }}
      />
      <form
        className={
          "h-[80%] w-[30%] bg-gray-200 rounded-4xl flex flex-col justify-center items-center gap-4 z-100"
        }
        style={{
          transform: `translateY(${offset - scrollY / 4}px)`,
          transition: "transform 0.5s ease-out",
        }}
        ref={canvas}
        onSubmit={handleSubmit}
      >
        <label className="text-5xl font-bold">Contact </label>
        <input
          type="text"
          className="w-[80%] h-[10%] outline-none border-none p-4 rounded-xl bg-white"
          placeholder="Name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          className="w-[80%] h-[10%] outline-none border-none p-4 rounded-xl bg-white"
          placeholder="Email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="tel"
          className="w-[80%] h-[10%] outline-none border-none p-4 rounded-xl bg-white"
          placeholder="Phone(ptional)"
          name="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <textarea
          type="text"
          className="min-w-[80%] max-w-max max-h-max min-h-[10%] outline-none border-none p-4 rounded-xl bg-white resize-both"
          placeholder="Message"
          name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          className="w-[50%] h-[6vh] bg-black text-white rounded-xl"
          type="submit"
          disabled={submitting}
        >
          {submitting ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
