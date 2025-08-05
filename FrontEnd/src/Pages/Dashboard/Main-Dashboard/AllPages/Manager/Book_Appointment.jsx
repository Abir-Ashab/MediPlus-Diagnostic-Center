import React, { useState, useEffect } from "react";
import { CommonProblem, TestsList } from "./MixedObjectData";
import { useDispatch } from "react-redux";
import { AddPatients, CreateBooking } from "../../../../../Redux/Datas/action";
import { usePrintReport } from "../../../../../Components/PrintReport";
import PrintSuccessModal from "../../../../../Components/PrintSuccessModal";
import AddressAutocomplete from "../../../../../Components/AddressAutocomplete";
import Sidebar from "../../GlobalFiles/Sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Input, Select, Button, Spin, Card, Divider } from "antd";
import { User, Calendar, Clock, Heart, Phone, MapPin, DollarSign, Mail, FileText, Settings, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import CategorizedTestSelection from "./CategorizedTestSelection";

const { Option } = Select;

const Book_Appointment = () => {
  const dispatch = useDispatch();
  const { printReport } = usePrintReport();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // Step state for multi-step form
  const [doctors, setDoctors] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingBrokers, setLoadingBrokers] = useState(true);
  // const [bookedAppointments, setBookedAppointments] = useState([]);
  // const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  // const [bookingType, setBookingType] = useState('appointment'); // Commented out - only test orders now
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [lastCreatedOrder, setLastCreatedOrder] = useState(null);

  const [commonData, setCommonData] = useState({
    patientName: "",
    age: "",
    gender: "",
    mobile: "",
    disease: "",
    address: "",
    email: "",
    doctorName: "",
    brokerName: "",
  });

  // const [appointmentData, setAppointmentData] = useState({
  //   date: "",
  //   time: "",
  //   doctorFee: 0,
  // });

  const [testData, setTestData] = useState({
    date: "",
    time: "",
  });

  const [selectedTests, setSelectedTests] = useState([{ id: Date.now(), testId: "", customPrice: null }]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [hospitalRevenue, setHospitalRevenue] = useState(0);
  const [doctorRevenue, setDoctorRevenue] = useState(0);
  const [brokerRevenue, setBrokerRevenue] = useState(0);
  const [doctorsList, setDoctorsList] = useState([]);

  // Custom commission/fee state
  const [customDoctorCommission, setCustomDoctorCommission] = useState(null);
  const [customDoctorFee, setCustomDoctorFee] = useState(null);
  const [customBrokerCommission, setCustomBrokerCommission] = useState(null);
  const [showCommissionEdit, setShowCommissionEdit] = useState(false);

  const [testsList, setTestsList] = useState([]);

  // Fetch tests from API
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await axios.get('https://medi-plus-diagnostic-center-bdbv.vercel.app/tests?isActive=true');
        setTestsList(response.data);
      } catch (error) {
        console.error('Error fetching tests:', error);
      }
    };
    fetchTests();
  }, []);

  // Fetch doctors with commission settings
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get("https://medi-plus-diagnostic-center-bdbv.vercel.app/testorders/doctors/commission");
        setDoctorsList(response.data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };
    fetchDoctors();
  }, []);

  // Set commission from doctor's profile when doctor list loads and there's already a selected doctor
  useEffect(() => {
    if (doctorsList.length > 0 && commonData.doctorName && customDoctorCommission === null) {
      const doctor = doctorsList.find(doc => doc.docName === commonData.doctorName);
      if (doctor && doctor.testReferralCommission !== undefined) {
        setCustomDoctorCommission(doctor.testReferralCommission);
      }
    }
  }, [doctorsList, commonData.doctorName, customDoctorCommission]);

  // const getCurrentModeData = () => {
  //   return bookingType === 'appointment' ? { ...commonData, ...appointmentData } : { ...commonData, ...testData };
  // };

  const getCurrentModeData = () => {
    return { ...commonData, ...testData }; // Only test data now
  };

  // const generateTimeSlots = () => {
  //   const slots = [];
  //   for (let hour = 9; hour <= 18; hour++) {
  //     for (let minute = 0; minute < 60; minute += 15) {
  //       if (hour === 18 && minute > 0) break;
  //       const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  //       slots.push(timeString);
  //     }
  //   }
  //   return slots;
  // };

  // const fetchBookedAppointments = async (doctorName, date) => {
  //   if (!doctorName || !date) return;
  //   try {
  //     const response = await axios.get(`https://medi-plus-diagnostic-center-bdbv.vercel.app/appointments?doctor=${doctorName}&date=${date}`);
  //     setBookedAppointments(response.data);
  //   } catch (error) {
  //     console.error("Error fetching booked appointments:", error);
  //     setBookedAppointments([]);
  //   }
  // };

  // useEffect(() => {
  //   const allSlots = generateTimeSlots();
  //   const bookedTimes = bookedAppointments.map(appointment => appointment.time);
  //   const available = allSlots.filter(slot => {
  //     const slotTime = new Date(`2000-01-01T${slot}:00`);
  //     return !bookedTimes.some(bookedTime => {
  //       const bookedDateTime = new Date(`2000-01-01T${bookedTime}:00`);
  //       const timeDifference = Math.abs(slotTime - bookedDateTime) / (1000 * 60);
  //       return timeDifference < 15;
  //     });
  //   });
  //   setAvailableTimeSlots(available);
  // }, [bookedAppointments]);

  // useEffect(() => {
  //   const currentData = getCurrentModeData();
  //   if (currentData.doctorName && currentData.date && bookingType === 'appointment') {
  //     fetchBookedAppointments(currentData.doctorName, currentData.date);
  //   }
  // }, [commonData.doctorName, appointmentData.date, bookingType]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const response = await axios.get("https://medi-plus-diagnostic-center-bdbv.vercel.app/doctors");
        setDoctors(response.data);
        setLoadingDoctors(false);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        toast.error("⚠️ Failed to load doctors. Please refresh the page and try again.", {
          position: "top-right",
          autoClose: 4000,
        });
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    const fetchBrokers = async () => {
      try {
        setLoadingBrokers(true);
        const response = await axios.get("https://medi-plus-diagnostic-center-bdbv.vercel.app/brokers");
        setBrokers(response.data);
        setLoadingBrokers(false);
      } catch (error) {
        console.error("Error fetching brokers:", error);
        toast.error("⚠️ Failed to load brokers. Please refresh the page and try again.", {
          position: "top-right",
          autoClose: 4000,
        });
        setLoadingBrokers(false);
      }
    };
    fetchBrokers();
  }, []);

  // useEffect(() => {
  //   if (commonData.doctorName && bookingType === 'appointment') {
  //     const selectedDoctor = doctorsList.find(
  //       d => d.docName === commonData.doctorName
  //     );
  //     if (selectedDoctor) {
  //       const fee = selectedDoctor.remuneration || 500; // Use remuneration field as doctor consultation fee
  //       setAppointmentData(prev => ({ ...prev, doctorFee: fee }));
  //       setSelectedTests([{ id: Date.now(), testId: "doctor-fee", customName: "Doctor Fee", customPrice: fee }]);
  //     }
  //   }
  // }, [commonData.doctorName, doctorsList, bookingType]);

  useEffect(() => {
    let total = 0;
    // Only test orders now - removed appointment logic
    total = selectedTests.reduce((sum, test) => {
      if (!test.testId) return sum;
      
      // Use custom price if available, otherwise use the original test price
      if (test.customPrice !== null && test.customPrice !== undefined) {
        return sum + test.customPrice;
      }
      
      // Try to find test in API data first, then fallback to static TestsList
      const selectedTest = testsList.find(t => t.testId === parseInt(test.testId)) || 
                         TestsList.find(t => t.id === parseInt(test.testId));
      return sum + (selectedTest ? selectedTest.price : 0);
    }, 0);
    
    setTotalAmount(total);
    calculateRevenueDistribution(total, commonData.doctorName, commonData.brokerName);
  }, [selectedTests, commonData.doctorName, commonData.brokerName, doctorsList, testsList, customDoctorCommission, customBrokerCommission]);

  const calculateRevenueDistribution = (amount, doctorName, broker) => {
    // Only for test orders now - removed appointment logic
    const doctor = doctorsList.find(doc => doc.docName === doctorName);
    const doctorCommissionRate = doctor ? doctor.testReferralCommission / 100 : 0;
    const commissionRate = customDoctorCommission !== null ? customDoctorCommission / 100 : doctorCommissionRate;
    
    const doctorCommission = doctorName ? amount * commissionRate : 0;
    const hospitalShare = amount - doctorCommission;
    
    setHospitalRevenue(hospitalShare);
    setDoctorRevenue(doctorCommission);
    setBrokerRevenue(0); // No broker commission for test orders
  };

  const handleCommonDataChange = (e) => {
    const { name, value } = e.target;
    setCommonData(prev => ({ ...prev, [name]: value }));
  };

  const handleDoctorChange = (value) => {
    setCommonData(prev => ({ ...prev, doctorName: value }));
    
    // Set commission from doctor's profile when doctor changes
    if (value) {
      const doctor = doctorsList.find(doc => doc.docName === value);
      if (doctor && doctor.testReferralCommission !== undefined) {
        setCustomDoctorCommission(doctor.testReferralCommission);
      } else {
        setCustomDoctorCommission(null);
      }
    } else {
      setCustomDoctorCommission(null);
    }
    setCustomDoctorFee(null);
  };

  // const handleBrokerChange = (value) => {
  //   setCommonData(prev => ({ ...prev, brokerName: value }));
  //   // Reset custom broker commission when broker changes
  //   setCustomBrokerCommission(null);
  // };

  const handleModeSpecificChange = (e) => {
    const { name, value } = e.target;
    setTestData(prev => ({ ...prev, [name]: value }));
  };

  // Step navigation functions
  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  const handleTestSelect = (id, value) => {
    const updatedTests = selectedTests.map(test =>
      test.id === id ? { ...test, testId: value, customPrice: null } : test
    );
    setSelectedTests(updatedTests);
  };

  const handleTestPriceChange = (id, customPrice) => {
    const updatedTests = selectedTests.map(test => {
      if (test.id === id) {
        const newPrice = customPrice === '' || customPrice === null ? null : parseFloat(customPrice);
        return { ...test, customPrice: newPrice };
      }
      return test;
    });
    setSelectedTests(updatedTests);
  };

  // Update test price in database using PUT API
  const updateTestPrice = async (testId, newPrice) => {
    try {
      const test = testsList.find(t => t.testId === parseInt(testId));
      if (!test) return;

      await axios.put(`https://medi-plus-diagnostic-center-bdbv.vercel.app/tests/${test._id}`, {
        ...test,
        price: Number(newPrice)
      });

      toast.success("Test price updated successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      // Refresh tests list
      const response = await axios.get('https://medi-plus-diagnostic-center-bdbv.vercel.app/tests?isActive=true');
      setTestsList(response.data);
    } catch (error) {
      console.error('Error updating test price:', error);
      toast.error("Failed to update test price. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const updateDoctorCommissionFee = async (doctorName, commission, fee) => {
    try {
      const doctor = doctorsList.find(d => d.docName === doctorName);
      if (!doctor) return;

      const updateData = {};
      if (commission !== null && commission !== undefined) {
        updateData.testReferralCommission = commission;
      }
      if (fee !== null && fee !== undefined) {
        updateData.remuneration = fee;
      }

      // Use existing doctor PATCH route
      await axios.patch(`https://medi-plus-diagnostic-center-bdbv.vercel.app/doctors/${doctor._id}`, updateData);

      toast.success("Doctor commission/fee updated successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      // Refresh doctors list
      const response = await axios.get("https://medi-plus-diagnostic-center-bdbv.vercel.app/testorders/doctors/commission");
      setDoctorsList(response.data);
    } catch (error) {
      console.error('Error updating doctor commission/fee:', error);
      toast.error("Failed to update doctor commission/fee. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const updateBrokerCommission = async (brokerName, commission) => {
    try {
      const broker = brokers.find(b => (b.name || b.docName) === brokerName);
      if (!broker) return;

      // Use existing broker PATCH route
      await axios.patch(`https://medi-plus-diagnostic-center-bdbv.vercel.app/brokers/${broker._id}`, {
        commissionRate: commission
      });

      toast.success("Broker commission updated successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      // Refresh brokers list
      const response = await axios.get("https://medi-plus-diagnostic-center-bdbv.vercel.app/brokers");
      setBrokers(response.data);
    } catch (error) {
      console.error('Error updating broker commission:', error);
      toast.error("Failed to update broker commission. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const addMoreTest = () => {
    const newTest = { id: Date.now(), testId: "", customPrice: null };
    setSelectedTests(prev => [...prev, newTest]);
  };

  const selectTestDirectly = (testId) => {
    // Check if test is already selected
    const isAlreadySelected = selectedTests.some(test => test.testId === testId.toString());
    if (isAlreadySelected) return;

    // Find empty slot first
    const emptySlot = selectedTests.find(slot => !slot.testId || slot.testId === '');
    if (emptySlot) {
      // Use existing empty slot
      handleTestSelect(emptySlot.id, testId.toString());
    } else {
      // Create new slot and select test immediately
      const newTest = { id: Date.now(), testId: testId.toString(), customPrice: null };
      setSelectedTests(prev => [...prev, newTest]);
    }
  };

  const removeTest = (id) => {
    if (selectedTests.length > 1) {
      const updatedTests = selectedTests.filter(test => test.id !== id);
      setSelectedTests(updatedTests);
    } else {
      toast.warning("⚠️ At least one test is required", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // const HandleBookingTypeChange = (type) => {
  //   setBookingType(type);
  //   setSelectedTests([{ id: Date.now(), testId: "", customPrice: null }]);
  // };

  const clearFormAfterSubmit = () => {
    setTestData({ date: "", time: "" });
    setSelectedTests([{ id: Date.now(), testId: "", customPrice: null }]);
    setCurrentStep(1); // Reset to first step
    toast.success("Test order created successfully! Patient information has been preserved for your next booking.", {
      position: "top-right",
      autoClose: 5000,
    });
  };

  const HandleOnsubmitAppointment = async (e) => {
    e.preventDefault();
    const currentData = getCurrentModeData();
    
    // Validation
    if (commonData.gender === "") {
      return toast.error("Please fill all the required fields", {
        position: "top-right",
        autoClose: 3000,
      });
    }
    
    const hasSelectedTest = selectedTests.some(test => test.testId !== "");
    if (!hasSelectedTest) {
      return toast.error("Please select at least one test", {
        position: "top-right",
        autoClose: 3000,
      });
    }

    // Only test orders now - removed appointment logic
    const testsWithPrices = selectedTests
      .filter(test => test.testId !== "")
      .map(test => {
        // Try to find test in API data first, then fallback to static TestsList
        const selectedTest = testsList.find(t => t.testId === parseInt(test.testId)) || 
                           TestsList.find(t => t.id === parseInt(test.testId));
        
        const finalPrice = test.customPrice !== null && test.customPrice !== undefined 
          ? test.customPrice 
          : selectedTest.price;
        
        return { 
          testName: selectedTest.title, 
          testPrice: finalPrice,
          originalPrice: selectedTest.price,
          isCustomPrice: test.customPrice !== null && test.customPrice !== undefined,
          category: selectedTest.category
        };
      });

    setLoading(true);
    try {
      const patientData = {
        ...commonData,
        ...currentData,
        tests: testsWithPrices,
        totalAmount,
        hospitalRevenue,
        doctorRevenue,
        brokerRevenue,
        orderType: 'test', // Always test order now
      };

      const patientResponse = await dispatch(AddPatients({ ...patientData, patientId: Date.now() }));

      // Test order creation only
      const testOrderData = { ...patientData, patientID: patientResponse.id };
      const response = await axios.post("https://medi-plus-diagnostic-center-bdbv.vercel.app/testorders", testOrderData);
      
      setLoading(false);
      
      // Store the created order for printing
      setLastCreatedOrder({
        ...testOrderData,
        _id: response.data._id || Date.now().toString()
      });
      
      // Show print modal for test orders
      setShowPrintModal(true);
      
      // Clear form
      clearFormAfterSubmit();
    } catch (error) {
      setLoading(false);
      const errorMessage = error.response?.data?.message || error.message || "Something went wrong";
      toast.error(`Error: ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000,
      });
      console.error("Error:", error);
    }
  };

  const currentData = getCurrentModeData();

  // Step validation function
  const canProceedToNextStep = () => {
    if (currentStep === 1) {
      return commonData.patientName && commonData.age && commonData.gender && 
             commonData.mobile && commonData.address && commonData.disease;
    } else if (currentStep === 2) {
      return selectedTests.some(test => test.testId !== "");
    }
    return true;
  };

  return (
    <div>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar onCollapse={setSidebarCollapsed} />
        <div className={`flex-1 p-6 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-0'}`}>
          <div className="flex-1 p-6 ml-40">
            <div>
              {/* Header */}
              <Card className="mb-6 shadow-sm border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">Create Test Order</h1>
                      <p className="text-gray-600">Schedule laboratory tests for patients</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Step Indicator */}
              <Card className="mb-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {[1, 2, 3].map((step) => (
                      <div key={step} className="flex items-center">
                        <div
                          onClick={() => goToStep(step)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ${
                            currentStep === step
                              ? 'bg-blue-600 text-white'
                              : currentStep > step
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {currentStep > step ? '✓' : step}
                        </div>
                        <div className="ml-2 text-sm font-medium">
                          {step === 1 && 'Patient Info'}
                          {step === 2 && 'Test Selection'}
                          {step === 3 && 'Schedule & Summary'}
                        </div>
                        {step < 3 && (
                          <div className={`w-16 h-0.5 ml-4 ${currentStep > step ? 'bg-green-600' : 'bg-gray-200'}`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Patient Info Preservation Notice */}
              {(commonData.patientName || commonData.mobile) && (
                <Card className="mb-6 bg-green-50 border-green-200">
                  <div className="flex items-center text-green-800">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">
                      Patient information preserved: {commonData.patientName && `${commonData.patientName}`}
                      {commonData.patientName && commonData.mobile && ' - '}
                      {commonData.mobile && `${commonData.mobile}`}
                    </span>
                  </div>
                </Card>
              )}

              <form onSubmit={HandleOnsubmitAppointment}>
                {/* Step 1: Patient Information */}
                {currentStep === 1 && (
                  <Card className="mb-6 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <User className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Patient Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name *</label>
                        <Input
                          prefix={<User className="w-4 h-4 text-gray-400" />}
                          placeholder="Full name"
                          name="patientName"
                          value={commonData.patientName}
                          onChange={handleCommonDataChange}
                          required
                          className="border-gray-200 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
                        <Input
                          type="number"
                          placeholder="Age"
                          name="age"
                          value={commonData.age}
                          onChange={handleCommonDataChange}
                          required
                          min="0"
                          max="150"
                          className="border-gray-200 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                        <Select
                          name="gender"
                          value={commonData.gender}
                          onChange={(value) => setCommonData(prev => ({ ...prev, gender: value }))}
                          required
                          className="w-full"
                          placeholder="Select Gender"
                        >
                          <Option value="">Select Gender</Option>
                          <Option value="Male">Male</Option>
                          <Option value="Female">Female</Option>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
                        <Input
                          prefix={<Phone className="w-4 h-4 text-gray-400" />}
                          placeholder="Phone number"
                          name="mobile"
                          value={commonData.mobile}
                          onChange={handleCommonDataChange}
                          required
                          className="border-gray-200 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                        <AddressAutocomplete
                          value={commonData.address}
                          onChange={(value) => setCommonData(prev => ({ ...prev, address: value }))}
                          placeholder="Start typing your address in Bangladesh..."
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
                        <Input
                          prefix={<Mail className="w-4 h-4 text-gray-400" />}
                          type="email"
                          placeholder="abc@abc.com (optional)"
                          name="email"
                          value={commonData.email}
                          onChange={handleCommonDataChange}
                          className="border-gray-200 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type of Disease *</label>
                        <Select
                          name="disease"
                          value={commonData.disease}
                          onChange={(value) => setCommonData(prev => ({ ...prev, disease: value }))}
                          required
                          className="w-full"
                          placeholder="Select Disease"
                        >
                          <Option value="">Select Disease</Option>
                          {CommonProblem.map((ele, i) => (
                            <Option key={i} value={ele.title}>{ele.title}</Option>
                          ))}
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Referring Doctor (Optional)</label>
                        <Select
                          name="doctorName"
                          value={commonData.doctorName}
                          onChange={handleDoctorChange}
                          disabled={loadingDoctors}
                          className="w-full"
                          placeholder={loadingDoctors ? "Loading doctors..." : "Select Doctor"}
                        >
                          <Option value="">{loadingDoctors ? "Loading doctors..." : "Select Doctor"}</Option>
                          {doctors.map((doctor) => (
                            <Option key={doctor._id} value={doctor.name || doctor.docName}>
                              {doctor.name || doctor.docName} - {doctor.specialization}
                            </Option>
                          ))}
                        </Select>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Step 2: Test Selection */}
                {currentStep === 2 && (
                  <>
                    <Card className="mb-6 shadow-sm border border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-purple-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Test Selection</h3>
                      </div>
                      <CategorizedTestSelection
                        selectedTests={selectedTests}
                        onTestSelect={handleTestSelect}
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
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </Card>
                    )}
                  </>
                )}

                {/* Step 3: Schedule, Fees & Summary */}
                {currentStep === 3 && (
                  <>
                    <Card className="mb-6 shadow-sm border border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Test Schedule</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Collection Date *</label>
                          <Input
                            type="date"
                            name="date"
                            value={currentData.date}
                            onChange={handleModeSpecificChange}
                            required
                            className="border-gray-200 focus:ring-indigo-500"
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Collection Time *</label>
                          <Input
                            type="time"
                            name="time"
                            value={currentData.time}
                            onChange={handleModeSpecificChange}
                            required
                            className="border-gray-200 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </Card>

                    {/* Commission/Fee Customization Section */}
                    {commonData.doctorName && (
                      <Card className="mb-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Settings className="w-5 h-5 text-indigo-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Commission Settings</h3>
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
                                      return (doctor ? doctor.testReferralCommission || 5 : 5).toString();
                                    })()}
                                    value={customDoctorCommission !== null ? customDoctorCommission : (() => {
                                      if (commonData.doctorName) {
                                        const doctor = doctorsList.find(doc => doc.docName === commonData.doctorName);
                                        return doctor ? doctor.testReferralCommission || 5 : 5;
                                      }
                                      return '';
                                    })()}
                                    onChange={(e) => setCustomDoctorCommission(e.target.value ? parseFloat(e.target.value) : null)}
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    className="flex-1"
                                  />
                                  {customDoctorCommission !== null && (() => {
                                    const doctor = doctorsList.find(doc => doc.docName === commonData.doctorName);
                                    const defaultCommission = doctor ? doctor.testReferralCommission || 5 : 5;
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
                            </div>
                          </div>
                        )}
                        
                        {/* Display current settings */}
                        <div className="bg-blue-50 p-3 rounded">
                          <div className="font-medium text-blue-800">Doctor: {commonData.doctorName}</div>
                          <div className="text-blue-600">
                            Commission: {customDoctorCommission !== null ? `${customDoctorCommission}%` : (() => {
                              const doctor = doctorsList.find(doc => doc.docName === commonData.doctorName);
                              return `${doctor ? doctor.testReferralCommission || 5 : 5}%`;
                            })()} (Custom: {customDoctorCommission !== null ? 'Yes' : 'No'})
                          </div>
                        </div>
                      </Card>
                    )}

                    <Card className="mb-6 shadow-sm border border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="w-5 h-5 text-yellow-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Financial Summary</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">{totalAmount}</div>
                          <div className="text-sm text-gray-600">Total Amount (Taka)</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">{hospitalRevenue.toFixed(2)}</div>
                          <div className="text-sm text-gray-600">Hospital Revenue</div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-purple-600">{doctorRevenue.toFixed(2)}</div>
                          <div className="text-sm text-gray-600">Doctor Commission</div>
                        </div>
                      </div>
                    </Card>
                  </>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center">
                  <div>
                    {currentStep > 1 && (
                      <Button
                        type="default"
                        onClick={prevStep}
                        className="flex items-center gap-2 px-6 py-2 font-semibold rounded-lg shadow-md transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                    )}
                  </div>
                  
                  <div>
                    {currentStep < 3 ? (
                      <Button
                        type="primary"
                        onClick={nextStep}
                        disabled={!canProceedToNextStep()}
                        className="flex items-center gap-2 px-6 py-2 font-semibold rounded-lg shadow-md transition-all duration-200 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        htmlType="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 font-semibold rounded-lg shadow-md transition-all duration-200 bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
                        loading={loading}
                      >
                        {loading ? 'Processing...' : 'Create Test Order'}
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {/* Print Success Modal */}
      <PrintSuccessModal
        isVisible={showPrintModal}
        onClose={() => {
          setShowPrintModal(false);
          setLastCreatedOrder(null);
        }}
        orderData={lastCreatedOrder}
        onPrint={printReport}
      />
    </div>
  );
};

export default Book_Appointment;