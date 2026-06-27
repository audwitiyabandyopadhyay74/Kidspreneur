'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const CreateIdeaContext = createContext();

export const CreateIdeaProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const openModal = () => {
    if (!isMounted) return;
    
    // If not on explore page, navigate there first
    if (!pathname.startsWith('/explore')) {
      router.push('/explore');
      // Small delay to ensure page loads before opening modal
      setTimeout(() => setIsOpen(true), 100);
    } else {
      setIsOpen(true);
    }
  };

  const closeModal = () => {
    if (isMounted) {
      setIsOpen(false);
    }
  };

  const value = React.useMemo(() => ({
    isOpen,
    openModal,
    closeModal
  }), [isOpen, isMounted, pathname]);

  return (
    <CreateIdeaContext.Provider value={value}>
      {children}
    </CreateIdeaContext.Provider>
  );
};

export const useCreateIdea = () => {
  const context = useContext(CreateIdeaContext);
  if (context === undefined) {
    throw new Error('useCreateIdea must be used within a CreateIdeaProvider');
  }
  return context;
};
