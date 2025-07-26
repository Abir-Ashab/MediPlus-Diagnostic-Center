import React, { useState, useEffect } from 'react';
import { TestsList, TestCategories } from './MixedObjectData';

const CategorizedTestSelection = ({ selectedTests, onTestSelect, onAddMore, onRemove }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState('sections'); 
  const [isCompactView, setIsCompactView] = useState(true);
  const [collapsedSections, setCollapsedSections] = useState(new Set());
 
  useEffect(() => {
    if (isCompactView) {
      setCollapsedSections(new Set(Object.keys(groupedTests)));
    } else {
      setCollapsedSections(new Set());
    }
  }, [isCompactView]);

  const toggleSection = (sectionName) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionName)) {
      newCollapsed.delete(sectionName);
    } else {
      newCollapsed.add(sectionName);
    }
    setCollapsedSections(newCollapsed);
  };

  const toggleAllSections = () => {
    if (collapsedSections.size === Object.keys(groupedTests).length) {
      setCollapsedSections(new Set());
    } else {
      setCollapsedSections(new Set(Object.keys(groupedTests)));
    }
  };

  // Group tests by category
  const groupedTests = TestsList.reduce((acc, test) => {
    if (!acc[test.category]) {
      acc[test.category] = [];
    }
    acc[test.category].push(test);
    return acc;
  }, {});

  // Filter tests based on search term
  const filteredTests = TestsList.filter(test =>
    test.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Auto-add test directly when clicked
  const selectTest = (testId) => {
    // Check if test is already selected
    const isAlreadySelected = selectedTests.some(test => test.testId === testId.toString());
    if (isAlreadySelected) return;

    // Find empty slot or create new one
    const emptySlot = selectedTests.find(slot => slot.testId === '' || !slot.testId);
    if (emptySlot) {
      onTestSelect(emptySlot.id, testId.toString());
    } else {
      // Auto-create new slot first
      onAddMore();
      // Use a longer timeout to ensure the new slot is created before selecting
      setTimeout(() => {
        // Find the newly created empty slot
        const newEmptySlot = selectedTests.find(slot => slot.testId === '' || !slot.testId);
        if (newEmptySlot) {
          onTestSelect(newEmptySlot.id, testId.toString());
        }
      }, 100);
    }
  };

  // Get section header style based on medical form sections
  const getSectionIcon = (category) => {
    const icons = {
      [TestCategories.HISTOPATHOLOGY]: '🔬',
      [TestCategories.XRAY]: '⚡',
      [TestCategories.ULTRASOUND]: '📻',
      [TestCategories.BIOCHEMICAL]: '🧪',
      [TestCategories.HAEMATOLOGY]: '🩸',
      [TestCategories.IMMUNOLOGY]: '🛡️',
      [TestCategories.MICROBIOLOGY]: '🦠',
      [TestCategories.HORMONE]: '⚗️',
      [TestCategories.CANCER_MARKER]: '🎯',
      [TestCategories.HEPATITIS]: '🫀',
      [TestCategories.CARDIAC]: '💓',
      [TestCategories.URINE]: '💧',
      [TestCategories.STOOL]: '📋',
      [TestCategories.CARDIOLOGY]: '❤️',
      [TestCategories.VACCINATION]: '💉',
      [TestCategories.OTHERS]: '📝'
    };
    return icons[category] || '📝';
  };

  const getSectionColor = (category) => {
    const colors = {
      [TestCategories.HISTOPATHOLOGY]: 'from-blue-500 to-blue-600',
      [TestCategories.XRAY]: 'from-green-500 to-green-600',
      [TestCategories.ULTRASOUND]: 'from-purple-500 to-purple-600',
      [TestCategories.BIOCHEMICAL]: 'from-orange-500 to-orange-600',
      [TestCategories.HAEMATOLOGY]: 'from-red-500 to-red-600',
      [TestCategories.IMMUNOLOGY]: 'from-indigo-500 to-indigo-600',
      [TestCategories.MICROBIOLOGY]: 'from-teal-500 to-teal-600',
      [TestCategories.HORMONE]: 'from-pink-500 to-pink-600',
      [TestCategories.CANCER_MARKER]: 'from-yellow-500 to-yellow-600',
      [TestCategories.HEPATITIS]: 'from-cyan-500 to-cyan-600',
      [TestCategories.CARDIAC]: 'from-rose-500 to-rose-600',
      [TestCategories.URINE]: 'from-lime-500 to-lime-600',
      [TestCategories.STOOL]: 'from-amber-500 to-amber-600',
      [TestCategories.CARDIOLOGY]: 'from-emerald-500 to-emerald-600',
      [TestCategories.VACCINATION]: 'from-violet-500 to-violet-600',
      [TestCategories.OTHERS]: 'from-gray-500 to-gray-600'
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">


      {/* Search and View Toggle */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search for specific tests..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setActiveView(e.target.value ? 'search' : 'sections');
              }}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => {setActiveView('sections'); setSearchTerm('');}}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeView === 'sections' 
                  ? 'bg-white text-green-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 By Sections
            </button>
            <button
              onClick={() => setActiveView('search')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeView === 'search' 
                  ? 'bg-white text-green-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🔍 Search View
            </button>
          </div>
        </div>

        {/* Compact View Controls - Only show in sections view */}
        {activeView === 'sections' && (
          <div className="flex flex-wrap items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="compactView"
                  checked={isCompactView}
                  onChange={(e) => setIsCompactView(e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="compactView" className="ml-2 text-sm text-gray-700">
                  Compact View
                </label>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleAllSections}
                className="px-3 py-1 text-sm text-green-700 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors"
              >
                {collapsedSections.size === Object.keys(groupedTests).length ? '📂 Expand All' : '📁 Collapse All'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selected Tests Panel */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">🎯 Selected Tests</h3>
        </div>

        <div className="space-y-2">
          {selectedTests.map((test, index) => {
            const selectedTestInfo = TestsList.find(t => t.id === parseInt(test.testId));
            return (
              <div key={test.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                    {index + 1}
                  </span>
                </div>
                <select
                  value={test.testId}
                  onChange={(e) => onTestSelect(test.id, e.target.value)}
                  className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
                >
                  <option value="">Select a test...</option>
                  {Object.entries(groupedTests).map(([category, tests]) => (
                    <optgroup key={category} label={`${getSectionIcon(category)} ${category}`}>
                      {tests.map((testItem) => (
                        <option key={testItem.id} value={testItem.id}>
                          {testItem.title} - ৳{testItem.price}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {selectedTestInfo && (
                  <div className="text-sm font-semibold text-green-600">
                    ৳{selectedTestInfo.price}
                  </div>
                )}
                {selectedTests.length > 1 && (
                  <button
                    onClick={() => onRemove(test.id)}
                    className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition duration-200"
                    title="Remove test"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4">
        {activeView === 'sections' ? (
          /* Section-wise View (Medical Form Style) */
          <div className="space-y-6">
            {Object.entries(groupedTests).map(([category, tests]) => {
              const isCollapsed = collapsedSections.has(category);
              return (
                <div key={category} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  {/* Section Header (Medical Form Style) */}
                  <div 
                    className={`bg-gradient-to-r ${getSectionColor(category)} text-white p-4 ${isCompactView ? 'cursor-pointer hover:shadow-md' : ''} transition-all duration-200`}
                    onClick={() => isCompactView && toggleSection(category)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getSectionIcon(category)}</span>
                        <div>
                          <h4 className="text-lg font-bold">{category}</h4>
                          <p className="text-sm opacity-90">
                            {tests.length} tests available
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-sm opacity-90">
                            {isCollapsed ? 'Expand' : 'Click to select'}
                          </div>
                        </div>
                        {isCompactView && (
                          <div className="ml-3">
                            <svg 
                              className={`w-5 h-5 transition-transform duration-200 ${isCollapsed ? 'rotate-0' : 'rotate-180'}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tests Grid - Collapsible */}
                  {(!isCompactView || !isCollapsed) && (
                    <div className="p-4 bg-white">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {tests.map((test) => {
                          const isSelected = selectedTests.some(selected => selected.testId === test.id.toString());
                          return (
                            <div
                              key={test.id}
                              onClick={() => !isSelected && selectTest(test.id)}
                              className={`p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                                isSelected
                                  ? 'border-green-500 bg-green-50 opacity-75 cursor-not-allowed'
                                  : 'border-gray-200 hover:border-green-300 hover:bg-green-50 hover:shadow-md'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-medium text-sm text-gray-900 leading-tight mb-1">
                                    {test.title}
                                  </h5>
                                  <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold text-green-600">৳{test.price}</span>
                                    {isSelected && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        ✓ Added
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Search Results */
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🔍 Search Results ({filteredTests.length})
            </h3>
            {filteredTests.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTests.map((test) => {
                  const isSelected = selectedTests.some(selected => selected.testId === test.id.toString());
                  return (
                    <div
                      key={test.id}
                      onClick={() => !isSelected && selectTest(test.id)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'border-green-500 bg-green-50 opacity-75 cursor-not-allowed'
                          : 'border-gray-200 hover:border-green-300 hover:bg-green-50 hover:shadow-md'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{getSectionIcon(test.category)}</span>
                          <span className="text-xs text-gray-500 font-medium">{test.category}</span>
                        </div>
                        <h5 className="font-medium text-sm text-gray-900 leading-tight">
                          {test.title}
                        </h5>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-green-600">৳{test.price}</span>
                          {isSelected && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Added
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tests found</h3>
                <p className="text-gray-500">Try different search terms</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategorizedTestSelection;
