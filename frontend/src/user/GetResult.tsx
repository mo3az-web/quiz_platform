import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface ResultData {
    id: string;
    title: string;
    score: number;
    totalQuestions: number;
    percentage: number;
    date: string;
    status: 'passed' | 'failed';
}

const GetResult: React.FC = () => {
    const [results, setResults] = useState<ResultData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/results');
            setResults(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to load results');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading results...</div>;
    
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Your Results</h1>
            
            {results.length === 0 ? (
                <p className="text-gray-600">No results found.</p>
            ) : (
                <div className="grid gap-4">
                    {results.map((result) => (
                        <div key={result.id} className="border rounded-lg p-4 shadow-md hover:shadow-lg transition">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-semibold">{result.title}</h2>
                                    <p className="text-gray-600 text-sm">{new Date(result.date).toLocaleDateString()}</p>
                                </div>
                                <span className={`px-3 py-1 rounded text-white text-sm font-medium ${
                                    result.status === 'passed' ? 'bg-green-600' : 'bg-red-600'
                                }`}>
                                    {result.status.toUpperCase()}
                                </span>
                            </div>
                            
                            <div className="mt-4 flex justify-between items-center">
                                <div>
                                    <p className="text-gray-700">Score: {result.score}/{result.totalQuestions}</p>
                                    <p className="text-lg font-bold text-blue-600">{result.percentage}%</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GetResult;