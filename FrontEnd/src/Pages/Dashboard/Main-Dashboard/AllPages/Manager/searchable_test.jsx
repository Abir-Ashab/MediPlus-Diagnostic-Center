import { useState, useEffect } from "react";

const SearchableTestSelection = ({ selectedTests, handleTestSelect, addMoreTest, removeTest, TestsList }) => {
  const [searchTerms, setSearchTerms] = useState({});
  const [showDropdowns, setShowDropdowns] = useState({});

  const handleSearchChange = (testId, value) => {
    setSearchTerms(prev => ({ ...prev, [testId]: value }));
    setShowDropdowns(prev => ({ ...prev, [testId]: true }));
  };

  const handleTestSelection = (testId, selectedTestId, selectedTest) => {
    handleTestSelect(testId, selectedTestId);
    setSearchTerms(prev => ({ ...prev, [testId]: selectedTest.title }));
    setShowDropdowns(prev => ({ ...prev, [testId]: false }));
  };

  const getFilteredTests = (testId) => {
    const searchTerm = searchTerms[testId] || '';
    const selectedTestIds = selectedTests.map(test => test.testId).filter(id => id !== '');
    
    return TestsList.filter(test => 
      test.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedTestIds.includes(test.id.toString())
    );
  };

  const handleInputFocus = (testId) => {
    setShowDropdowns(prev => ({ ...prev, [testId]: true }));
  };

  const handleInputBlur = (testId) => {
    // Delay hiding dropdown to allow for selection
    setTimeout(() => {
      setShowDropdowns(prev => ({ ...prev, [testId]: false }));
    }, 200);
  };

  useEffect(() => {
    selectedTests.forEach(test => {
      if (test.testId && !searchTerms[test.id]) {
        const selectedTest = TestsList.find(t => t.id === parseInt(test.testId));
        if (selectedTest) {
          setSearchTerms(prev => ({ ...prev, [test.id]: selectedTest.title }));
        }
      }
    });
  }, [selectedTests, TestsList]);

  return (
    <div className="test-selection-container">
      {selectedTests.map((test, index) => (
        <div key={test.id} className="test-selection-item">
          <div className="searchable-dropdown">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerms[test.id] || ''}
              onChange={(e) => handleSearchChange(test.id, e.target.value)}
              onFocus={() => handleInputFocus(test.id)}
              onBlur={() => handleInputBlur(test.id)}
              className="form-input search-input"
            />
            
            {showDropdowns[test.id] && (
              <div className="dropdown-options">
                {getFilteredTests(test.id).length > 0 ? (
                  getFilteredTests(test.id).map((testOption) => (
                    <div
                      key={testOption.id}
                      className="dropdown-option"
                      onMouseDown={() => handleTestSelection(test.id, testOption.id.toString(), testOption)}
                    >
                      <div className="test-option-content">
                        <span className="test-name">{testOption.title}</span>
                        <span className="test-price">{testOption.price} Taka</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="dropdown-option no-results">
                    No tests found
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="test-actions">
            {selectedTests.length > 1 && (
              <button
                type="button"
                onClick={() => removeTest(test.id)}
                className="remove-test-btn"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addMoreTest}
        className="add-test-btn"
      >
        + Add Another Test
      </button>
    </div>
  );
};

export default SearchableTestSelection;