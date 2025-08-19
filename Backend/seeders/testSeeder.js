const mongoose = require("mongoose");
const TestModel = require("../models/Test.model");
const TestCategoryModel = require("../models/TestCategory.model");

// Test Categories Data
const testCategories = [
  { categoryId: "HISTOPATHOLOGY", categoryName: "Histopathology & Cytopathology" },
  { categoryId: "XRAY", categoryName: "X-Ray (Digital)" },
  { categoryId: "OTHERS", categoryName: "Others" },
  { categoryId: "ULTRASOUND", categoryName: "Ultrasound Imaging" },
  { categoryId: "VACCINATION", categoryName: "Vaccination" },
  { categoryId: "CARDIAC", categoryName: "Cardiac Imaging" },
  { categoryId: "HAEMATOLOGY", categoryName: "Haematology" },
  { categoryId: "IMMUNOLOGY", categoryName: "Immunology/Serology" },
  { categoryId: "CANCER_MARKER", categoryName: "Cancer Marker" },
  { categoryId: "BIOCHEMICAL", categoryName: "Biochemical Exam" },
  { categoryId: "MICROBIOLOGY", categoryName: "Microbiology" },
  { categoryId: "HEPATITIS", categoryName: "Hepatitis Profile" },
  { categoryId: "URINE", categoryName: "Urine" },
  { categoryId: "HORMONE", categoryName: "Hormone Test" },
  { categoryId: "CARDIOLOGY", categoryName: "Cardiology" },
  { categoryId: "STOOL", categoryName: "Stool" }
];

// Default commission percentages by category
const commissionPercentages = {
  VACCINATION: 20,
  HORMONE: 20,
  HISTOPATHOLOGY: 50,
  XRAY: 30,
  CARDIAC: 30, // For ECG and Echo
  ULTRASOUND: 20,
  OTHERS: 50,
  HAEMATOLOGY: 50,
  IMMUNOLOGY: 0, // Maps to Less
  CANCER_MARKER: 0, // Maps to Less
  BIOCHEMICAL: 0, // Maps to Less
  MICROBIOLOGY: 0, // Maps to Less
  HEPATITIS: 0, // Maps to Less
  URINE: 0, // Maps to Less
  CARDIOLOGY: 0, // Maps to Less
  STOOL: 0 // Maps to Less
};

