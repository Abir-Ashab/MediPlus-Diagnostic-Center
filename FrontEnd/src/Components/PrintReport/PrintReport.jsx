import React from 'react';
import { useSelector } from 'react-redux';
import { TestCategories, TestsList } from '../../Pages/Dashboard/Main-Dashboard/AllPages/Manager/MixedObjectData';

const PrintReport = ({ order, onPrint }) => {
  // Get current user from Redux store with safe destructuring
  const { data: { user } = {} } = useSelector((state) => state.auth || {});
  
  // Helper function to get user name based on user type
  const getCurrentUserName = () => {
    if (!user) return 'System';
    return user.nurseName || user.doctorName || user.adminName || user.name || 'Unknown User';
  };

  const handlePrint = () => {
    if (!order) {
      console.error('No order data provided for printing');
      return;
    }

    // Group tests by category by matching test names with TestsList
    const groupedTests = {};
    if (order.tests) {
      order.tests.forEach(test => {
        // Find the test in TestsList by matching the test name
        const foundTest = TestsList.find(t => t.title === test.testName);
        const category = foundTest ? foundTest.category : TestCategories.OTHERS;
        
        if (!groupedTests[category]) {
          groupedTests[category] = [];
        }
        groupedTests[category].push(test);
      });
    }

    const printWindow = window.open('', '_blank', 'height=600,width=800');
    // Get current date/time for report generation
    const now = new Date();
    const entryDate = now.toLocaleDateString('en-GB');
    const entryTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

    function format12Hour(timeStr) {
      if (!timeStr) return '';
      let [h, m] = timeStr.replace('.', ':').split(':');
      h = parseInt(h, 10);
      m = parseInt(m, 10) || 0;
      const date = new Date();
      date.setHours(h, m, 0, 0);
      return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    
    let deliveryTime = '';
    if (order.time) {
      let [h, m] = order.time.replace('.', ':').split(':');
      h = parseInt(h, 10);
      m = parseInt(m, 10) || 0;
      const start = new Date();
      start.setHours(h, m, 0, 0);
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
      deliveryTime = `${start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })} to ${end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    }

    printWindow.document.write(`
      <html>
      <head>
        <title>${order.orderType === 'appointment' ? 'Appointment Receipt' : 'Test Report'} - ${order.patientName}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            font-size: 12px;
            line-height: 1.3;
          }
          .header-box {
            border: 2px solid #000;
            text-align: center;
            padding: 10px;
            margin-bottom: 15px;
          }
          .clinic-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 2px;
          }
          .clinic-subtitle {
            font-size: 12px;
            margin-bottom: 3px;
          }
          .clinic-address {
            font-size: 11px;
          }
          .patient-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            font-size: 11px;
          }
          .patient-left, .patient-right {
            width: 48%;
          }
          .info-line {
            margin-bottom: 3px;
          }
          .info-line strong {
            display: inline-block;
            width: 90px;
          }
          .tests-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #000;
            margin-bottom: 20px;
          }
          .table-header {
            background-color: #f5f5f5;
            border: 1px solid #000;
          }
          .table-header th {
            padding: 8px;
            font-size: 11px;
            font-weight: bold;
            border-right: 1px solid #000;
            text-align: center;
          }
          .group-row {
            background-color: #f9f9f9;
            font-weight: bold;
            font-size: 11px;
          }
          .group-row td {
            padding: 6px 8px;
            border-right: 1px solid #000;
            border-bottom: 1px solid #000;
          }
          .test-row td {
            padding: 4px 8px;
            font-size: 11px;
            border-right: 1px solid #000;
            border-bottom: 1px solid #000;
            vertical-align: top;
          }
          .test-name-col {
            text-align: left;
          }
          .price-col {
            text-align: right;
            width: 80px;
          }
          .totals-section {
            margin-top: 15px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .received-by {
            font-size: 11px;
          }
          .totals-box {
            font-size: 11px;
            text-align: right;
          }
          .total-line {
            margin-bottom: 3px;
          }
          .signature-area {
            margin-top: 40px;
            text-align: right;
            font-size: 11px;
          }
        </style>
      </head>
      <body>
        <div class="header-box">
          <div class="clinic-name">MEDIPLUS MEDICAL SERVICES (Pvt) LTD.</div>
          <div class="clinic-subtitle">The Most Advanced & Modernized Diagnostic Complex</div>
          <div class="clinic-address">177 R.B Road (President Road) Narayangonj Phone: 9715761</div>
        </div>

        <div class="patient-info">
          <div class="patient-left">
            <div class="info-line"><strong>Patient ID</strong> ${order._id ? order._id.slice(-5) : '12345'}</div>
            <div class="info-line"><strong>Name</strong> ${order.patientName}</div>
            <div class="info-line"><strong>Age</strong> ${order.age}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <strong>Sex</strong> ${order.gender}</div>
            <div class="info-line"><strong>Refd By</strong> ${order.doctorName || 'Self'}</div>
            ${order.brokerName ? `<div class="info-line"><strong>Broker</strong> ${order.brokerName}</div>` : ''}
          </div>
          <div class="patient-right">
            <div class="info-line"><strong>Entry Date</strong> ${entryDate}</div>
            <div class="info-line"><strong>Entry Time</strong> ${entryTime}</div>
            <div class="info-line"><strong>Delivery Date</strong> ${new Date(new Date(order.date).getTime() + 24*60*60*1000).toLocaleDateString('en-GB')}</div>
            <div class="info-line"><strong>Delivery Time</strong> ${deliveryTime}</div>
          </div>
        </div>

        <table class="tests-table">
          <thead class="table-header">
            <tr>
              <th style="width: 150px;">${order.orderType === 'appointment' ? 'Service Type' : 'Test Group Name'}</th>
              <th>${order.orderType === 'appointment' ? 'Service Description' : 'Test Name'}</th>
              <th style="width: 80px;">Taka</th>
            </tr>
          </thead>
          <tbody>
            ${order.orderType === 'appointment' 
              ? `
                <tr class="test-row">
                  <td class="group-row">APPOINTMENT</td>
                  <td class="test-name-col">Doctor Consultation (${order.doctorName})</td>
                  <td class="price-col">${order.totalAmount}.00</td>
                </tr>
              `
              : Object.keys(groupedTests).map(category => {
                  const categoryTests = groupedTests[category];
                  const categoryDisplayName = Object.values(TestCategories).includes(category) 
                    ? category 
                    : (TestCategories[category] || category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
                  
                  return categoryTests.map((test, index) => {
                    if (index === 0) {
                      return `
                        <tr class="test-row">
                          <td rowspan="${categoryTests.length}" class="group-row">${categoryDisplayName.toUpperCase()}</td>
                          <td class="test-name-col">${test.testName}</td>
                          <td class="price-col">${test.testPrice}.00</td>
                        </tr>
                      `;
                    } else {
                      return `
                        <tr class="test-row">
                          <td class="test-name-col">${test.testName}</td>
                          <td class="price-col">${test.testPrice}.00</td>
                        </tr>
                      `;
                    }
                  }).join('');
                }).join('')
            }
          </tbody>
        </table>

        <div class="totals-section">
          <div class="received-by">
            <strong>Received By:</strong> ${getCurrentUserName()}
            <div style="margin-top: 50px;">
              <div style="border-top: 1px solid #000; width: 150px; margin-bottom: 5px;"></div>
              <strong>Signature</strong>
            </div>
          </div>
          <div class="totals-box">
            <div class="total-line"><strong>Total:</strong> ${order.totalAmount}.00</div>
            <div class="total-line"><strong>Add Vat (0%):</strong> 0.00</div>
            <br/>
            <div style="border-top: 1px solid #000; width: 150px; margin-bottom: 5px;"></div>
            <div class="total-line"><strong>Total+Vat:</strong> ${order.totalAmount}.00</div>
            <div class="total-line"><strong>Advance:</strong> ${order.paidAmount}.00</div>
            <div class="total-line"><strong>Due:</strong> ${order.dueAmount}.00</div>
            <div class="total-line"><strong>Less:</strong> 0.00</div>
          </div>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      if (onPrint) {
        onPrint();
      }
    }, 500);
  };

  return null; // This component doesn't render anything, it's just a utility
};

