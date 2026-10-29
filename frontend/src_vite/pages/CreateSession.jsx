import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const CreateSession = () => {
    const navigate = useNavigate();
    const [difficulty, setDifficulty] = useState('medium');
    const [players, setPlayers] = useState([{ username: '', role: 'Rescuer' }]);
    const [error, setError] = useState('');

    const handleAddPlayer = () => {
        setPlayers([...players, { username: '', role: 'Rescuer' }]);
    };

    const handleRemovePlayer = (index) => {
        const newPlayers = players.filter((_, i) => i !== index);
        setPlayers(newPlayers);
    };

    const handlePlayerChange = (index, field, value) => {
        const newPlayers = [...players];
        newPlayers[index][field] = value;
        setPlayers(newPlayers);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await api.post('/sessions/', {
                config: { difficulty },
                players: players
            });
            navigate('/dashboard/sessions');
        } catch (err) {
            setError('Failed to create session. Check usernames.');
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Create New Mission</h2>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Configuration Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Mission Configuration</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">Difficulty Level</label>
                            <select
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                    </div>

                    {/* Players Section */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-700">Squad Assignment</h3>
                            <button
                                type="button"
                                onClick={handleAddPlayer}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                + Add Player
                            </button>
                        </div>

                        <div className="space-y-4">
                            {players.map((player, index) => (
                                <div key={index} className="flex gap-4 items-start">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            placeholder="Username"
                                            value={player.username}
                                            onChange={(e) => handlePlayerChange(index, 'username', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div className="w-40">
                                        <select
                                            value={player.role}
                                            onChange={(e) => handlePlayerChange(index, 'role', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="Rescuer">Rescuer</option>
                                            <option value="ChemicalExpert">Chem Expert</option>
                                        </select>
                                    </div>
                                    {players.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemovePlayer(index)}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard/sessions')}
                            className="px-6 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg shadow-blue-500/30 transition-colors"
                        >
                            Create Mission
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateSession;
