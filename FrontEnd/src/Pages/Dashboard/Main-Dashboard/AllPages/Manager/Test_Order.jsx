import React, { useState, useEffect } from "react";
import { CommonProblem, TestsList } from "./MixedObjectData";
import "./CSS/Book_appointment.css";
import { useDispatch } from "react-redux";
import { AddPatients } from "../../../../../Redux/Datas/action";
import Sidebar from "../../GlobalFiles/Sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import PatientInfoForm from "./PatientInfoForm";
import TestSelection from "./TestSelection";
import RevenueDistribution from "./RevenueDistribution";

const notify = (text) => toast(text);

// Searchable Test Selection Component
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
    // Initialize search terms for existing selected tests
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
    <div className="form-section">
      <h3 className="section-title">Test Selection</h3>
      <div className="test-selection-container">
        {selectedTests.map((test, index) => (
          <div key={test.id} className="test-selection-item">
            <div className="test-input-group">
              <label>Test </label>
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
    </div>
  );
};

const Test_Order = () => {
  const dispatch = useDispatch();
  const [Loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  const InitValue = {
    patientName: "",
    age: "",
    gender: "",
    mobile: "",
    disease: "",
    address: "",
    email: "",
    doctorName: "",
    date: "",
    time: "",
  };

  const [TestOrder, setTestOrder] = useState(InitValue);
  const [selectedTests, setSelectedTests] = useState([{ id: Date.now(), testId: "" }]);
  const [totalAmount, setTotalAmount] = useState(0);
  
  // States for revenue distribution
  const [hospitalRevenue, setHospitalRevenue] = useState(0);
  const [doctorRevenue, setDoctorRevenue] = useState(0);

  // Fetch doctors from the backend API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const response = await axios.get("http://localhost:5000/doctors");
        setDoctors(response.data);
        setLoadingDoctors(false);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        notify("Failed to load doctors. Please try again later.");
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  // Calculate total amount whenever selected tests change
  useEffect(() => {
    const calculateTotal = () => {
      return selectedTests.reduce((sum, test) => {
        const selectedTest = TestsList.find(t => t.id === parseInt(test.testId));
        return sum + (selectedTest && test.testId ? selectedTest.price : 0);
      }, 0);
    };
    
    const total = calculateTotal();
    setTotalAmount(total);

    // Calculate revenue distribution
    calculateRevenueDistribution(total, TestOrder.doctorName);
  }, [selectedTests, TestOrder.doctorName]);

  // Function to calculate revenue distribution for tests
  const calculateRevenueDistribution = (amount, doctor) => {
    // For tests: 95% hospital, 5% doctor, no broker
    setHospitalRevenue(amount * 0.95);
    setDoctorRevenue(doctor ? amount * 0.05 : 0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTestOrder({ ...TestOrder, [name]: value });
  };

  // Handle test selection
  const handleTestSelect = (id, value) => {
    const updatedTests = selectedTests.map(test => 
      test.id === id ? { ...test, testId: value } : test
    );
    setSelectedTests(updatedTests);
  };

  // Add more test field
  const addMoreTest = () => {
    setSelectedTests([...selectedTests, { id: Date.now(), testId: "" }]);
  };

  // Remove test field
  const removeTest = (id) => {
    if (selectedTests.length > 1) {
      const updatedTests = selectedTests.filter(test => test.id !== id);
      setSelectedTests(updatedTests);
    } else {
      notify("At least one test is required");
    }
  };

  const HandleOnsubmitTestOrder = async (e) => {
    e.preventDefault();
  
    if (TestOrder.gender === "") {
      return notify("Please fill all the required fields");
    }

    // Check if at least one test is selected
    const hasSelectedTest = selectedTests.some(test => test.testId !== "");
    if (!hasSelectedTest) {
      return notify("Please select at least one test");
    }

    // Create tests array with name and price for each selected test
    const testsWithPrices = selectedTests
      .filter(test => test.testId !== "") // Filter out empty selections
      .map(test => {
        const selectedTest = TestsList.find(t => t.id === parseInt(test.testId));
        return {
          testName: selectedTest.title,
          testPrice: selectedTest.price
        };
      });

    setLoading(true);
    
    try {
      // Create patient first
      const patientData = {
        patientName: TestOrder.patientName,
        age: TestOrder.age,
        gender: TestOrder.gender,
        mobile: TestOrder.mobile,
        disease: TestOrder.disease,
        address: TestOrder.address,
        email: TestOrder.email,
        patientId: Date.now()
      };
      
      // Add patient using existing Redux action
      const patientResponse = await dispatch(AddPatients(patientData));
      
      // Create test order directly with API instead of Redux
      const testOrderData = {
        patientName: TestOrder.patientName,
        age: TestOrder.age,
        gender: TestOrder.gender,
        mobile: TestOrder.mobile,
        disease: TestOrder.disease,
        address: TestOrder.address,
        email: TestOrder.email,
        tests: testsWithPrices,
        totalAmount: totalAmount,
        doctorName: TestOrder.doctorName,
        date: TestOrder.date,
        time: TestOrder.time,
        hospitalRevenue: hospitalRevenue,
        doctorRevenue: doctorRevenue,
        orderType: "test", // Mark this as a test order
        patientID: patientResponse.id
      };
      
      // Direct API call instead of using Redux
      const response = await axios.post("http://localhost:5000/testorders", testOrderData);
      
      notify("Test Order Created Successfully");
      setLoading(false);
      setTestOrder(InitValue);
      setSelectedTests([{ id: Date.now(), testId: "" }]); // Reset selected tests
      
    } catch (error) {
      notify("Error: " + (error.response?.data?.message || error.message || "Unknown error"));
      console.error("Error creating test order:", error);
      setLoading(false);
    }
  };  

  return (
    <>
      <ToastContainer />
      <div className="container">
        <Sidebar />
        <div className="AfterSideBar">
          <div className="enhanced-form">
            <div className="form-header">
              <h1>Create Test Order</h1>
              <p>Schedule laboratory tests for patients</p>
            </div>
            
            <form onSubmit={HandleOnsubmitTestOrder} className="appointment-form">
              {/* Patient Information Section */}
              <div className="form-section">
                <h3 className="section-title">Patient Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Patient Name *</label>
                    <input
                      type="text"
                      placeholder="Enter patient's full name"
                      name="patientName"
                      value={TestOrder.patientName}
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Age *</label>
                    <input
                      type="number"
                      placeholder="Enter age"
                      name="age"
                      value={TestOrder.age}
                      onChange={handleChange}
                      required
                      className="form-input"
                      min="0"
                      max="150"
                    />
                  </div>

                  <div className="form-group">
                    <label>Gender *</label>
                    <select
                      name="gender"
                      value={TestOrder.gender}
                      onChange={handleChange}
                      required
                      className="form-select"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Contact Number *</label>
                    <input
                      type="tel"
                      placeholder="Enter phone number"
                      name="mobile"
                      value={TestOrder.mobile}
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Email *</label>
                    <input
                      type="email"
                      placeholder="Enter email address"
                      name="email"
                      value={TestOrder.email}
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Address *</label>
                    <input
                      type="text"
                      placeholder="Enter complete address"
                      name="address"
                      value={TestOrder.address}
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Medical Information Section */}
              <div className="form-section">
                <h3 className="section-title">Medical Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Type of Disease *</label>
                    <select
                      name="disease"
                      value={TestOrder.disease}
                      onChange={handleChange}
                      required
                      className="form-select"
                    >
                      <option value="">Select Disease</option>
                      {CommonProblem.map((ele, i) => (
                        <option key={i} value={ele.title}>
                          {ele.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Searchable Test Selection */}
              <SearchableTestSelection
                selectedTests={selectedTests}
                handleTestSelect={handleTestSelect}
                addMoreTest={addMoreTest}
                removeTest={removeTest}
                TestsList={TestsList}
              />

              {/* Doctor Assignment Section */}
              <div className="form-section">
                <h3 className="section-title">Doctor Assignment</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Referring Doctor (Optional)</label>
                    <select
                      name="doctorName"
                      value={TestOrder.doctorName}
                      onChange={handleChange}
                      className="form-select"
                      disabled={loadingDoctors}
                    >
                      <option value="">
                        {loadingDoctors ? "Loading doctors..." : "Select Doctor (Optional)"}
                      </option>
                      {doctors.map((doctor) => (
                        <option key={doctor._id} value={doctor.name || doctor.docName}>
                          {doctor.name || doctor.docName} - {doctor.specialization}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Test Schedule Section */}
              <div className="form-section">
                <h3 className="section-title">Test Schedule</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Collection Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={TestOrder.date}
                      onChange={handleChange}
                      required
                      className="form-input"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="form-group">
                    <label>Collection Time *</label>
                    <input
                      type="time"
                      name="time"
                      value={TestOrder.time}
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Fee Information Section */}
              <div className="form-section">
                <h3 className="section-title">Fee Information</h3>
                
                {/* Total Amount */}
                <div className="total-amount">
                  <span>Total Amount:</span>
                  <span className="total-value">{totalAmount} Taka</span>
                </div>
              </div>

              {/* Revenue Distribution */}
              {totalAmount > 0 && (
                <div className="form-section">
                  <h3 className="section-title">Revenue Distribution</h3>
                  <div className="revenue-cards">
                    <div className="revenue-card hospital">
                      <div className="revenue-label">Hospital</div>
                      <div className="revenue-amount">{hospitalRevenue.toFixed(0)} Taka</div>
                      <div className="revenue-percentage">95%</div>
                    </div>
                    
                    <div className="revenue-card doctor">
                      <div className="revenue-label">Doctor</div>
                      <div className="revenue-amount">{doctorRevenue.toFixed(0)} Taka</div>
                      <div className="revenue-percentage">
                        {TestOrder.doctorName ? "5%" : "0%"}
                      </div>
                    </div>
                    
                    <div className="revenue-card broker" style={{ opacity: 0.5 }}>
                      <div className="revenue-label">Broker</div>
                      <div className="revenue-amount">0 Taka</div>
                      <div className="revenue-percentage">N/A</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={Loading}
                >
                  {Loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Creating...
                    </>
                  ) : (
                    "Create Test Order"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Test_Order;