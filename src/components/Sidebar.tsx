import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LuImage,
  LuImagePlus,
  LuMessageSquare,
  LuGraduationCap,
  LuClipboardList,
  LuVideo,
  LuChevronRight,
  LuLayoutDashboard,
  LuFlag,
  LuUsers,
  LuShieldCheck,
} from "react-icons/lu";

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
  /** If true, only renders when the user has the 'admin' role */
  adminOnly?: boolean;
}

interface SidebarProps {
  /** Role from Firestore users collection. Undefined while loading. */
  userRole: string | null;
}

const SideBarItem: React.FC<NavItem> = ({ name, path, icon, badge }) => {
  const location = useLocation();
  const isSelected = location.pathname === path;

  return (
    <Link
      to={path}
      className={`
        group
        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
        transition-all duration-200 ease-in-out
        ${isSelected
          ? 'bg-blue-50 dark:bg-blue-950/30 border-l-2 border-blue-600 dark:border-blue-400'
          : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 border-l-2 border-transparent'
        }
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900
        active:scale-[0.98]
      `}
      aria-current={isSelected ? "page" : undefined}
    >
      {/* Icon */}
      <span className={`
        flex-shrink-0 w-5 h-5 transition-colors duration-200
        ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}
      `}>
        {icon}
      </span>

      {/* Label */}
      <span className={`
        flex-1 text-sm font-medium transition-colors duration-200
        ${isSelected
          ? 'text-slate-900 dark:text-white'
          : 'text-slate-700 dark:text-slate-300'
        }
      `}>
        {name}
      </span>

      {/* Badge (optional) */}
      {badge && (
        <span className="flex-shrink-0 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
          {badge}
        </span>
      )}

      {/* Active indicator / Chevron */}
      {isSelected ? (
        <span className="flex-shrink-0 w-1 h-6 bg-blue-600 dark:bg-blue-400 rounded-full" />
      ) : (
        <LuChevronRight className="flex-shrink-0 w-4 h-4 text-slate-400 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      )}
    </Link>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ userRole }) => {
  const isAdmin = userRole === 'admin';

  // Items visible to both admins and moderators
  const commonItems: NavItem[] = [
    { name: "Overview", path: "/", icon: <LuLayoutDashboard /> },
    { name: "Carousel Items", path: "/carousel-items", icon: <LuImage /> },
    { name: "Home Images", path: "/home-images", icon: <LuImagePlus /> },
    { name: "Forum", path: "/forum", icon: <LuMessageSquare /> },
    { name: "Learn", path: "/learn", icon: <LuGraduationCap /> },
    { name: "Quizzes", path: "/quizes", icon: <LuClipboardList /> },
    { name: "Videos", path: "/videos", icon: <LuVideo /> },
  ];

  // Items visible only to admins
  const adminItems: NavItem[] = [
    { name: "Feature Flags", path: "/feature-flags", icon: <LuFlag /> },
    { name: "Moderator Applications", path: "/moderator-applications", icon: <LuUsers /> },
  ];

  return (
    <nav className="flex flex-col h-full" aria-label="Main navigation">
      {/* Navigation Header */}
      <div className="px-3 py-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Navigation
        </h2>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {commonItems.map((item) => (
          <SideBarItem key={item.path} {...item} />
        ))}

        {/* Tools section */}
        <div className="my-4 border-t border-slate-200 dark:border-slate-800" />
        <SideBarItem
          name="Quiz Manager"
          path="/quiz-manager"
          icon={<LuClipboardList />}
        />

        {/* Admin-only System section */}
        {isAdmin && (
          <>
            <div className="my-4 border-t border-slate-200 dark:border-slate-800" />
            <p className="px-3 mb-1 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Admin
            </p>
            {adminItems.map((item) => (
              <SideBarItem key={item.path} {...item} />
            ))}
          </>
        )}

        {/* Role badge at the bottom of the nav */}
        <div className="my-4 border-t border-slate-200 dark:border-slate-800" />
        <div className="px-3 py-2 flex items-center gap-2">
          <LuShieldCheck className={`w-4 h-4 flex-shrink-0 ${isAdmin ? 'text-blue-500' : 'text-emerald-500'}`} />
          <span className={`text-xs font-semibold capitalize ${isAdmin ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {userRole ?? 'moderator'}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-slate-200 dark:border-slate-800">
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          CIF Guardian Care v1.0
        </p>
      </div>
    </nav>
  );
};

export default Sidebar;