import React, { useEffect, useMemo, useState } from 'react';
import { AttemptService } from '../../services/attemptService';
import { QuestionService } from '../../services/QuestionService';
import RecommendedQuestions from './RecommendedQuestions';
import ContinueSection from './ContinueSection';

/**
 * HomeDynamicContent - Container component for dynamic home page content
 * Manages state and data fetching for recommended questions and continue section
 */
const HomeDynamicContent = () => {
    const [attempts, setAttempts] = useState([]);
    const [loadingAttempts, setLoadingAttempts] = useState(true);
    const [lastQuestion, setLastQuestion] = useState(null);
    const [recommended, setRecommended] = useState([]);
    const [loadingRecommended, setLoadingRecommended] = useState(true);

    // Get the most recent attempt
    const lastAttempt = useMemo(() => {
        if (!attempts || attempts.length === 0) return null;
        const sorted = [...attempts].sort(
            (a, b) => new Date(b.submitted_at || 0) - new Date(a.submitted_at || 0)
        );
        return sorted[0];
    }, [attempts]);

    // Load user's attempts
    useEffect(() => {
        let active = true;
        const loadAttempts = async () => {
            try {
                setLoadingAttempts(true);
                const data = await AttemptService.getUserAttempts();
                if (!active) return;
                setAttempts(Array.isArray(data) ? data : []);
            } catch {
                if (!active) return;
                setAttempts([]);
            } finally {
                if (active) setLoadingAttempts(false);
            }
        };
        loadAttempts();
        return () => {
            active = false;
        };
    }, []);

    // Load full question details for last attempt
    useEffect(() => {
        let active = true;
        const loadLastQuestion = async () => {
            if (!lastAttempt?.question) {
                setLastQuestion(null);
                return;
            }
            try {
                const q = await QuestionService.getQuestionById(lastAttempt.question);
                if (!active) return;
                setLastQuestion(q || null);
            } catch {
                if (!active) return;
                setLastQuestion(null);
            }
        };
        loadLastQuestion();
        return () => {
            active = false;
        };
    }, [lastAttempt?.question]);

    // Load recommended questions based on last attempt topic
    useEffect(() => {
        let active = true;
        const loadRecommended = async () => {
            try {
                setLoadingRecommended(true);
                const topic = lastAttempt?.topic || null;
                const filters = topic ? { topic, verified: true } : { verified: true };
                const data = await QuestionService.getAllQuestions({ filters });
                if (!active) return;
                const list = Array.isArray(data) ? data.slice(0, 6) : [];
                setRecommended(list);
            } catch {
                if (!active) return;
                setRecommended([]);
            } finally {
                if (active) setLoadingRecommended(false);
            }
        };
        loadRecommended();
        return () => {
            active = false;
        };
    }, [lastAttempt?.topic]);

    return (
        <>
            <RecommendedQuestions questions={recommended} loading={loadingRecommended} />
            <ContinueSection
                lastAttempt={lastAttempt}
                lastQuestion={lastQuestion}
                loading={loadingAttempts}
            />
        </>
    );
};

export default HomeDynamicContent;
