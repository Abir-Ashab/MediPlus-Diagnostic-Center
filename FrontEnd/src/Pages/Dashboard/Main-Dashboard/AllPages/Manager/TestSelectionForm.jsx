import React from "react";
import { Input, Button, Card } from "antd";
import { Clock, FileText } from 'lucide-react';
import CategorizedTestSelection from "./CategorizedTestSelection";

const TestSelectionForm = ({
  selectedTests,
  testData,
  testsList,
  handleTestSelect,
  deselectTest,
  clearAllTests,
  selectTestDirectly,
  addMoreTest,
  removeTest,
  handleTestDataChange,
  handleTestPriceChange,
  updateTestPrice
}) => {
  return (
    <>
      <Card className="mb-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Test Selection</h3>
          </div>
          {selectedTests.some(test => test.testId !== "") && (
            <Button
              size="small"
              onClick={clearAllTests}
              className="bg-red-100 text-red-600 border-red-200 hover:bg-red-200"
            >
              Clear All Tests
            </Button>
          )}
        </div>
        <CategorizedTestSelection
          selectedTests={selectedTests}
          onTestSelect={handleTestSelect}
          onDeselectTest={deselectTest}
          onClearAll={clearAllTests}
          onSelectTestDirectly={selectTestDirectly}
          onAddMore={addMoreTest}
          onRemove={removeTest}
        />
      </Card>

      {/* Selected Tests with Editable Prices */}
      {selectedTests.some(test => test.testId !== "") && (
        <Card className="mb-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Selected Tests & Prices</h3>
          </div>
          
          <div className="space-y-3">
            {selectedTests.filter(test => test.testId !== "").map((test) => {
              const selectedTest = testsList.find(t => t.testId === parseInt(test.testId));
              if (!selectedTest) return null;
              
              const currentPrice = test.customPrice !== null && test.customPrice !== undefined 
                ? test.customPrice 
                : selectedTest.price;
              
              return (
                <div key={test.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{selectedTest.title}</h4>
                    <p className="text-sm text-gray-600">Test ID: {selectedTest.testId}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      <label className="text-xs text-gray-500 mb-1">Price (৳)</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={currentPrice}
                          onChange={(e) => handleTestPriceChange(test.id, e.target.value)}
                          className="w-24 text-center"
                          size="small"
                          min="0"
                          step="10"
                        />
                        {test.customPrice !== null && test.customPrice !== undefined && test.customPrice !== selectedTest.price && (
                          <Button
                            size="small"
                            type="primary"
                            onClick={() => updateTestPrice(test.testId, test.customPrice)}
                            className="bg-blue-600 hover:bg-blue-700"
                            title="Update price in database"
                          >
                            Save
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {test.customPrice !== null && test.customPrice !== undefined && selectedTest.price !== currentPrice && (
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Original: ৳{selectedTest.price}</div>
                        <div className="text-xs text-orange-600 font-medium">
                          {currentPrice > selectedTest.price ? '+' : ''}৳{(currentPrice - selectedTest.price).toFixed(2)}
                        </div>
                      </div>
                    )}
                    
                    {/* Deselect Button */}
                    <Button
                      size="small"
                      onClick={() => deselectTest(test.id)}
                      className="bg-red-100 text-red-600 border-red-200 hover:bg-red-200"
                      title="Deselect this test"
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Test Schedule Information */}
      {selectedTests.some(test => test.testId !== "") && (
        <Card className="mb-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Test Schedule</h3>
            <span className="text-sm text-gray-500 ml-2">(Separate from appointment schedule)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Test Date *</label>
              <Input
                type="date"
                name="date"
                value={testData.date}
                onChange={handleTestDataChange}
                required
                className="border-gray-200 focus:ring-green-500"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Time *
              </label>
              <Input
                type="time"
                name="time"
                value={testData.time}
                onChange={handleTestDataChange}
                className="border-gray-200 focus:ring-green-500"
                placeholder="Select preferred test time"
              />
            </div>
          </div>
          
          {testData.date && (
            <div className="mt-4 bg-green-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Test scheduled for:</span>
                <span className="font-medium text-green-700">
                  {testData.date}{testData.time && ` at ${testData.time}`}
                </span>
              </div>
            </div>
          )}
        </Card>
      )}
    </>
  );
};

export default TestSelectionForm;