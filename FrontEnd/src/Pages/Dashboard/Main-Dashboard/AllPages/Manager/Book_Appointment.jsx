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
  const [currentStep, setCurrentStep] = useState(1); // Step state for 3-step form
  const [doctors, setDoctors] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingBrokers, setLoadingBrokers] = useState(true);
  const [bookedAppointments, setBookedAppointments] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [lastCreatedOrder, setLastCreatedOrder] = useState(null);

  const [commonData, setCommonData] = useState({
    patientName: "",
    age: "",
    gender: "",
    mobile: "",
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
  const [calculatedTotal, setCalculatedTotal] = useState(0);
  const [useManualTotal, setUseManualTotal] = useState(false);
  const [manualTotal, setManualTotal] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [hospitalRevenue, setHospitalRevenue] = useState(0);
  const [doctorRevenue, setDoctorRevenue] = useState(0);
  const [brokerRevenue, setBrokerRevenue] = useState(0);
  const [doctorsList, setDoctorsList] = useState([]);

  // Custom commission/fee state
  const [customDoctorCommission, setCustomDoctorCommission] = useState(null); // For test referral commission
  const [customAppointmentCommission, setCustomAppointmentCommission] = useState(null); // For appointment fee commission
  const [customDoctorFee, setCustomDoctorFee] = useState(null);
  const [customBrokerCommission, setCustomBrokerCommission] = useState(null);
  const [showCommissionEdit, setShowCommissionEdit] = useState(false);
  const [isFeeManuallyEdited, setIsFeeManuallyEdited] = useState(false); // Track if fee has been manually edited

  const [testsList, setTestsList] = useState([]);

  const finalTotal = useManualTotal ? manualTotal : calculatedTotal;
  const dueAmount = finalTotal - paidAmount;

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
    return { ...commonData, ...appointmentData };
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
    if (currentData.doctorName && currentData.date) {
      fetchBookedAppointments(currentData.doctorName, currentData.date);
    }
  }, [commonData.doctorName, appointmentData.date]);

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
    if (commonData.doctorName && !isFeeManuallyEdited) {
      const selectedDoctor = doctorsList.find(
        d => d.docName === commonData.doctorName
      );
      if (selectedDoctor) {
        const fee = selectedDoctor.remuneration || 500; // Use remuneration field as doctor consultation fee
        setAppointmentData(prev => ({ ...prev, doctorFee: fee }));
      }
    }
  }, [commonData.doctorName, doctorsList, isFeeManuallyEdited]);

  useEffect(() => {
    let total = 0;
    // Calculate total based on selected tests and doctor fee
    if (appointmentData.doctorFee > 0) {
      total += appointmentData.doctorFee;
    }
    
    total += selectedTests.reduce((sum, test) => {
      if (!test.testId || test.testId === "doctor-fee") return sum;
      
      // Use custom price if available, otherwise use the original test price
      if (test.customPrice !== null && test.customPrice !== undefined) {
        return sum + test.customPrice;
      }
      
      // Try to find test in API data first, then fallback to static TestsList
      const selectedTest = testsList.find(t => t.testId === parseInt(test.testId)) || 
                         TestsList.find(t => t.id === parseInt(test.testId));
      return sum + (selectedTest ? selectedTest.price : 0);
    }, 0);
    
    setCalculatedTotal(total);
    if (!useManualTotal) {
      setManualTotal(total);
    }
    calculateRevenueDistribution(useManualTotal ? manualTotal : total, commonData.doctorName, commonData.brokerName);
  }, [selectedTests, commonData.doctorName, commonData.brokerName, appointmentData.doctorFee, doctorsList, testsList, customDoctorCommission, customAppointmentCommission, customBrokerCommission, customDoctorFee, useManualTotal, manualTotal]);

  const calculateRevenueDistribution = (amount, doctorName, broker) => {
    // Check if this includes appointment fee (doctor consultation)
    const hasAppointmentFee = appointmentData.doctorFee > 0;
    const testAmount = amount - (hasAppointmentFee ? appointmentData.doctorFee : 0);
    
    let doctorCommission = 0;
    let brokerCommission = 0;
    let hospitalShare = 0;

    // For appointment fees: Doctor gets full appointment fee from their profile
    if (hasAppointmentFee && doctorName) {
      doctorCommission += appointmentData.doctorFee; // Doctor gets full appointment fee
    }

    // For test fees: Doctor gets commission percentage from profile (if referral), hospital gets rest
    if (testAmount > 0 && doctorName) {
      const doctor = doctorsList.find(doc => doc.docName === doctorName);
      const testCommissionRate = doctor ? (customDoctorCommission !== null ? customDoctorCommission / 100 : doctor.testReferralCommission / 100) : 0;
      const doctorTestCommission = testAmount * testCommissionRate;
      doctorCommission += doctorTestCommission;
      hospitalShare += testAmount - doctorTestCommission; // Hospital gets rest of test amount
    } else if (testAmount > 0) {
      // No doctor referral, hospital gets all test amount
      hospitalShare += testAmount;
    }

    // Broker commission is deducted from doctor's appointment fee only (not total amount)
    if (broker && hasAppointmentFee) {
      const selectedBroker = brokers.find(b => (b.name || b.docName) === broker);
      const brokerCommissionRate = customBrokerCommission !== null ? customBrokerCommission / 100 : (selectedBroker ? selectedBroker.commissionRate / 100 : 0.05);
      brokerCommission = appointmentData.doctorFee * brokerCommissionRate; // Broker gets percentage of doctor's appointment fee only
    }

    // Final hospital share = test remainder only
    // (Appointment fee goes to doctor, broker takes from doctor's fee, hospital gets test remainder)
    
    setHospitalRevenue(Math.max(0, hospitalShare));
    setDoctorRevenue(doctorCommission);
    setBrokerRevenue(brokerCommission);
  };

  const handleCommonDataChange = (e) => {
    const { name, value } = e.target;
    setCommonData(prev => ({ ...prev, [name]: value }));
    if (name === 'doctorName') {
      setAppointmentData(prev => ({ ...prev, time: "" }));
    }
  };

  const handleDoctorChange = (value) => {
    setCommonData(prev => ({ ...prev, doctorName: value }));
    
    // Reset custom commissions when doctor changes
    setCustomDoctorCommission(null);
    setCustomAppointmentCommission(null);
    setIsFeeManuallyEdited(false); // Reset manual edit flag when doctor changes
    
    // Set default doctor fee for appointments
    const selectedDoctor = doctorsList.find(d => d.docName === value);
    if (selectedDoctor) {
      const fee = selectedDoctor.remuneration || 500;
      setAppointmentData(prev => ({ ...prev, time: "", doctorFee: fee }));
      setCustomDoctorFee(fee); // Set custom fee to default fee initially so input shows value
    }
  };

  const handleBrokerChange = (value) => {
    setCommonData(prev => ({ ...prev, brokerName: value }));
    // Reset custom broker commission and appointment commission when broker changes
    setCustomBrokerCommission(null);
    setCustomAppointmentCommission(null);
  };

  const handleModeSpecificChange = (e) => {
    const { name, value } = e.target;
    setAppointmentData(prev => ({ ...prev, [name]: value }));
    if (name === 'date') {
      setAppointmentData(prev => ({ ...prev, time: "" }));
    }
  };

  const handleTestDataChange = (e) => {
    const { name, value } = e.target;
    setTestData(prev => ({ ...prev, [name]: value }));
  };

  const handleTestSelect = (id, value) => {
    const updatedTests = selectedTests.map(test =>
      test.id === id ? { ...test, testId: value, customPrice: null } : test
    );
    setSelectedTests(updatedTests);
  };

  const deselectTest = (id) => {
    // Find the test being deselected for feedback
    const testToDeselect = selectedTests.find(test => test.id === id);
    let testName = "Test";
    
    if (testToDeselect && testToDeselect.testId) {
      const selectedTest = testsList.find(t => t.testId === parseInt(testToDeselect.testId));
      if (selectedTest) {
        testName = selectedTest.title;
      }
    }
    
    // Deselect test by setting testId to empty string
    const updatedTests = selectedTests.map(test =>
      test.id === id ? { ...test, testId: "", customPrice: null } : test
    );
    setSelectedTests(updatedTests);
    
    toast.info(`"${testName}" has been deselected.`, {
      position: "top-right",
      autoClose: 2000,
    });
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

  const clearAllTests = () => {
    // Clear all selected tests but keep at least one empty slot
    setSelectedTests([{ id: Date.now(), testId: "", customPrice: null }]);
    toast.info("All tests cleared.", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const removeTest = (id) => {
    if (selectedTests.length > 1) {
      const updatedTests = selectedTests.filter(test => test.id !== id);
      setSelectedTests(updatedTests);
    } else {
      // If only one test slot, clear it instead of removing
      const updatedTests = selectedTests.map(test =>
        test.id === id ? { ...test, testId: "", customPrice: null } : test
      );
      setSelectedTests(updatedTests);
      toast.info("Test deselected. You can select a new test or add more test slots.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const clearFormAfterSubmit = () => {
    setAppointmentData({ date: "", time: "", doctorFee: 0 });
    setTestData({ date: "", time: "" });
    setSelectedTests([{ id: Date.now(), testId: "", customPrice: null }]);
    setCurrentStep(1); // Reset to first step
    setIsFeeManuallyEdited(false); // Reset manual edit flag
    setUseManualTotal(false);
    setManualTotal(0);
    setPaidAmount(0);
    toast.success("Order completed successfully! Patient information has been preserved for your next booking.", {
      position: "top-right",
      autoClose: 5000,
    });
  };

  // Step navigation functions
  const nextStep = () => {
    if (!canProceedToNextStep()) {
      toast.error("Please fill all required fields before proceeding.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
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

  // Step validation function
  const canProceedToNextStep = () => {
    if (currentStep === 1) {
      return (
        commonData.patientName &&
        commonData.age &&
        commonData.gender &&
        commonData.mobile &&
        commonData.address &&
        commonData.doctorName &&
        appointmentData.date
      );
    }
    if (currentStep === 2) {
      const hasSelectedTest = selectedTests.some(test => test.testId !== "");
      if (hasSelectedTest && !testData.date) {
        return false; // Test date is required when tests are selected
      }
      return true; // Allow proceeding even without tests (tests are optional)
    }
    return true;
  };

  const HandleAppointmentSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (commonData.gender === "") {
      return toast.error("Please fill all the required fields", {
        position: "top-right",
        autoClose: 3000,
      });
    }
    
    if (!appointmentData.time) {
      return toast.error("Please select an appointment time", {
        position: "top-right",
        autoClose: 3000,
      });
    }

    setLoading(true);
    try {
      const selectedDoctor = doctorsList.find(doc => doc.docName === commonData.doctorName);
      const selectedBroker = brokers.find(b => (b.name || b.docName) === commonData.brokerName);
      
      // Doctor gets full appointment fee from their profile
      const appointmentDoctorRevenue = appointmentData.doctorFee;
      
      // Broker gets their percentage from doctor's appointment fee only
      const brokerCommissionRate = customBrokerCommission !== null 
        ? customBrokerCommission / 100 
        : (selectedBroker ? selectedBroker.commissionRate / 100 : 0);
      const appointmentBrokerRevenue = commonData.brokerName ? appointmentData.doctorFee * brokerCommissionRate : 0;
      
      // Hospital gets nothing from appointment fees (doctor gets full fee, broker gets commission from doctor's fee)
      const appointmentHospitalRevenue = 0;

      const patientData = {
        ...commonData,
        ...appointmentData,
        tests: [{ testName: "Doctor Fee", testPrice: appointmentData.doctorFee }],
        totalAmount: finalTotal,
        paidAmount: paidAmount,
        dueAmount: dueAmount,
        hospitalRevenue: appointmentHospitalRevenue,
        doctorRevenue: appointmentDoctorRevenue,
        brokerRevenue: appointmentBrokerRevenue,
        orderType: 'appointment',
      };

      const patientResponse = await dispatch(AddPatients({ ...patientData, patientId: Date.now() }));
      const bookingData = { ...patientData, patientID: patientResponse.id };
      await dispatch(CreateBooking(bookingData));
      
      fetchBookedAppointments(commonData.doctorName, appointmentData.date);
      setLoading(false);
      
      toast.success("Appointment booked successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      
      // Clear only appointment data, keep patient info and tests
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

  const HandleTestOrderSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (commonData.gender === "") {
      return toast.error("Please fill all the required fields", {
        position: "top-right",
        autoClose: 3000,
      });
    }
    
    if (!testData.date) {
      return toast.error("Please select a date for the test order", {
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

    // Test orders processing
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

    const testAmount = testsWithPrices.reduce((sum, test) => sum + test.testPrice, 0);

    setLoading(true);
    try {
      // For test fees: Doctor gets commission percentage, hospital gets rest
      const selectedDoctor = doctorsList.find(doc => doc.docName === commonData.doctorName);
      const doctorTestCommissionRate = customDoctorCommission !== null 
        ? customDoctorCommission / 100 
        : (selectedDoctor ? selectedDoctor.testReferralCommission / 100 : 0);
      const testDoctorRevenue = commonData.doctorName ? testAmount * doctorTestCommissionRate : 0;
      const testHospitalRevenue = testAmount - testDoctorRevenue;

      const patientData = {
        ...commonData,
        date: testData.date,
        time: testData.time,
        tests: testsWithPrices,
        totalAmount: finalTotal,
        paidAmount: paidAmount,
        dueAmount: dueAmount,
        hospitalRevenue: testHospitalRevenue,
        doctorRevenue: testDoctorRevenue,
        brokerRevenue: 0,
        orderType: 'test',
      };

      const patientResponse = await dispatch(AddPatients({ ...patientData, patientId: Date.now() }));

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
      
      toast.success("Test order created successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      
      // Clear only test selection, keep patient info and appointment
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

  const HandleCombinedSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (commonData.gender === "") {
      return toast.error("Please fill all the required fields", {
        position: "top-right",
        autoClose: 3000,
      });
    }
    
    if (!appointmentData.time) {
      return toast.error("Please select an appointment time", {
        position: "top-right",
        autoClose: 3000,
      });
    }

    if (!testData.date) {
      return toast.error("Please select a date for the test order", {
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

    setLoading(true);
    try {
      // First submit appointment
      const selectedDoctor = doctorsList.find(doc => doc.docName === commonData.doctorName);
      const selectedBroker = brokers.find(b => (b.name || b.docName) === commonData.brokerName);
      
      // Doctor gets full appointment fee from their profile
      const appointmentDoctorRevenue = appointmentData.doctorFee;
      
      // Broker gets their percentage from doctor's appointment fee only
      const brokerCommissionRate = customBrokerCommission !== null 
        ? customBrokerCommission / 100 
        : (selectedBroker ? selectedBroker.commissionRate / 100 : 0);
      const appointmentBrokerRevenue = commonData.brokerName ? appointmentData.doctorFee * brokerCommissionRate : 0;
      
      // Hospital gets nothing from appointment fees (doctor gets full fee, broker gets commission from doctor's fee)
      const appointmentHospitalRevenue = 0;
      
      const appointmentPatientData = {
        ...commonData,
        ...appointmentData,
        tests: [{ testName: "Doctor Fee", testPrice: appointmentData.doctorFee }],
        totalAmount: finalTotal,
        paidAmount: paidAmount,
        dueAmount: dueAmount,
        hospitalRevenue: appointmentHospitalRevenue,
        doctorRevenue: appointmentDoctorRevenue,
        brokerRevenue: appointmentBrokerRevenue,
        orderType: 'appointment',
      };

      const appointmentPatientResponse = await dispatch(AddPatients({ ...appointmentPatientData, patientId: Date.now() }));
      const bookingData = { ...appointmentPatientData, patientID: appointmentPatientResponse.id };
      await dispatch(CreateBooking(bookingData));

      // Then submit test order
      const testsWithPrices = selectedTests
        .filter(test => test.testId !== "")
        .map(test => {
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

      const testAmount = testsWithPrices.reduce((sum, test) => sum + test.testPrice, 0);
      
      // For test fees: Doctor gets commission percentage, hospital gets rest
      const doctorTestCommissionRate = customDoctorCommission !== null 
        ? customDoctorCommission / 100 
        : (selectedDoctor ? selectedDoctor.testReferralCommission / 100 : 0);
      const testDoctorRevenue = commonData.doctorName ? testAmount * doctorTestCommissionRate : 0;
      const testHospitalRevenue = testAmount - testDoctorRevenue;
      
      const testPatientData = {
        ...commonData,
        date: testData.date,
        time: testData.time,
        tests: testsWithPrices,
        totalAmount: finalTotal,
        paidAmount: paidAmount,
        dueAmount: dueAmount,
        hospitalRevenue: testHospitalRevenue,
        doctorRevenue: testDoctorRevenue,
        brokerRevenue: 0,
        orderType: 'test',
      };

      const testPatientResponse = await dispatch(AddPatients({ ...testPatientData, patientId: Date.now() + 1 }));
      const testOrderData = { ...testPatientData, patientID: testPatientResponse.id };
      const response = await axios.post("https://medi-plus-diagnostic-center-bdbv.vercel.app/testorders", testOrderData);
      
      fetchBookedAppointments(commonData.doctorName, appointmentData.date);
      setLoading(false);
      
      // Store the created order for printing
      setLastCreatedOrder({
        ...testOrderData,
        _id: response.data._id || Date.now().toString()
      });
      
      // Show print modal
      setShowPrintModal(true);
      
      toast.success("Both appointment and test order created successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      
      // Reset form after combined submission
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

  return (
    <div>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar onCollapse={setSidebarCollapsed} />
        <div className={`flex-1 p-6 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-0'}`}>
          <div className="flex-1 p-6 ml-40">
            <div>
              {/* Header */}
              <Card className="mb-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                    <Calendar className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Medical Services Booking</h1>
                    <p className="text-gray-600">Complete appointment booking and test ordering in one place</p>
                  </div>
                </div>
              </Card>

              {/* Step Indicator */}
              <Card className="mb-6 shadow-lg border border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    {[1, 2, 3].map((step) => (
                      <div key={step} className="flex items-center">
                        <div
                          onClick={() => goToStep(step)}
                          className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 transform shadow-md ${
                            currentStep === step
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white scale-110 shadow-lg'
                              : currentStep > step
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:scale-105'
                              : 'bg-white text-gray-500 border-2 border-gray-200 hover:border-gray-300 hover:scale-105'
                          }`}
                        >
                          <span className="font-semibold">
                            {currentStep > step ? '✓' : step}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className={`text-sm font-semibold transition-all duration-200 ${
                            currentStep === step ? 'text-blue-700' : currentStep > step ? 'text-green-700' : 'text-gray-500'
                          }`}>
                            {step === 1 && 'Doctor Appointment'}
                            {step === 2 && 'Test Selection'}
                            {step === 3 && 'Financial Summary'}
                          </div>
                          <div className={`text-xs transition-all duration-200 ${
                            currentStep === step ? 'text-blue-600' : currentStep > step ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            {step === 1 && 'Patient & Doctor Info'}
                            {step === 2 && 'Choose Tests'}
                            {step === 3 && 'Review & Submit'}
                          </div>
                        </div>
                        {step < 3 && (
                          <div className={`w-20 h-1 ml-6 rounded-full transition-all duration-300 ${
                            currentStep > step ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gray-200'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <form onSubmit={(e) => e.preventDefault()}>
                {/* Step 1: Doctor Appointment */}
                {currentStep === 1 && (
                  <>
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                          <AddressAutocomplete
                            value={commonData.address}
                            onChange={(value) => setCommonData(prev => ({ ...prev, address: value }))}
                            placeholder="Start typing your address in Bangladesh..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <Input
                            prefix={<Mail className="w-4 h-4 text-gray-400" />}
                            type="email"
                            placeholder="abc@gmail.com"
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Name *</label>
                          <Select
                            name="doctorName"
                            value={commonData.doctorName}
                            onChange={handleDoctorChange}
                            disabled={loadingDoctors}
                            required
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
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Broker Name</label>
                          <Select
                            name="brokerName"
                            value={commonData.brokerName}
                            onChange={handleBrokerChange}
                            disabled={loadingBrokers}
                            className="w-full"
                            placeholder={loadingBrokers ? "Loading brokers..." : "Select Broker"}
                          >
                            <Option value="">{loadingBrokers ? "Loading brokers..." : "Select Broker"}</Option>
                            {brokers.map((broker) => (
                              <Option key={broker._id} value={broker.name || broker.docName}>
                                {broker.name || broker.docName}
                              </Option>
                            ))}
                          </Select>
                        </div>
                      </div>
                    </Card>

                    <Card className="mb-6 shadow-sm border border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Schedule Information</h3>
                        <span className="text-sm text-gray-500 ml-2">(Date required for all services)</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                          <Input
                            type="date"
                            name="date"
                            value={appointmentData.date}
                            onChange={handleModeSpecificChange}
                            required
                            className="border-gray-200 focus:ring-indigo-500"
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Time 
                          </label>
                          <Select
                            name="time"
                            value={appointmentData.time}
                            onChange={(value) => setAppointmentData(prev => ({ ...prev, time: value }))}
                            className="w-full"
                            placeholder={!commonData.doctorName || !appointmentData.date ? "Select doctor and date first" : "Select available time (optional for tests)"}
                            disabled={!commonData.doctorName || !appointmentData.date}
                          >
                            <Option value="">{!commonData.doctorName || !appointmentData.date ? "Select doctor and date first" : "Select available time (optional for tests)"}</Option>
                            {availableTimeSlots.map((slot) => (
                              <Option key={slot} value={slot}>{slot}</Option>
                            ))}
                          </Select>
                        </div>
                      </div>
                      
                      {commonData.doctorName && (
                        <div className="mt-4 bg-purple-50 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700">Doctor Consultation Fee:</span>
                            <span className="font-medium text-purple-700">৳{appointmentData.doctorFee || 0}</span>
                          </div>
                        </div>
                      )}
                    </Card>
                  </>
                )}

                {/* Step 2: Test Selection */}
                {currentStep === 2 && (
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

                    {/* Test Schedule Information - Moved to end */}
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
                              Test Time <span className="text-gray-500">(Optional)</span>
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
                )}

                {/* Step 3: Financial Summary */}
                {currentStep === 3 && (
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
                                          setIsFeeManuallyEdited(true); // Mark fee as manually edited
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
                                          // Reset appointment commission when broker commission changes
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
                    
                    {/* Combined Submit Option */}
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
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center">
                  <div>
                    {currentStep > 1 && (
                      <Button
                        type="default"
                        onClick={prevStep}
                        className="flex items-center gap-3 px-6 py-3 font-medium rounded-xl shadow-md transition-all duration-300 bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:shadow-lg"
                        size="large"
                      >
                        <ChevronLeft className="w-5 h-5" />
                        <span className="text-base">Back</span>
                      </Button>
                    )}
                  </div>
                  
                  <div>
                    {currentStep < 3 && (
                      <Button
                        type="primary"
                        onClick={nextStep}
                        disabled={!canProceedToNextStep()}
                        title={!canProceedToNextStep() ? 'Please fill all required fields' : ''}
                        className={`flex items-center gap-3 px-8 py-3 font-semibold rounded-xl shadow-lg transition-all duration-300 transform ${
                          canProceedToNextStep() 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:scale-105 hover:shadow-xl' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        size="large"
                      >
                        <span className="text-base">
                          {currentStep === 1 ? 'Continue to Test Selection' : 'Review & Submit'}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-sm opacity-80">
                            Step {currentStep + 1}/3
                          </span>
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
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