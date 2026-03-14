import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  CpuChipIcon,
  AcademicCapIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  ClipboardDocumentCheckIcon as ClipboardDocumentCheckIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  CpuChipIcon as CpuChipIconSolid,
  AcademicCapIcon as AcademicCapIconSolid,
} from "@heroicons/react/24/solid";

function Layout({ children }) {
  const location = useLocation();
  const homePath = "/results";
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  const navItems = [
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

  return (
    <div className="flex min-h-screen text-slate-800">
      <div className="md:hidden fixed top-0 inset-x-0 z-[10000] bg-white/85 backdrop-blur-md border-b border-slate-200/70">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to={homePath} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-700 to-teal-600 rounded-lg flex items-center justify-center shadow-sm">
              <svg
                className="w-4 h-4 text-white"
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
            <span className="font-bold text-slate-900 tracking-tight">
              SCRS
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileNavOpen((prev) => !prev)}
            className="p-2 rounded-lg bg-slate-100 text-slate-700"
            aria-label="Toggle menu"
          >
            {isMobileNavOpen ? (
              <XMarkIcon className="w-5 h-5" />
            ) : (
              <Bars3Icon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {isMobileNavOpen && (
        <button
          type="button"
          onClick={() => setIsMobileNavOpen(false)}
          className="md:hidden fixed inset-0 z-[9998] bg-slate-900/35 backdrop-blur-[1px]"
          aria-label="Close menu overlay"
        />
      )}

      <aside
        className={`md:hidden mobile-sidebar ${isMobileNavOpen ? "mobile-sidebar-open" : "mobile-sidebar-closed"}`}
      >
        <div className="p-4 border-b border-slate-200">
          <p className="text-[11px] uppercase tracking-[0.08em] text-cyan-800 font-semibold">
            Navigation
          </p>
        </div>
        <nav className="p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = isActive(item.path) ? item.iconSolid : item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive(item.path)
                    ? "bg-gradient-to-r from-cyan-700 to-teal-600 text-white shadow-lg shadow-cyan-900/20"
                    : "text-slate-700 hover:bg-white/80 hover:shadow-sm"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-semibold tracking-tight">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Sidebar Navigation - Fixed position, always stays in place even when scrolling */}
      <aside className="sidebar-fixed">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo */}
          <div className="p-6 border-b border-slate-200/80 flex-shrink-0">
            <Link
              to={homePath}
              className="flex items-start space-x-3 hover:opacity-90 transition-opacity cursor-pointer"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-700 to-teal-600 rounded-xl flex items-center justify-center shadow-md shadow-cyan-800/20">
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
                <h1 className="text-xl font-bold text-slate-900 leading-tight">
                  SCRS
                </h1>
                <p className="text-xs text-slate-500 leading-snug mt-1">
                  Career Intelligence for Students
                </p>
              </div>
            </Link>
            <div className="mt-4 rounded-xl border border-cyan-100 bg-cyan-50/60 px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.08em] text-cyan-800 font-semibold">
                Live Assessment Workspace
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
            {navItems.map((item) => {
              const Icon = isActive(item.path) ? item.iconSolid : item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive(item.path)
                      ? "bg-gradient-to-r from-cyan-700 to-teal-600 text-white shadow-lg shadow-cyan-900/20"
                      : "text-slate-700 hover:bg-white/80 hover:shadow-sm"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive(item.path) ? "" : "group-hover:scale-105"
                    }`}
                  />
                  <span className="font-semibold tracking-tight">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content - Scrollable independently, positioned to account for fixed sidebar */}
      <main className="flex-1 ml-0 md:ml-64 min-h-screen bg-transparent">
        <div className="relative pt-20 md:pt-8 p-4 sm:p-5 md:p-8 lg:p-10">
          <div className="pointer-events-none absolute -top-8 -right-8 w-64 h-64 bg-cyan-200/30 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute bottom-8 left-8 w-56 h-56 bg-amber-200/25 rounded-full blur-3xl" />
          <div className="relative z-10">{children}</div>
        </div>
      </main>
    </div>
  );
}

export default Layout;
