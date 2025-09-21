import axios from 'axios';

// Create Axios instance with base configuration
const api = axios.create({
    baseURL: 'http://localhost:8000', // Replace with your backend API URL
    timeout: 10000,
    withCredentials: true, // Send cookies if needed
});

// Helper function to read CSRF token from cookies
function getCookie(name) {
    const m = document.cookie.match(new RegExp('(^|; )' + name + '=([^;]+)'));
    return m ? decodeURIComponent(m[2]) : null;
}

// Request interceptor - automatically add CSRF Token for unsafe methods
api.interceptors.request.use((config) => {
    const method = (config.method || 'get').toLowerCase();
    const needsCsrf = ['post', 'put', 'patch', 'delete'].includes(method);

    if (needsCsrf && !config.headers?.['X-CSRFToken']) {
        const token = getCookie('csrftoken');
        if (token) {
            config.headers = { ...config.headers, 'X-CSRFToken': token };
        }
    }
    return config;
});

// Response interceptor - unified error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

// Question service API methods
export const questionService = {
    // Get all questions from backend
    getAllQuestions: async () => {
        try {
            const response = await api.get('/api/questions/');
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch questions');
        }
    },

    // Search questions by query (server-side search)
    searchQuestions: async (searchQuery) => {
        try {
            const response = await api.get('/api/questions/search/', {
                params: { q: searchQuery },
            });
            return response.data;
        } catch (error) {
            throw new Error('Failed to search questions');
        }
    },

    // Get single question by ID
    getQuestionById: async (id) => {
        try {
            const response = await api.get(`/api/questions/${id}/`);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch question with id ${id}`);
        }
    },

    // Create new question
    createQuestion: async (questionData) => {
        try {
            const response = await api.post('/api/questions/', questionData);
            return response.data;
        } catch (error) {
            throw new Error('Failed to create question');
        }
    },

    // Update existing question
    updateQuestion: async (id, questionData) => {
        try {
            const response = await api.put(`/api/questions/${id}/`, questionData);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to update question with id ${id}`);
        }
    },

    // Delete question by ID
    deleteQuestion: async (id) => {
        try {
            await api.delete(`/api/questions/${id}/`);
            return true;
        } catch (error) {
            throw new Error(`Failed to delete question with id ${id}`);
        }
    },

    // Submit answer for a question
    submitAnswer: async (answerData) => {
        try {
            const response = await api.post('/api/questions/submit/', answerData);
            return response.data;
        } catch (error) {
            throw new Error('Failed to submit answer');
        }
    },
};

export default api;
