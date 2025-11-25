/**
 * Breadcrumbs Component
 * Navigation breadcrumbs for better UX
 */
import { Link } from 'react-router-dom';
import { LuChevronRight, LuHome } from 'react-icons/lu';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
}

export function Breadcrumbs({ items, showHome = true }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400" aria-label="Breadcrumb">
      {showHome && (
        <>
          <Link
            to="/"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
            aria-label="Home"
          >
            <LuHome size={16} />
          </Link>
          {items.length > 0 && <LuChevronRight size={14} className="text-slate-400" />}
        </>
      )}
      
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <div key={index} className="flex items-center space-x-2">
            {item.path && !isLast ? (
              <Link
                to={item.path}
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-slate-900 dark:text-white font-medium' : ''}>
                {item.label}
              </span>
            )}
            {!isLast && <LuChevronRight size={14} className="text-slate-400" />}
          </div>
        );
      })}
    </nav>
  );
}
