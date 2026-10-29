import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

const SessionDetails = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await api.get(`/dashboard/sessions/${id}`);
                setData(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load session details');
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    if (loading) return <div className="text-white">Loading details...</div>;
    if (error) return <div className="text-red-400">{error}</div>;
    if (!data) return null;

    const { session, players, results, reports } = data;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <Link to="/dashboard/sessions" className="text-gray-500 hover:text-gray-700 mb-2 block">
                        ← Back to Missions
                    </Link>
                    <h2 className="text-3xl font-bold text-gray-800">Mission Report #{session.id}</h2>
                    <p className="text-gray-500">Status: <span className="font-semibold">{session.status}</span></p>
                </div>
            </div>

            {/* Squad Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Squad Status</h3>
                <div className="grid gap-4">
                    {players.map((player) => (
                        <div key={player.user_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                    {player.username[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{player.username}</p>
                                    <p className="text-sm text-gray-500">{player.role}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${player.status === 'JOINED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {player.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Game Metrics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Mission Metrics</h3>
                {results.length === 0 ? (
                    <p className="text-gray-500 italic">No metrics recorded yet.</p>
                ) : (
                    <div className="grid gap-4">
                        {results.map((result, idx) => (
                            <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                                <p className="font-semibold text-gray-900 mb-2">{result.username}'s Performance</p>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    {Object.entries(result.metrics).map(([key, value]) => (
                                        <div key={key} className="flex justify-between border-b border-gray-100 pb-1">
                                            <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                                            <span className="font-mono font-medium">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* AI Performance Reports */}
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <h3 className="text-xl font-bold">AI Performance Analysis</h3>
                </div>

                {reports.length === 0 ? (
                    <p className="text-purple-200 italic">AI analysis pending completion of mission...</p>
                ) : (
                    <div className="space-y-6">
                        {reports.map((report, idx) => (
                            <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="font-semibold text-purple-200">Analysis for {report.username}</span>
                                    <span className="text-xs text-purple-300">{new Date(report.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-gray-100 leading-relaxed whitespace-pre-wrap">
                                    {report.content}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SessionDetails;
