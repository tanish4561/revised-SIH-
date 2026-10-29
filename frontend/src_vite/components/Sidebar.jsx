import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        { name: 'Sessions', path: '/dashboard/sessions' },
        { name: 'Create Session', path: '/dashboard/create' },
    ];

    return (
        <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 flex flex-col">
            <div className="p-6 text-2xl font-bold border-b border-gray-800">
                Admin Panel
            </div>
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <Link
                                to={item.path}
                                className={`block px-4 py-3 rounded-lg transition-colors ${location.pathname === item.path
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="p-4 border-t border-gray-800">
                <button className="w-full px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
