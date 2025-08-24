import axios from 'axios';

const API_BASE_URL = 'https://web-production-2bef7.up.railway.app/api';
const AI_BASE_URL = 'https://web-production-2bef7.up.railway.app'; // AI endpoints are directly on root

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

const aiApi = axios.create({
  baseURL: AI_BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store active requests for cancellation
const activeRequests = new Map();

// Create cancellable request wrapper
const createCancellableRequest = (requestId, requestFn) => {
  const controller = new AbortController();
  activeRequests.set(requestId, controller);
  
  console.log(`Creating cancellable request: ${requestId}`);
  
  const request = requestFn(controller.signal).then((result) => {
    console.log(`Request ${requestId} completed successfully with result:`, result);
    console.log(`Result type:`, typeof result);
    console.log(`Result stringified:`, JSON.stringify(result));
    return result;
  }).catch((error) => {
    console.log(`Request ${requestId} failed:`, error.message);
    throw error;
  }).finally(() => {
    console.log(`Cleaning up request: ${requestId}`);
    activeRequests.delete(requestId);
  });
  
  return { 
    request, 
    cancel: () => {
      console.log(`Cancelling request: ${requestId}`);
      controller.abort();
    }
  };
};

// Cancel specific request
export const cancelRequest = (requestId) => {
  const controller = activeRequests.get(requestId);
  if (controller) {
    controller.abort();
    activeRequests.delete(requestId);
  }
};

// Cancel all active requests
export const cancelAllRequests = () => {
  activeRequests.forEach(controller => controller.abort());
  activeRequests.clear();
};

export const emailAPI = {
  // Get all emails
  getEmails: async () => {
    try {
      const response = await api.get('/emails');
      return response.data;
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  },

  // Get emails by category
  getEmailsByCategory: async (category) => {
    try {
      const response = await api.get(`/emails/category/${encodeURIComponent(category)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching emails by category:', error);
      throw error;
    }
  },

  // Get available categories
  getCategories: async () => {
    try {
      const response = await api.get('/emails/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Sync emails from Gmail
  

  // Create a draft
  createDraft: async (draftData) => {
    try {
      const response = await api.post('/emails/drafts', draftData);
      return response.data;
    } catch (error) {
      console.error('Error creating draft:', error);
      throw error;
    }
  },

  // Get all drafts
  getDrafts: async () => {
    try {
      const response = await api.get('/emails/drafts');
      return response.data;
    } catch (error) {
      console.error('Error fetching drafts:', error);
      throw error;
    }
  },

  // AI-powered email analysis
  analyzeEmail: async (emailContent, subject = '') => {
    const requestId = 'analyze-' + Date.now();
    return createCancellableRequest(requestId, async (signal) => {
      try {
        const response = await aiApi.post('/grammar-check', {
          text: emailContent
        }, { signal, timeout: 20000 }); // 20 second timeout for AI requests
        return response.data;
      } catch (error) {
        if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
          throw new Error('Request was cancelled or timed out');
        }
        console.error('Error analyzing email:', error);
        throw error;
      }
    });
  },

  // Generate AI draft
  generateAIDraft: (emailContent, subject = '', mode = 'reply', prompt = '') => {
    const requestId = 'draft-' + Date.now();
    
    console.log('Creating cancellable request wrapper...');
    const wrapper = createCancellableRequest(requestId, async (signal) => {
      try {
        console.log('Sending draft request to backend:', {
          prompt: prompt || emailContent,
          tone: mode === 'reply' ? 'professional' : 'friendly',
          length: 'medium'
        });
        
        const response = await aiApi.post('/draft', {
          prompt: prompt || emailContent,
          tone: mode === 'reply' ? 'professional' : 'friendly',
          length: 'medium'
        }, { 
          signal,
        });
        
        console.log('Raw backend response:', response);
        console.log('Response data:', response.data);
        console.log('About to return response.data:', response.data);
        
        return response.data;
      } catch (error) {
        if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
          throw new Error('Request was cancelled or timed out');
        }
        console.error('Error generating AI draft:', error);
        throw error;
      }
    });
    
    console.log('Wrapper created:', wrapper);
    return wrapper;
  },

  // Polish email draft
  polishDraft: async (draftContent) => {
    const requestId = 'polish-' + Date.now();
    return createCancellableRequest(requestId, async (signal) => {
      try {
        const response = await aiApi.post('/polish', {
          text: draftContent,
          style: 'professional'
        }, { signal, timeout: 20000 }); // 20 second timeout for polishing
        return response.data;
      } catch (error) {
        if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
          throw new Error('Request was cancelled or timed out');
        }
        console.error('Error polishing draft:', error);
        throw error;
      }
    });
  },

  // Send email
  sendEmail: async (emailData) => {
    try {
      const response = await api.post('/emails/send', emailData);
      return response.data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  },
};

export default api; 
