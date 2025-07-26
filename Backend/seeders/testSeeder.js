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

// Tests Data (from your existing MixedObjectData.jsx)
const testsData = [
  // HISTOPATHOLOGY & CYTOPATHOLOGY
  { testId: 1, title: "Histopathology", price: 2500, category: "HISTOPATHOLOGY" },
  { testId: 2, title: "FNAC", price: 2000, category: "HISTOPATHOLOGY" },
  { testId: 3, title: "Pap's Smear for Cytology", price: 1800, category: "HISTOPATHOLOGY" },
  { testId: 4, title: "Sputum for Malignant Cell", price: 1500, category: "HISTOPATHOLOGY" },
  { testId: 5, title: "Discharge fluid for Malignant Cell", price: 1600, category: "HISTOPATHOLOGY" },
  { testId: 6, title: "Ba-Swallow of Oesophagus", price: 3500, category: "HISTOPATHOLOGY" },
  { testId: 7, title: "Ba-enema double contrast", price: 4000, category: "HISTOPATHOLOGY" },
  { testId: 8, title: "Ba-Meal", price: 3000, category: "HISTOPATHOLOGY" },
  { testId: 9, title: "Ba-follow Through", price: 3200, category: "HISTOPATHOLOGY" },
  { testId: 10, title: "Oral Cholecystography (OCG)", price: 2800, category: "HISTOPATHOLOGY" },
  { testId: 11, title: "IVU with post mict. film", price: 4500, category: "HISTOPATHOLOGY" },
  { testId: 12, title: "Retrograde Cystourethrogram", price: 3800, category: "HISTOPATHOLOGY" },
  { testId: 13, title: "OPG", price: 1200, category: "HISTOPATHOLOGY" },

  // X-RAY (DIGITAL)
  { testId: 14, title: "Chest P/A View", price: 800, category: "XRAY" },
  { testId: 15, title: "Rt Lat.", price: 900, category: "XRAY" },
  { testId: 16, title: "Lt Lat.", price: 900, category: "XRAY" },
  { testId: 17, title: "KUB", price: 1000, category: "XRAY" },
  { testId: 18, title: "Plain X-Ray Abdomen", price: 1200, category: "XRAY" },
  { testId: 19, title: "Skull B/V", price: 1500, category: "XRAY" },
  { testId: 20, title: "P.N.S. (O.M View)", price: 1200, category: "XRAY" },
  { testId: 21, title: "Cervical Spine B/V", price: 1800, category: "XRAY" },
  { testId: 22, title: "Lumbo-Dorsal Spine B/V", price: 2000, category: "XRAY" },
  { testId: 23, title: "Lumbo-Sacral Spine B/V", price: 2000, category: "XRAY" },
  { testId: 24, title: "Ba-Meal of Stomach and Duodenum", price: 3500, category: "XRAY" },
  { testId: 25, title: "Thoracic spine B/V", price: 1800, category: "XRAY" },

  // OTHERS
  { testId: 26, title: "Tuberculin Test / MT", price: 500, category: "OTHERS" },
  { testId: 27, title: "Semen Analysis", price: 800, category: "OTHERS" },
  { testId: 28, title: "Hb Electrophoresis", price: 2500, category: "OTHERS" },
  { testId: 29, title: "Protein Electrophoresis", price: 2800, category: "OTHERS" },
  { testId: 30, title: "HbA1C", price: 1200, category: "OTHERS" },
  { testId: 31, title: "HIV (1+2)", price: 1500, category: "OTHERS" },
  { testId: 32, title: "Skin/Nail Scraping for Fungus", price: 600, category: "OTHERS" },
  { testId: 33, title: "AFB", price: 400, category: "OTHERS" },

  // ULTRASOUND IMAGING
  { testId: 34, title: "Whole Abdomen & Pelvic Organs", price: 2500, category: "ULTRASOUND" },
  { testId: 35, title: "HBS / Upper Abdomen", price: 2000, category: "ULTRASOUND" },
  { testId: 36, title: "Lower Abdomen / Uterus & Adnexa", price: 1800, category: "ULTRASOUND" },
  { testId: 37, title: "Pregnancy Profile", price: 2200, category: "ULTRASOUND" },
  { testId: 38, title: "KUB / Genito-Urinary Tract", price: 2000, category: "ULTRASOUND" },
  { testId: 39, title: "KUB with Prostate & Residual Volume (PVR)", price: 2500, category: "ULTRASOUND" },
  { testId: 40, title: "Thyroid", price: 1500, category: "ULTRASOUND" },
  { testId: 41, title: "Brain", price: 3000, category: "ULTRASOUND" },
  { testId: 42, title: "Breasts", price: 1800, category: "ULTRASOUND" },
  { testId: 43, title: "Scrotum/Testes", price: 1600, category: "ULTRASOUND" },
  { testId: 44, title: "Soft Tissue", price: 1200, category: "ULTRASOUND" },

  // VACCINATION
  { testId: 45, title: "Hepatitis B Vaccine", price: 800, category: "VACCINATION" },
  { testId: 46, title: "Hepatitis A Vaccine", price: 1200, category: "VACCINATION" },
  { testId: 47, title: "Chickenpox", price: 2500, category: "VACCINATION" },
  { testId: 48, title: "Typhoid", price: 600, category: "VACCINATION" },

  // CARDIAC IMAGING
  { testId: 49, title: "E.C.G", price: 500, category: "CARDIAC" },
  { testId: 50, title: "E.T.T-Stress E.C.G", price: 2500, category: "CARDIAC" },
  { testId: 51, title: "ECHOCARDIOGRAM-2D & M-MODE", price: 3500, category: "CARDIAC" },
  { testId: 52, title: "Video Endoscopy", price: 8000, category: "CARDIAC" },

  // HAEMATOLOGY
  { testId: 53, title: "TC,DC,Hb%ESR", price: 400, category: "HAEMATOLOGY" },
  { testId: 54, title: "MP", price: 300, category: "HAEMATOLOGY" },
  { testId: 55, title: "CC Count", price: 250, category: "HAEMATOLOGY" },
  { testId: 56, title: "LE Cell", price: 800, category: "HAEMATOLOGY" },
  { testId: 57, title: "Platelet Count", price: 300, category: "HAEMATOLOGY" },
  { testId: 58, title: "BT,CT", price: 400, category: "HAEMATOLOGY" },
  { testId: 59, title: "Prothrombin Time", price: 600, category: "HAEMATOLOGY" },
  { testId: 60, title: "APTT", price: 700, category: "HAEMATOLOGY" },
  { testId: 61, title: "Reticulocyte Count", price: 500, category: "HAEMATOLOGY" },
  { testId: 62, title: "HCT/PCV", price: 300, category: "HAEMATOLOGY" },
  { testId: 63, title: "Blood Film", price: 400, category: "HAEMATOLOGY" },

  // Continue with all other categories...
  // (I'll add the rest in separate chunks to avoid hitting limits)
];

