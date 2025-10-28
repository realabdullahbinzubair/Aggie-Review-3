import { Search } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string, type: 'professor' | 'course') => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'professor' | 'course'>('professor');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), searchType);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex space-x-2 mb-4">
        <button
          type="button"
          onClick={() => setSearchType('professor')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
            searchType === 'professor'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Search Professors
        </button>
        <button
          type="button"
          onClick={() => setSearchType('course')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
            searchType === 'course'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Search Courses
        </button>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            searchType === 'professor'
              ? 'Search by professor name...'
              : 'Search by course code (e.g., COMP 285)...'
          }
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        />
      </form>
    </div>
  );
}
