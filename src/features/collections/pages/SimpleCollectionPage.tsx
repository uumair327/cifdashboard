/**
 * SimpleCollectionPage - Simplified version that works like the old Displayer
 * This is a temporary bridge to get data showing while maintaining Clean Architecture
 */
import { useState, useEffect } from 'react';
import { ICollectionRepository } from '../domain/repositories/ICollectionRepository';
import { BaseCollection } from '../domain/entities/Collection';

interface SimpleCollectionPageProps<T extends BaseCollection> {
  title: string;
  collectionName: string;
  repository: ICollectionRepository<T>;
  fields: string[];
}

export function SimpleCollectionPage<T extends BaseCollection>({
  title,
  collectionName,
  repository,
  fields,
}: SimpleCollectionPageProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        console.log(`[SimpleCollectionPage] Fetching ${collectionName}...`);
        setLoading(true);
        setError(null);
        
        const result = await repository.getAll();
        console.log(`[SimpleCollectionPage] Got ${result.length} items:`, result);
        
        if (mounted) {
          setData(result);
        }
      } catch (err) {
        console.error(`[SimpleCollectionPage] Error:`, err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load data');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, [repository, collectionName]);

  // Debug logging
  console.log(`[SimpleCollectionPage] Render - loading: ${loading}, error: ${error}, data length: ${data.length}`);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="text-sm text-gray-600">Loading {title.toLowerCase()}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">
          <h3 className="text-lg font-semibold">Error Loading Data</h3>
          <p className="text-sm">{error}</p>
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm font-medium">Debug Info</summary>
            <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
              Collection: {collectionName}
              {'\n'}Error: {error}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p className="mb-2">No {title.toLowerCase()} found</p>
        <p className="text-xs">Collection: {collectionName}</p>
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium">Debug Info</summary>
          <pre className="mt-2 p-4 bg-gray-100 rounded text-xs text-left">
            Collection Name: {collectionName}
            {'\n'}Data Length: {data.length}
            {'\n'}Loading: {loading}
            {'\n'}Error: {error || 'none'}
          </pre>
        </details>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="text-sm text-gray-600">
          ✅ {data.length} items loaded
        </div>
      </div>
      
      {/* Debug Panel */}
      <details className="mb-4 p-4 bg-blue-50 rounded">
        <summary className="cursor-pointer text-sm font-medium text-blue-900">
          🔍 Debug Info (Click to expand)
        </summary>
        <pre className="mt-2 p-4 bg-white rounded text-xs overflow-auto max-h-60">
          {JSON.stringify({
            collection: collectionName,
            itemCount: data.length,
            fields: fields,
            sampleItem: data[0] || null,
          }, null, 2)}
        </pre>
      </details>
      
      {/* Simple Table */}
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                ID
              </th>
              {fields.map(field => (
                <th
                  key={field}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  {field}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((item, index) => (
              <tr key={item.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-mono">
                  {item.id || index}
                </td>
                {fields.map(field => (
                  <td key={field} className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {String((item as any)[field] || '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
