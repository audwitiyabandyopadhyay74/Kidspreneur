'use client';

import { useEffect, useState } from 'react';
import ideaService from '@/lib/api/ideaService';
import { useApi } from '@/lib/api/useApi';

export default function IdeasList() {
  const [ideas, setIdeas] = useState([]);
  const { request, loading, error } = useApi();

  const fetchIdeas = useCallback(async () => {
    const { data } = await request(() => ideaService.getIdeas());
    if (data) {
      setIdeas(data);
    }
  }, [request]);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  if (loading) return <div>Loading ideas...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Ideas</h2>
      {ideas.length === 0 ? (
        <p>No ideas found. Create your first idea!</p>
      ) : (
        <ul className="space-y-2">
          {ideas.map((idea) => (
            <li key={idea._id} className="p-4 border rounded-lg">
              <h3 className="font-semibold">{idea.title}</h3>
              <p className="text-gray-600">{idea.description}</p>
              <div className="mt-2 text-sm text-gray-500">
                Created on: {new Date(idea.createdAt).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
