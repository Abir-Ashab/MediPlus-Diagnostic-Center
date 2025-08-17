import React, { useState, useRef, useEffect } from 'react';
import { Select, Input } from 'antd';
import { MapPin } from 'lucide-react';

const { Option } = Select;

// Static addresses for Narayanganj District
const narayanganjAddresses = [
  // Narayanganj Sadar Upazila
  'Narayanganj Sadar, Narayanganj',
  'Chashara, Narayanganj Sadar',
  'Fatullah, Narayanganj Sadar',
  'Kadam Rasul, Narayanganj Sadar',
  'Panchdona, Narayanganj Sadar',
  'Siddhirganj, Narayanganj Sadar',
  'Kalagachhia, Narayanganj Sadar',
  'Godnail, Narayanganj Sadar',
  
  // Araihazar Upazila
  'Araihazar Sadar, Araihazar',
  'Sreenagar, Araihazar',
  'Hajipur, Araihazar',
  'Shimrail, Araihazar',
  'Chandra, Araihazar',
  'Nayamati, Araihazar',
  
  // Bandar Upazila
  'Bandar Sadar, Bandar',
  'East Char, Bandar',
  'West Char, Bandar',
  'Char Bhadrasan, Bandar',
  'Char Atra, Bandar',
  
  // Rupganj Upazila
  'Rupganj Sadar, Rupganj',
  'Bhulta, Rupganj',
  'Murapara, Rupganj',
  'Kayetpara, Rupganj',
  'Golakandail, Rupganj',
  'Tarabo, Rupganj',
  
  // Sonargaon Upazila
  'Sonargaon Sadar, Sonargaon',
  'Pirojpur, Sonargaon',
  'Kholamora, Sonargaon',
  'Hasara, Sonargaon',
  'Jampur, Sonargaon',
  'Baidya Bazar, Sonargaon',
  'Barodi, Sonargaon',
  'Noagaon, Sonargaon',
  
  // Popular Areas and Neighborhoods
  'Shitalakshya Residential Area, Narayanganj',
  'BSCIC Industrial Area, Narayanganj',
  'Chandra Highway, Narayanganj',
  'Khanpur, Narayanganj',
  'Nabiganj, Narayanganj',
  'Deobhog, Narayanganj',
  'Madanganj, Narayanganj',
  'Pagla, Narayanganj',
  'Signboard, Narayanganj',
  'Telipara, Narayanganj',
  'Bondor Bazaar, Narayanganj',
  'Shimrail Bazar, Narayanganj',
  'Rupganj Bazar, Narayanganj',
  'Sonargaon Bazar, Narayanganj',
  'Araihazar Bazar, Narayanganj'
];

const NarayanganjAddressSelect = ({ value, onChange, placeholder = "Type to search or select address in Narayanganj..." }) => {
  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const dropdownRef = useRef(null);
  
  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Filter addresses based on search text
  const filteredAddresses = narayanganjAddresses.filter(address =>
    address.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setSearchText(inputValue);
    onChange(inputValue);
    setIsTyping(true);
    setShowDropdown(inputValue.length > 0);
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  const handleAddressSelect = (address) => {
    onChange(address);
    setSearchText('');
    setIsTyping(false);
    setShowDropdown(false);
  };

  const handleInputClear = () => {
    onChange('');
    setSearchText('');
    setIsTyping(false);
    setShowDropdown(false);
  };

  // Show all addresses when focused but not typing, filtered when typing
  const addressesToShow = searchText ? filteredAddresses : narayanganjAddresses;

  return (
    <div className="relative" ref={dropdownRef}>
      <Input
        prefix={<MapPin className="w-4 h-4 text-gray-400" />}
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        allowClear
        onClear={handleInputClear}
        className="border-gray-200 focus:ring-blue-500"
      />
      
      {/* Combined Search Results and All Options Dropdown */}
      {showDropdown && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {addressesToShow.length > 0 ? (
            <>
              {addressesToShow.map((address, index) => (
                <div
                  key={index}
                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                  onClick={() => handleAddressSelect(address)}
                >
                  <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <span className="text-sm">{address}</span>
                </div>
              ))}
            </>
          ) : searchText ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              No matching addresses found. You can still use "{searchText}" as your address.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default NarayanganjAddressSelect;