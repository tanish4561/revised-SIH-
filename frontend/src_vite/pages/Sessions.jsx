import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const Sessions = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const response = await api.get('/dashboard/sessions');
            setSessions(response.data.sessions);
            setLoading(false);
        } catch (err) {
            setError('Failed to load sessions');
            setLoading(false);
        }
    };

    const handleStartSession = async (sessionId) => {
        try {
            await api.post(`/sessions/${sessionId}/start`);
            fetchSessions(); // Refresh list
        } catch (err) {
            alert('Failed to start session');
        }
    };

    if (loading) return <div className="text-white">Loading sessions...</div>;
    if (error) return <div className="text-red-400">{error}</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Mission Control</h2>
                <Link
                    to="/dashboard/create"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/30"
                >
                    + New Session
                </Link>
            </div>

            <div className="grid gap-6">
                {sessions.map((session) => (
                    <div
                        key={session.id}
                        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-lg font-semibold text-gray-900">
                                        Session #{session.id}
                                    </span>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${session.status === 'CREATED'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : session.status === 'STARTED'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}
                                    >
                                        {session.status}
                                    </span>
                                </div>
                                <p className="text-gray-500 text-sm">
                                    Created: {new Date(session.created_at).toLocaleString()}
                                </p>
                                <div className="mt-4 flex gap-4 text-sm text-gray-600">
                                    <div>
                                        <span className="font-medium">Difficulty:</span>{' '}
                                        {session.config?.difficulty || 'Normal'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                {session.status === 'CREATED' && (
                                    <button
                                        onClick={() => handleStartSession(session.id)}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                                    >
                                        Start Mission
                                    </button>
                                )}
                                <Link
                                    to={`/dashboard/sessions/${session.id}`}
                                    className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm rounded-lg transition-colors"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}

                {sessions.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500">No active missions found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sessions;
