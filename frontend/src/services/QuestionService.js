import apiClient from './apiClient.js';
import { AttemptService } from './attemptService.js';

// Question service API methods
export const QuestionService = {
    // Get all questions from backend (matches QuestionListView)
    getAllQuestions: async (options = {}) => {
        try {
            const params = {};

            if (options.search?.trim()) {
                params.search = options.search.trim();
            }

            const filters = options.filters || {};
            if (filters.week) {
                params.week = filters.week;
            }
            if (filters.topic) {
                params.topic = filters.topic;
            }
            if (filters.type) {
                params.type = filters.type;
            }
            if (filters.source) {
                params.source = filters.source;
            }
            if (filters.creator) {
                params.creator = filters.creator;
            }
            if (filters.verified) {
                params.verified = 'true';
            }
            if (typeof filters.minRating === 'number' && filters.minRating > 0) {
                params.min_rating = filters.minRating;
            }
            if (typeof filters.maxRating === 'number' && filters.maxRating > 0) {
                params.max_rating = filters.maxRating;
            }

            if (options.sort) {
                params.ordering = options.sort;
            }

            const response = await apiClient.get('/questions/', { params });
            return response.data;
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('Failed to fetch questions:', error);
            }
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
            if (import.meta.env.DEV) {
                console.error('Failed to search questions:', error);
            }
            throw new Error('Failed to search questions');
        }
    },

    // Get single question by ID (matches QuestionDetailView with UUID)
    getQuestionById: async (id) => {
        try {
            const response = await apiClient.get(`/questions/${id}/`);
            return response.data;
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error(`Failed to fetch question ${id}:`, error);
            }
            throw new Error(`Failed to fetch question with id ${id}`);
        }
    },

    // Create new question
    createQuestion: async (questionData) => {
        try {
            const response = await apiClient.post('/questions/create/', questionData);
            return response.data;
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('Failed to create question:', error);
            }
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
            if (import.meta.env.DEV) {
                console.error('Failed to create short answer question:', error);
            }
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
            if (import.meta.env.DEV) {
                console.error('Failed to create MCQ question:', error);
            }
            throw new Error('Failed to create multiple choice question');
        }
    },

    // Submit answer for attempts
    submitAnswer: async (questionId, answer) => {
        try {
            // Use AttemptService for consistency
            const response = await AttemptService.createAttempt(questionId, answer);
            return response;
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('Failed to submit answer:', error);
            }
            
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

    // Get questions created by current user
    getUserQuestions: async () => {
        try {
            const response = await apiClient.get('/questions/user/');
            return response.data;
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('Failed to fetch user questions:', error);
            }
            throw new Error('Failed to fetch user questions');
        }
    },

    // Get questions created by specific user (public)
    getQuestionsByCreator: async (creatorId, options = {}) => {
        const mergedFilters = {
            ...(options.filters || {}),
            creator: creatorId,
        };
        return QuestionService.getAllQuestions({
            ...options,
            filters: mergedFilters,
        });
    },

    getQuestionMetadata: async () => {
        try {
            const response = await apiClient.get('/questions/metadata/');
            return response.data;
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('Failed to fetch question metadata:', error);
            }
            throw new Error('Failed to fetch question metadata');
        }
    },

    // Verify question (admin only)
    verifyQuestion: async (questionId, approved, rejectionReason = '') => {
        try {
            const payload = {
                approved: approved
            };

            // Include rejection reason if rejecting
            if (!approved && rejectionReason) {
                payload.rejectionReason = rejectionReason;
            }

            const response = await apiClient.post(`/questions/${questionId}/verify/`, payload);
            return response.data;
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('Failed to verify question:', error);
            }

            // Provide specific error messages
            if (error.response?.status === 403) {
                throw new Error('Only administrators can verify questions');
            } else if (error.response?.status === 404) {
                throw new Error('Question not found');
            } else if (error.response?.data?.error) {
                throw new Error(error.response.data.error);
            } else {
                throw new Error('Failed to verify question');
            }
        }
    },

    // Note: Rating functions moved to ratingService.js
    // Use RatingService.getQuestionRating, RatingService.rateQuestion, RatingService.clearRating
};

//export default api;
