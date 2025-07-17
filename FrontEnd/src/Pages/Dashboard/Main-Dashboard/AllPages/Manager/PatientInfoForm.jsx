// src/components/PatientInfoForm.js
import React from "react";

const PatientInfoForm = ({ formData, handleChange, CommonProblem }) => {
  return (
    <>
      {/* Name PlaceHolder */}
      <div>
        <label>Patient Name</label>
        <div className="inputdiv">
          <input
            type="text"
            placeholder="First Name"
            name="patientName"
            value={formData.patientName}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      {/* AGE PLACEHOLDER  */}
      <div>
        <label>Age</label>
        <div className="inputdiv">
          <input
            type="number"
            placeholder="Age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      {/* GENDER PLACEHOLDER  */}
      <div>
        <label>Gender</label>
        <div className="inputdiv">
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      {/* MOBILE PLACEHOLDER */}
      <div>
        <label>Contact Number</label>
        <div className="inputdiv">
          <input
            type="number"
            placeholder="Number"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div>
        <label>Email</label>
        <div className="inputdiv">
          <input
            type="email"
            placeholder="example@email.com"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      {/* PROBLEM PLACEHOLDER */}
      <div>
        <label>Type of Disease</label>
        <div className="inputdiv">
          <select
            name="disease"
            value={formData.disease}
            onChange={handleChange}
            required
          >
            <option value="">Select Disease</option>
            {CommonProblem.map((ele, i) => {
              return (
                <option key={i} value={ele.title}>
                  {ele.title}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* ADDRESS SECTION  */}
      <div>
        <label>Address</label>
        <div className="inputdiv">
          <input
            type="text"
            placeholder="Address line 1"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>
      </div>
    </>
  );
};

export default PatientInfoForm;