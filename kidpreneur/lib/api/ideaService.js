import apiService from './apiService';
import { API_ENDPOINTS } from './config';

export const ideaService = {
  // Create a new idea
  createIdea: async (ideaData) => {
    return apiService.post(API_ENDPOINTS.IDEAS.CREATE, ideaData);
  },

  // Get all ideas
  getIdeas: async () => {
    return apiService.get(API_ENDPOINTS.IDEAS.BASE);
  },

  // Get a single idea by ID
  getIdeaById: async (id) => {
    return apiService.get(API_ENDPOINTS.IDEAS.GET_BY_ID(id));
  },

  // Update an idea
  updateIdea: async (id, updateData) => {
    return apiService.put(API_ENDPOINTS.IDEAS.UPDATE(id), updateData);
  },

  // Delete an idea
  deleteIdea: async (id) => {
    return apiService.delete(API_ENDPOINTS.IDEAS.DELETE(id));
  },
};

export default ideaService;