// Add remaining tests data
const remainingTestsData = [
  // IMMUNOLOGY/SEROLOGY
  { testId: 64, title: "Widal Test", price: 400, category: "IMMUNOLOGY" },
  { testId: 65, title: "ASO Titer", price: 600, category: "IMMUNOLOGY" },
  { testId: 66, title: "Febrile Antigen", price: 800, category: "IMMUNOLOGY" },
  { testId: 67, title: "RA Test", price: 500, category: "IMMUNOLOGY" },
  { testId: 68, title: "Rose Waaler Test", price: 700, category: "IMMUNOLOGY" },
  { testId: 69, title: "CRP", price: 800, category: "IMMUNOLOGY" },
  { testId: 70, title: "VDRL/City Only", price: 500, category: "IMMUNOLOGY" },
  { testId: 71, title: "C3", price: 1200, category: "IMMUNOLOGY" },
  { testId: 72, title: "C4", price: 1200, category: "IMMUNOLOGY" },
  { testId: 73, title: "TPHA", price: 800, category: "IMMUNOLOGY" },
  { testId: 74, title: "IgG", price: 1500, category: "IMMUNOLOGY" },
  { testId: 75, title: "IgM", price: 1500, category: "IMMUNOLOGY" },
  { testId: 76, title: "IgA", price: 1500, category: "IMMUNOLOGY" },
  { testId: 77, title: "IgE", price: 1800, category: "IMMUNOLOGY" },
  { testId: 78, title: "ANA", price: 2500, category: "IMMUNOLOGY" },
  { testId: 79, title: "H-pylori", price: 1200, category: "IMMUNOLOGY" },
  { testId: 80, title: "Anti Ds DNA", price: 2000, category: "IMMUNOLOGY" },
  { testId: 81, title: "Anti DNA", price: 1800, category: "IMMUNOLOGY" },
  { testId: 82, title: "Blood Group & Rh Factor", price: 300, category: "IMMUNOLOGY" },
  { testId: 83, title: "Rh Antibody Titre", price: 1200, category: "IMMUNOLOGY" },
  { testId: 84, title: "Coomb's Test (Direct/Indirect)", price: 800, category: "IMMUNOLOGY" },
  { testId: 85, title: "ICT Tuberculosis", price: 1500, category: "IMMUNOLOGY" },
  { testId: 86, title: "ICT Filaria", price: 1200, category: "IMMUNOLOGY" },
  { testId: 87, title: "ICT Kala-azar", price: 1500, category: "IMMUNOLOGY" },
  { testId: 88, title: "ICT Malaria", price: 800, category: "IMMUNOLOGY" },
  { testId: 89, title: "ELISA of TB IgA/IgG/IgM", price: 2500, category: "IMMUNOLOGY" },
  { testId: 90, title: "Antisperm Antibody", price: 2200, category: "IMMUNOLOGY" },
  { testId: 91, title: "Dengue ICT", price: 1200, category: "IMMUNOLOGY" },
  { testId: 92, title: "Dengue ELISA", price: 2500, category: "IMMUNOLOGY" },
  { testId: 93, title: "Dengue NS1 Ag", price: 1800, category: "IMMUNOLOGY" },

  // CANCER MARKER
  { testId: 94, title: "CA-15-3", price: 2500, category: "CANCER_MARKER" },
  { testId: 95, title: "Free PSA", price: 2200, category: "CANCER_MARKER" },
  { testId: 96, title: "CA-19-9", price: 2500, category: "CANCER_MARKER" },
  { testId: 97, title: "AFP", price: 2000, category: "CANCER_MARKER" },
  { testId: 98, title: "CA-125", price: 2500, category: "CANCER_MARKER" },
  { testId: 99, title: "CEA", price: 2200, category: "CANCER_MARKER" },
  { testId: 100, title: "PSA", price: 2000, category: "CANCER_MARKER" },
  { testId: 101, title: "BHCG", price: 1800, category: "CANCER_MARKER" },
  { testId: 102, title: "Total hCG", price: 1500, category: "CANCER_MARKER" },

  // MICROBIOLOGY
  { testId: 103, title: "Blood for C/S", price: 1200, category: "MICROBIOLOGY" },
  { testId: 104, title: "Throat Swab for RE CS KLB", price: 800, category: "MICROBIOLOGY" },
  { testId: 105, title: "Sputum R/E,C/S,AFB,(Gm Stain)", price: 1000, category: "MICROBIOLOGY" },
  { testId: 106, title: "Vaginal Swab R/E C/S Gm Stain", price: 900, category: "MICROBIOLOGY" },
  { testId: 107, title: "Wound Swab for C/S", price: 700, category: "MICROBIOLOGY" },
  { testId: 108, title: "Umbilical Swab for C/S", price: 600, category: "MICROBIOLOGY" },
  { testId: 109, title: "Conjunctival Swab for C/S", price: 700, category: "MICROBIOLOGY" },
  { testId: 110, title: "Aural Swab for C/S", price: 600, category: "MICROBIOLOGY" },
  { testId: 111, title: "Prostatic/Urethral Smear", price: 800, category: "MICROBIOLOGY" },
  { testId: 112, title: "R/E G/C CS Gm Stain", price: 900, category: "MICROBIOLOGY" },
  { testId: 113, title: "Pus for R/E,C/S,Gm Stain", price: 800, category: "MICROBIOLOGY" },

  // Add remaining categories (BIOCHEMICAL, HEPATITIS, HORMONE, URINE, CARDIOLOGY, STOOL)
  // ... (continuing with all the remaining data)
];

