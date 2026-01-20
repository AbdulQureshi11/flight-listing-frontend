import { useState, useEffect, useRef, useMemo } from "react";
import { MdClose } from "react-icons/md";

const AirportAutocomplete = ({ value, onChange, placeholder }) => {
  const [inputValue, setInputValue] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [airports, setAirports] = useState([]);
  const wrapperRef = useRef(null);

  const base = import.meta.env.BASE_URL;
  // Load airports from JSON file
  useEffect(() => {
    fetch(`${base}/airports.json`)
      .then((res) => res.json())
      .then((data) => setAirports(data))
      .catch((err) => console.error("Failed to load airports:", err));
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const query = e.target.value;
    const cleanQuery = query.toUpperCase().trim();
    setInputValue(query);

    if (query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    // 1. Filter and 2. Score/Sort
    const filtered = airports
      .filter((airport) => {
        const searchStr = query.toLowerCase();
        return (
          airport.code.toLowerCase().includes(searchStr) ||
          airport.name.toLowerCase().includes(searchStr) ||
          airport.city.toLowerCase().includes(searchStr) ||
          airport.country.toLowerCase().includes(searchStr)
        );
      })
      .sort((a, b) => {
        const getScore = (item) => {
          const code = item.code.toUpperCase();
          const city = (item.city || "").toUpperCase();
          const name = item.name.toUpperCase();

          if (code === cleanQuery) return 100; // Highest: Exact IATA match
          if (code.startsWith(cleanQuery)) return 80; // Second: Code starts with query
          if (city.startsWith(cleanQuery)) return 60; // Third: City name starts with query
          if (name.startsWith(cleanQuery)) return 40; // Fourth: Airport name starts with query
          return 10; // Lowest: Contains match
        };

        return getScore(b) - getScore(a);
      })
      .slice(0, 8); // Limit to 8 results for better UX

    setSuggestions(filtered);
    setIsOpen(filtered.length > 0);
  };

  const handleSelect = (airport) => {
    // UI displays the friendly name, but sends code to parent
    setInputValue(`${airport.code} - ${airport.city}`);
    onChange(airport.code);
    setIsOpen(false);
  };

  const handleClear = () => {
    setInputValue("");
    onChange("");
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => inputValue.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className="h-10 text-sm rounded-xl border border-gray-200 w-full px-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MdClose className="text-lg" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
          {suggestions.map((airport) => (
            <div
              key={airport.code}
              onClick={() => handleSelect(airport)}
              className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-blue-600">
                    {airport.code}
                  </span>
                  <span className="text-sm text-gray-600 ml-2">
                    {airport.city}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{airport.country}</span>
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{airport.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AirportAutocomplete;
