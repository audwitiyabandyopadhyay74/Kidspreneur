"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Idea from "../components/idea";
import { API_BASE } from '../../lib/api';

const SearchPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (query) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(`${API_BASE}/api/ideas/search?q=${encodeURIComponent(trimmedQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      } else {
        console.error("Failed to fetch search results");
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching ideas:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      handleSearch(query);
    }
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const params = new URLSearchParams();
      params.set('q', searchQuery);
      router.replace(`/search?${params.toString()}`, { scroll: false });
      
      clearTimeout(window.searchTimeout);
      window.searchTimeout = setTimeout(() => {
        handleSearch(searchQuery);
      }, 500);
    } else {
      setSearchResults([]);
      setHasSearched(false);
    }
  }, [searchQuery]);

  return (
    <div className="w-screen max-w-screen gap-4 max-h-max min-h-screen flex flex-col items-center justify-start overflow-scroll pt-20">
      {/* Search Header */}
      <div className="w-full max-w-4xl px-4 mb-8">
        <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">Search Ideas</h1>
        <div className="relative">
          <form onSubmit={(e) => { e.preventDefault(); handleSearch(searchQuery); }} className="w-full">
            <input 
              type="text" 
              className="w-full h-16 rounded-4xl bg-gray-200 outline-none border-none pl-6 pr-6 text-lg"
              placeholder="Search by title, description, or category..."
              value={searchQuery}
              onChange={handleInputChange}
            />
          </form>
          <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
            {isLoading ? (
              <i className="fa-solid fa-spinner fa-spin text-gray-500 text-xl"></i>
            ) : (
              <i className="fa-solid fa-search text-gray-500 text-xl"></i>
            )}
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="w-full max-w-7xl px-4">
        {!hasSearched ? (
          <div className="text-center text-gray-500 text-lg">
            {searchQuery ? 'Press Enter or wait to see results...' : 'Start typing to search for ideas...'}
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="text-center text-gray-500 text-lg py-12">
            No ideas found matching "{searchQuery}"
          </div>
        ) : (
          <>
            <div className="text-center text-gray-600 text-lg mb-6">
              Found {searchResults.length} idea{searchResults.length !== 1 ? 's' : ''} matching "{searchQuery}"
            </div>
            <div className="flex flex-wrap gap-6 justify-center">
              {searchResults.map((idea) => (
                <Idea key={idea._id} idea={idea} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
