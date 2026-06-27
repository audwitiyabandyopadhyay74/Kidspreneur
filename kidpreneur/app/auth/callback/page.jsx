"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import Island2 from "../../components/Island2Canvas";
import SeaCanvas from "../../components/SeaCanvas";
import AirplaneCanvas from "../../components/a2c";
import "../../globals.css";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      localStorage.setItem("token", token);
      toast.success("Logged in successfully!");
      setTimeout(() => {
        router.push("/profile");
      }, 1000);
    } else {
      toast.error("Authentication failed. Please try again.");
      setTimeout(() => {
        router.push("/auth/login");
      }, 1000);
    }
  }, [router, searchParams]);

  return (
    <div className="max-w-screen max-h-[100vh] flex items-center justify-center flex-col">
      <div
        className="w-[30%] h-[40%] bg-gray-200 rounded-4xl z-100 fixed"
        style={{ padding: "2rem", marginTop: "15%" }}
      >
        <div className="w-full h-full flex flex-col items-center justify-center gap-6 z-100">
          <div className="logo-text text-2xl font-semibold text-amber-500 font-[cursive] text-center">
            Welcome Back!
          </div>
          
          <div className="w-full flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          
          <p className="text-center text-gray-600">
            Please wait, we're logging you in...
          </p>
        </div>
      </div>

      {/* Background 3D Scenes */}
      <SeaCanvas />
      <Island2 scale={2} />
      <AirplaneCanvas />
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="w-screen h-screen flex items-center justify-center">Loading...</div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
