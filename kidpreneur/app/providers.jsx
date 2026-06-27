'use client';
import { CreateIdeaProvider } from './contexts/CreateIdeaContext';

export function Providers({ children }) {
  return (
    <CreateIdeaProvider>
      {children}
    </CreateIdeaProvider>
  );
}

// Re-export the context and hook for convenience
export { useCreateIdea } from './contexts/CreateIdeaContext';
