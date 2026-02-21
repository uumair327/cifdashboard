import React, { lazy, Suspense, useMemo } from 'react'
import ReactDOM from 'react-dom/client'
import App from './pages/App'
import './index.css'
import { ThemeProvider } from './context/ThemeContext'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ToastProvider } from './core/components/Toast/ToastProvider'
import { AuthProvider, FirebaseAuthService, useAuth } from './core/auth'
import { ErrorBoundary } from './core/components/ErrorBoundary/ErrorBoundary'
import { FeatureFlagProvider } from './core/feature-flags'
import { FirebaseFeatureFlagRepository } from './core/feature-flags'
import { auth } from './firebase'
import {
  FirebaseModeratorRepository,
  useModeratorApplications,
} from './features/moderator'

// Lazy load pages for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const CarouselItemsPage = lazy(() => import('./features/collections/pages/CarouselItemsPage'))
const HomeImagesPage = lazy(() => import('./features/collections/pages/HomeImagesPage'))
const ForumPage = lazy(() => import('./features/forum/pages/ForumManagementPage'))
const LearnPage = lazy(() => import('./features/collections/pages/LearnPage'))
const QuizesPage = lazy(() => import('./features/collections/pages/QuizesPage'))
const VideosPage = lazy(() => import('./features/collections/pages/VideosPage'))
const QuizManagerPage = lazy(() => import('./features/quiz/pages/QuizManagerPage'))
const FeatureFlagsPage = lazy(() => import('./features/feature-flags/pages/FeatureFlagsPage'))
const ModeratorApplicationsPageLazy = lazy(() => import('./features/moderator/pages/ModeratorApplicationsPage'))

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
)

/**
 * Wrapper component that injects the hook data into ModeratorApplicationsPage.
 * This keeps the page component purely presentational (props-only).
 */
const ModeratorApplicationsPageWrapper = () => {
  const { user } = useAuth();
  const repo = useMemo(() => new FirebaseModeratorRepository(), []);
  const { applications, loading, error, reviewApplication } = useModeratorApplications(
    repo,
    user?.uid ?? null,
  );

  return (
    <ModeratorApplicationsPageLazy
      applications={applications}
      loading={loading}
      error={error}
      currentUid={user?.uid ?? ''}
      onReview={reviewApplication}
    />
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Dashboard />
          </Suspense>
        )
      },
      {
        path: "carousel-items",
        element: (
          <Suspense fallback={<PageLoader />}>
            <CarouselItemsPage />
          </Suspense>
        )
      },
      {
        path: "home-images",
        element: (
          <Suspense fallback={<PageLoader />}>
            <HomeImagesPage />
          </Suspense>
        )
      },
      {
        path: "forum",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ForumPage />
          </Suspense>
        )
      },
      {
        path: "learn",
        element: (
          <Suspense fallback={<PageLoader />}>
            <LearnPage />
          </Suspense>
        )
      },
      {
        path: "quizes",
        element: (
          <Suspense fallback={<PageLoader />}>
            <QuizesPage />
          </Suspense>
        )
      },
      {
        path: "videos",
        element: (
          <Suspense fallback={<PageLoader />}>
            <VideosPage />
          </Suspense>
        )
      },
      {
        path: "quiz-manager",
        element: (
          <Suspense fallback={<PageLoader />}>
            <QuizManagerPage />
          </Suspense>
        )
      },
      {
        path: "feature-flags",
        element: (
          <Suspense fallback={<PageLoader />}>
            <FeatureFlagsPage />
          </Suspense>
        )
      },
      {
        path: "moderator-applications",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ModeratorApplicationsPageWrapper />
          </Suspense>
        )
      },
    ]
  },
  {
    path: "/login",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Login />
      </Suspense>
    )
  },
  {
    path: "/register",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Register />
      </Suspense>
    )
  }
], {
  basename: '/cifdashboard'
})

// Initialize services (singletons)
const authService = new FirebaseAuthService(auth);
const featureFlagRepository = new FirebaseFeatureFlagRepository();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider authService={authService}>
        <FeatureFlagProvider repository={featureFlagRepository}>
          <ThemeProvider>
            <ToastProvider>
              <RouterProvider router={router} />
            </ToastProvider>
          </ThemeProvider>
        </FeatureFlagProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
