// src/components/TestOrdersList.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../GlobalFiles/Sidebar";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import Modal from "react-modal";

const TestOrdersList = () => {
  const [testOrders, setTestOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  // Fetch test orders directly using Axios instead of Redux
  const fetchTestOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/testorders");
      setTestOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching test orders:", error);
      toast.error("Error loading test orders: " + (error.message || "Unknown error"));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestOrders();
  }, []);

  // Function to update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/testorders/${orderId}`, {
        status: newStatus
      });
      toast.success(`Order status updated to ${newStatus}`);
      fetchTestOrders(); // Refresh the list
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  // Function to delete test order
  const deleteTestOrder = async (orderId) => {
    try {
      await axios.delete(`http://localhost:5000/testorders/${orderId}`);
      toast.success("Test order deleted successfully");
      setIsConfirmDeleteOpen(false);
      setOrderToDelete(null);
      fetchTestOrders(); // Refresh the list
    } catch (error) {
      console.error("Error deleting test order:", error);
      toast.error("Failed to delete test order");
    }
  };

  // Function to filter test orders based on search
  const filteredOrders = testOrders.filter((order) => {
    const searchText = searchQuery.toLowerCase();
    return (
      order.patientName?.toLowerCase().includes(searchText) ||
      order.email?.toLowerCase().includes(searchText) ||
      order.mobile?.toString().includes(searchText) ||
      order.doctorName?.toLowerCase().includes(searchText)
    );
  });

  return (
    <>
      <ToastContainer />
      <div className="container">
        <Sidebar />
        <div className="AfterSideBar">
          <div style={{ marginBottom: "20px" }}>
            <h1 style={{ marginBottom: "15px" }}>Test Orders List</h1>
            
            {/* Search Input */}
            <div style={{ maxWidth: "500px", margin: "0 0 20px 0" }}>
              <input
                type="text"
                placeholder="Search by name, email, mobile or doctor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                }}
              />
            </div>
            
            {loading ? (
              <div>Loading Test Orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div>No test orders found</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={tableHeaderStyle}>Patient Name</th>
                      <th style={tableHeaderStyle}>Contact</th>
                      <th style={tableHeaderStyle}>Email</th>
                      <th style={tableHeaderStyle}>Tests</th>
                      <th style={tableHeaderStyle}>Doctor</th>
                      <th style={tableHeaderStyle}>Date & Time</th>
                      <th style={tableHeaderStyle}>Amount</th>
                      <th style={tableHeaderStyle}>Status</th>
                      <th style={tableHeaderStyle}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order._id}>
                        <td style={tableCellStyle}>
                          {order.patientName}
                          <div style={{ fontSize: "12px", color: "#666" }}>
                            {order.gender}, {order.age} yrs
                          </div>
                        </td>
                        <td style={tableCellStyle}>{order.mobile}</td>
                        <td style={tableCellStyle}>{order.email}</td>
                        <td style={tableCellStyle}>
                          {order.tests && order.tests.map((test, i) => (
                            <div key={i}>
                              {test.testName} - {test.testPrice} Taka
                            </div>
                          ))}
                        </td>
                        <td style={tableCellStyle}>{order.doctorName || "N/A"}</td>
                        <td style={tableCellStyle}>
                          {new Date(order.date).toLocaleDateString()}, {order.time}
                        </td>
                        <td style={tableCellStyle}>
                          <div style={{ fontWeight: "bold" }}>{order.totalAmount} Taka</div>
                          <div style={{ fontSize: "12px", color: "#666" }}>
                            Hospital: {order.hospitalRevenue?.toFixed(0)} | 
                            Doctor: {order.doctorRevenue?.toFixed(0)}
                          </div>
                        </td>
                        <td style={tableCellStyle}>
                          <span
                            style={{
                              background: getStatusColor(order.status),
                              padding: "4px 8px",
                              borderRadius: "4px",
                              color: "#fff",
                              fontSize: "12px",
                              cursor: "pointer"
                            }}
                            onClick={() => {
                              const statuses = ["Pending", "In Progress", "Completed", "Cancelled"];
                              const currentIndex = statuses.findIndex(s => 
                                s.toLowerCase() === (order.status || "pending").toLowerCase());
                              const nextIndex = (currentIndex + 1) % statuses.length;
                              updateOrderStatus(order._id, statuses[nextIndex]);
                            }}
                          >
                            {order.status || "Pending"}
                          </span>
                        </td>
                        <td style={tableCellStyle}>
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsModalOpen(true);
                            }}
                            style={{
                              padding: "5px 10px",
                              background: "#3498db",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              marginRight: "5px",
                              cursor: "pointer",
                            }}
                          >
                            View
                          </button>
                          <button
                            onClick={() => {
                              // Handle Print Report
                              const printWindow = window.open('', '_blank', 'height=600,width=800');
                              printWindow.document.write(`
                                <html>
                                  <head>
                                    <title>Test Order - ${order.patientName}</title>
                                    <style>
                                      body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
                                      h1 { color: #2c3e50; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
                                      .details { margin-bottom: 20px; }
                                      .detail-row { display: flex; margin-bottom: 5px; }
                                      .label { font-weight: bold; width: 150px; }
                                      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                                      th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                                      th { background-color: #f2f2f2; }
                                      .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #7f8c8d; }
                                    </style>
                                  </head>
                                  <body>
                                    <h1>Test Order Receipt</h1>
                                    <div class="details">
                                      <div class="detail-row"><span class="label">Patient:</span> ${order.patientName} (${order.gender}, ${order.age} yrs)</div>
                                      <div class="detail-row"><span class="label">Mobile:</span> ${order.mobile}</div>
                                      <div class="detail-row"><span class="label">Email:</span> ${order.email || 'N/A'}</div>
                                      <div class="detail-row"><span class="label">Doctor:</span> ${order.doctorName || 'N/A'}</div>
                                      <div class="detail-row"><span class="label">Date & Time:</span> ${new Date(order.date).toLocaleDateString()}, ${order.time}</div>
                                      <div class="detail-row"><span class="label">Status:</span> ${order.status || 'Pending'}</div>
                                    </div>
                                    
                                    <h2>Ordered Tests</h2>
                                    <table>
                                      <thead>
                                        <tr>
                                          <th>#</th>
                                          <th>Test Name</th>
                                          <th>Price (Taka)</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        ${order.tests && order.tests.map((test, i) => `
                                          <tr>
                                            <td>${i+1}</td>
                                            <td>${test.testName}</td>
                                            <td>${test.testPrice}</td>
                                          </tr>
                                        `).join('')}
                                        <tr>
                                          <td colspan="2" style="text-align: right; font-weight: bold;">Total:</td>
                                          <td style="font-weight: bold;">${order.totalAmount} Taka</td>
                                        </tr>
                                      </tbody>
                                    </table>
                                    
                                    <div class="footer">
                                      <p>This is a computer generated receipt and does not require physical signature.</p>
                                      <p>Order ID: ${order._id}</p>
                                    </div>
                                  </body>
                                </html>
                              `);
                              
                              printWindow.document.close();
                              printWindow.focus();
                              // Delay printing to ensure content is loaded
                              setTimeout(() => {
                                printWindow.print();
                                // printWindow.close();
                              }, 500);
                            }}
                            style={{
                              padding: "5px 10px",
                              background: "#2ecc71",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              marginRight: "5px",
                              cursor: "pointer",
                            }}
                          >
                            Print
                          </button>
                          <button
                            onClick={() => {
                              setOrderToDelete(order);
                              setIsConfirmDeleteOpen(true);
                            }}
                            style={{
                              padding: "5px 10px",
                              background: "#e74c3c",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            maxWidth: '700px',
            maxHeight: '80vh',
            overflow: 'auto',
            padding: '20px',
            borderRadius: '8px',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        }}
        contentLabel="Test Order Details"
      >
        {selectedOrder && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Test Order Details</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div>
                <h3>Patient Information</h3>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Name:</strong> {selectedOrder.patientName}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Age/Gender:</strong> {selectedOrder.age} / {selectedOrder.gender}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Mobile:</strong> {selectedOrder.mobile}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Email:</strong> {selectedOrder.email || 'N/A'}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Address:</strong> {selectedOrder.address || 'N/A'}
                </div>
                {selectedOrder.disease && (
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Medical Issue:</strong> {selectedOrder.disease}
                  </div>
                )}
              </div>
              
              <div>
                <h3>Order Information</h3>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Order ID:</strong> {selectedOrder._id}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Doctor:</strong> {selectedOrder.doctorName || 'N/A'}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Date:</strong> {new Date(selectedOrder.date).toLocaleDateString()}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Time:</strong> {selectedOrder.time}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Status:</strong> 
                  <select 
                    value={selectedOrder.status || 'Pending'}
                    onChange={(e) => {
                      updateOrderStatus(selectedOrder._id, e.target.value);
                      setSelectedOrder({...selectedOrder, status: e.target.value});
                    }}
                    style={{
                      marginLeft: '10px',
                      padding: '5px',
                      borderRadius: '4px',
                      border: '1px solid #ddd'
                    }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h3>Ordered Tests</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>Test Name</th>
                    <th style={tableHeaderStyle}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.tests && selectedOrder.tests.map((test, i) => (
                    <tr key={i}>
                      <td style={tableCellStyle}>{test.testName}</td>
                      <td style={tableCellStyle}>{test.testPrice} Taka</td>
                    </tr>
                  ))}
                  <tr>
                    <td style={{...tableCellStyle, fontWeight: 'bold', textAlign: 'right'}}>Total:</td>
                    <td style={{...tableCellStyle, fontWeight: 'bold'}}>{selectedOrder.totalAmount} Taka</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h3>Revenue Distribution</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>Entity</th>
                    <th style={tableHeaderStyle}>Percentage</th>
                    <th style={tableHeaderStyle}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={tableCellStyle}>Hospital</td>
                    <td style={tableCellStyle}>95%</td>
                    <td style={tableCellStyle}>{selectedOrder.hospitalRevenue?.toFixed(0)} Taka</td>
                  </tr>
                  <tr>
                    <td style={tableCellStyle}>Doctor</td>
                    <td style={tableCellStyle}>5%</td>
                    <td style={tableCellStyle}>{selectedOrder.doctorRevenue?.toFixed(0)} Taka</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  padding: '8px 15px',
                  background: '#95a5a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  setOrderToDelete(selectedOrder);
                  setIsConfirmDeleteOpen(true);
                  setIsModalOpen(false);
                }}
                style={{
                  padding: '8px 15px',
                  background: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal
        isOpen={isConfirmDeleteOpen}
        onRequestClose={() => {
          setIsConfirmDeleteOpen(false);
          setOrderToDelete(null);
        }}
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '400px',
            padding: '20px',
            borderRadius: '8px',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        }}
        contentLabel="Confirm Delete"
      >
        <h2 style={{ marginTop: 0 }}>Confirm Delete</h2>
        <p>Are you sure you want to delete the test order for {orderToDelete?.patientName}?</p>
        <p style={{ color: '#e74c3c', fontWeight: 'bold' }}>This action cannot be undone.</p>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button
            onClick={() => {
              setIsConfirmDeleteOpen(false);
              setOrderToDelete(null);
            }}
            style={{
              padding: '8px 15px',
              background: '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => deleteTestOrder(orderToDelete._id)}
            style={{
              padding: '8px 15px',
              background: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Delete
          </button>
        </div>
      </Modal>
    </>
  );
};

// Helper function to determine status color
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "completed":
      return "#2ecc71";
    case "in progress":
      return "#f39c12";
    case "cancelled":
      return "#e74c3c";
    default:
      return "#3498db"; // Default for "Pending" or any other status
  }
};

const tableHeaderStyle = {
  backgroundColor: "#f2f2f2",
  padding: "12px",
  textAlign: "left",
  borderBottom: "1px solid #ddd",
};

const tableCellStyle = {
  padding: "10px",
  borderBottom: "1px solid #ddd",
};

export default TestOrdersList;