// Biochemical tests and remaining categories
const finalTestsData = [
  // BIOCHEMICAL EXAM
  { testId: 114, title: "Plasma Glucose", price: 200, category: "BIOCHEMICAL" },
  { testId: 115, title: "+ FPG", price: 150, category: "BIOCHEMICAL" },
  { testId: 116, title: "+ RPS", price: 150, category: "BIOCHEMICAL" },
  { testId: 117, title: "+ RPPG", price: 200, category: "BIOCHEMICAL" },
  { testId: 118, title: "+2hrs ABF/Lunch/Dinner/75g glucose", price: 300, category: "BIOCHEMICAL" },
  { testId: 119, title: "Urea/BUN", price: 200, category: "BIOCHEMICAL" },
  { testId: 120, title: "S.Creatinine", price: 250, category: "BIOCHEMICAL" },
  { testId: 121, title: "S.Uric Acid", price: 250, category: "BIOCHEMICAL" },
  { testId: 122, title: "S.Calcium", price: 300, category: "BIOCHEMICAL" },
  { testId: 123, title: "Inorganic Phosphatase", price: 300, category: "BIOCHEMICAL" },
  { testId: 124, title: "S.Total Protein", price: 300, category: "BIOCHEMICAL" },
  { testId: 125, title: "Electrolytes", price: 800, category: "BIOCHEMICAL" },
  { testId: 126, title: "Globulin", price: 250, category: "BIOCHEMICAL" },
  { testId: 127, title: "Albumin", price: 300, category: "BIOCHEMICAL" },
  { testId: 128, title: "S.Bilirubin (Total/Direct/Indirect)", price: 400, category: "BIOCHEMICAL" },
  { testId: 129, title: "S.GOT", price: 250, category: "BIOCHEMICAL" },
  { testId: 130, title: "AG Ratio", price: 200, category: "BIOCHEMICAL" },
  { testId: 131, title: "S.GPT", price: 250, category: "BIOCHEMICAL" },
  { testId: 132, title: "Alk. Phosphatase", price: 300, category: "BIOCHEMICAL" },
  { testId: 133, title: "GST", price: 400, category: "BIOCHEMICAL" },
  { testId: 134, title: "LDH", price: 500, category: "BIOCHEMICAL" },
  { testId: 135, title: "Acid Phosphatase (Total/Prostatic)", price: 600, category: "BIOCHEMICAL" },
  { testId: 136, title: "S.Amylase", price: 500, category: "BIOCHEMICAL" },
  { testId: 137, title: "CRP", price: 800, category: "BIOCHEMICAL" },
  { testId: 138, title: "Lipid Profile", price: 1200, category: "BIOCHEMICAL" },
  { testId: 139, title: "Triglyceride", price: 300, category: "BIOCHEMICAL" },
  { testId: 140, title: "Cholesterol", price: 250, category: "BIOCHEMICAL" },
  { testId: 141, title: "LDL Cholesterol", price: 400, category: "BIOCHEMICAL" },
  { testId: 142, title: "HDL Cholesterol", price: 400, category: "BIOCHEMICAL" },
  { testId: 143, title: "S.Magnesium", price: 500, category: "BIOCHEMICAL" },
  { testId: 144, title: "TIBC", price: 600, category: "BIOCHEMICAL" },
  { testId: 145, title: "S.Iron", price: 500, category: "BIOCHEMICAL" },
  { testId: 146, title: "Folic Acid", price: 1200, category: "BIOCHEMICAL" },
  { testId: 147, title: "Ferritin", price: 1500, category: "BIOCHEMICAL" },
  { testId: 148, title: "Vitamin B-12", price: 1800, category: "BIOCHEMICAL" },
  { testId: 149, title: "Aldehyde test", price: 400, category: "BIOCHEMICAL" },
  { testId: 150, title: "Vitamin D (25 OH)", price: 2500, category: "BIOCHEMICAL" },
  { testId: 151, title: "Aldolase", price: 800, category: "BIOCHEMICAL" },
  { testId: 152, title: "eGFR", price: 300, category: "BIOCHEMICAL" },

  // HEPATITIS PROFILE
  { testId: 153, title: "HBs Ag ELISA/Sreening", price: 600, category: "HEPATITIS" },
  { testId: 154, title: "Anti HBs Ab", price: 800, category: "HEPATITIS" },
  { testId: 155, title: "Anti HBc IgG", price: 1000, category: "HEPATITIS" },
  { testId: 156, title: "HBe Ag", price: 1200, category: "HEPATITIS" },
  { testId: 157, title: "Anti HBc IgM", price: 1200, category: "HEPATITIS" },
  { testId: 158, title: "Anti HEV", price: 1500, category: "HEPATITIS" },
  { testId: 159, title: "Anti HEV-IgM", price: 1800, category: "HEPATITIS" },
  { testId: 160, title: "Anti HAV-IgM", price: 1800, category: "HEPATITIS" },

  // HORMONE TEST
  { testId: 161, title: "T3", price: 500, category: "HORMONE" },
  { testId: 162, title: "T4", price: 500, category: "HORMONE" },
  { testId: 163, title: "FT3", price: 800, category: "HORMONE" },
  { testId: 164, title: "FT4", price: 800, category: "HORMONE" },
  { testId: 165, title: "TSH", price: 600, category: "HORMONE" },
  { testId: 166, title: "Prolactin", price: 1000, category: "HORMONE" },
  { testId: 167, title: "Estradiol", price: 1200, category: "HORMONE" },
  { testId: 168, title: "LH", price: 800, category: "HORMONE" },
  { testId: 169, title: "Progesterone", price: 1200, category: "HORMONE" },
  { testId: 170, title: "FSH", price: 800, category: "HORMONE" },
  { testId: 171, title: "Testosterone", price: 1200, category: "HORMONE" },
  { testId: 172, title: "Cortisol", price: 1500, category: "HORMONE" },
  { testId: 173, title: "Growth Hormone", price: 2000, category: "HORMONE" },

  // URINE
  { testId: 174, title: "R/E", price: 200, category: "URINE" },
  { testId: 175, title: "C/S", price: 600, category: "URINE" },
  { testId: 176, title: "Pregnancy Test", price: 300, category: "URINE" },
  { testId: 177, title: "Bile Salts", price: 200, category: "URINE" },
  { testId: 178, title: "Bile Pigment", price: 200, category: "URINE" },
  { testId: 179, title: "Urobilinogen", price: 200, category: "URINE" },
  { testId: 180, title: "24 Hrs.Total Protein/Calcium /Phosphate", price: 800, category: "URINE" },
  { testId: 181, title: "Bence Jones Protein", price: 600, category: "URINE" },

  // CARDIOLOGY
  { testId: 182, title: "CK-MB", price: 1200, category: "CARDIOLOGY" },
  { testId: 183, title: "LDH", price: 500, category: "CARDIOLOGY" },
  { testId: 184, title: "Troponin I", price: 2500, category: "CARDIOLOGY" },
  { testId: 185, title: "CRK-MB", price: 1500, category: "CARDIOLOGY" },

  // STOOL
  { testId: 186, title: "R/E", price: 200, category: "STOOL" },
  { testId: 187, title: "C/S", price: 600, category: "STOOL" },
  { testId: 188, title: "OBT", price: 300, category: "STOOL" },
  { testId: 189, title: "Dva Count", price: 400, category: "STOOL" },
  { testId: 190, title: "Reducing Substance", price: 300, category: "STOOL" }
];

// Combine all test data
const allTestsData = [...testsData, ...remainingTestsData, ...finalTestsData];

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
    const insertedTests = await TestModel.insertMany(allTestsData);
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
