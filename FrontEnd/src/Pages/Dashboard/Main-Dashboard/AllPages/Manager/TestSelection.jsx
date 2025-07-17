// src/components/TestSelection.js
import React from "react";

const TestSelection = ({ 
  selectedTests, 
  handleTestSelect, 
  addMoreTest, 
  removeTest, 
  TestsList 
}) => {
  return (
    <div>
      <label>Select Tests</label>
      <div style={{ marginBottom: "15px" }}>
        {selectedTests.map((test, index) => (
          <div key={test.id} style={{ 
            display: "flex", 
            alignItems: "center", 
            marginBottom: "10px" 
          }}>
            <div className="inputdiv" style={{ flex: 1, marginRight: "10px" }}>
              <select
                value={test.testId}
                onChange={(e) => handleTestSelect(test.id, e.target.value)}
                required
                style={{ width: "100%" }}
              >
                <option value="">Select Test</option>
                {TestsList.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} - {t.price} Taka
                  </option>
                ))}
              </select>
            </div>
            <button 
              type="button" 
              onClick={() => removeTest(test.id)}
              style={{
                padding: "5px 10px",
                backgroundColor: "#ff6b6b",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Remove
            </button>
          </div>
        ))}
        <button 
          type="button" 
          onClick={addMoreTest}
          style={{
            padding: "8px 15px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginTop: "5px"
          }}
        >
          + Add More Test
        </button>
      </div>
    </div>
  );
};

export default TestSelection;
