"use client";
import React, { useState, useEffect } from 'react';
import Idea from './idea';
import Rocket from './RocketCanvas1';
import { API_BASE } from '../../lib/api';
import { toast } from 'react-toastify';

const Leaderboard1 = () => {
  const [topIdeas, setTopIdeas] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [followingUsers, setFollowingUsers] = useState(new Set());

  useEffect(() => {
    // Fetch current user data
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE}/api/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const userData = await res.json();
          setCurrentUser(userData);
          // Convert following array to Set for easy lookup
          const followingIds = (userData.following || []).map(id => 
            String(typeof id === 'string' ? id : id?._id || id)
          );
          setFollowingUsers(new Set(followingIds));
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    // Fetch top ideas data
    const fetchTopIdeas = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/ideas?sort=likes&limit=10`);
        if (res.ok) {
          const data = await res.json();
          setTopIdeas(data);
        } else {
          console.error("Failed to fetch top ideas");
        }
      } catch (error) {
        console.error("Error fetching top ideas:", error);
      }
    };

    fetchCurrentUser();
    fetchTopIdeas();
  }, []);

  const handleFollowToggle = async (userId, isCurrentlyFollowing) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to follow users');
      return;
    }

    try {
      const endpoint = isCurrentlyFollowing ? 'unfollow' : 'follow';
      const res = await fetch(`${API_BASE}/api/users/${userId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        // Update following state
        const newFollowingUsers = new Set(followingUsers);
        if (isCurrentlyFollowing) {
          newFollowingUsers.delete(userId);
        } else {
          newFollowingUsers.add(userId);
        }
        setFollowingUsers(newFollowingUsers);
        toast.success(data.message || (isCurrentlyFollowing ? 'Unfollowed' : 'Followed'));
        
        // Dispatch follow action notification
        window.dispatchEvent(new CustomEvent('follow-action', {
          detail: {
            action: isCurrentlyFollowing ? 'unfollow' : 'follow',
            username: 'User' // We don't have username in leaderboard context
          }
        }));
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Failed to follow/unfollow user');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to follow/unfollow user');
    }
  };

  return (
    <div className='w-screen h-screen flex flex-col justify-center items-center'>
      <div className="leaderboard min-w-[55%] min-h-[80%]  mt-[100%] rounded-4xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex flex-col">
        <span className="text-[5vh] font-bold w-full h-max text-center text-white ">
          Leaderboard
        </span>

        {/* Header Row */}
        <div
          className="w-full p-4 h-[20%] hover:bg-gray-00 rounded-t-4xl rounded-2xl flex items-center justify-between "
          style={{ padding: "2rem" }}
        >
          <span className="text-xl font-semibold min-w-[10%] max-w-[10%] min-h-max flex items-center justify-center">
            Rank
          </span>
          <span className="text-xl font-semibold min-w-[25%] max-w-[25%] min-h-max flex items-center justify-center">
            Idea Title
          </span>
          <span className="text-xl font-semibold min-w-[20%] max-w-[20%] min-h-max flex items-center justify-center">
            Author
          </span>
          <span className="text-xl font-semibold min-w-[10%] max-w-[10%] min-h-max flex items-center justify-center">
            Likes
          </span>
          <span className="text-xl font-semibold min-w-[15%] max-w-[15%] min-h-max flex items-center justify-center">
            Category
          </span>
          <span className="text-xl font-semibold min-w-[20%] max-w-[20%] min-h-max flex items-center justify-center">
            
          </span>
        </div>

        {/* Data Rows */}
        {topIdeas.map((idea, index) => {
          const authorId = idea.createdBy?._id;
          const isFollowing = authorId ? followingUsers.has(String(authorId)) : false;
          const isOwnProfile = currentUser && authorId && String(authorId) === String(currentUser._id);
          
          return (
            <div
              key={idea._id}
              className="w-full p-4 h-[10%] min-h-max hover:bg-gray-0 rounded-2xl flex items-center justify-between "
              style={{ padding: "2rem" }}
            >
              <span className="text-xl font-semibold min-w-[10%] max-w-[10%] min-h-max flex items-center justify-center">
                #{index + 1}
              </span>
              <span className="text-xl font-semibold min-w-[25%] max-w-[25%] min-h-max flex items-center justify-center truncate">
                {idea.title}
              </span>
              <span className="text-xl font-semibold min-w-[20%] max-w-[20%] min-h-max flex items-center justify-center">
                {idea.createdBy?.name || 'Unknown'}
              </span>
              <span className="text-xl font-semibold min-w-[10%] max-w-[10%] min-h-max flex items-center justify-center">
                {idea.likes?.length || 0}
              </span>
              <span className="text-xl font-semibold min-w-[15%] max-w-[15%] min-h-max flex items-center justify-center">
                {idea.category || 'Other'}
              </span>
              <div className="min-w-[20%] max-w-[20%] min-h-max flex items-center justify-center">
                {!isOwnProfile && authorId && (
                  <button
                    onClick={() => handleFollowToggle(authorId, isFollowing)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      isFollowing 
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                        : 'bg-amber-500 text-white hover:bg-amber-600'
                    }`}
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                )}
                {isOwnProfile && (
                  <span className="text-sm text-gray-500 italic">You</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <span className="text-[5vh] font-bold w-[80%] text-center text-white ">
        Ideas That Deserved To Be in The Board In Short All
        </span>
        <div className="max-w-screen min-w-screen max-h-max min-h-[100vh] flex flex-wrap items-center gap-4 justify-center" style={{ padding: "4rem" }}>
          {topIdeas.map((idea) => (
            <Idea key={idea._id} idea={idea} />
          ))}
      </div>
      <Rocket />
    </div>
  )
}

export default Leaderboard1;