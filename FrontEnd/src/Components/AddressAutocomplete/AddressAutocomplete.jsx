import React, { useState, useEffect, useCallback } from 'react';
import { Input, AutoComplete } from 'antd';
import { MapPin } from 'lucide-react';
import { debounce } from 'lodash';

const AddressAutocomplete = ({ 
  value, 
  onChange, 
  placeholder = "", 
  className = "",
  required = false 
}) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Debounced function to search for places
  const searchPlaces = useCallback(
    debounce(async (searchText) => {
      if (!searchText || searchText.length < 3) {
        setOptions([]);
        return;
      }

      setLoading(true);
      try {
        // Using Nominatim API for Bangladesh addresses - free and reliable
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(searchText)}&` +
          `countrycodes=bd&` +
          `format=json&` +
          `limit=8&` +
          `addressdetails=1&` +
          `accept-language=en`
        );

        if (response.ok) {
          const data = await response.json();
          
          const formattedOptions = data.map((place, index) => {
            // Format the display name for better readability
            let displayName = place.display_name;
            
            // Extract key components
            const address = place.address || {};
            const components = [];
            
            // Add road/area name if available
            if (address.road) components.push(address.road);
            if (address.neighbourhood) components.push(address.neighbourhood);
            if (address.suburb) components.push(address.suburb);
            
            // Add city/district
            if (address.city) components.push(address.city);
            else if (address.county) components.push(address.county);
            else if (address.state_district) components.push(address.state_district);
            
            // Add division/state
            if (address.state) components.push(address.state);
            
            // Create a cleaner display name
            const cleanDisplayName = components.length > 0 
              ? components.join(', ') + ', Bangladesh'
              : displayName;

            return {
              value: cleanDisplayName,
              label: (
                <div className="flex items-center gap-2 py-1">
                  <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {components.slice(0, 2).join(', ') || place.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {components.slice(2).join(', ') || 'Bangladesh'}
                    </div>
                  </div>
                </div>
              ),
              key: `${place.place_id}-${index}`,
              originalData: place
            };
          });

          setOptions(formattedOptions);
        } else {
          console.warn('Address search API error:', response.status);
          setOptions([]);
        }
      } catch (error) {
        console.error('Error searching addresses:', error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (value && value.length >= 3) {
      searchPlaces(value);
    } else {
      setOptions([]);
    }
  }, [value, searchPlaces]);

  const handleSearch = (searchText) => {
    if (onChange) {
      onChange(searchText);
    }
  };

  const handleSelect = (selectedValue, option) => {
    if (onChange) {
      onChange(selectedValue);
    }
    setOptions([]); // Clear options after selection
  };

  return (
    <AutoComplete
      value={value}
      options={options}
      onSearch={handleSearch}
      onSelect={handleSelect}
      className={`w-full ${className}`}
      filterOption={false}
      notFoundContent={loading ? (
        <div className="flex items-center justify-center py-3">
          <div className="flex items-center gap-2 text-gray-500">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Searching addresses...</span>
          </div>
        </div>
      ) : options.length === 0 && value && value.length >= 3 ? (
        <div className="flex items-center gap-2 py-3 px-3 text-gray-500">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">No addresses found. Try a different search term.</span>
        </div>
      ) : null}
      dropdownStyle={{
        maxHeight: '300px',
        overflow: 'auto',
        backgroundColor: 'white',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      }}
    >
      <Input
        prefix={<MapPin className="w-4 h-4 text-gray-400" />}
        placeholder={placeholder}
        required={required}
        className="border-gray-200 focus:ring-blue-500"
        suffix={loading ? (
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        ) : null}
      />
    </AutoComplete>
  );
};

export default AddressAutocomplete;