// Export both the component and the print function for flexibility
export const usePrintReport = () => {
  const { data: { user } = {} } = useSelector((state) => state.auth || {});
  
  const getCurrentUserName = () => {
    if (!user) return 'System';
    return user.nurseName || user.doctorName || user.adminName || user.name || 'Unknown User';
  };

  const printReport = (order, onPrint) => {
    if (!order) {
      console.error('No order data provided for printing');
      return;
    }

    // Group tests by category by matching test names with TestsList
    const groupedTests = {};
    if (order.tests) {
      order.tests.forEach(test => {
        const foundTest = TestsList.find(t => t.title === test.testName);
        const category = foundTest ? foundTest.category : TestCategories.OTHERS;
        
        if (!groupedTests[category]) {
          groupedTests[category] = [];
        }
        groupedTests[category].push(test);
      });
    }

    const printWindow = window.open('', '_blank', 'height=600,width=800');
    const now = new Date();
    const entryDate = now.toLocaleDateString('en-GB');
    const entryTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

    let deliveryTime = '';
    if (order.time) {
      let [h, m] = order.time.replace('.', ':').split(':');
      h = parseInt(h, 10);
      m = parseInt(m, 10) || 0;
      const start = new Date();
      start.setHours(h, m, 0, 0);
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
      deliveryTime = `${start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })} to ${end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    }

    printWindow.document.write(`
      <html>
      <head>
        <title>${order.orderType === 'appointment' ? 'Appointment Receipt' : 'Test Report'} - ${order.patientName}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            font-size: 12px;
            line-height: 1.3;
          }
          .header-box {
            border: 2px solid #000;
            text-align: center;
            padding: 10px;
            margin-bottom: 15px;
          }
          .clinic-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 2px;
          }
          .clinic-subtitle {
            font-size: 12px;
            margin-bottom: 3px;
          }
          .clinic-address {
            font-size: 11px;
          }
          .patient-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            font-size: 11px;
          }
          .patient-left, .patient-right {
            width: 48%;
          }
          .info-line {
            margin-bottom: 3px;
          }
          .info-line strong {
            display: inline-block;
            width: 90px;
          }
          .tests-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #000;
            margin-bottom: 20px;
          }
          .table-header {
            background-color: #f5f5f5;
            border: 1px solid #000;
          }
          .table-header th {
            padding: 8px;
            font-size: 11px;
            font-weight: bold;
            border-right: 1px solid #000;
            text-align: center;
          }
          .group-row {
            background-color: #f9f9f9;
            font-weight: bold;
            font-size: 11px;
          }
          .group-row td {
            padding: 6px 8px;
            border-right: 1px solid #000;
            border-bottom: 1px solid #000;
          }
          .test-row td {
            padding: 4px 8px;
            font-size: 11px;
            border-right: 1px solid #000;
            border-bottom: 1px solid #000;
            vertical-align: top;
          }
          .test-name-col {
            text-align: left;
          }
          .price-col {
            text-align: right;
            width: 80px;
          }
          .totals-section {
            margin-top: 15px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .received-by {
            font-size: 11px;
          }
          .totals-box {
            font-size: 11px;
            text-align: right;
          }
          .total-line {
            margin-bottom: 3px;
          }
          .signature-area {
            margin-top: 40px;
            text-align: right;
            font-size: 11px;
          }
        </style>
      </head>
      <body>
        <div class="header-box">
          <div class="clinic-name">MEDIPLUS MEDICAL SERVICES (Pvt) LTD.</div>
          <div class="clinic-subtitle">The Most Advanced & Modernized Diagnostic Complex</div>
          <div class="clinic-address">177 R.B Road (President Road) Narayangonj Phone: 9715761</div>
        </div>

        <div class="patient-info">
          <div class="patient-left">
            <div class="info-line"><strong>Patient ID</strong> ${order._id ? order._id.slice(-5) : '12345'}</div>
            <div class="info-line"><strong>Name</strong> ${order.patientName}</div>
            <div class="info-line"><strong>Age</strong> ${order.age}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <strong>Sex</strong> ${order.gender}</div>
            <div class="info-line"><strong>Refd By</strong> ${order.doctorName || 'Self'}</div>
            ${order.brokerName ? `<div class="info-line"><strong>Broker</strong> ${order.brokerName}</div>` : ''}
          </div>
          <div class="patient-right">
            <div class="info-line"><strong>Entry Date</strong> ${entryDate}</div>
            <div class="info-line"><strong>Entry Time</strong> ${entryTime}</div>
            <div class="info-line"><strong>Delivery Date</strong> ${new Date(new Date(order.date).getTime() + 24*60*60*1000).toLocaleDateString('en-GB')}</div>
            <div class="info-line"><strong>Delivery Time</strong> ${deliveryTime}</div>
          </div>
        </div>

        <table class="tests-table">
          <thead class="table-header">
            <tr>
              <th style="width: 150px;">${order.orderType === 'appointment' ? 'Service Type' : 'Test Group Name'}</th>
              <th>${order.orderType === 'appointment' ? 'Service Description' : 'Test Name'}</th>
              <th style="width: 80px;">Taka</th>
            </tr>
          </thead>
          <tbody>
            ${order.orderType === 'appointment' 
              ? `
                <tr class="test-row">
                  <td class="group-row">APPOINTMENT</td>
                  <td class="test-name-col">Doctor Consultation (${order.doctorName})</td>
                  <td class="price-col">${order.totalAmount}.00</td>
                </tr>
              `
              : Object.keys(groupedTests).map(category => {
                  const categoryTests = groupedTests[category];
                  const categoryDisplayName = Object.values(TestCategories).includes(category) 
                    ? category 
                    : (TestCategories[category] || category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
                  
                  return categoryTests.map((test, index) => {
                    if (index === 0) {
                      return `
                        <tr class="test-row">
                          <td rowspan="${categoryTests.length}" class="group-row">${categoryDisplayName.toUpperCase()}</td>
                          <td class="test-name-col">${test.testName}</td>
                          <td class="price-col">${test.testPrice}.00</td>
                        </tr>
                      `;
                    } else {
                      return `
                        <tr class="test-row">
                          <td class="test-name-col">${test.testName}</td>
                          <td class="price-col">${test.testPrice}.00</td>
                        </tr>
                      `;
                    }
                  }).join('');
                }).join('')
            }
          </tbody>
        </table>

        <div class="totals-section">
          <div class="received-by">
            <strong>Received By:</strong> ${getCurrentUserName()}
            <div style="margin-top: 50px;">
              <div style="border-top: 1px solid #000; width: 150px; margin-bottom: 5px;"></div>
              <strong>Signature</strong>
            </div>
          </div>
          <div class="totals-box">
            <div class="total-line"><strong>Total:</strong> ${order.totalAmount}.00</div>
            <div class="total-line"><strong>Add Vat (0%):</strong> 0.00</div>
            <br/>
            <div style="border-top: 1px solid #000; width: 150px; margin-bottom: 5px;"></div>
            <div class="total-line"><strong>Total+Vat:</strong> ${order.totalAmount}.00</div>
            <div class="total-line"><strong>Advance:</strong> ${order.paidAmount}.00</div>
            <div class="total-line"><strong>Due:</strong> ${order.dueAmount}.00</div>
            <div class="total-line"><strong>Less:</strong> 0.00</div>
          </div>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      if (onPrint) {
        onPrint();
      }
    }, 500);
  };

  return { printReport };
};

export default PrintReport;