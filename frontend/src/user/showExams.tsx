import React, { useState, useEffect } from 'react';
import api from '../Api/api';
import { useNavigate } from 'react-router-dom';

interface Exam {
    id: number;
    title: string;
    description: string;
    duration: number;
    totalQuestions: number;
    passingScore: number;
    status: 'upcoming' | 'active' | 'completed';
}

export const ShowExams: React.FC = () => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userName, setUserName] = useState('Student');

    const navigate = useNavigate();

    useEffect(() => {
        fetchExams();
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const res = await api.get('/user');
            setUserName(res.data.name || 'Student');
        } catch {
            setUserName('Student');
        }
    };

    const fetchExams = async () => {
        try {
            setLoading(true);
            const res = await api.get('/student/quizzes');

            const data = Array.isArray(res.data)
                ? res.data
                : res.data.data || [];

            const formatted: Exam[] = data.map((q: any) => ({
                id: q.id,
                title: q.title || 'Untitled Exam',
                description: q.description || 'No description',
                duration: q.duration || 0,
                totalQuestions: Array.isArray(q.questions) ? q.questions.length : 0,
                passingScore: q.passing_score || 50,
                status: q.is_completed
                    ? 'completed'
                    : q.is_upcoming
                    ? 'upcoming'
                    : 'active',
            }));

            setExams(formatted);
        } catch (err) {
            setError('Failed to load exams');
        } finally {
            setLoading(false);
        }
    };

    const renderSection = (title: string, status: Exam['status']) => {
        const filtered = exams.filter(e => e.status === status);

        if (filtered.length === 0) return null;

        return (
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4">{title}</h2>

                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {filtered.map(exam => (
                        <div
                            key={exam.id}
                            onClick={() => navigate(`/exam/${exam.id}`)}
                            className="min-w-[260px] bg-white rounded-xl p-4 shadow hover:shadow-lg transition cursor-pointer"
                        >
                            <h3 className="font-semibold text-lg mb-1">
                                {exam.title}
                            </h3>

                            <p className="text-sm text-gray-500 mb-3">
                                {exam.description}
                            </p>

                            <div className="flex justify-between text-xs text-gray-400 mb-3">
                                <span>⏱ {exam.duration}</span>
                                <span>❓ {exam.totalQuestions}</span>
                                <span>✅ {exam.passingScore}%</span>
                            </div>

                            <button
                                disabled={exam.status === 'upcoming'}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (exam.status !== 'upcoming') {
                                        navigate(`/exam/${exam.id}`);
                                    }
                                }}
                                className={`w-full py-2 rounded-md text-sm font-medium
                                ${
                                    exam.status === 'active'
                                        ? 'bg-blue-600 text-white'
                                        : exam.status === 'completed'
                                        ? 'bg-gray-500 text-white'
                                        : 'bg-gray-300 cursor-not-allowed'
                                }`}
                            >
                                {exam.status === 'completed'
                                    ? 'Review'
                                    : exam.status === 'upcoming'
                                    ? 'Not Available'
                                    : 'Start'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (loading)
        return <div className="text-center mt-20">Loading...</div>;

    if (error)
        return <div className="text-center mt-20 text-red-500">{error}</div>;

    return (
        <div className="max-w-6xl mx-auto px-6 py-10">

            {/* 🔥 HEADER */}
            <div className="mb-10">
                <h1 className="text-3xl font-bold">
                    👋 Welcome, {userName}
                </h1>
                <p className="text-gray-500 mt-1">
                    Ready to take your exams?
                </p>
            </div>

            {/* 🔥 SECTIONS */}
            {renderSection('🔥 Active Exams', 'active')}
            {renderSection('⏳ Upcoming Exams', 'upcoming')}
            {renderSection('✅ Completed Exams', 'completed')}
        </div>
    );
};

export default ShowExams;