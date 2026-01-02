import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useProfileStore from '../store/profileStore';
import { 
  HomeIcon, 
  ClipboardDocumentCheckIcon, 
  ChartBarIcon,
  CpuChipIcon,
  ArrowPathIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  ClipboardDocumentCheckIcon as ClipboardDocumentCheckIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  CpuChipIcon as CpuChipIconSolid,
  ArrowPathIcon as ArrowPathIconSolid,
  AcademicCapIcon as AcademicCapIconSolid
} from '@heroicons/react/24/solid';

function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const clearProfile = useProfileStore((state) => state.clearProfile);

  const handleLogout = () => {
    clearProfile(); // Clear profile data on logout
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
    },
    {
      path: '/questionnaire',
      label: 'Questionnaire',
      icon: ClipboardDocumentCheckIcon,
      iconSolid: ClipboardDocumentCheckIconSolid,
    },
    {
      path: '/results',
      label: 'Results',
      icon: ChartBarIcon,
      iconSolid: ChartBarIconSolid,
    },
    {
      path: '/riasec-info',
      label: 'RIASEC Info',
      icon: AcademicCapIcon,
      iconSolid: AcademicCapIconSolid,
    },
    {
      path: '/model-statistics',
      label: 'Model Stats',
      icon: CpuChipIcon,
      iconSolid: CpuChipIconSolid,
    },
    {
      path: '/model-workflow',
      label: 'How It Works',
      icon: ArrowPathIcon,
      iconSolid: ArrowPathIconSolid,
    },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Navigation - Fixed position, always stays in place even when scrolling */}
      <aside className="sidebar-fixed">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo */}
          <div className="p-6 border-b border-slate-200 flex-shrink-0">
            <Link to="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">SCRS</h1>
                <p className="text-xs text-slate-500">Student Career Recommendation System</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
            {navItems.map((item) => {
              const Icon = isActive(item.path) ? item.iconSolid : item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-slate-900 text-white shadow-lg'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-slate-200 flex-shrink-0">
            <Link
              to="/profile"
              className="flex items-center space-x-3 px-4 py-3 mb-2 rounded-xl hover:bg-slate-100 transition-all duration-200 cursor-pointer group"
            >
              {/* Profile Image or Icon */}
              <div className="relative">
                {user?.profileImage ? (
                  <img 
                    src={user.profileImage.startsWith('data:') || user.profileImage.startsWith('http')
                      ? user.profileImage 
                      : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}${user.profileImage}`}
                    alt="Profile" 
                    className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 group-hover:border-slate-400 transition-colors"
                    onError={(e) => {
                      // Fallback to default icon if image fails to load
                      e.target.style.display = 'none';
                      const fallback = e.target.nextElementSibling;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                {!user?.profileImage && (
                  <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-semibold text-sm">
                    {(user?.username || 'U')[0].toUpperCase()}
                  </div>
                )}
                {/* Online indicator */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-slate-900 transition-colors">
                  {user?.fullName || user?.username || 'User'}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  View Profile
                </p>
              </div>
              {/* Arrow indicator */}
              <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content - Scrollable independently, positioned to account for fixed sidebar */}
      <main className="flex-1 ml-64 min-h-screen bg-slate-50">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default Layout;

