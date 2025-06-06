import React, { useEffect, useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { LuLogOut, LuMenu, LuX, LuSun, LuMoon } from "react-icons/lu";
import { logoutGoogle } from "../firebaseAuth";
import { useTheme } from "../context/ThemeContext";

// Lazy load components
const Sidebar = lazy(() => import("../components/Sidebar"));
const Displayer = lazy(() => import("../components/Displayer"));
const Adder = lazy(() => import("../components/Adder"));
const QuizManager = lazy(() => import("../components/QuizManager").catch(() => ({ default: () => <div>Error loading Quiz Manager</div> })));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full min-h-[200px]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    <span className="sr-only">Loading...</span>
  </div>
);

const App: React.FC = () => {
  const [selectedCollectionName, setSelectedCollectionName] = useState<string>("carousel_items");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user == null) {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const renderContent = () => {
    if (selectedCollectionName === 'quiz') {
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <QuizManager />
        </Suspense>
      );
    }

    return (
      <div className="space-y-4 md:space-y-6">
        <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
          <Suspense fallback={<LoadingSpinner />}>
            <Adder collectionName={selectedCollectionName} />
          </Suspense>
        </div>
        <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
          <Suspense fallback={<LoadingSpinner />}>
            <Displayer collectionName={selectedCollectionName} />
          </Suspense>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <header className="p-3 md:p-4 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 md:gap-4">
            {isMobile && (
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 ease-in-out active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Toggle menu"
                aria-expanded={isSidebarOpen}
              >
                {isSidebarOpen ? <LuX size={24} /> : <LuMenu size={24} />}
              </button>
            )}
            <h1 className="text-xl md:text-2xl font-bold">CIF Guardian Care</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <LuMoon size={20} /> : <LuSun size={20} />}
            </button>
            <button
              onClick={() => logoutGoogle()}
              className="flex items-center gap-1 md:gap-2 bg-slate-200 dark:bg-slate-800 px-3 md:px-4 py-1.5 md:py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <LuLogOut size={16} className="md:size-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Backdrop for mobile sidebar */}
        {isMobile && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity duration-300 ease-in-out"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`
            ${isMobile ? 'fixed inset-y-0 left-0 z-40 w-64 transform transition-all duration-300 ease-in-out shadow-xl' : 'w-64'} 
            ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
            bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
          `}
        >
          <div className="p-3 md:p-4 h-full">
            <Suspense fallback={<LoadingSpinner />}>
              <Sidebar
                selectedCollectionName={selectedCollectionName}
                setSelectedCollectionName={(collection) => {
                  setSelectedCollectionName(collection);
                  if (isMobile) {
                    setIsSidebarOpen(false);
                  }
                }}
              />
            </Suspense>
          </div>
        </div>

        {/* Main content */}
        <main className={`
          flex-1 overflow-auto p-3 md:p-4
          ${isMobile && isSidebarOpen ? 'opacity-50 pointer-events-none blur-sm' : 'opacity-100 pointer-events-auto blur-0'}
          transition-all duration-300 ease-in-out
        `}>
          <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
