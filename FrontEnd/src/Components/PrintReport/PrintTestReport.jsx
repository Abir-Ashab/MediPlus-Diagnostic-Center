import React, { useState } from "react";
import { Modal, Button, Input, Select } from "antd";
import { FileText, Plus, Minus, User, Calendar, Phone, MapPin, Stethoscope, TestTube2 } from "lucide-react";
import { useSelector } from 'react-redux';

const { Option } = Select;

const PrintTestReport = ({ order }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTest, setSelectedTest] = useState('');
  const [testResults, setTestResults] = useState([{ parameter: "", value: "", unit: "", normalRange: "", remarks: "" }]);

  const { data: { user } = {} } = useSelector((state) => state.auth || {});

  const getCurrentUserName = () => {
    if (!user) return 'System';
    return user.managerName || user.doctorName || user.adminName || user.name || 'Unknown User';
  };

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedTest('');
    setTestResults([{ parameter: "", value: "", unit: "", normalRange: "", remarks: "" }]);
  };

  const handleAddResult = () => {
    setTestResults([...testResults, { parameter: "", value: "", unit: "", normalRange: "", remarks: "" }]);
  };

  const handleRemoveResult = (index) => {
    if (testResults.length > 1) {
      const updatedResults = testResults.filter((_, i) => i !== index);
      setTestResults(updatedResults);
    }
  };

  const handleResultChange = (index, field, value) => {
    const updatedResults = [...testResults];
    updatedResults[index][field] = value;
    setTestResults(updatedResults);
  };

  const handlePrintReport = () => {
    if (!selectedTest) {
      alert('Please select a test to generate report');
      return;
    }

    // Filter out empty results
    const filteredResults = testResults.filter(result => 
      result.parameter.trim() || result.value.trim()
    );

    if (filteredResults.length === 0) {
      alert('Please add at least one test result');
      return;
    }

    const printWindow = window.open('', '_blank', 'height=800,width=600');
    const now = new Date();
    const reportDate = now.toLocaleDateString('en-GB');
    const reportTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });

    // Generate results table
    const resultsHTML = filteredResults.map((result, index) => `
      <tr>
        <td class="parameter-cell">${result.parameter}</td>
        <td class="value-cell">${result.value}</td>
        <td class="unit-cell">${result.unit}</td>
        <td class="range-cell">${result.normalRange}</td>
        <td class="remarks-cell">${result.remarks}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
      <head>
        <title>Test Report - ${selectedTest} - ${order.patientName}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 15px; 
            font-size: 12px;
            line-height: 1.4;
            background: white;
          }
          
          .header-section {
            border: 2px solid #000;
            text-align: center;
            padding: 12px;
            margin-bottom: 15px;
            background: #f8f9fa;
          }
          
          .clinic-name {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 3px;
            color: #1a1a1a;
          }
          
          .clinic-subtitle {
            font-size: 13px;
            margin-bottom: 3px;
            color: #444;
          }
          
          .clinic-address {
            font-size: 11px;
            color: #666;
          }
          
          .report-title {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            margin: 15px 0;
            padding: 8px;
            background: #e3f2fd;
            border: 1px solid #2196f3;
            text-transform: uppercase;
            color: #1976d2;
          }
          
          .patient-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            font-size: 11px;
            border: 1px solid #ddd;
            padding: 12px;
            background: #fafafa;
          }
          
          .patient-left, .patient-right {
            width: 48%;
          }
          
          .info-line {
            margin-bottom: 4px;
            padding: 2px 0;
          }
          
          .info-label {
            display: inline-block;
            width: 90px;
            font-weight: bold;
            color: #333;
          }
          
          .info-value {
            color: #000;
          }
          
          .results-section {
            margin: 20px 0;
            // border: 1px solid #000;
          }
          
          .results-title {
            background: #2c5282;
            color: white;
            padding: 8px;
            text-align: center;
            font-weight: bold;
            font-size: 13px;
          }
          
          .results-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
          }
          
          .results-table th {
            background: #f1f5f9;
            border: 1px solid #000;
            padding: 8px 6px;
            text-align: center;
            font-weight: bold;
            font-size: 10px;
          }
          
          .results-table td {
            border: 1px solid #000;
            padding: 6px;
            vertical-align: top;
          }
          
          .parameter-cell {
            width: 25%;
            background: #f9f9f9;
            font-weight: 500;
          }
          
          .value-cell {
            width: 15%;
            text-align: center;
            font-weight: bold;
          }
          
          .unit-cell {
            width: 15%;
            text-align: center;
          }
          
          .range-cell {
            width: 25%;
            text-align: center;
            font-size: 10px;
          }
          
          .remarks-cell {
            width: 20%;
            font-size: 10px;
          }
          
          .signature-section {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          
          .technician-sign, .doctor-sign {
            text-align: center;
            width: 200px;
          }
          
          .sign-line {
            border-top: 1px solid #000;
            // margin-bottom: 2px;
            height: 50px;
            display: flex;
            align-items: flex-end;
          }
          
          .sign-label {
            font-weight: bold;
            font-size: 11px;
          }
          
          .footer-note {
            margin-top: 50px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
          }
          
          @media print {
            body { 
              margin: 0; 
              padding: 15px;
            }
            .no-print { 
              display: none; 
            }
          }
          
          @page {
            margin: 1cm;
            size: A4;
          }
        </style>
      </head>
      <body>
        <div class="header-section">
          <div class="clinic-name">MEDIPLUS MEDICAL SERVICES (Pvt) LTD.</div>
          <div class="clinic-subtitle">The Most Advanced & Modernized Diagnostic Complex</div>
          <div class="clinic-address">177 R.B Road (President Road) Narayangonj Phone: 9715761</div>
        </div>

        <div class="report-title">${selectedTest} - TEST REPORT</div>

        <div class="patient-info">
          <div class="patient-left">
            <div class="info-line">
              <span class="info-label">Patient ID:</span>
              <span class="info-value">${order._id ? order._id.slice(-8).toUpperCase() : 'N/A'}</span>
            </div>
            <div class="info-line">
              <span class="info-label">Name:</span>
              <span class="info-value">${order.patientName}</span>
            </div>
            <div class="info-line">
              <span class="info-label">Age/Sex:</span>
              <span class="info-value">${order.age} Years / ${order.gender}</span>
            </div>
            <div class="info-line">
              <span class="info-label">Mobile:</span>
              <span class="info-value">${order.mobile || 'N/A'}</span>
            </div>
            <div class="info-line">
              <span class="info-label">Address:</span>
              <span class="info-value">${order.address || 'N/A'}</span>
            </div>
          </div>
          <div class="patient-right">
            <div class="info-line">
              <span class="info-label">Report Date:</span>
              <span class="info-value">${reportDate}</span>
            </div>
            <div class="info-line">
              <span class="info-label">Report Time:</span>
              <span class="info-value">${reportTime}</span>
            </div>
            <div class="info-line">
              <span class="info-label">Sample Date:</span>
              <span class="info-value">${new Date(order.date).toLocaleDateString('en-GB')}</span>
            </div>
            <div class="info-line">
              <span class="info-label">Ref. Doctor:</span>
              <span class="info-value">${order.doctorName || 'Self'}</span>
            </div>
          </div>
        </div>

        <div class="results-section">
          <div class="results-title">TEST RESULTS</div>
          <table class="results-table">
            <thead>
              <tr>
                <th>Test Parameter</th>
                <th>Result</th>
                <th>Unit</th>
                <th>Normal Range</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${resultsHTML}
            </tbody>
          </table>
        </div>

        <div class="signature-section">
          <div class="technician-sign">
            <div class="sign-line"></div>
            <div class="sign-label">Lab Technician</div>
            <div style="font-size: 10px; margin-top: 2px;">${getCurrentUserName()}</div>
          </div>
          <div class="doctor-sign">
            <div class="sign-line"></div>
            <div class="sign-label">Prepared By</div>
            <div style="font-size: 10px; margin-top: 2px;">${order.doctorName || 'Self'}</div>
          </div>
        </div>

        <div class="footer-note">
          This report is computer generated and does not require signature.<br>
          For any queries, please contact our laboratory.
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      setIsModalVisible(false);
    }, 500);
  };

  return (
    <>
      <Button
        onClick={handleOpenModal}
        className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors text-sm font-medium"
      >
        <FileText className="w-4 h-4" />
        Report
      </Button>

      <Modal
        title={null}
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={1000}
        className="modern-modal"
        style={{ top: 20 }}
        styles={{
          content: {
            padding: 0,
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          },
          body: {
            padding: 0,
          },
        }}
      >
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Generate Test Report</h2>
              <p className="text-blue-100">Create a professional medical test report</p>
            </div>
          </div>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto">
          {/* Patient Info Display */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Patient Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">NAME</p>
                  <p className="font-semibold text-gray-900">{order.patientName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">AGE & GENDER</p>
                  <p className="font-semibold text-gray-900">{order.age} years, {order.gender}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
                <Phone className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">MOBILE</p>
                  <p className="font-semibold text-gray-900">{order.mobile || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl md:col-span-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">ADDRESS</p>
                  <p className="font-semibold text-gray-900">{order.address || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
                <Stethoscope className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">REF. DOCTOR</p>
                  <p className="font-semibold text-gray-900">{order.doctorName || 'Self'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Test Selection */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TestTube2 className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Select Test</h3>
            </div>
            <Select
              placeholder="Choose a test to generate report for..."
              value={selectedTest}
              onChange={setSelectedTest}
              className="w-full"
              size="large"
              style={{
                borderRadius: '12px',
              }}
            >
              {order.tests && order.tests.map((test, index) => (
                <Option key={index} value={test.testName}>
                  <div className="flex items-center gap-2">
                    <TestTube2 className="w-4 h-4 text-purple-500" />
                    {test.testName}
                  </div>
                </Option>
              ))}
            </Select>
          </div>

          {/* Test Results Input */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Test Results</h3>
              </div>
              <Button
                onClick={handleAddResult}
                className="bg-green-100 hover:bg-green-200 text-green-700 border-green-200 hover:border-green-300 rounded-lg flex items-center gap-2"
                icon={<Plus className="w-4 h-4" />}
              >
                Add Parameter
              </Button>
            </div>
            
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Parameter</label>
                      <Input
                        placeholder="e.g., Hemoglobin"
                        value={result.parameter}
                        onChange={(e) => handleResultChange(index, 'parameter', e.target.value)}
                        className="rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Value</label>
                      <Input
                        placeholder="12.5"
                        value={result.value}
                        onChange={(e) => handleResultChange(index, 'value', e.target.value)}
                        className="rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
                      <Input
                        placeholder="g/dL"
                        value={result.unit}
                        onChange={(e) => handleResultChange(index, 'unit', e.target.value)}
                        className="rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Normal Range</label>
                      <Input
                        placeholder="12-15"
                        value={result.normalRange}
                        onChange={(e) => handleResultChange(index, 'normalRange', e.target.value)}
                        className="rounded-lg"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Remarks</label>
                        <Input
                          placeholder="Normal"
                          value={result.remarks}
                          onChange={(e) => handleResultChange(index, 'remarks', e.target.value)}
                          className="rounded-lg"
                        />
                      </div>
                      {testResults.length > 1 && (
                        <Button
                          onClick={() => handleRemoveResult(index)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 border-red-200 hover:border-red-300 rounded-lg"
                          icon={<Minus className="w-4 h-4" />}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-700">
                <span className="font-medium">💡 Tips:</span> Fill in the test parameters, results, units, normal ranges, and any remarks. 
                Leave fields empty if not applicable. Click "Add Parameter" to include multiple test values.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Ensure all required information is filled before generating the report.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={handleCloseModal}
              className="bg-white hover:bg-gray-50 text-gray-700 border-gray-300 hover:border-gray-400 rounded-lg px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePrintReport}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-lg px-8 font-medium shadow-lg"
            >
              Generate Report
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PrintTestReport;