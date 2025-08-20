import React from "react";
import { Input, Select, Card } from "antd";
import { User, Calendar, Heart, Phone, MapPin, Mail } from 'lucide-react';
import AddressAutocomplete from "../AddressAutocomplete";

const { Option } = Select;

const PatientAndAppointmentForm = ({
  commonData,
  appointmentData,
  doctors,
  brokers,
  availableTimeSlots,
  loadingDoctors,
  loadingBrokers,
  handleCommonDataChange,
  handleDoctorChange,
  handleBrokerChange,
  handleModeSpecificChange,
  setCommonData,
  setAppointmentData
}) => {
  React.useEffect(() => {
    if (!appointmentData.date) {
      setAppointmentData(prev => ({ ...prev, date: new Date().toISOString().split('T')[0] }));
    }
  }, [appointmentData.date, setAppointmentData]);
  return (
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
    </>
  );
};

export default PatientAndAppointmentForm;
