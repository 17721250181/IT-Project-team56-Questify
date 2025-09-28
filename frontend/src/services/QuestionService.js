import axios from 'axios';
import apiClient from './apiClient.js';

// // Create Axios instance with base configuration
// const api = axios.create({
//     baseURL: 'http://localhost:8000', // Replace with your backend API URL
//     timeout: 10000,
//     withCredentials: true, // Send cookies if needed
// });

// Helper function to read CSRF token from cookies
function getCookie(name) {
    const m = document.cookie.match(new RegExp('(^|; )' + name + '=([^;]+)'));
    return m ? decodeURIComponent(m[2]) : null;
}

// Request interceptor - automatically add CSRF Token for unsafe methods
apiClient.interceptors.request.use((config) => {
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
export const QuestionService = {
    // Get all questions from backend (matches QuestionListView)
    getAllQuestions: async () => {
        try {
            console.log("withCredentials:", apiClient.defaults.withCredentials);
            const response = await api.get('/questions/');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch questions:', error);
            throw new Error('Failed to fetch questions');
        }
    },

    // Search questions by query (client-side filtering since no backend search endpoint)
    searchQuestions: async (searchQuery) => {
        try {
            // Get all questions and filter client-side
            const response = await api.get('/questions/');
            const questions = response.data;
            
            // Basic filtering based on question text and creator
            const filteredQuestions = questions.filter(question =>
                question.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                question.creator?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            
            return filteredQuestions;
        } catch (error) {
            console.error('Failed to search questions:', error);
            throw new Error('Failed to search questions');
        }
    },

    // Get single question by ID (matches QuestionDetailView with UUID)
    getQuestionById: async (id) => {
        try {
            const response = await api.get(`/questions/${id}/`);
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch question ${id}:`, error);
            throw new Error(`Failed to fetch question with id ${id}`);
        }
    },

    // Create new question
    createQuestion: async (questionData) => {
        try {
            const response = await api.post('/questions/create/', questionData);
            return response.data;
        } catch (error) {
            console.error('Failed to create question:', error);
            throw new Error('Failed to create question');
        }
    },

    // Create Short Answer Question
    createShortAnswerQuestion: async (questionText, answer) => {
        try {
            const questionData = {
                question: questionText,
                type: 'SHORT',
                answer: answer
            };
            const response = await api.post('/questions/create/', questionData);
            return response.data;
        } catch (error) {
            console.error('Failed to create short answer question:', error);
            throw new Error('Failed to create short answer question');
        }
    },

    // Create Multiple Choice Question
    createMCQQuestion: async (questionText, options, correctOption) => {
        try {
            const questionData = {
                question: questionText,
                type: 'MCQ',
                option_a: options.A,
                option_b: options.B,
                option_c: options.C,
                option_d: options.D,
                option_e: options.E,
                correct_option: correctOption
            };
            const response = await api.post('/questions/create/', questionData);
            return response.data;
        } catch (error) {
            console.error('Failed to create MCQ question:', error);
            throw new Error('Failed to create multiple choice question');
        }
    },

    // Submit answer for attempts (placeholder - would need attempts API)
    submitAnswer: async (questionId, answerData) => {
        try {
            const response = await api.post('/attempts/create/', {question:questionId, answer: answerData});
            return response.data;
        } catch (error) {
            console.error('Failed to submit answer:', error);
            throw new Error('Failed to submit answer');
        }
    },
};

export default api;