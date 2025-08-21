require('dotenv').config();
const express = require('express');
const { connection } = require('./configs/db');
const cors = require('cors');
const { seedDatabase } = require('./seeders/testSeeder');

const doctorPaymentRoutes = require('./routes/doctorPayment.route');
const adminRouter = require('./routes/Admins.Route');
const appointmentRouter = require('./routes/Appointments.Route');
const doctorRouter = require('./routes/Doctors.Route');
const managerRouter = require('./routes/Managers.Route');
const patientRouter = require('./routes/Patients.Route');
const reportRouter = require('./routes/Reports.Route');
const agentRoutes = require('./routes/Agents.Route');
const testOrder = require('./routes/testOrderRoutes');
const testsRouter = require('./routes/Tests.Route');
const agentPaymentRoutes = require('./routes/agentPayment.route');

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Homepage');
});

app.use('/admin', adminRouter);
app.use('/testorders', testOrder);
app.use('/appointments', appointmentRouter);
app.use('/doctors', doctorRouter);
app.use('/managers', managerRouter);
app.use('/patients', patientRouter);
app.use('/reports', reportRouter);
app.use('/agents', agentRoutes);
app.use('/tests', testsRouter);
app.use('/doctorPayments', doctorPaymentRoutes);
app.use('/agentPayments', agentPaymentRoutes);

const seedOnStartup = async () => {
  try {
    await seedDatabase();
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
  }
};

app.listen(process.env.port, async () => {
  try {
    await connection; 
    console.log('Connected to DB');
    
    // await seedOnStartup();
    
  } catch (error) {
    console.error('Unable to connect to DB:', error);
  }
  console.log(`Listening at port ${process.env.port}`);
});