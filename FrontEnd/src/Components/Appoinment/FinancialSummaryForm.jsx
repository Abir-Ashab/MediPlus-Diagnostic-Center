import React from "react";
import { Input, Button, Card } from "antd";
import { DollarSign, FileText, Check, X } from 'lucide-react';

const FinancialSummaryForm = ({
  commonData,
  testData,
  selectedTests,
  testsList,
  baseTotal,
  vatRate,
  vatAmount,
  discountAmount,
  finalTotal,
  paidAmount,
  dueAmount,
  useManualTotal,
  manualTotal,
  loading,
  setUseManualTotal,
  setManualTotal,
  setPaidAmount,
  setVatRate,
  setDiscountAmount,
  HandleTestOrderSubmit,
  deselectTest
}) => {
  return (
    <div className="space-y-8">
      {/* Financial Summary */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-yellow-50 via-white to-green-50/30 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Financial Summary</h3>
              <p className="text-sm text-gray-500 mt-1">Transaction breakdown and payment details</p>
            </div>
          </div>

          {/* Pricing Calculation Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Left Column - Base Amount and Calculations */}
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-5 rounded-xl border border-slate-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Pricing Breakdown</h4>
                
                <div className="space-y-3">
                  {/* Base Amount */}
                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="text-sm font-medium text-gray-600">Base Amount:</span>
                    <span className="text-base font-semibold text-gray-800">৳{baseTotal.toFixed(2)}</span>
                  </div>
                  
                  {/* VAT Settings */}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-gray-600">VAT Rate:</span>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Input
                          type="number"
                          value={vatRate}
                          onChange={(e) => setVatRate(parseFloat(e.target.value) || 0)}
                          min="0"
                          max="100"
                          step="0.1"
                          className="w-20 h-8 text-xs rounded-lg pr-6"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="text-sm font-medium text-gray-600">VAT Amount:</span>
                    <span className="text-base font-semibold text-green-600">৳{vatAmount.toFixed(2)}</span>
                  </div>
                  
                  {/* Discount/Less Settings */}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-gray-600">Discount (Less):</span>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">৳</span>
                      <Input
                        type="number"
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                        min="0"
                        step="10"
                        className="w-24 h-8 pl-6 text-xs rounded-lg"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="text-sm font-medium text-red-600">Less Amount:</span>
                    <span className="text-base font-semibold text-red-600">-৳{discountAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Manual Total Override */}
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-100 p-5 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-800">Total Amount</h4>
                  <Button
                    size="small"
                    onClick={() => setUseManualTotal(!useManualTotal)}
                    className="bg-white/50 hover:bg-white/70 border-0 text-blue-700 rounded-lg h-8 px-3"
                  >
                    <span className="text-xs">{useManualTotal ? 'Auto' : 'Manual'}</span>
                  </Button>
                </div>
                
                {useManualTotal ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 font-medium">৳</span>
                      <Input
                        type="number"
                        value={manualTotal}
                        onChange={(e) => setManualTotal(parseFloat(e.target.value) || 0)}
                        className="h-12 pl-10 rounded-xl border-2 border-indigo-300 focus:border-indigo-500 text-lg font-bold"
                        min="0"
                      />
                    </div>
                    <div className="text-xs text-indigo-600 bg-indigo-50 p-2 rounded-lg">
                      Manual override active. Auto-calculated: ৳{(baseTotal + vatAmount - discountAmount).toFixed(2)}
                    </div>
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-indigo-700">
                    ৳{finalTotal.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Main Financial Card */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            {/* Final Total */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-6 translate-x-6"></div>
              <div className="relative">
                <div className="text-2xl font-bold mb-1">
                  ৳{finalTotal.toFixed(2)}
                  {useManualTotal && <span className="text-xs text-blue-200 ml-2">(Manual)</span>}
                </div>
                <div className="text-blue-100 text-sm">Final Total</div>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Paid Amount */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl p-6 border border-indigo-200/50">
              <div className="text-2xl font-bold text-indigo-600 mb-3">৳{paidAmount}</div>
              <div className="text-sm text-indigo-700 mb-4">Paid Amount</div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 font-medium">৳</span>
                <Input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                  className="h-12 pl-10 rounded-xl border-2 border-indigo-200 focus:border-indigo-400"
                  min="0"
                  max={finalTotal}
                />
              </div>
            </div>

            {/* Due Amount */}
            <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl p-6 border border-red-200/50">
              <div className="text-2xl font-bold text-red-600 mb-3">৳{dueAmount.toFixed(2)}</div>
              <div className="text-sm text-red-700 mb-4">Due Amount</div>
              <div className={`h-12 rounded-xl flex items-center px-4 font-medium ${
                dueAmount <= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {dueAmount <= 0 ? (
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Fully Paid</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <X className="w-4 h-4" />
                    <span>Payment Pending</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Test Order Summary */}
      {selectedTests.some(test => test.testId !== "") && (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 via-white to-emerald-50/30 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Test Order Summary</h3>
                <p className="text-sm text-gray-500 mt-1">Laboratory tests and scheduling</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              {[
                { label: 'Patient', value: commonData.patientName, color: 'text-gray-900' },
                { label: 'Selected Tests', value: `${selectedTests.filter(test => test.testId !== "").length} tests`, color: 'text-green-600' },
                { 
                  label: 'Test Date & Time', 
                  value: testData.date ? `${testData.date}${testData.time ? ` at ${testData.time}` : ''}` : 'Not scheduled', 
                  color: 'text-gray-700' 
                },
                { 
                  label: 'Tests Total', 
                  value: `৳${baseTotal.toFixed(2)}`, 
                  color: 'text-green-600' 
                },
                ...(commonData.doctorName ? [{ label: 'Referring Doctor', value: commonData.doctorName, color: 'text-blue-600' }] : []),
                ...(commonData.brokerName ? [{ label: 'Broker', value: commonData.brokerName, color: 'text-orange-600' }] : [])
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm font-medium text-gray-600">{item.label}:</span>
                  <span className={`text-sm font-semibold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Selected Tests List */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Tests:</h4>
              <div className="max-h-40 overflow-y-auto space-y-2 bg-gray-50 rounded-xl p-4">
                {selectedTests.filter(test => test.testId !== "").map((test, index) => {
                  const selectedTest = testsList.find(t => t.testId === parseInt(test.testId));
                  return selectedTest ? (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-800">{selectedTest.title}</span>
                        <div className="text-xs text-gray-500 mt-1">
                          ৳{test.customPrice !== null && test.customPrice !== undefined ? test.customPrice : selectedTest.price}
                        </div>
                      </div>
                      <Button
                        size="small"
                        onClick={() => deselectTest(test.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 border-0 shadow-none h-8 w-8 rounded-full p-0 flex items-center justify-center"
                        type="text"
                        title="Remove this test"
                        icon={<X className="w-4 h-4" />}
                      />
                    </div>
                  ) : null;
                })}
              </div>
            </div>
            
            <Button
              type="primary"
              onClick={HandleTestOrderSubmit}
              disabled={loading || !selectedTests.some(test => test.testId !== "") || !testData.date}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-0 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              loading={loading}
            >
              {loading ? 'Creating Test Order...' : 'Create Test Order'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default FinancialSummaryForm;