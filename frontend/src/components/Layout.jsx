import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  CpuChipIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  ClipboardDocumentCheckIcon as ClipboardDocumentCheckIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  CpuChipIcon as CpuChipIconSolid,
  AcademicCapIcon as AcademicCapIconSolid,
} from "@heroicons/react/24/solid";

function Layout({ children }) {
  const location = useLocation();
  const homePath = "/questionnaire";

  const isActive = (path) => location.pathname === path;

  const navItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
    },
    {
      path: "/questionnaire",
      label: "Questionnaire",
      icon: ClipboardDocumentCheckIcon,
      iconSolid: ClipboardDocumentCheckIconSolid,
    },
    {
      path: "/results",
      label: "Results",
      icon: ChartBarIcon,
      iconSolid: ChartBarIconSolid,
    },
    {
      path: "/riasec-info",
      label: "RIASEC Info",
      icon: AcademicCapIcon,
      iconSolid: AcademicCapIconSolid,
    },
    {
      path: "/model-statistics",
      label: "Model Stats",
      icon: CpuChipIcon,
      iconSolid: CpuChipIconSolid,
    },
  ];

  const visibleNavItems = navItems.filter((item) => item.path !== "/dashboard");

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Navigation - Fixed position, always stays in place even when scrolling */}
      <aside className="sidebar-fixed">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo */}
          <div className="p-6 border-b border-slate-200 flex-shrink-0">
            <Link
              to={homePath}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">SCRS</h1>
                <p className="text-xs text-slate-500">
                  Student Career Recommendation System
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
            {visibleNavItems.map((item) => {
              const Icon = isActive(item.path) ? item.iconSolid : item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive(item.path)
                      ? "bg-slate-900 text-white shadow-lg"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content - Scrollable independently, positioned to account for fixed sidebar */}
      <main className="flex-1 ml-64 min-h-screen bg-slate-50">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}

export default Layout;
