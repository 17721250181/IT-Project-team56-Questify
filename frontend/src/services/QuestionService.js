import apiClient from './apiClient.js';

// Question service API methods
export const QuestionService = {
    // Get all questions from backend (matches QuestionListView)
    getAllQuestions: async () => {
        try {
            console.log("withCredentials:", apiClient.defaults.withCredentials);
            const response = await apiClient.get('/questions/');
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
            const response = await apiClient.get('/questions/');
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
            const response = await apiClient.get(`/questions/${id}/`);
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch question ${id}:`, error);
            throw new Error(`Failed to fetch question with id ${id}`);
        }
    },

    // Create new question
    createQuestion: async (questionData) => {
        try {
            const response = await apiClient.post('/questions/create/', questionData);
            return response.data;
        } catch (error) {
            console.error('Failed to create question:', error);
            throw new Error('Failed to create question');
        }
    },

    // Create Short Answer Question
    createShortAnswerQuestion: async (questionText, answer, week, topic) => {
        try {
            const questionData = {
                question: questionText,
                type: 'SHORT',
                answer: answer,
                week: week,
                topic: topic
            };
            const response = await apiClient.post('/questions/create/', questionData);
            return response.data;
        } catch (error) {
            console.error('Failed to create short answer question:', error);
            throw new Error('Failed to create short answer question');
        }
    },

    // Create Multiple Choice Question
    createMCQQuestion: async (questionText, options, correctOptions, week, topic) => {
        try {
            const questionData = {
                question: questionText,
                type: 'MCQ',
                option_a: options.A,
                option_b: options.B,
                option_c: options.C,
                option_d: options.D,
                option_e: options.E,
                correct_options: correctOptions,
                week: week,
                topic: topic
            };
            const response = await apiClient.post('/questions/create/', questionData);
            return response.data;
        } catch (error) {
            console.error('Failed to create MCQ question:', error);
            throw new Error('Failed to create multiple choice question');
        }
    },

    // Submit answer for attempts
    submitAnswer: async (questionId, answer) => {
        try {
            const response = await apiClient.post('/attempts/create/', {question:questionId, answer: answer});
            return response.data;
        } catch (error) {
            console.error('Failed to submit answer:', error);
            
            // Provide more specific error messages
            if (error.response?.status === 401) {
                throw new Error('Please login to submit answers');
            } else if (error.response?.status === 404) {
                throw new Error('Question not found');
            } else if (error.response?.data?.error) {
                throw new Error(error.response.data.error);
            } else {
                throw new Error('Failed to submit answer');
            }
        }
    },
};

//export default api;