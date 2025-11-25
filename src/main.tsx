import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import App from './pages/App'
import './index.css'
import { ThemeProvider } from './context/ThemeContext'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ToastProvider } from './core/components/Toast/ToastProvider'
import { AuthProvider, FirebaseAuthService } from './core/auth'
import { ErrorBoundary } from './core/components/ErrorBoundary/ErrorBoundary'
import { auth } from './firebase'

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

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
)

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
      }
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

// Initialize auth service
const authService = new FirebaseAuthService(auth);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider authService={authService}>
        <ThemeProvider>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