// Tests Data
const testsData = [
  // HISTOPATHOLOGY & CYTOPATHOLOGY (Path: 50%)
  { testId: 1, title: "Histopathology", price: 2500, category: "HISTOPATHOLOGY", doctorCommissionPercentage: 50 },
  { testId: 2, title: "FNAC", price: 2000, category: "HISTOPATHOLOGY", doctorCommissionPercentage: 50 },
  { testId: 3, title: "Pap's Smear for Cytology", price: 1800, category: "HISTOPATHOLOGY", doctorCommissionPercentage: 50 },
  { testId: 4, title: "Sputum for Malignant Cell", price: 1500, category: "HISTOPATHOLOGY", doctorCommissionPercentage: 50 },
  { testId: 5, title: "Discharge fluid for Malignant Cell", price: 1600, category: "HISTOPATHOLOGY", doctorCommissionPercentage: 50 },
  { testId: 6, title: "Ba-Swallow of Oesophagus", price: 3500, category: "HISTOPATHOLOGY", doctorCommissionPercentage: 50 },
  { testId: 7, title: "Ba-enema double contrast", price: 4000, category: "HISTOPATHOLOGY", doctorCommissionPercentage: 50 },
  { testId: 8, title: "Ba-Meal", price: 3000, category: "HISTOPATHOLOGY", doctorCommissionPercentage: 50 },
  { testId: 9, title: "Ba-follow Through", price: 3200, category: "HISTOPATHOLOGY", doctorCommissionPercentage: 50 },
  { testId: 10, title: "Oral Cholecystography (OCG)", price: 2800, category: "HISTOPATHOLOGY", doctorCommissionPercentage: 50 },
  { testId: 11, title: "IVU with post mict. film", price: 4500, category: "HISTOPATHOLOGY", doctorCommissionPercentage: 50 },
  { testId: 12, title: "Retrograde Cystourethrogram", price: 3800, category: "HISTOPATHOLOGY", doctorCommissionPercentage: 50 },
  { testId: 13, title: "OPG", price: 1200, category: "HISTOPATHOLOGY", doctorCommissionPercentage: 50 },

  // X-RAY (DIGITAL) (X-Ray: 30%)
  { testId: 14, title: "Chest P/A View", price: 800, category: "XRAY", doctorCommissionPercentage: 30 },
  { testId: 15, title: "Rt Lat.", price: 900, category: "XRAY", doctorCommissionPercentage: 30 },
  { testId: 16, title: "Lt Lat.", price: 900, category: "XRAY", doctorCommissionPercentage: 30 },
  { testId: 17, title: "KUB", price: 1000, category: "XRAY", doctorCommissionPercentage: 30 },
  { testId: 18, title: "Plain X-Ray Abdomen", price: 1200, category: "XRAY", doctorCommissionPercentage: 30 },
  { testId: 19, title: "Skull B/V", price: 1500, category: "XRAY", doctorCommissionPercentage: 30 },
  { testId: 20, title: "P.N.S. (O.M View)", price: 1200, category: "XRAY", doctorCommissionPercentage: 30 },
  { testId: 21, title: "Cervical Spine B/V", price: 1800, category: "XRAY", doctorCommissionPercentage: 30 },
  { testId: 22, title: "Lumbo-Dorsal Spine B/V", price: 2000, category: "XRAY", doctorCommissionPercentage: 30 },
  { testId: 23, title: "Lumbo-Sacral Spine B/V", price: 2000, category: "XRAY", doctorCommissionPercentage: 30 },
  { testId: 24, title: "Ba-Meal of Stomach and Duodenum", price: 3500, category: "XRAY", doctorCommissionPercentage: 30 },
  { testId: 25, title: "Thoracic spine B/V", price: 1800, category: "XRAY", doctorCommissionPercentage: 30 },

  // OTHERS (Path: 50%)
  { testId: 26, title: "Tuberculin Test / MT", price: 500, category: "OTHERS", doctorCommissionPercentage: 50 },
  { testId: 27, title: "Semen Analysis", price: 800, category: "OTHERS", doctorCommissionPercentage: 50 },
  { testId: 28, title: "Hb Electrophoresis", price: 2500, category: "OTHERS", doctorCommissionPercentage: 50 },
  { testId: 29, title: "Protein Electrophoresis", price: 2800, category: "OTHERS", doctorCommissionPercentage: 50 },
  { testId: 30, title: "HbA1C", price: 1200, category: "OTHERS", doctorCommissionPercentage: 50 },
  { testId: 31, title: "HIV (1+2)", price: 1500, category: "OTHERS", doctorCommissionPercentage: 50 },
  { testId: 32, title: "Skin/Nail Scraping for Fungus", price: 600, category: "OTHERS", doctorCommissionPercentage: 50 },
  { testId: 33, title: "AFB", price: 400, category: "OTHERS", doctorCommissionPercentage: 50 },

  // ULTRASOUND IMAGING (USG: 20%)
  { testId: 34, title: "Whole Abdomen & Pelvic Organs", price: 2500, category: "ULTRASOUND", doctorCommissionPercentage: 20 },
  { testId: 35, title: "HBS / Upper Abdomen", price: 2000, category: "ULTRASOUND", doctorCommissionPercentage: 20 },
  { testId: 36, title: "Lower Abdomen / Uterus & Adnexa", price: 1800, category: "ULTRASOUND", doctorCommissionPercentage: 20 },
  { testId: 37, title: "Pregnancy Profile", price: 2200, category: "ULTRASOUND", doctorCommissionPercentage: 20 },
  { testId: 38, title: "KUB / Genito-Urinary Tract", price: 2000, category: "ULTRASOUND", doctorCommissionPercentage: 20 },
  { testId: 39, title: "KUB with Prostate & Residual Volume (PVR)", price: 2500, category: "ULTRASOUND", doctorCommissionPercentage: 20 },
  { testId: 40, title: "Thyroid", price: 1500, category: "ULTRASOUND", doctorCommissionPercentage: 20 },
  { testId: 41, title: "Brain", price: 3000, category: "ULTRASOUND", doctorCommissionPercentage: 20 },
  { testId: 42, title: "Breasts", price: 1800, category: "ULTRASOUND", doctorCommissionPercentage: 20 },
  { testId: 43, title: "Scrotum/Testes", price: 1600, category: "ULTRASOUND", doctorCommissionPercentage: 20 },
  { testId: 44, title: "Soft Tissue", price: 1200, category: "ULTRASOUND", doctorCommissionPercentage: 20 },

  // VACCINATION (Vaccine: 20%)
  { testId: 45, title: "Hepatitis B Vaccine", price: 800, category: "VACCINATION", doctorCommissionPercentage: 20 },
  { testId: 46, title: "Hepatitis A Vaccine", price: 1200, category: "VACCINATION", doctorCommissionPercentage: 20 },
  { testId: 47, title: "Chickenpox", price: 2500, category: "VACCINATION", doctorCommissionPercentage: 20 },
  { testId: 48, title: "Typhoid", price: 600, category: "VACCINATION", doctorCommissionPercentage: 20 },

  // CARDIAC IMAGING (ECG: 30%, Echo: 20%)
  { testId: 49, title: "E.C.G", price: 500, category: "CARDIAC", doctorCommissionPercentage: 30 },
  { testId: 50, title: "E.T.T-Stress E.C.G", price: 2500, category: "CARDIAC", doctorCommissionPercentage: 30 },
  { testId: 51, title: "ECHOCARDIOGRAM-2D & M-MODE", price: 3500, category: "CARDIAC", doctorCommissionPercentage: 20 },
  { testId: 52, title: "Video Endoscopy", price: 8000, category: "CARDIAC", doctorCommissionPercentage: 20 },

  // HAEMATOLOGY (Path: 50%)
  { testId: 53, title: "TC,DC,Hb%ESR", price: 400, category: "HAEMATOLOGY", doctorCommissionPercentage: 50 },
  { testId: 54, title: "MP", price: 300, category: "HAEMATOLOGY", doctorCommissionPercentage: 50 },
  { testId: 55, title: "CC Count", price: 250, category: "HAEMATOLOGY", doctorCommissionPercentage: 50 },
  { testId: 56, title: "LE Cell", price: 800, category: "HAEMATOLOGY", doctorCommissionPercentage: 50 },
  { testId: 57, title: "Platelet Count", price: 300, category: "HAEMATOLOGY", doctorCommissionPercentage: 50 },
  { testId: 58, title: "BT,CT", price: 400, category: "HAEMATOLOGY", doctorCommissionPercentage: 50 },
  { testId: 59, title: "Prothrombin Time", price: 600, category: "HAEMATOLOGY", doctorCommissionPercentage: 50 },
  { testId: 60, title: "APTT", price: 700, category: "HAEMATOLOGY", doctorCommissionPercentage: 50 },
  { testId: 61, title: "Reticulocyte Count", price: 500, category: "HAEMATOLOGY", doctorCommissionPercentage: 50 },
  { testId: 62, title: "HCT/PCV", price: 300, category: "HAEMATOLOGY", doctorCommissionPercentage: 50 },
  { testId: 63, title: "Blood Film", price: 400, category: "HAEMATOLOGY", doctorCommissionPercentage: 50 },

  // IMMUNOLOGY/SEROLOGY (Less: 0%)
  { testId: 64, title: "Widal Test", price: 400, category: "IMMUNOLOGY", doctorCommissionPercentage: 0 },
  { testId: 65, title: "ASO Titer", price: 600, category: "IMMUNOLOGY", doctorCommissionPercentage: 0 },
  { testId: 66, title: "Febrile Antigen", price: 800, category: "IMMUNOLOGY", doctorCommissionPercentage: 0 },
  { testId: 67, title: "RA Test", price: 500, category: "IMMUNOLOGY", doctorCommissionPercentage: 0 },
  { testId: 68, title: "Rose Waaler Test", price: 700, category: "IMMUNOLOGY", doctorCommissionPercentage: 0 },
  { testId: 69, title: "CRP", price: 800, category: "IMMUNOLOGY", doctorCommissionPercentage: 0 },
  { testId: 70, title: "VDRL/City Only", price: 500, category: "IMMUNOLOGY", doctorCommissionPercentage: 0 },
  { testId: 71, title: "C3", price: 1200, category: "IMMUNOLOGY", doctorCommissionPercentage: 0 },
  { testId: 72, title: "C4", price: 1200, category: "IMMUNOLOGY", doctorCommissionPercentage: 0 },
  { testId: 73, title: "TPHA", price: 800, category: "IMMUNOLOGY", doctorCommissionPercentage: 0 },
  { testId: 74, title: "IgG", price: 1500, category: "IMMUNOLOGY", doctorCommissionPercentage: 0 },
  { testId: 75, title: "IgM", price: 1500, category: "IMMUNOLOGY", doctorCommissionPercentage: 0 },
  { testId: 76, title: "IgA", price: 1500, category: "IMMUNOLOGY", doctorCommissionPercentage: 0 },
  { testId: 77, title: "IgE", price: 1800, category: "IMMUNOLOGY", doctorCommissionPercentage: 0 },
  { testId: 78, title: "ANA", price: 2500, category: "IMMUNOLOGY", doctorCommissionPercentage: 0 },
  { testId: 79, title: "H-pylori", price: 1200, category: "IMMUNOLOGY", doctorCommissionPercentage: 0 },
  { testId: 80, title: "Anti Ds DNA", price: 2000, category: "IMMUNOLOGY", doctorCommissionPercentage: 0 },
  { testId: 81, title: "Anti DNA", price: 1800, category: "IMMUNOLOGY", doctorCommissionPercentage: 0 },
  { testId: 82, title: "Blood Group & Rh Factor", price: 300, category: "IMMUNOLOGY", doctorCommissionPercentage: 0 },
  { testId: 83, title: "Rh Antibody Titre", price: 1200, category: "IMMUNOLOGY", doctorCommissionPercentage: 0 },
  { testId: 84, title: "Coomb's Test (Direct/Indirect)", price: 800, category: "IMMUNOLOGY", doctorCommissionPercentage: 0 },
  { testId: 85, title: "ICT Tuberculosis", price: 1500, category: "IMMUNOLOGY", doctorCommissionPercentage: 0 },
  { testId: 86, title: "ICT Filaria", price: 1200, category: "IMMUNOLOGY", doctorCommissionPercentage: 0 },
  { testId: 87, title: "ICT Kala-azar", price: 1500, category: "IMMUNOLOGY", doctorCommissionPercentage: 0 },
  { testId: 88, title: "ICT Malaria", price: 800, category: "IMMUNOLOGY", doctorCommissionPercentage: 0 },
  { testId: 89, title: "ELISA of TB IgA/IgG/IgM", price: 2500, category: "IMMUNOLOGY", doctorCommissionPercentage: 0 },
  { testId: 90, title: "Antisperm Antibody", price: 2200, category: "IMMUNOLOGY", doctorCommissionPercentage: 0 },
  { testId: 91, title: "Dengue ICT", price: 1200, category: "IMMUNOLOGY", doctorCommissionPercentage: 0 },
  { testId: 92, title: "Dengue ELISA", price: 2500, category: "IMMUNOLOGY", doctorCommissionPercentage: 0 },
  { testId: 93, title: "Dengue NS1 Ag", price: 1800, category: "IMMUNOLOGY", doctorCommissionPercentage: 0 },

  // CANCER MARKER (Less: 0%)
  { testId: 94, title: "CA-15-3", price: 2500, category: "CANCER_MARKER", doctorCommissionPercentage: 0 },
  { testId: 95, title: "Free PSA", price: 2200, category: "CANCER_MARKER", doctorCommissionPercentage: 0 },
  { testId: 96, title: "CA-19-9", price: 2500, category: "CANCER_MARKER", doctorCommissionPercentage: 0 },
  { testId: 97, title: "AFP", price: 2000, category: "CANCER_MARKER", doctorCommissionPercentage: 0 },
  { testId: 98, title: "CA-125", price: 2500, category: "CANCER_MARKER", doctorCommissionPercentage: 0 },
  { testId: 99, title: "CEA", price: 2200, category: "CANCER_MARKER", doctorCommissionPercentage: 0 },
  { testId: 100, title: "PSA", price: 2000, category: "CANCER_MARKER", doctorCommissionPercentage: 0 },
  { testId: 101, title: "BHCG", price: 1800, category: "CANCER_MARKER", doctorCommissionPercentage: 0 },
  { testId: 102, title: "Total hCG", price: 1500, category: "CANCER_MARKER", doctorCommissionPercentage: 0 },

  // MICROBIOLOGY (Less: 0%)
  { testId: 103, title: "Blood for C/S", price: 1200, category: "MICROBIOLOGY", doctorCommissionPercentage: 0 },
  { testId: 104, title: "Throat Swab for RE CS KLB", price: 800, category: "MICROBIOLOGY", doctorCommissionPercentage: 0 },
  { testId: 105, title: "Sputum R/E,C/S,AFB,(Gm Stain)", price: 1000, category: "MICROBIOLOGY", doctorCommissionPercentage: 0 },
  { testId: 106, title: "Vaginal Swab R/E C/S Gm Stain", price: 900, category: "MICROBIOLOGY", doctorCommissionPercentage: 0 },
  { testId: 107, title: "Wound Swab for C/S", price: 700, category: "MICROBIOLOGY", doctorCommissionPercentage: 0 },
  { testId: 108, title: "Umbilical Swab for C/S", price: 600, category: "MICROBIOLOGY", doctorCommissionPercentage: 0 },
  { testId: 109, title: "Conjunctival Swab for C/S", price: 700, category: "MICROBIOLOGY", doctorCommissionPercentage: 0 },
  { testId: 110, title: "Aural Swab for C/S", price: 600, category: "MICROBIOLOGY", doctorCommissionPercentage: 0 },
  { testId: 111, title: "Prostatic/Urethral Smear", price: 800, category: "MICROBIOLOGY", doctorCommissionPercentage: 0 },
  { testId: 112, title: "R/E G/C CS Gm Stain", price: 900, category: "MICROBIOLOGY", doctorCommissionPercentage: 0 },
  { testId: 113, title: "Pus for R/E,C/S,Gm Stain", price: 800, category: "MICROBIOLOGY", doctorCommissionPercentage: 0 },

  // BIOCHEMICAL EXAM (Less: 0%)
  { testId: 114, title: "Plasma Glucose", price: 200, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },
  { testId: 115, title: "+ FPG", price: 150, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },
  { testId: 116, title: "+ RPS", price: 150, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },
  { testId: 117, title: "+ RPPG", price: 200, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },
  { testId: 118, title: "+2hrs ABF/Lunch/Dinner/75g glucose", price: 300, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },
  { testId: 119, title: "Urea/BUN", price: 200, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },
  { testId: 120, title: "S.Creatinine", price: 250, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },
  { testId: 121, title: "S.Uric Acid", price: 250, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },
  { testId: 122, title: "S.Calcium", price: 300, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },
  { testId: 123, title: "Inorganic Phosphatase", price: 300, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },
  { testId: 124, title: "S.Total Protein", price: 300, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },
  { testId: 125, title: "Electrolytes", price: 800, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },
  { testId: 126, title: "Globulin", price: 250, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },
  { testId: 127, title: "Albumin", price: 300, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },
  { testId: 128, title: "S.Bilirubin (Total/Direct/Indirect)", price: 400, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },
  { testId: 129, title: "S.GOT", price: 250, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },
  { testId: 130, title: "AG Ratio", price: 200, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },
  { testId: 131, title: "S.GPT", price: 250, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },
  { testId: 132, title: "Alk. Phosphatase", price: 300, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },
  { testId: 133, title: "GST", price: 400, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },
  { testId: 134, title: "LDH", price: 500, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },
  { testId: 135, title: "Acid Phosphatase (Total/Prostatic)", price: 600, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },
  { testId: 136, title: "S.Amylase", price: 500, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },
  { testId: 137, title: "CRP", price: 800, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },
  { testId: 138, title: "Lipid Profile", price: 1200, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },
  { testId: 139, title: "Triglyceride", price: 300, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },
  { testId: 140, title: "Cholesterol", price: 250, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },
  { testId: 141, title: "LDL Cholesterol", price: 400, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },
  { testId: 142, title: "HDL Cholesterol", price: 400, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },
  { testId: 143, title: "S.Magnesium", price: 500, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },
  { testId: 144, title: "TIBC", price: 600, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },
  { testId: 145, title: "S.Iron", price: 500, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },
  { testId: 146, title: "Folic Acid", price: 1200, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },
  { testId: 147, title: "Ferritin", price: 1500, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },
  { testId: 148, title: "Vitamin B-12", price: 1800, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },
  { testId: 149, title: "Aldehyde test", price: 400, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },
  { testId: 150, title: "Vitamin D (25 OH)", price: 2500, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },
  { testId: 151, title: "Aldolase", price: 800, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },
  { testId: 152, title: "eGFR", price: 300, category: "BIOCHEMICAL", doctorCommissionPercentage: 0 },

  // HEPATITIS PROFILE (Less: 0%)
  { testId: 153, title: "HBs Ag ELISA/Sreening", price: 600, category: "HEPATITIS", doctorCommissionPercentage: 0 },
  { testId: 154, title: "Anti HBs Ab", price: 800, category: "HEPATITIS", doctorCommissionPercentage: 0 },
  { testId: 155, title: "Anti HBc IgG", price: 1000, category: "HEPATITIS", doctorCommissionPercentage: 0 },
  { testId: 156, title: "HBe Ag", price: 1200, category: "HEPATITIS", doctorCommissionPercentage: 0 },
  { testId: 157, title: "Anti HBc IgM", price: 1200, category: "HEPATITIS", doctorCommissionPercentage: 0 },
  { testId: 158, title: "Anti HEV", price: 1500, category: "HEPATITIS", doctorCommissionPercentage: 0 },
  { testId: 159, title: "Anti HEV-IgM", price: 1800, category: "HEPATITIS", doctorCommissionPercentage: 0 },
  { testId: 160, title: "Anti HAV-IgM", price: 1800, category: "HEPATITIS", doctorCommissionPercentage: 0 },

  // HORMONE TEST (Hormone: 20%)
  { testId: 161, title: "T3", price: 500, category: "HORMONE", doctorCommissionPercentage: 20 },
  { testId: 162, title: "T4", price: 500, category: "HORMONE", doctorCommissionPercentage: 20 },
  { testId: 163, title: "FT3", price: 800, category: "HORMONE", doctorCommissionPercentage: 20 },
  { testId: 164, title: "FT4", price: 800, category: "HORMONE", doctorCommissionPercentage: 20 },
  { testId: 165, title: "TSH", price: 600, category: "HORMONE", doctorCommissionPercentage: 20 },
  { testId: 166, title: "Prolactin", price: 1000, category: "HORMONE", doctorCommissionPercentage: 20 },
  { testId: 167, title: "Estradiol", price: 1200, category: "HORMONE", doctorCommissionPercentage: 20 },
  { testId: 168, title: "LH", price: 800, category: "HORMONE", doctorCommissionPercentage: 20 },
  { testId: 169, title: "Progesterone", price: 1200, category: "HORMONE", doctorCommissionPercentage: 20 },
  { testId: 170, title: "FSH", price: 800, category: "HORMONE", doctorCommissionPercentage: 20 },
  { testId: 171, title: "Testosterone", price: 1200, category: "HORMONE", doctorCommissionPercentage: 20 },
  { testId: 172, title: "Cortisol", price: 1500, category: "HORMONE", doctorCommissionPercentage: 20 },
  { testId: 173, title: "Growth Hormone", price: 2000, category: "HORMONE", doctorCommissionPercentage: 20 },

  // URINE (Less: 0%)
  { testId: 174, title: "R/E", price: 200, category: "URINE", doctorCommissionPercentage: 0 },
  { testId: 175, title: "C/S", price: 600, category: "URINE", doctorCommissionPercentage: 0 },
  { testId: 176, title: "Pregnancy Test", price: 300, category: "URINE", doctorCommissionPercentage: 0 },
  { testId: 177, title: "Bile Salts", price: 200, category: "URINE", doctorCommissionPercentage: 0 },
  { testId: 178, title: "Bile Pigment", price: 200, category: "URINE", doctorCommissionPercentage: 0 },
  { testId: 179, title: "Urobilinogen", price: 200, category: "URINE", doctorCommissionPercentage: 0 },
  { testId: 180, title: "24 Hrs.Total Protein/Calcium /Phosphate", price: 800, category: "URINE", doctorCommissionPercentage: 0 },
  { testId: 181, title: "Bence Jones Protein", price: 600, category: "URINE", doctorCommissionPercentage: 0 },

  // CARDIOLOGY (Less: 0%)
  { testId: 182, title: "CK-MB", price: 1200, category: "CARDIOLOGY", doctorCommissionPercentage: 0 },
  { testId: 183, title: "LDH", price: 500, category: "CARDIOLOGY", doctorCommissionPercentage: 0 },
  { testId: 184, title: "Troponin I", price: 2500, category: "CARDIOLOGY", doctorCommissionPercentage: 0 },
  { testId: 185, title: "CRK-MB", price: 1500, category: "CARDIOLOGY", doctorCommissionPercentage: 0 },

  // STOOL (Less: 0%)
  { testId: 186, title: "R/E", price: 200, category: "STOOL", doctorCommissionPercentage: 0 },
  { testId: 187, title: "C/S", price: 600, category: "STOOL", doctorCommissionPercentage: 0 },
  { testId: 188, title: "OBT", price: 300, category: "STOOL", doctorCommissionPercentage: 0 },
  { testId: 189, title: "Dva Count", price: 400, category: "STOOL", doctorCommissionPercentage: 0 },
  { testId: 190, title: "Reducing Substance", price: 300, category: "STOOL", doctorCommissionPercentage: 0 }
];

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data
    await TestCategoryModel.deleteMany({});
    await TestModel.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Insert categories
    const insertedCategories = await TestCategoryModel.insertMany(testCategories);
    console.log(`✅ Inserted ${insertedCategories.length} test categories`);

    // Insert tests
    const insertedTests = await TestModel.insertMany(testsData);
    console.log(`✅ Inserted ${insertedTests.length} tests`);

    console.log("🎉 Database seeding completed successfully!");
    console.log(`📊 Total Categories: ${insertedCategories.length}`);
    console.log(`🧪 Total Tests: ${insertedTests.length}`);

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
};

module.exports = { seedDatabase };