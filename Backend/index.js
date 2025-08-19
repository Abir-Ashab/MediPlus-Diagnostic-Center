// D:\MediPlus-Diagnostic-Center\Backend\index.js
require('dotenv').config();
const express = require('express');
const { connection } = require('./configs/db');
const cors = require('cors');
const { seedDatabase } = require('./seeders/testSeeder');
const TestModel = require('./models/Test.model');

const doctorPaymentRoutes = require('./routes/doctorPayment.route');
const adminRouter = require('./routes/Admins.Route');
const appointmentRouter = require('./routes/Appointments.Route');
const bedRouter = require('./routes/Beds.Route');
const doctorRouter = require('./routes/Doctors.Route');
const nurseRouter = require('./routes/Nurses.Route');
const patientRouter = require('./routes/Patients.Route');
const paymentRouter = require('./routes/Payments.route');
const prescriptionRouter = require('./routes/Prescriptions.Route');
const reportRouter = require('./routes/Reports.Route');
const brokerRoutes = require('./routes/Brokers.Route');
const testOrder = require('./routes/testOrderRoutes');
const testsRouter = require('./routes/Tests.Route');
const seederRouter = require('./routes/Seeder.Route');

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Homepage');
});

app.use('/admin', adminRouter);
app.use('/testorders', testOrder);
app.use('/appointments', appointmentRouter);
app.use('/beds', bedRouter);
app.use('/doctors', doctorRouter);
app.use('/nurses', nurseRouter);
app.use('/patients', patientRouter);
app.use('/payments', paymentRouter);
app.use('/prescriptions', prescriptionRouter);
app.use('/reports', reportRouter);
app.use('/brokers', brokerRoutes);
app.use('/tests', testsRouter);
app.use('/doctorPayments', doctorPaymentRoutes);
app.use('/seeder', seederRouter);

const seedOnStartup = async () => {
  try {
    await seedDatabase();
    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
};

app.listen(process.env.port, async () => {
  try {
    await connection; // Connect to the database using existing connection promise
    console.log('✅ Connected to DB');
    
    await seedOnStartup();
    
  } catch (error) {
    console.error('❌ Unable to connect to DB:', error);
  }
  console.log(`Listening at port ${process.env.port}`);
});