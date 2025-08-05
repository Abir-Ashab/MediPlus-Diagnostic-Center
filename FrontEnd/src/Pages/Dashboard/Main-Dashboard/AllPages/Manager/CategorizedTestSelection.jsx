import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CategorizedTestSelection = ({ selectedTests, onTestSelect, onSelectTestDirectly, onAddMore, onRemove }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState('sections'); 
  const [selectedCategory, setSelectedCategory] = useState(''); // Track which category is selected
  const [testsList, setTestsList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch tests and categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch tests first as it's more critical
        const testsResponse = await axios.get('https://medi-plus-diagnostic-center-bdbv.vercel.app/tests?isActive=true');
        setTestsList(testsResponse.data);
        
        // Try to fetch categories, but use fallback if it fails
        try {
          const categoriesResponse = await axios.get('https://medi-plus-diagnostic-center-bdbv.vercel.app/tests/categories');
          setCategories(categoriesResponse.data);
        } catch (categoryError) {
          console.warn('Could not fetch categories from API, using fallback categories:', categoryError);
          // Fallback categories based on common test types
          setCategories([
            { categoryId: 'Biochemical Exam', categoryName: 'Biochemical Exam' },
            { categoryId: 'Cancer Marker', categoryName: 'Cancer Marker' },
            { categoryId: 'Cardiac Imaging', categoryName: 'Cardiac Imaging' },
            { categoryId: 'Cardiology', categoryName: 'Cardiology' },
            { categoryId: 'Haematology', categoryName: 'Haematology' },
            { categoryId: 'Hepatitis Profile', categoryName: 'Hepatitis Profile' },
            { categoryId: 'Histopathology & Cytopathology', categoryName: 'Histopathology & Cytopathology' },
            { categoryId: 'Hormone Test', categoryName: 'Hormone Test' },
            { categoryId: 'Immunology/Serology', categoryName: 'Immunology/Serology' },
            { categoryId: 'Microbiology', categoryName: 'Microbiology' },
            { categoryId: 'Others', categoryName: 'Others' },
            { categoryId: 'Stool', categoryName: 'Stool' },
            { categoryId: 'Ultrasound Imaging', categoryName: 'Ultrasound Imaging' },
            { categoryId: 'Urine', categoryName: 'Urine' },
            { categoryId: 'Vaccination', categoryName: 'Vaccination' },
            { categoryId: 'X-Ray (Digital)', categoryName: 'X-Ray (Digital)' }
          ]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tests:', error);
        setLoading(false);
        // You might want to show a toast notification here
      }
    };

    fetchData();
  }, []);

  // Group tests by category
  const groupedTests = testsList.reduce((acc, test) => {
    try {
      const category = test?.category || 'Others'; // Default to 'Others' if no category
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(test);
    } catch (error) {
      console.error('Error processing test:', test, error);
    }
    return acc;
  }, {});

  // Filter tests based on search term
  const filteredTests = testsList.filter(test => {
    try {
      return test?.title && test.title.toLowerCase().includes(searchTerm.toLowerCase());
    } catch (error) {
      console.error('Error filtering test:', test, error);
      return false;
    }
  });

  const selectTest = (testId) => {
    try {
      console.log('Selecting test:', testId);
      // Use the direct selection function passed from parent
      if (onSelectTestDirectly && typeof onSelectTestDirectly === 'function') {
        onSelectTestDirectly(testId);
      } else {
        console.error('onSelectTestDirectly is not a function:', onSelectTestDirectly);
      }
    } catch (error) {
      console.error('Error selecting test:', error);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tests...</p>
        </div>
      ) : (
        <>    
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
              type="button"
              onClick={() => {setActiveView('sections'); setSearchTerm('');}}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeView === 'sections' 
                  ? 'bg-white text-green-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              By Categories
            </button>
            <button
              type="button"
              onClick={() => setActiveView('search')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeView === 'search' 
                  ? 'bg-white text-green-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Search All
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4">
        {activeView === 'sections' ? (
          /* Category Navbar and Selected Category Tests */
          <div className="space-y-6">
            {/* Category Navigation Bar */}
            <div className="border-b border-gray-200 bg-white">
              <div className="flex flex-wrap gap-2 p-2">
                {Object.entries(groupedTests).map(([category, tests]) => {
                  try {
                    const categoryName = categories.find(cat => cat.categoryId === category)?.categoryName || category;
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                          selectedCategory === category
                            ? 'bg-green-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                        }`}
                      >
                        {categoryName}
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                          selectedCategory === category 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-300 text-gray-600'
                        }`}>
                          {Array.isArray(tests) ? tests.length : 0}
                        </span>
                      </button>
                    );
                  } catch (error) {
                    console.error('Error rendering category button:', category, error);
                    return null;
                  }
                })}
              </div>
            </div>

            {/* Selected Category Tests */}
            {selectedCategory && groupedTests[selectedCategory] ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {categories.find(cat => cat.categoryId === selectedCategory)?.categoryName || selectedCategory} Tests
                  </h3>
                  <span className="text-sm text-gray-500">
                    {groupedTests[selectedCategory].length} tests available
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {groupedTests[selectedCategory].map((test) => {
                    try {
                      const isSelected = selectedTests.some(selected => selected.testId === test?.testId?.toString());
                      return (
                        <div
                          key={test?.testId || Math.random()}
                          onClick={() => !isSelected && test?.testId && selectTest(test.testId)}
                          className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? 'border-green-500 bg-green-50 cursor-not-allowed'
                              : 'border-gray-200 hover:border-green-400 hover:bg-green-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium text-sm text-gray-900 mb-1">
                                {test?.title || 'Unknown Test'}
                              </h5>
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-green-600">৳{test?.price || '0'}</span>
                                {isSelected ? (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                    Added
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-500">
                                    + Add
                                  </span>
                                )}
                              </div>
                            </div>
                            {isSelected && (
                              <div className="ml-2">
                                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    } catch (error) {
                      console.error('Error rendering test item:', test, error);
                      return null;
                    }
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Test Category</h3>
                <p className="text-gray-500">Choose from the categories above to browse available tests</p>
              </div>
            )}
          </div>
        ) : (
          /* Search Results */
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Search Results ({filteredTests.length} found)
            </h3>
            {filteredTests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredTests.map((test) => {
                  try {
                    const isSelected = selectedTests.some(selected => selected.testId === test?.testId?.toString());
                    const categoryName = categories.find(cat => cat.categoryId === test?.category)?.categoryName || test?.category || 'Others';
                    return (
                      <div
                        key={test?.testId || Math.random()}
                        onClick={() => !isSelected && test?.testId && selectTest(test.testId)}
                        className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'border-green-500 bg-green-50 cursor-not-allowed'
                            : 'border-gray-200 hover:border-green-400 hover:bg-green-50'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              isSelected 
                                ? 'bg-green-200 text-green-800' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {categoryName}
                            </span>
                          </div>
                          <h5 className="font-medium text-sm text-gray-900 mb-1">
                            {test.title}
                          </h5>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-green-600">৳{test.price}</span>
                            {isSelected ? (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                Added
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500">
                                + Add
                              </span>
                            )}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="ml-2">
                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                  } catch (error) {
                    console.error('Error rendering search result:', test, error);
                    return null;
                  }
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tests found</h3>
                <p className="text-gray-500">Try different search terms</p>
              </div>
            )}
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
};

export default CategorizedTestSelection;
