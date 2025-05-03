import React, { useEffect, useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { LuLogOut, LuMenu } from "react-icons/lu";
import { logoutGoogle } from "../firebaseAuth";

// Lazy load components
const Sidebar = lazy(() => import("../components/Sidebar"));
const Displayer = lazy(() => import("../components/Displayer"));
const Adder = lazy(() => import("../components/Adder"));
const QuizManager = lazy(() => import("../components/QuizManager").catch(() => ({ default: () => <div>Error loading Quiz Manager</div> })));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const App: React.FC = () => {
  const [selectedCollectionName, setSelectedCollectionName] = useState<string>("carousel_items");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const navigate = useNavigate();

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
      <>
        <div className="bg-slate-900 rounded-lg p-6 shadow-lg">
          <Suspense fallback={<LoadingSpinner />}>
            <Adder collectionName={selectedCollectionName} />
          </Suspense>
        </div>
        <div className="bg-slate-900 rounded-lg p-6 shadow-lg">
          <Suspense fallback={<LoadingSpinner />}>
            <Displayer collectionName={selectedCollectionName} />
          </Suspense>
        </div>
      </>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white">
      <header className="p-4 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            {isMobile && (
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <LuMenu size={24} />
              </button>
            )}
            <h1 className="text-2xl font-bold">CIF Guardian Care</h1>
          </div>
          <button
            onClick={() => logoutGoogle()}
            className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <LuLogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {isSidebarOpen && (
          <div className={`${isMobile ? 'fixed inset-0 z-40' : 'w-64'} bg-slate-900 border-r border-slate-800`}>
            <div className="p-4">
              <Suspense fallback={<LoadingSpinner />}>
                <Sidebar
                  selectedCollectionName={selectedCollectionName}
                  setSelectedCollectionName={setSelectedCollectionName}
                />
              </Suspense>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-hidden">
          <div className="h-full p-4 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              <div className="grid gap-6">
                {renderContent()}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
