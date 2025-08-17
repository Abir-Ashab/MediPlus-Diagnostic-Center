import React from "react";
import { Input, Select, Button, Card, Divider } from "antd";
import { DollarSign, Settings, Edit, Calendar, FileText } from 'lucide-react';

const FinancialSummaryForm = ({
  commonData,
  appointmentData,
  testData,
  selectedTests,
  testsList,
  finalTotal,
  hospitalRevenue,
  doctorRevenue,
  brokerRevenue,
  paidAmount,
  dueAmount,
  useManualTotal,
  manualTotal,
  loading,
  // Commission editing states
  customDoctorCommission,
  customAppointmentCommission,
  customDoctorFee,
  customBrokerCommission,
  showCommissionEdit,
  doctorsList,
  brokers,
  // Handlers
  setUseManualTotal,
  setManualTotal,
  setPaidAmount,
  setCustomDoctorCommission,
  setCustomAppointmentCommission,
  setCustomDoctorFee,
  setCustomBrokerCommission,
  setShowCommissionEdit,
  setAppointmentData,
  setIsFeeManuallyEdited,
  updateDoctorCommissionFee,
  updateBrokerCommission,
  HandleAppointmentSubmit,
  HandleTestOrderSubmit,
  HandleCombinedSubmit,
  deselectTest
}) => {
  return (
    <>
      {/* Commission/Fee Customization Section */}
      {(commonData.doctorName || commonData.brokerName) && (
        <Card className="mb-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">Commission & Fee Settings</h3>
            </div>
            <Button
              type="default"
              size="small"
              onClick={() => setShowCommissionEdit(!showCommissionEdit)}
              className="flex items-center gap-1"
            >
              <Edit className="w-4 h-4" />
              {showCommissionEdit ? 'Hide' : 'Edit'}
            </Button>
          </div>
          
          {showCommissionEdit && (
            <div className="p-4 bg-gray-50 rounded-lg mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Doctor Settings */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Doctor Settings</h4>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Test Referral Commission (%) {(() => {
                        const doctor = doctorsList.find(doc => doc.docName === commonData.doctorName);
                        return doctor && doctor.testReferralCommission !== undefined ? `- Default: ${doctor.testReferralCommission}%` : '';
                      })()}
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder={(() => {
                          const doctor = doctorsList.find(doc => doc.docName === commonData.doctorName);
                          return doctor && doctor.testReferralCommission !== undefined ? doctor.testReferralCommission.toString() : '5';
                        })()}
                        value={customDoctorCommission !== null ? customDoctorCommission : ''}
                        onChange={(e) => setCustomDoctorCommission(e.target.value ? parseFloat(e.target.value) : null)}
                        min="0"
                        max="100"
                        step="0.1"
                        className="flex-1"
                      />
                      {customDoctorCommission !== null && (() => {
                        const doctor = doctorsList.find(doc => doc.docName === commonData.doctorName);
                        const defaultCommission = doctor && doctor.testReferralCommission !== undefined ? doctor.testReferralCommission : 5;
                        return customDoctorCommission !== defaultCommission;
                      })() && (
                        <Button
                          size="small"
                          type="primary"
                          onClick={() => updateDoctorCommissionFee(commonData.doctorName, customDoctorCommission, null)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Save
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {commonData.doctorName && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Appointment Fee (₹) - Default: {(() => {
                          const doctor = doctorsList.find(doc => doc.docName === commonData.doctorName);
                          return doctor && doctor.remuneration !== undefined ? `₹${doctor.remuneration}` : '₹500';
                        })()}
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder={(() => {
                            const doctor = doctorsList.find(doc => doc.docName === commonData.doctorName);
                            return doctor && doctor.remuneration !== undefined ? doctor.remuneration.toString() : '500';
                          })()}
                          value={appointmentData.doctorFee || ''}
                          onChange={(e) => {
                            const newFee = e.target.value ? parseFloat(e.target.value) : 0;
                            setCustomDoctorFee(newFee);
                            setAppointmentData(prev => ({ ...prev, doctorFee: newFee }));
                            setIsFeeManuallyEdited(true);
                          }}
                          min="0"
                          step="10"
                          className="flex-1"
                        />
                        {(() => {
                          const doctor = doctorsList.find(doc => doc.docName === commonData.doctorName);
                          const defaultFee = doctor && doctor.remuneration !== undefined ? doctor.remuneration : 500;
                          return appointmentData.doctorFee !== defaultFee;
                        })() && (
                          <Button
                            size="small"
                            type="primary"
                            onClick={() => updateDoctorCommissionFee(commonData.doctorName, null, appointmentData.doctorFee)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Save
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {commonData.doctorName && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Appointment Fee Commission (%) - Default: {(() => {
                          if (commonData.brokerName) {
                            const broker = brokers.find(b => (b.name || b.docName) === commonData.brokerName);
                            const brokerRate = customBrokerCommission !== null ? customBrokerCommission : (broker ? broker.commissionRate : 5);
                            return `${100 - brokerRate}% (100% - ${brokerRate}% broker commission)`;
                          }
                          return '100% (no broker)';
                        })()}
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder={(() => {
                            if (commonData.brokerName) {
                              const broker = brokers.find(b => (b.name || b.docName) === commonData.brokerName);
                              const brokerRate = customBrokerCommission !== null ? customBrokerCommission : (broker ? broker.commissionRate : 5);
                              return (100 - brokerRate).toString();
                            }
                            return "100";
                          })()}
                          value={customAppointmentCommission !== null ? customAppointmentCommission : ''}
                          onChange={(e) => setCustomAppointmentCommission(e.target.value ? parseFloat(e.target.value) : null)}
                          min="0"
                          max="100"
                          step="0.1"
                          className="flex-1"
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Note: Appointment fee is split between doctor and broker. Doctor gets remaining % after broker commission.
                      </div>
                    </div>
                  )}
                </div>

                {/* Broker Settings */}
                {commonData.brokerName && commonData.doctorName && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">Broker Settings</h4>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Appointment Fee Commission (%) - Default: {(() => {
                          const broker = brokers.find(b => (b.name || b.docName) === commonData.brokerName);
                          return broker ? `${broker.commissionRate}%` : '5%';
                        })()}
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder={(() => {
                            const broker = brokers.find(b => (b.name || b.docName) === commonData.brokerName);
                            return broker ? broker.commissionRate.toString() : '5';
                          })()}
                          value={customBrokerCommission !== null ? customBrokerCommission : ''}
                          onChange={(e) => {
                            setCustomBrokerCommission(e.target.value ? parseFloat(e.target.value) : null);
                            setCustomAppointmentCommission(null);
                          }}
                          min="0"
                          max="100"
                          step="0.1"
                          className="flex-1"
                        />
                        {customBrokerCommission !== null && (() => {
                          const broker = brokers.find(b => (b.name || b.docName) === commonData.brokerName);
                          const defaultCommission = broker ? broker.commissionRate : 5;
                          return customBrokerCommission !== defaultCommission;
                        })() && (
                          <Button
                            size="small"
                            type="primary"
                            onClick={() => updateBrokerCommission(commonData.brokerName, customBrokerCommission)}
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            Save
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Display current settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            {commonData.doctorName && (
              <div className="bg-blue-50 p-3 rounded">
                <div className="font-medium text-blue-800">Doctor: {commonData.doctorName}</div>
                <div className="text-blue-600">
                  <div>Test Commission: {customDoctorCommission !== null ? `${customDoctorCommission}%` : (() => {
                    const doctor = doctorsList.find(doc => doc.docName === commonData.doctorName);
                    return `${doctor && doctor.testReferralCommission !== undefined ? doctor.testReferralCommission : 5}%`;
                  })()} (Custom: {customDoctorCommission !== null ? 'Yes' : 'No'})</div>
                  {commonData.doctorName && (
                    <div>Appointment Fee: Doctor gets full fee (₹{appointmentData.doctorFee || 0}) from their profile</div>
                  )}
                </div>
              </div>
            )}
            
            {commonData.brokerName && (
              <div className="bg-orange-50 p-3 rounded">
                <div className="font-medium text-orange-800">Broker: {commonData.brokerName}</div>
                <div className="text-orange-600">
                  Commission: {customBrokerCommission !== null ? `${customBrokerCommission}%` : (() => {
                    const broker = brokers.find(b => (b.name || b.docName) === commonData.brokerName);
                    return broker ? `${broker.commissionRate}%` : '5%';
                  })()} of doctor's appointment fee (Custom: {customBrokerCommission !== null ? 'Yes' : 'No'})</div>
              </div>
            )}
          </div>
        </Card>
      )}

      <Card className="mb-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">Financial Summary</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              ৳{finalTotal}
              {useManualTotal && <span className="text-xs text-orange-600 ml-2">(Manual)</span>}
            </div>
            <div className="text-sm text-gray-600 flex justify-center items-center gap-2">
              Total Amount
              <Button
                size="small"
                icon={<Edit className="w-3 h-3" />}
                onClick={() => setUseManualTotal(!useManualTotal)}
              >
                {useManualTotal ? 'Use Calculated' : 'Edit'}
              </Button>
            </div>
            {useManualTotal && (
              <Input
                type="number"
                value={manualTotal}
                onChange={(e) => setManualTotal(parseFloat(e.target.value) || 0)}
                className="mt-2"
                min="0"
              />
            )}
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">৳{hospitalRevenue.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Hospital Revenue</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">৳{doctorRevenue.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Doctor Commission</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">৳{brokerRevenue.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Broker Commission</div>
          </div>
        </div>
        <Divider />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-indigo-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">৳{paidAmount}</div>
            <div className="text-sm text-gray-600">Paid Amount</div>
            <Input
              type="number"
              value={paidAmount}
              onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
              className="mt-2"
              min="0"
              max={finalTotal}
            />
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">৳{dueAmount.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Due Amount</div>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Appointment Summary - Show if doctor is selected */}
        {commonData.doctorName && (
          <Card className="shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Appointment Summary</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Patient:</span>
                <span className="font-medium">{commonData.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Doctor:</span>
                <span className="font-medium">{commonData.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date & Time:</span>
                <span className="font-medium">{appointmentData.date} at {appointmentData.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Consultation Fee:</span>
                <span className="font-medium text-purple-600">৳{appointmentData.doctorFee || 0}</span>
              </div>
              {commonData.brokerName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Broker:</span>
                  <span className="font-medium">{commonData.brokerName}</span>
                </div>
              )}
            </div>
            <div className="mt-4">
              <Button
                type="primary"
                onClick={HandleAppointmentSubmit}
                disabled={loading || !appointmentData.time}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                loading={loading}
                size="large"
              >
                <Calendar className="w-5 h-5" />
                {loading ? 'Booking...' : 'Book Appointment Only'}
              </Button>
            </div>
          </Card>
        )}

        {/* Test Order Summary - Only show if tests are selected */}
        {selectedTests.some(test => test.testId !== "") && (
          <Card className="shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Test Order Summary</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Patient:</span>
                <span className="font-medium">{commonData.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Selected Tests:</span>
                <span className="font-medium">{selectedTests.filter(test => test.testId !== "").length} tests</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Test Date & Time:</span>
                <span className="font-medium">
                  {testData.date ? `${testData.date}${testData.time ? ` at ${testData.time}` : ''}` : 'Not scheduled'}
                </span>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {selectedTests.filter(test => test.testId !== "").map((test, index) => {
                  const selectedTest = testsList.find(t => t.testId === parseInt(test.testId));
                  return selectedTest ? (
                    <div key={index} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                      <span className="text-gray-700">• {selectedTest.title}</span>
                      <Button
                        size="small"
                        onClick={() => deselectTest(test.id)}
                        className="text-red-600 hover:text-red-800 border-none shadow-none p-0 h-auto"
                        type="text"
                        title="Remove this test"
                      >
                        ✕
                      </Button>
                    </div>
                  ) : null;
                })}
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tests Total:</span>
                <span className="font-medium text-green-600">
                  ৳{selectedTests.reduce((sum, test) => {
                    if (!test.testId) return sum;
                    if (test.customPrice !== null && test.customPrice !== undefined) {
                      return sum + test.customPrice;
                    }
                    const selectedTest = testsList.find(t => t.testId === parseInt(test.testId));
                    return sum + (selectedTest ? selectedTest.price : 0);
                  }, 0)}
                </span>
              </div>
              {commonData.doctorName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Referring Doctor:</span>
                  <span className="font-medium">{commonData.doctorName}</span>
                </div>
              )}
            </div>
            <div className="mt-4">
              <Button
                type="primary"
                onClick={HandleTestOrderSubmit}
                disabled={loading || !selectedTests.some(test => test.testId !== "") || !testData.date}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                loading={loading}
                size="large"
              >
                <FileText className="w-5 h-5" />
                {loading ? 'Creating...' : 'Create Test Order Only'}
              </Button>
            </div>
          </Card>
        )}
      </div>
      
      {commonData.doctorName && selectedTests.some(test => test.testId !== "") && (
        <Card className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Booking</h3>
            <p className="text-sm text-gray-600 mb-4">Submit both appointment and test order together</p>
            <Button
              type="primary"
              onClick={HandleCombinedSubmit}
              disabled={loading || !appointmentData.time || !selectedTests.some(test => test.testId !== "") || !testData.date}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-8 py-2"
              loading={loading}
              size="large"
            >
              {loading ? 'Processing...' : 'Submit Both Appointment & Tests'}
            </Button>
          </div>
        </Card>
      )}
    </>
  );
};

export default FinancialSummaryForm;