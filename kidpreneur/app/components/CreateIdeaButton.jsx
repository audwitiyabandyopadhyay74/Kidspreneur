'use client';
import { useRouter } from 'next/navigation';
import { useCreateIdea } from '../contexts/CreateIdeaContext';

export default function CreateIdeaButton() {
  const { openModal } = useCreateIdea();
  const router = useRouter();

  const handleClick = () => {
    // If not on explore page, navigate there first
    if (!window.location.pathname.startsWith('/explore')) {
      router.push('/explore');
      // Small delay to ensure page loads before opening modal
      setTimeout(openModal, 100);
    } else {
      openModal();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
    >
      Create Idea
      <i className="fa-solid fa-pencil"></i>
    </button>
  );
}
