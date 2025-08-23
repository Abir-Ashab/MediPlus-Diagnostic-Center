import React, { useState, useEffect } from "react";
import { TestsList } from "./MixedObjectData";
import { useDispatch } from "react-redux";
import { AddPatients, CreateBooking } from "../../../../../Redux/Datas/action";
import { usePrintReport } from "../../../../../Components/PrintReport";
import PrintSuccessModal from "../../../../../Components/PrintSuccessModal";
import Sidebar from "../../GlobalFiles/Sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Button, Card } from "antd";
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

import PatientAndAppointmentForm from "../../../../../Components/Appoinment/PatientAndAppointmentForm";
import TestSelectionForm from "../../../../../Components/Appoinment/TestSelectionForm";
import FinancialSummaryForm from "../../../../../Components/Appoinment/FinancialSummaryForm";

const Book_Appointment = () => {
  const dispatch = useDispatch();
  const { printReport } = usePrintReport();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [doctors, setDoctors] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [bookedAppointments, setBookedAppointments] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [lastCreatedOrder, setLastCreatedOrder] = useState(null);
  const [existingPatientID, setExistingPatientID] = useState(null);
  const [previousDue, setPreviousDue] = useState(0);

  const [commonData, setCommonData] = useState({
    patientName: "",
    age: "",
    gender: "",
    mobile: "",
    address: "",
    email: "",
    doctorName: "",
    agentName: "",
  });

  const [appointmentData, setAppointmentData] = useState({
    date: "",
    time: "",
  });

  const [testData, setTestData] = useState({
    date: "",
    time: "",
  });

  const [selectedTests, setSelectedTests] = useState([{ id: Date.now(), testId: "", customPrice: null }]);
  const [baseTotal, setBaseTotal] = useState(0);
  const [vatRate, setVatRate] = useState(0); 
  const [vatAmount, setVatAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [useManualTotal, setUseManualTotal] = useState(false);
  const [manualTotal, setManualTotal] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [testsList, setTestsList] = useState([]);

  const finalTotal = useManualTotal ? manualTotal : (baseTotal - discountAmount);
  // Allow paidAmount up to (finalTotal + previousDue), due is (finalTotal + previousDue - paidAmount)
  const dueAmount = finalTotal + previousDue - paidAmount;

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
    const fetchAgents = async () => {
      try {
        setLoadingAgents(true);
        const response = await axios.get("https://medi-plus-diagnostic-center-bdbv.vercel.app/agents");
        setAgents(response.data);
        setLoadingAgents(false);
      } catch (error) {
        console.error("Error fetching agents:", error);
        toast.error("⚠️ Failed to load agents. Please refresh the page and try again.", {
          position: "top-right",
          autoClose: 4000,
        });
        setLoadingAgents(false);
      }
    };
    fetchAgents();
  }, []);

  useEffect(() => {
    const fetchPatientData = async () => {
      if (commonData.mobile.length === 11) {
        try {
          const response = await axios.get(`https://medi-plus-diagnostic-center-bdbv.vercel.app/testorders?mobile=${commonData.mobile}`);
          const prevOrders = response.data;
          if (prevOrders.length > 0) {
            prevOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            const latest = prevOrders[0];
            setCommonData(prev => ({
              ...prev,
              patientName: latest.patientName,
              age: latest.age,
              gender: latest.gender,
              email: latest.email || "",
              address: latest.address || "",
            }));
            // Use patientID if available, otherwise fallback to _id
            setExistingPatientID(latest.patientID || latest._id);
            // Only sum due for orders with matching mobile
            const totalPrevDue = prevOrders.reduce((sum, order) => {
              return order.mobile === commonData.mobile ? sum + (order.dueAmount || 0) : sum;
            }, 0);
            setPreviousDue(totalPrevDue);
          } else {
            setExistingPatientID(null);
            setPreviousDue(0);
          }
        } catch (error) {
          console.error("Error fetching patient data:", error);
        }
      }
    };
    fetchPatientData();
  }, [commonData.mobile]);

  // Calculate base total and apply VAT
  useEffect(() => {
    const base = selectedTests.reduce((sum, test) => {
      if (!test.testId) return sum;
      
      if (test.customPrice !== null && test.customPrice !== undefined) {
        return sum + test.customPrice;
      }
      
      const selectedTest = testsList.find(t => t.testId === parseInt(test.testId)) || 
                         TestsList.find(t => t.id === parseInt(test.testId));
      return sum + (selectedTest ? selectedTest.price : 0);
    }, 0);
    
    setBaseTotal(base);
    
    // Calculate VAT amount
    // const vat = (base * vatRate) / 100;
    // setVatAmount(vat);
    
    // Set manual total if not manually overridden
    if (!useManualTotal) {
      setManualTotal(base - discountAmount);
    }
  }, [selectedTests, testsList, useManualTotal, vatRate, discountAmount]);

  const handleCommonDataChange = (e) => {
    const { name, value } = e.target;
    setCommonData(prev => ({ ...prev, [name]: value }));
    if (name === 'doctorName') {
      setAppointmentData(prev => ({ ...prev, time: "" }));
    }
  };

  const handleDoctorChange = (value) => {
    setCommonData(prev => ({ ...prev, doctorName: value }));
  };

  const handleAgentChange = (value) => {
    setCommonData(prev => ({ ...prev, agentName: value }));
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
    const testToDeselect = selectedTests.find(test => test.id === id);
    let testName = "Test";
    
    if (testToDeselect && testToDeselect.testId) {
      const selectedTest = testsList.find(t => t.testId === parseInt(testToDeselect.testId));
      if (selectedTest) {
        testName = selectedTest.title;
      }
    }
    
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

  const addMoreTest = () => {
    const newTest = { id: Date.now(), testId: "", customPrice: null };
    setSelectedTests(prev => [...prev, newTest]);
  };

  const selectTestDirectly = (testId) => {
    const isAlreadySelected = selectedTests.some(test => test.testId === testId.toString());
    if (isAlreadySelected) return;

    const emptySlot = selectedTests.find(slot => !slot.testId || slot.testId === '');
    if (emptySlot) {
      handleTestSelect(emptySlot.id, testId.toString());
    } else {
      const newTest = { id: Date.now(), testId: testId.toString(), customPrice: null };
      setSelectedTests(prev => [...prev, newTest]);
    }
  };

  const clearAllTests = () => {
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
    setAppointmentData({ date: "", time: "" });
    setTestData({ date: "", time: "" });
    setSelectedTests([{ id: Date.now(), testId: "", customPrice: null }]);
    setCurrentStep(1);
    setUseManualTotal(false);
    setManualTotal(0);
    setPaidAmount(0);
    setDiscountAmount(0);
    setVatRate(0);
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

  const canProceedToNextStep = () => {
    if (currentStep === 1) {
      return (
        commonData.patientName &&
        commonData.age &&
        commonData.gender &&
        commonData.mobile &&
        appointmentData.date
      );
    }
    if (currentStep === 2) {
      const hasSelectedTest = selectedTests.some(test => test.testId !== "");
      if (hasSelectedTest && !testData.date) {
        return false;
      }
      return true;
    }
    return true;
  };

  const HandleTestOrderSubmit = async (e) => {
    e.preventDefault();
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
    setLoading(true);
    try {
      const patientInfo = {
        patientName: commonData.patientName,
        age: commonData.age,
        gender: commonData.gender,
        mobile: commonData.mobile,
        email: commonData.email,
        address: commonData.address,
      };
      let patientID;
      if (existingPatientID) {
        patientID = existingPatientID;
      } else {
        // Create patient and use backend-generated _id
        const patientResponse = await dispatch(AddPatients({...patientInfo}));
        // Try to get _id from different possible locations
        console.log("Patient Response:", patientResponse);

        patientID = patientResponse?._id || patientResponse?.data?._id || patientResponse?.id;
      }
      if (!patientID) {
        setLoading(false);
        toast.error("Could not determine patient ID after patient creation.", {
          position: "top-right",
          autoClose: 4000,
        });
        return;
      }
      const testOrderData = {
        ...commonData,
        date: testData.date,
        time: testData.time,
        tests: testsWithPrices,
        baseAmount: baseTotal,
        discountAmount: discountAmount,
        totalAmount: finalTotal,
        paidAmount: paidAmount,
        orderType: 'test',
        patientID,
      };

      const response = await axios.post("https://medi-plus-diagnostic-center-bdbv.vercel.app/testorders", testOrderData);

      // Use the correct patientID for pay-due endpoint
      if (paidAmount > finalTotal) {
        const payPrevDue = paidAmount - finalTotal;
        try {
          await axios.patch(`https://medi-plus-diagnostic-center-bdbv.vercel.app/testorders/patients/pay-due`, {
            mobile: commonData.mobile,
            paymentAmount: payPrevDue
          });
        } catch (err) {
          toast.warn("Paid for previous due, but could not update all previous orders.");
        }
      }
      setLoading(false);
      setLastCreatedOrder({
        ...testOrderData,
        _id: response.data._id || Date.now().toString()
      });
      setShowPrintModal(true);
      toast.success("Test order created successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
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
    const currentData = { ...commonData, ...appointmentData };
    if (currentData.doctorName && currentData.date) {
      fetchBookedAppointments(currentData.doctorName, currentData.date);
    }
  }, [commonData.doctorName, appointmentData.date]);

  return (
    <div>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar onCollapse={setSidebarCollapsed} />
        <div className={`flex-1 p-6 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-0'}`}>
          <div className="flex-1 p-6 ml-40">
            <div>
              <Card className="mb-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                    <Calendar className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Medical Services Booking</h1>
                    <p className="text-gray-600">Complete test ordering in one place</p>
                  </div>
                </div>
              </Card>
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
                            {step === 1 && 'Patient Information'}
                            {step === 2 && 'Test Selection'}
                            {step === 3 && 'Financial Summary'}
                          </div>
                          <div className={`text-xs transition-all duration-200 ${
                            currentStep === step ? 'text-blue-600' : currentStep > step ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            {step === 1 && 'Patient & Reference Info'}
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
                {currentStep === 1 && (
                  <PatientAndAppointmentForm
                    commonData={commonData}
                    appointmentData={appointmentData}
                    doctors={doctors}
                    agents={agents}
                    availableTimeSlots={availableTimeSlots}
                    loadingDoctors={loadingDoctors}
                    loadingAgents={loadingAgents}
                    handleCommonDataChange={handleCommonDataChange}
                    handleDoctorChange={handleDoctorChange}
                    handleAgentChange={handleAgentChange}
                    handleModeSpecificChange={handleModeSpecificChange}
                    setCommonData={setCommonData}
                    setAppointmentData={setAppointmentData}
                  />
                )}

                {currentStep === 2 && (
                  <TestSelectionForm
                    selectedTests={selectedTests}
                    testData={testData}
                    setTestData={setTestData}
                    testsList={testsList}
                    handleTestSelect={handleTestSelect}
                    deselectTest={deselectTest}
                    clearAllTests={clearAllTests}
                    selectTestDirectly={selectTestDirectly}
                    addMoreTest={addMoreTest}
                    removeTest={removeTest}
                    handleTestDataChange={handleTestDataChange}
                    handleTestPriceChange={handleTestPriceChange}
                    updateTestPrice={updateTestPrice}
                  />
                )}

                {currentStep === 3 && (
                  <FinancialSummaryForm
                    commonData={commonData}
                    testData={testData}
                    selectedTests={selectedTests}
                    testsList={testsList}
                    baseTotal={baseTotal}
                    // vatRate={vatRate}
                    // vatAmount={vatAmount}
                    discountAmount={discountAmount}
                    finalTotal={finalTotal}
                    paidAmount={paidAmount}
                    dueAmount={dueAmount}
                    useManualTotal={useManualTotal}
                    manualTotal={manualTotal}
                    loading={loading}
                    setUseManualTotal={setUseManualTotal}
                    setManualTotal={setManualTotal}
                    setPaidAmount={setPaidAmount}
                    // setVatRate={setVatRate}
                    setDiscountAmount={setDiscountAmount}
                    HandleTestOrderSubmit={HandleTestOrderSubmit}
                    deselectTest={deselectTest}
                    previousDue={previousDue}
                  />
                )}

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
