# Diagnostic Center Management System 

## 1. Workflow / Business Logic

This system facilitates a streamlined process for patient consultation, test billing, and commission distribution among the hospital, doctor, and broker.

### Step-by-Step Flow:

- **Doctor Consultation:**
  - A patient consults a doctor.
  - The doctor manually prescribes necessary medical tests.

- **Manager/Test Department:**
  - The patient visits the manager.
  - The manager inputs the prescribed tests.
  - A bill is generated based on the selected tests.

- **Billing & Receipt Generation:**
  - The system creates a receipt that includes:
    - **Patient Name**
    - **Doctor Name**
    - **Test Names** (selected from dropdown)
    - **Total Amount** calculated as: `X% (Hospital) + Y% (Doctor) + Z% (Broker)`
  - This breakdown is credited to respective profiles:
    - Hospital receives **X%**
    - Doctor receives **Y%**
    - Broker (if involved) receives **Z%**

---

## 2. User Roles and Features

### Admin (User Type 1)
- Can create and manage manager accounts.
- Has access to system summaries.
- Can view all billing records across the system.

### Manager (User Type 2)
- Can create broker and doctor profiles.
- Registers new patients and assigns them to doctors.
- Selects a broker if the patient was referred.
- Inputs prescribed tests and generates bills.
- Can view billing history and search by:
  - Patient name
  - Doctor name
  - Date of billing

---

## 3. Profiles (Non-user Entities)

### Doctor Profile
- Displays a list of patients consulted by the doctor.
- Shows total earnings from their share in all bills.

### Broker Profile
- Displays a list of patients referred by the broker.
- Shows total commission earned from referrals.

### Hospital Profile
- Shows total earnings from hospital share in all generated bills.
- Displays overall aggregated revenue for administrative insight.


##  Project Setup Instructions

Follow these steps to run the project locally:

#### Frontend Setup

```bash
cd frontend
npm install
npm start
```

#### Backend Setup

```bash
cd backend
npm install
npm start
```

### Credentials

**Admin**
- Id: 1315
- Password: iit12345

**Manager**
- Id: 1746114110168
- Password: 1234

