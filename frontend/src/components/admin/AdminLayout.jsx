import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Package, 
    ShoppingCart, 
    Users, 
    Mail, 
    Settings, 
    Image as ImageIcon, 
    BarChart3, 
    Search, 
    Truck, 
    UserCircle,
    Menu,
    LogOut,
    MessageSquare,
    Globe,
    Tag
} from 'lucide-react';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
        if (!token || user.role !== 'admin') {
            navigate('/admin/login');
        }
    }, [navigate]);

    const navItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/products', icon: Package, label: 'Product Management' },
        { path: '/admin/orders', icon: ShoppingCart, label: 'Order Management' },
        { path: '/admin/users', icon: Users, label: 'User Management' },
        { path: '/admin/marketing', icon: Mail, label: 'Email Marketing' },
        { path: '/admin/banners', icon: ImageIcon, label: 'Banner / Slider' },
        { path: '/admin/website', icon: Globe, label: 'Website Management' },
        { path: '/admin/reviews', icon: MessageSquare, label: 'Review Management' },
        { path: '/admin/analytics', icon: BarChart3, label: 'Analytics & Reports' },
        { path: '/admin/seo', icon: Search, label: 'SEO & Meta Tags' },
        { path: '/admin/courier', icon: Truck, label: 'Courier Management' },
        { path: '/admin/coupons', icon: Tag, label: 'Coupons' },
        { path: '/admin/settings', icon: Settings, label: 'System Settings' },
        { path: '/admin/account', icon: UserCircle, label: 'Account Management' }
    ];

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        navigate('/admin/login');
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-center h-16 border-b border-gray-100">
                    <span className="text-xl font-bold text-gray-800">Ghani Admin</span>
                </div>
                <nav className="p-4 space-y-1 h-[calc(100vh-4rem)] overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/admin'}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                                    isActive 
                                    ? 'bg-[#2d4b3e] text-white' 
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-[#2d4b3e]'
                                }`
                            }
                            onClick={() => setSidebarOpen(false)}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Top Header */}
                <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <button 
                            className="p-2 text-gray-600 rounded-lg hover:bg-gray-100 lg:hidden"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <h2 className="text-xl font-semibold text-gray-800 hidden sm:block">Control Panel</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-600 hidden sm:block">Hello, Admin</span>
                        <button 
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                            <LogOut size={16} />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
