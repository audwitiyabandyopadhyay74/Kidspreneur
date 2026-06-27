"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCreateIdea } from '../contexts/CreateIdeaContext';
import CreateIdeaButton from './CreateIdeaButton';
import { API_BASE } from "../../lib/api";
import "../globals.css";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  // Fetch user profile from the API
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, cannot fetch profile');
        return null;
      }

      console.log('Fetching user profile...');
      const response = await fetch(`${API_BASE}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data = await response.json();
      console.log('User profile fetched:', data);
      
      if (data && data.data) {
        const userData = data.data;
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return userData;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      return null;
    }
  };

  // Check auth state on component mount and on auth state changes
  useEffect(() => {
    console.log('Navbar mounted, setting up auth state listeners...');
    
    const checkAuth = () => {
      console.log('--- Auth State Check ---');
      const token = localStorage.getItem('token');
      console.log('Token in localStorage:', token ? `${token.substring(0, 10)}...` : 'not found');
      
      // Check if we have user data in localStorage
      const storedUser = localStorage.getItem('user');
      console.log('Stored user in localStorage:', storedUser ? 'exists' : 'not found');
      
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          console.log('Parsed user data:', userData);
          setUser(userData);
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          localStorage.removeItem('user');
          setUser(null);
        }
      } else {
        console.log('No stored user found, setting user to null');
        setUser(null);
      }
      
      // If we have a token but no user data, fetch the latest user data
      if (token) {
        console.log('Token found, checking if we need to fetch user profile...');
        if (!storedUser) {
          console.log('No stored user found, fetching latest user profile...');
          fetchUserProfile().catch(error => {
            console.error('Error fetching user profile:', error);
            setUser(null);
          });
        }
      } else {
        console.log('No token found, setting user to null');
        setUser(null);
      }
    };

    // Initial check
    checkAuth();

    // Listen for auth state changes
    const handleStorageChange = () => {
      console.log('Storage changed, checking auth state...');
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChange', handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChange', handleStorageChange);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${API_BASE}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      window.dispatchEvent(new CustomEvent('authStateChange'));
      router.push('/');
      window.location.reload();
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="w-full h-20 flex items-center justify-between fixed top-0 left-0 right-0 bg-white lg:bg-white shadow-sm z-50 px-4 md:px-6 lg:px-8 transition-all duration-300">
      {/* Logo and Mobile Menu Button */}
      <div className="flex items-center">
        <button 
          onClick={toggleMenu}
          className="md:hidden mr-4 text-gray-600 hover:text-amber-500"
          aria-label="Toggle menu"
        >
          <i className={`fa-solid ${isMenuOpen ? 'fa-times text-2xl' : 'fa-bars text-xl'}`}></i>
        </button>
        <div className="logo-text text-2xl font-semibold text-amber-500 font-[cursive]">
          <a href="/" className="hover:text-amber-600 transition-colors">
            Kidpreneur
          </a>
        </div>
      </div>

      {/* Desktop Navigation Links */}
      <div className="hidden md:flex items-center gap-6 lg:gap-8">
        <a href="/explore" className="text-gray-700 hover:text-amber-500 transition-colors">
          <i className="fa-solid fa-compass mr-2"></i> Explore
        </a>
        <a href="/top-ideas" className="text-gray-700 hover:text-amber-500 transition-colors">
          <i className="fa-solid fa-trophy mr-2"></i> Top Ideas
        </a>
        <a href="/leaderboard" className="text-gray-700 hover:text-amber-500 transition-colors">
          <i className="fa-solid fa-ranking-star mr-2"></i> Leaderboard
        </a>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-3 md:gap-4">
        {user ? (
          <>
            <CreateIdeaButton />
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors"
              >
                <span className="hidden md:inline">{user.name || user.email}</span>
                <i className="fa-solid fa-chevron-down text-xs"></i>
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <i className="fa-solid fa-user mr-2"></i> Profile
                  </a>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <i className="fa-solid fa-arrow-right-from-bracket mr-2"></i> Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <a 
              href="/auth/login" 
              className="px-4 py-2 text-gray-700 hover:text-amber-500 transition-colors"
            >
              Log In
            </a>
            <a 
              href="/auth/signup" 
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              Sign Up
            </a>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
