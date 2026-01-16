import { useState, useEffect, useRef } from "react";
import { MdClose } from "react-icons/md";

const AirportAutocomplete = ({ value, onChange, placeholder }) => {
  const [inputValue, setInputValue] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [airports, setAirports] = useState([]);
  const wrapperRef = useRef(null);

  // Load airports from JSON file
  useEffect(() => {
    fetch("/flight-demo/airports.json") // Place airports.json in public folder
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
    setInputValue(query);

    if (query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    // Search airports
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
      .slice(0, 8); // Limit to 8 results

    setSuggestions(filtered);
    setIsOpen(filtered.length > 0);
  };

  const handleSelect = (airport) => {
    setInputValue(`${airport.code} - ${airport.city}`);
    onChange(airport.code); // Pass only code to parent
    setIsOpen(false);
  };

  const handleClear = () => {
    setInputValue("");
    onChange("");
    setSuggestions([]);
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
          className="h-10 text-sm rounded-xl border border-gray-200 w-full px-3 pr-8"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
              className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
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
