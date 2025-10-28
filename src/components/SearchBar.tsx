import { Search, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface SearchBarProps {
  onSearch: (query: string, type: 'professor' | 'course') => void;
}

interface Suggestion {
  id: string;
  name: string;
  type: 'professor' | 'course';
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'professor' | 'course'>('professor');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      if (searchType === 'professor') {
        const { data, error } = await supabase
          .from('professors')
          .select('id, name')
          .ilike('name', `%${query}%`)
          .order('name')
          .limit(8);

        if (!error && data) {
          setSuggestions(data.map(p => ({ id: p.id, name: p.name, type: 'professor' as const })));
          setShowSuggestions(true);
        }
      } else {
        const { data, error } = await supabase
          .from('courses')
          .select('id, code, name')
          .or(`code.ilike.%${query}%,name.ilike.%${query}%`)
          .order('code')
          .limit(8);

        if (!error && data) {
          setSuggestions(data.map(c => ({ id: c.id, name: `${c.code} - ${c.name}`, type: 'course' as const })));
          setShowSuggestions(true);
        }
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query, searchType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), searchType);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    const searchQuery = searchType === 'course'
      ? suggestion.name.split(' - ')[0]
      : suggestion.name;
    setQuery(searchQuery);
    onSearch(searchQuery, searchType);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex space-x-2 mb-4">
        <button
          type="button"
          onClick={() => {
            setSearchType('professor');
            clearSearch();
          }}
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
          onClick={() => {
            setSearchType('course');
            clearSearch();
          }}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
            searchType === 'course'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Search Courses
        </button>
      </div>

      <div ref={wrapperRef} className="relative">
        <form onSubmit={handleSubmit}>
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            placeholder={
              searchType === 'professor'
                ? 'Search by professor name...'
                : 'Search by course code (e.g., COMP 285)...'
            }
            className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
            >
              <X size={20} />
            </button>
          )}
        </form>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full text-left px-4 py-3 hover:bg-yellow-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                  index === selectedIndex ? 'bg-yellow-50' : ''
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Search size={16} className="text-gray-400" />
                  <span className="text-gray-900">{suggestion.name}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
