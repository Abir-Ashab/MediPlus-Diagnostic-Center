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
import { User, Calendar, Clock, Heart, Phone, MapPin, DollarSign, Mail, FileText, Settings, Edit } from 'lucide-react';
import CategorizedTestSelection from "./CategorizedTestSelection";

const { Option } = Select;

const Book_Appointment = () => {
  const dispatch = useDispatch();
  const { printReport } = usePrintReport();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingBrokers, setLoadingBrokers] = useState(true);
  const [bookedAppointments, setBookedAppointments] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [bookingType, setBookingType] = useState('appointment');
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

  const [appointmentData, setAppointmentData] = useState({
    date: "",
    time: "",
    doctorFee: 0,
  });

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

  const getCurrentModeData = () => {
    return bookingType === 'appointment' ? { ...commonData, ...appointmentData } : { ...commonData, ...testData };
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        if (hour === 18 && minute > 0) break;
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const fetchBookedAppointments = async (doctorName, date) => {
    if (!doctorName || !date) return;
    try {
      const response = await axios.get(`https://medi-plus-diagnostic-center-bdbv.vercel.app/appointments?doctor=${doctorName}&date=${date}`);
      setBookedAppointments(response.data);
    } catch (error) {
      console.error("Error fetching booked appointments:", error);
      setBookedAppointments([]);
    }
  };

  useEffect(() => {
    const allSlots = generateTimeSlots();
    const bookedTimes = bookedAppointments.map(appointment => appointment.time);
    const available = allSlots.filter(slot => {
      const slotTime = new Date(`2000-01-01T${slot}:00`);
      return !bookedTimes.some(bookedTime => {
        const bookedDateTime = new Date(`2000-01-01T${bookedTime}:00`);
        const timeDifference = Math.abs(slotTime - bookedDateTime) / (1000 * 60);
        return timeDifference < 15;
      });
    });
    setAvailableTimeSlots(available);
  }, [bookedAppointments]);

  useEffect(() => {
    const currentData = getCurrentModeData();
    if (currentData.doctorName && currentData.date && bookingType === 'appointment') {
      fetchBookedAppointments(currentData.doctorName, currentData.date);
    }
  }, [commonData.doctorName, appointmentData.date, bookingType]);

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

  useEffect(() => {
    if (commonData.doctorName && bookingType === 'appointment') {
      const selectedDoctor = doctorsList.find(
        d => d.docName === commonData.doctorName
      );
      if (selectedDoctor) {
        const fee = selectedDoctor.remuneration || 500; // Use remuneration field as doctor consultation fee
        setAppointmentData(prev => ({ ...prev, doctorFee: fee }));
        setSelectedTests([{ id: Date.now(), testId: "doctor-fee", customName: "Doctor Fee", customPrice: fee }]);
      }
    }
  }, [commonData.doctorName, doctorsList, bookingType]);

  useEffect(() => {
    let total = 0;
    if (bookingType === 'appointment') {
      if (selectedTests.some(test => test.testId === "doctor-fee")) {
        total += appointmentData.doctorFee;
      }
    } else {
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
    }
    setTotalAmount(total);
    calculateRevenueDistribution(total, commonData.doctorName, commonData.brokerName);
  }, [selectedTests, commonData.doctorName, commonData.brokerName, appointmentData.doctorFee, bookingType, doctorsList, testsList, customDoctorCommission, customBrokerCommission]);

  const calculateRevenueDistribution = (amount, doctorName, broker) => {
    if (bookingType === 'appointment') {
      const brokerCommissionRate = customBrokerCommission !== null ? customBrokerCommission / 100 : 0.05; // Default 5%
      
      if (broker) {
        const doctorCommissionRate = customDoctorCommission !== null ? customDoctorCommission / 100 : 0.9; // Default 90%
        const hospitalCommissionRate = 1 - doctorCommissionRate - brokerCommissionRate;
        
        setHospitalRevenue(amount * hospitalCommissionRate);
        setDoctorRevenue(doctorName ? amount * doctorCommissionRate : 0);
        setBrokerRevenue(amount * brokerCommissionRate);
      } else {
        const doctorCommissionRate = customDoctorCommission !== null ? customDoctorCommission / 100 : 0.95; // Default 95%
        const hospitalCommissionRate = 1 - doctorCommissionRate;
        
        setHospitalRevenue(amount * hospitalCommissionRate);
        setDoctorRevenue(doctorName ? amount * doctorCommissionRate : 0);
        setBrokerRevenue(0);
      }
    } else {
      // For test orders, use dynamic doctor commission
      const doctor = doctorsList.find(doc => doc.docName === doctorName);
      const defaultCommissionRate = doctor ? doctor.testReferralCommission / 100 : 0.05; // Default to 5% if doctor not found
      const commissionRate = customDoctorCommission !== null ? customDoctorCommission / 100 : defaultCommissionRate;
      
      const doctorCommission = doctorName ? amount * commissionRate : 0;
      const hospitalShare = amount - doctorCommission;
      
      setHospitalRevenue(hospitalShare);
      setDoctorRevenue(doctorCommission);
      setBrokerRevenue(0);
    }
  };

  const handleCommonDataChange = (e) => {
    const { name, value } = e.target;
    setCommonData(prev => ({ ...prev, [name]: value }));
    if (name === 'doctorName' && bookingType === 'appointment') {
      setAppointmentData(prev => ({ ...prev, time: "" }));
    }
  };

  const handleDoctorChange = (value) => {
    setCommonData(prev => ({ ...prev, doctorName: value }));
    
    // Reset custom commissions when doctor changes
    setCustomDoctorCommission(null);
    setCustomDoctorFee(null);
    
    // Set default doctor fee for appointments
    if (bookingType === 'appointment') {
      const selectedDoctor = doctorsList.find(d => d.docName === value);
      if (selectedDoctor) {
        const fee = selectedDoctor.remuneration || 500;
        setAppointmentData(prev => ({ ...prev, time: "", doctorFee: fee }));
        setCustomDoctorFee(fee);
      }
    }
  };

  const handleBrokerChange = (value) => {
    setCommonData(prev => ({ ...prev, brokerName: value }));
    // Reset custom broker commission when broker changes
    setCustomBrokerCommission(null);
  };

  const handleModeSpecificChange = (e) => {
    const { name, value } = e.target;
    if (bookingType === 'appointment') {
      setAppointmentData(prev => ({ ...prev, [name]: value }));
      if (name === 'date') {
        setAppointmentData(prev => ({ ...prev, time: "" }));
      }
    } else {
      setTestData(prev => ({ ...prev, [name]: value }));
    }
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

  const HandleBookingTypeChange = (type) => {
    setBookingType(type);
    setSelectedTests([{ id: Date.now(), testId: "", customPrice: null }]);
  };

  const clearFormAfterSubmit = () => {
    if (bookingType === 'appointment') {
      setAppointmentData({ date: "", time: "", doctorFee: 0 });
      toast.success("Appointment booked successfully! Patient information has been preserved for your next booking.", {
        position: "top-right",
        autoClose: 5000,
      });
    } else {
      setTestData({ date: "", time: "" });
      toast.success("Test order created successfully! Patient information has been preserved for your next booking.", {
        position: "top-right",
        autoClose: 5000,
      });
    }
    setSelectedTests([{ id: Date.now(), testId: "", customPrice: null }]);
  };

  const HandleOnsubmitAppointment = async (e) => {
    e.preventDefault();
    const currentData = getCurrentModeData();
    
    // Validation
    if (commonData.gender === "") {
      return toast.error(" Please fill all the required fields", {
        position: "top-right",
        autoClose: 3000,
      });
    }
    
    if (bookingType === 'appointment' && !currentData.time) {
      return toast.error("Please select an appointment time", {
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

    let testsWithPrices;
    if (bookingType === 'appointment') {
      testsWithPrices = selectedTests
        .filter(test => test.testId !== "")
        .map(test => test.testId === "doctor-fee" ? { testName: "Doctor Fee", testPrice: appointmentData.doctorFee } : null)
        .filter(test => test);
    } else {
      testsWithPrices = selectedTests
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
    }

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
        orderType: bookingType,
      };

      const patientResponse = await dispatch(AddPatients({ ...patientData, patientId: Date.now() }));

      if (bookingType === 'appointment') {
        const bookingData = { ...patientData, patientID: patientResponse.id };
        await dispatch(CreateBooking(bookingData));
        fetchBookedAppointments(commonData.doctorName, appointmentData.date);
        setLoading(false);
        clearFormAfterSubmit();
      } else {
        // Test order creation
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
      }
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

  return (
    <div>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar onCollapse={setSidebarCollapsed} />
        <div className={`flex-1 p-6 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-0'}`}>
          <div className="flex-1 p-6 ml-40">
            <div>
              <Card className="mb-6 shadow-sm border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {bookingType === 'appointment' ? 'Book Appointment' : 'Create Test Order'}
                      </h1>
                      <p className="text-gray-600">
                        {bookingType === 'appointment' ? 'Schedule your consultation with our expert doctors' : 'Schedule laboratory tests for patients'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => HandleBookingTypeChange('appointment')}
                      className={`flex items-center gap-2 px-6 py-2 font-semibold rounded-lg shadow-md transition-all duration-200 ${
                        bookingType === 'appointment'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 hover:shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      Doctor Appointment
                    </Button>
                    <Button
                      onClick={() => HandleBookingTypeChange('test')}
                      className={`flex items-center gap-2 px-6 py-2 font-semibold rounded-lg shadow-md transition-all duration-200 ${
                        bookingType === 'test'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 hover:shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      Test Order
                    </Button>
                  </div>
                </div>
              </Card>

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
                </Card>

                <Card className="mb-6 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Heart className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Medical Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {bookingType === 'appointment' ? 'Doctor Name *' : 'Referring Doctor (Optional)'}
                      </label>
                      <Select
                        name="doctorName"
                        value={commonData.doctorName}
                        onChange={handleDoctorChange}
                        disabled={loadingDoctors}
                        required={bookingType === 'appointment'}
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
                    {bookingType === 'appointment' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Broker Name (Optional)</label>
                        <Select
                          name="brokerName"
                          value={commonData.brokerName}
                          onChange={handleBrokerChange}
                          disabled={loadingBrokers}
                          className="w-full"
                          placeholder={loadingBrokers ? "Loading brokers..." : "Select Broker (Optional)"}
                        >
                          <Option value="">{loadingBrokers ? "Loading brokers..." : "Select Broker (Optional)"}</Option>
                          {brokers.map((broker) => (
                            <Option key={broker._id} value={broker.name || broker.docName}>
                              {broker.name || broker.docName}
                            </Option>
                          ))}
                        </Select>
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="mb-6 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Test/Service Selection</h3>
                  </div>
                  {bookingType === 'appointment' ? (
                    appointmentData.doctorFee > 0 && (
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Doctor Consultation Fee:</span>
                          <span className="font-medium text-purple-700">{appointmentData.doctorFee} Taka</span>
                        </div>
                      </div>
                    )
                  ) : (
                    <CategorizedTestSelection
                      selectedTests={selectedTests}
                      onTestSelect={handleTestSelect}
                      onSelectTestDirectly={selectTestDirectly}
                      onAddMore={addMoreTest}
                      onRemove={removeTest}
                    />
                  )}
                </Card>

                {/* Selected Tests with Editable Prices */}
                {bookingType === 'test' && selectedTests.some(test => test.testId !== "") && (
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

                <Card className="mb-6 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {bookingType === 'appointment' ? 'Appointment Schedule' : 'Test Schedule'}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {bookingType === 'appointment' ? 'Date *' : 'Collection Date *'}
                      </label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {bookingType === 'appointment' ? 'Time *' : 'Collection Time *'}
                      </label>
                      {bookingType === 'appointment' ? (
                        <Select
                          name="time"
                          value={currentData.time}
                          onChange={(value) => setAppointmentData(prev => ({ ...prev, time: value }))}
                          required
                          className="w-full"
                          placeholder={!commonData.doctorName || !appointmentData.date ? "Select doctor and date first" : "Select available time"}
                          disabled={!commonData.doctorName || !appointmentData.date}
                        >
                          <Option value="">{!commonData.doctorName || !appointmentData.date ? "Select doctor and date first" : "Select available time"}</Option>
                          {availableTimeSlots.map((slot) => (
                            <Option key={slot} value={slot}>{slot}</Option>
                          ))}
                        </Select>
                      ) : (
                        <Input
                          type="time"
                          name="time"
                          value={currentData.time}
                          onChange={handleModeSpecificChange}
                          required
                          className="border-gray-200 focus:ring-indigo-500"
                        />
                      )}
                    </div>
                  </div>
                </Card>

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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                        {commonData.doctorName && (
                          <div className="space-y-3">
                            <h4 className="font-medium text-gray-700">Doctor Settings</h4>
                            {bookingType === 'appointment' ? (
                              <div className="space-y-2">
                                <div>
                                  <label className="block text-sm text-gray-600 mb-1">
                                    Commission (%) - Default: {commonData.brokerName ? '90%' : '95%'}
                                  </label>
                                  <div className="flex gap-2">
                                    <Input
                                      type="number"
                                      placeholder={commonData.brokerName ? "90" : "95"}
                                      value={customDoctorCommission || ''}
                                      onChange={(e) => setCustomDoctorCommission(e.target.value ? parseFloat(e.target.value) : null)}
                                      min="0"
                                      max="100"
                                      step="0.1"
                                      className="flex-1"
                                    />
                                    {customDoctorCommission !== null && (
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
                                <div>
                                  <label className="block text-sm text-gray-600 mb-1">
                                    Doctor Fee (Taka) - Default: {(() => {
                                      const selectedDoctor = doctorsList.find(d => d.docName === commonData.doctorName);
                                      return selectedDoctor ? selectedDoctor.remuneration || 500 : 500;
                                    })()}
                                  </label>
                                  <div className="flex gap-2">
                                    <Input
                                      type="number"
                                      placeholder={(() => {
                                        const selectedDoctor = doctorsList.find(d => d.docName === commonData.doctorName);
                                        return (selectedDoctor ? selectedDoctor.remuneration || 500 : 500).toString();
                                      })()}
                                      value={customDoctorFee || ''}
                                      onChange={(e) => {
                                        const value = e.target.value ? parseFloat(e.target.value) : null;
                                        setCustomDoctorFee(value);
                                        if (value !== null) {
                                          setAppointmentData(prev => ({ ...prev, doctorFee: value }));
                                        }
                                      }}
                                      min="0"
                                      step="0.01"
                                      className="flex-1"
                                    />
                                    {customDoctorFee !== null && (() => {
                                      const selectedDoctor = doctorsList.find(d => d.docName === commonData.doctorName);
                                      const defaultFee = selectedDoctor ? selectedDoctor.remuneration || 500 : 500;
                                      return customDoctorFee !== defaultFee;
                                    })() && (
                                      <Button
                                        size="small"
                                        type="primary"
                                        onClick={() => updateDoctorCommissionFee(commonData.doctorName, null, customDoctorFee)}
                                        className="bg-blue-600 hover:bg-blue-700"
                                      >
                                        Save
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                  Test Referral Commission (%) - Default: {(() => {
                                    const doctor = doctorsList.find(doc => doc.docName === commonData.doctorName);
                                    return doctor ? doctor.testReferralCommission || 5 : 5;
                                  })()}%
                                </label>
                                <div className="flex gap-2">
                                  <Input
                                    type="number"
                                    placeholder={(() => {
                                      const doctor = doctorsList.find(doc => doc.docName === commonData.doctorName);
                                      return (doctor ? doctor.testReferralCommission || 5 : 5).toString();
                                    })()}
                                    value={customDoctorCommission || ''}
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
                            )}
                          </div>
                        )}
                        
                        {commonData.brokerName && bookingType === 'appointment' && (
                          <div className="space-y-3">
                            <h4 className="font-medium text-gray-700">Broker Settings</h4>
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">
                                Commission (%) - Default: 5%
                              </label>
                              <div className="flex gap-2">
                                <Input
                                  type="number"
                                  placeholder="5"
                                  value={customBrokerCommission || ''}
                                  onChange={(e) => setCustomBrokerCommission(e.target.value ? parseFloat(e.target.value) : null)}
                                  min="0"
                                  max="100"
                                  step="0.1"
                                  className="flex-1"
                                />
                                {customBrokerCommission !== null && customBrokerCommission !== 5 && (
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
                    )}
                    
                    {/* Display current settings */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      {commonData.doctorName && (
                        <div className="bg-blue-50 p-3 rounded">
                          <div className="font-medium text-blue-800">Doctor: {commonData.doctorName}</div>
                          {bookingType === 'appointment' ? (
                            <div className="text-blue-600">
                              <div>Commission: {customDoctorCommission !== null ? `${customDoctorCommission}%` : (commonData.brokerName ? '90%' : '95%')} (Custom: {customDoctorCommission !== null ? 'Yes' : 'No'})</div>
                              <div>Fee: ৳{customDoctorFee !== null ? customDoctorFee : (() => {
                                const selectedDoctor = doctorsList.find(d => d.docName === commonData.doctorName);
                                return selectedDoctor ? selectedDoctor.remuneration || 500 : 500;
                              })()} (Custom: {customDoctorFee !== null ? 'Yes' : 'No'})</div>
                            </div>
                          ) : (
                            <div className="text-blue-600">
                              Commission: {customDoctorCommission !== null ? `${customDoctorCommission}%` : (() => {
                                const doctor = doctorsList.find(doc => doc.docName === commonData.doctorName);
                                return `${doctor ? doctor.testReferralCommission || 5 : 5}%`;
                              })()} (Custom: {customDoctorCommission !== null ? 'Yes' : 'No'})
                            </div>
                          )}
                        </div>
                      )}
                      
                      {commonData.brokerName && bookingType === 'appointment' && (
                        <div className="bg-orange-50 p-3 rounded">
                          <div className="font-medium text-orange-800">Broker: {commonData.brokerName}</div>
                          <div className="text-orange-600">
                            Commission: {customBrokerCommission !== null ? `${customBrokerCommission}%` : '5%'} (Custom: {customBrokerCommission !== null ? 'Yes' : 'No'})
                          </div>
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
                      <div className="text-2xl font-bold text-blue-600">{totalAmount}</div>
                      <div className="text-sm text-gray-600">Total Amount (Taka)</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{hospitalRevenue.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">Hospital Revenue</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">{doctorRevenue.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">Doctor Revenue</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">{brokerRevenue.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">Broker Revenue</div>
                    </div>
                  </div>
                </Card>

                <div className="flex justify-center">
                  <Button
                    type="primary"
                    htmlType="submit"
                    disabled={loading}
                      className={`flex items-center gap-2 px-6 py-2 font-semibold rounded-lg shadow-md transition-all duration-200 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 hover:shadow-lg`}
                    loading={loading}
                    >
                    {loading ? 'Processing...' : (bookingType === 'appointment' ? 'Book Appointment' : 'Create Test Order')}
                  </Button>
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