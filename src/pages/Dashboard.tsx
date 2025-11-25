/**
 * Dashboard Home Page
 * Overview with statistics and quick actions
 */
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCollection } from '../features/collections/hooks/useCollection';
import { createRepository } from '../features/collections/data';
import { StatCard } from '../core/components/StatCard/StatCard';
import { useAuth } from '../core/auth';
import {
  LuImage,
  LuImagePlus,
  LuMessageSquare,
  LuGraduationCap,
  LuClipboardList,
  LuVideo,
  LuArrowRight,
} from 'react-icons/lu';

export default function Dashboard() {
  const { user } = useAuth();

  // Create repositories
  const carouselRepo = useMemo(() => createRepository('carousel_items'), []);
  const homeImagesRepo = useMemo(() => createRepository('home_images'), []);
  const forumRepo = useMemo(() => createRepository('forum'), []);
  const learnRepo = useMemo(() => createRepository('learn'), []);
  const quizesRepo = useMemo(() => createRepository('quizes'), []);
  const videosRepo = useMemo(() => createRepository('videos'), []);

  // Fetch data
  const { data: carousel, loading: carouselLoading } = useCollection(carouselRepo, 'carousel_items');
  const { data: homeImages, loading: homeImagesLoading } = useCollection(homeImagesRepo, 'home_images');
  const { data: forum, loading: forumLoading } = useCollection(forumRepo, 'forum');
  const { data: learn, loading: learnLoading } = useCollection(learnRepo, 'learn');
  const { data: quizes, loading: quizesLoading } = useCollection(quizesRepo, 'quizes');
  const { data: videos, loading: videosLoading } = useCollection(videosRepo, 'videos');

  // Check if ALL collections are still loading (initial load)
  const allLoading = carouselLoading && homeImagesLoading && forumLoading && learnLoading && quizesLoading && videosLoading;

  const collections = [
    { name: 'Carousel Items', path: '/carousel-items', icon: <LuImage size={24} />, count: carousel?.length || 0, color: 'blue' as const },
    { name: 'Home Images', path: '/home-images', icon: <LuImagePlus size={24} />, count: homeImages?.length || 0, color: 'green' as const },
    { name: 'Forum', path: '/forum', icon: <LuMessageSquare size={24} />, count: forum?.length || 0, color: 'purple' as const },
    { name: 'Learn', path: '/learn', icon: <LuGraduationCap size={24} />, count: learn?.length || 0, color: 'orange' as const },
    { name: 'Quizzes', path: '/quizes', icon: <LuClipboardList size={24} />, count: quizes?.length || 0, color: 'red' as const },
    { name: 'Videos', path: '/videos', icon: <LuVideo size={24} />, count: videos?.length || 0, color: 'blue' as const },
  ];

  const totalItems = collections.reduce((sum, col) => sum + col.count, 0);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.email?.split('@')[0] || 'User'}! 👋
        </h1>
        <p className="text-blue-100">
          Manage your CIF Guardian Care content from this dashboard
        </p>
      </div>

      {/* Statistics */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Overview</h2>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Items"
            value={totalItems}
            icon={<LuClipboardList size={24} />}
            color="blue"
            loading={allLoading}
          />
          <StatCard
            title="Collections"
            value={collections.length}
            icon={<LuImage size={24} />}
            color="green"
            loading={allLoading}
          />
          <StatCard
            title="Quizzes"
            value={quizes?.length || 0}
            icon={<LuClipboardList size={24} />}
            color="purple"
            loading={quizesLoading}
          />
          <StatCard
            title="Videos"
            value={videos?.length || 0}
            icon={<LuVideo size={24} />}
            color="orange"
            loading={videosLoading}
          />
        </div>
      </div>

      {/* Quick Access */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quick Access</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => {
            // Map colors to actual Tailwind classes
            const colorClasses = {
              blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
              green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
              purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
              orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
              red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
            };

            return (
              <Link
                key={collection.path}
                to={collection.path}
                className="group bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${colorClasses[collection.color]}`}>
                    {collection.icon}
                  </div>
                  <LuArrowRight className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {collection.name}
                </h3>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {collection.count}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {collection.count === 1 ? 'item' : 'items'}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/quiz-manager"
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <LuClipboardList size={32} className="mb-3" />
            <h3 className="text-lg font-semibold mb-1">Quiz Manager</h3>
            <p className="text-sm text-purple-100">Manage quizzes and questions</p>
          </Link>
          
          <Link
            to="/videos"
            className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <LuVideo size={32} className="mb-3" />
            <h3 className="text-lg font-semibold mb-1">Videos</h3>
            <p className="text-sm text-red-100">Manage video content</p>
          </Link>
          
          <Link
            to="/learn"
            className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <LuGraduationCap size={32} className="mb-3" />
            <h3 className="text-lg font-semibold mb-1">Learning</h3>
            <p className="text-sm text-orange-100">Educational content</p>
          </Link>
          
          <Link
            to="/forum"
            className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <LuMessageSquare size={32} className="mb-3" />
            <h3 className="text-lg font-semibold mb-1">Forum</h3>
            <p className="text-sm text-green-100">Community discussions</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
