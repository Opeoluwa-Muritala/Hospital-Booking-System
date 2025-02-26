/** @jsxImportSource https://esm.sh/react@18.2.0 */
import React, { useState, useEffect } from "https://esm.sh/react@18.2.0";
import { createRoot } from "https://esm.sh/react-dom@18.2.0/client";

function HospitalBookingSystem() {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loginCredentials, setLoginCredentials] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [registrationMode, setRegistrationMode] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: '',
    type: 'patient',
    specialty: ''
  });
  const [newAppointment, setNewAppointment] = useState({
    doctorId: '',
    date: '',
    time: '',
    reason: ''
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('hospitalUser');
    const savedUserType = localStorage.getItem('hospitalUserType');
    if (savedUser && savedUserType) {
      setUser(JSON.parse(savedUser));
      setUserType(savedUserType);
      fetchDoctors();
      fetchAppointments();
    }
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/doctors');
      const data = await response.json();
      setDoctors(data);
    } catch (error) {
      console.error('Failed to fetch doctors', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/appointments');
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Failed to fetch appointments', error);
    }
  };

  const login = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginCredentials)
      });
      const userData = await response.json();
      if (userData.success) {
        setUser(userData.user);
        setUserType(userData.userType);
        localStorage.setItem('hospitalUser', JSON.stringify(userData.user));
        localStorage.setItem('hospitalUserType', userData.userType);
        fetchDoctors();
        fetchAppointments();
      } else {
        setLoginError('Invalid username or password');
      }
    } catch (error) {
      console.error('Login failed', error);
      setLoginError('An error occurred during login');
    }
  };

  const register = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    if (registrationData.password !== registrationData.confirmPassword) {
      setLoginError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      });
      const result = await response.json();
      
      if (result.success) {
        setRegistrationMode(false);
        setLoginCredentials({ 
          username: registrationData.username, 
          password: registrationData.password 
        });
        setLoginError('Registration successful. Please log in.');
      } else {
        setLoginError(result.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration failed', error);
      setLoginError('An error occurred during registration');
    }
  };

  const bookAppointment = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/book-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAppointment,
          patientId: user.id
        })
      });
      const result = await response.json();
      if (result.success) {
        fetchAppointments();
        setNewAppointment({ doctorId: '', date: '', time: '', reason: '' });
        alert('Appointment booked successfully!');
      } else {
        alert(result.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Failed to book appointment', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('hospitalUser');
    localStorage.removeItem('hospitalUserType');
    setUser(null);
    setUserType('');
  };

  const renderPatientView = () => (
    <div className="patient-dashboard">
      <h1>🏥 Patient Dashboard</h1>
      <div className="available-doctors">
        <h2>Available Doctors</h2>
        {doctors.map(doctor => (
          <div key={doctor.id} className="doctor-card">
            <h3>{doctor.name}</h3>
            <p>Specialty: {doctor.specialty}</p>
            <p>
              Status: {appointments.some(appt => 
                appt.doctorId === doctor.id && 
                appt.date === new Date().toISOString().split('T')[0]
              ) ? '🔴 Busy' : '🟢 Available'}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={bookAppointment} className="book-appointment-form">
        <h2>Book New Appointment</h2>
        <select
          value={newAppointment.doctorId}
          onChange={(e) => setNewAppointment({...newAppointment, doctorId: e.target.value})}
          required
        >
          <option value="">Select Doctor</option>
          {doctors.map(doctor => (
            <option key={doctor.id} value={doctor.id}>{doctor.name} - {doctor.specialty}</option>
          ))}
        </select>
        <input
          type="date"
          value={newAppointment.date}
          onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
          required
        />
        <input
          type="time"
          value={newAppointment.time}
          onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
          required
        />
        <textarea
          placeholder="Reason for Appointment"
          value={newAppointment.reason}
          onChange={(e) => setNewAppointment({...newAppointment, reason: e.target.value})}
          required
        />
        <button type="submit">Book Appointment</button>
      </form>

      <div className="my-appointments">
        <h2>My Appointments</h2>
        {appointments
          .filter(appt => appt.patientId === user.id)
          .map(appointment => (
            <div key={appointment.id} className="appointment-card">
              <p>Doctor: {appointment.doctorName}</p>
              <p>Date: {appointment.date}</p>
              <p>Time: {appointment.time}</p>
              <p>Reason: {appointment.reason}</p>
              <p>Status: {appointment.status}</p>
            </div>
          ))}
      </div>

      <button onClick={logout} className="logout-btn">Logout</button>
    </div>
  );

  const renderDoctorView = () => (
    <div className="doctor-dashboard">
      <h1>👩‍⚕️ Doctor Dashboard</h1>
      <div className="my-schedule">
        <h2>My Appointments</h2>
        {appointments
          .filter(appt => appt.doctorId === user.id)
          .map(appointment => (
            <div key={appointment.id} className="appointment-card">
              <p>Patient: {appointment.patientName}</p>
              <p>Date: {appointment.date}</p>
              <p>Time: {appointment.time}</p>
              <p>Reason: {appointment.reason}</p>
              <p>Status: {appointment.status}</p>
            </div>
          ))}
      </div>
      <button onClick={logout} className="logout-btn">Logout</button>
    </div>
  );

  const renderLoginForm = () => (
    <div className="login-container">
      {!registrationMode ? (
        <form onSubmit={login}>
          <h2>Hospital Booking System</h2>
          {loginError && <div className="error-message">{loginError}</div>}
          <input
            type="text"
            placeholder="Username"
            value={loginCredentials.username}
            onChange={(e) => setLoginCredentials({...loginCredentials, username: e.target.value})}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={loginCredentials.password}
            onChange={(e) => setLoginCredentials({...loginCredentials, password: e.target.value})}
            required
          />
          <button type="submit">Login</button>
          <p>
            Don't have an account? 
            <button 
              type="button" 
              className="link-button"
              onClick={() => setRegistrationMode(true)}
            >
              Register
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={register}>
          <h2>Register</h2>
          {loginError && <div className="error-message">{loginError}</div>}
          <input
            type="text"
            placeholder="Username"
            value={registrationData.username}
            onChange={(e) => setRegistrationData({...registrationData, username: e.target.value})}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={registrationData.email}
            onChange={(e) => setRegistrationData({...registrationData, email: e.target.value})}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={registrationData.password}
            onChange={(e) => setRegistrationData({...registrationData, password: e.target.value})}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={registrationData.confirmPassword}
            onChange={(e) => setRegistrationData({...registrationData, confirmPassword: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="Full Name"
            value={registrationData.name}
            onChange={(e) => setRegistrationData({...registrationData, name: e.target.value})}
            required
          />
          <select
            value={registrationData.type}
            onChange={(e) => setRegistrationData({...registrationData, type: e.target.value})}
          >
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>
          {registrationData.type === 'doctor' && (
            <input
              type="text"
              placeholder="Medical Specialty"
              value={registrationData.specialty}
              onChange={(e) => setRegistrationData({...registrationData, specialty: e.target.value})}
              required
            />
          )}
          <button type="submit">Register</button>
          <p>
            Already have an account? 
            <button 
              type="button" 
              className="link-button"
              onClick={() => setRegistrationMode(false)}
            >
              Login
            </button>
          </p>
        </form>
      )}
    </div>
  );

  return (
    <div className="container">
      {!user ? renderLoginForm() : 
        userType === 'patient' ? renderPatientView() : renderDoctorView()}
      <a 
        href={import.meta.url.replace("esm.town", "val.town")} 
        target="_top" 
        className="source-link"
      >
        View Source
      </a>
    </div>
  );
}

function client() {
  createRoot(document.getElementById("root")).render(<HospitalBookingSystem />);
}
if (typeof document !== "undefined") { client(); }

export default async function server(request: Request): Promise<Response> {
  const { sqlite } = await import("https://esm.town/v/stevekrouse/sqlite");
  const KEY = new URL(import.meta.url).pathname.split("/").at(-1);
  const SCHEMA_VERSION = 3;

  // Create tables with additional fields
  await sqlite.execute(`
    CREATE TABLE IF NOT EXISTS ${KEY}_users_${SCHEMA_VERSION} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      type TEXT NOT NULL
    )
  `);

  await sqlite.execute(`
    CREATE TABLE IF NOT EXISTS ${KEY}_doctors_${SCHEMA_VERSION} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE,
      name TEXT NOT NULL,
      specialty TEXT NOT NULL,
      qualifications TEXT,
      contact_number TEXT,
      FOREIGN KEY(user_id) REFERENCES ${KEY}_users_${SCHEMA_VERSION}(id)
    )
  `);

  await sqlite.execute(`
    CREATE TABLE IF NOT EXISTS ${KEY}_appointments_${SCHEMA_VERSION} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      doctor_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      reason TEXT NOT NULL,
      status TEXT DEFAULT 'scheduled',
      FOREIGN KEY(patient_id) REFERENCES ${KEY}_users_${SCHEMA_VERSION}(id),
      FOREIGN KEY(doctor_id) REFERENCES ${KEY}_doctors_${SCHEMA_VERSION}(id)
    )
  `);

  // Login endpoint
  if (request.method === 'POST' && new URL(request.url).pathname === '/login') {
    const { username, password } = await request.json();
    const users = await sqlite.execute(
      `SELECT * FROM ${KEY}_users_${SCHEMA_VERSION} WHERE username = ? AND password = ?`,
      [username, password]
    );

    if (users.rows.length > 0) {
      return new Response(JSON.stringify({
        success: true,
        user: users.rows[0],
        userType: users.rows[0].type
      }), { headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ success: false }), { headers: { 'Content-Type': 'application/json' } });
  }

  // Registration endpoint
  if (request.method === 'POST' && new URL(request.url).pathname === '/register') {
    const { username, password, name, email, type, specialty } = await request.json();
    
    // Check if username already exists
    const existingUser = await sqlite.execute(
      `SELECT * FROM ${KEY}_users_${SCHEMA_VERSION} WHERE username = ?`,
      [username]
    );
    
    if (existingUser.rows.length > 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Username already exists' 
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    // Insert user
    const userResult = await sqlite.execute(
      `INSERT INTO ${KEY}_users_${SCHEMA_VERSION} 
      (username, password, name, email, type) VALUES (?, ?, ?, ?, ?)`,
      [username, password, name, email, type]
    );

    // If user is a doctor, insert additional doctor information
    if (type === 'doctor') {
      await sqlite.execute(
        `INSERT INTO ${KEY}_doctors_${SCHEMA_VERSION} 
        (user_id, name, specialty) VALUES (?, ?, ?)`,
        [userResult.lastInsertRowid, name, specialty]
      );
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Registration successful' 
    }), { headers: { 'Content-Type': 'application/json' } });
  }

  // Doctors endpoint
  if (request.method === 'GET' && new URL(request.url).pathname === '/doctors') {
    const doctors = await sqlite.execute(`
      SELECT d.*, u.name as username 
      FROM ${KEY}_doctors_${SCHEMA_VERSION} d
      JOIN ${KEY}_users_${SCHEMA_VERSION} u ON d.user_id = u.id
    `);
    return new Response(JSON.stringify(doctors.rows), { headers: { 'Content-Type': 'application/json' } });
  }

  // Appointments endpoint
  if (request.method === 'GET' && new URL(request.url).pathname === '/appointments') {
    const appointments = await sqlite.execute(`
      SELECT 
        a.*, 
        p.name as patientName, 
        d.name as doctorName 
      FROM ${KEY}_appointments_${SCHEMA_VERSION} a
      JOIN ${KEY}_users_${SCHEMA_VERSION} p ON a.patient_id = p.id
      JOIN ${KEY}_doctors_${SCHEMA_VERSION} d ON a.doctor_id = d.id
    `);
    return new Response(JSON.stringify(appointments.rows), { headers: { 'Content-Type': 'application/json' } });
  }

  // Book Appointment endpoint
  if (request.method === 'POST' && new URL(request.url).pathname === '/book-appointment') {
    const { doctorId, patientId, date, time, reason } = await request.json();
    
    // Check for existing appointments at the same time
    const conflictingAppointments = await sqlite.execute(
      `SELECT * FROM ${KEY}_appointments_${SCHEMA_VERSION} 
       WHERE doctor_id = ? AND date = ? AND time = ?`,
      [doctorId, date, time]
    );

    if (conflictingAppointments.rows.length > 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'This time slot is already booked' 
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    await sqlite.execute(
      `INSERT INTO ${KEY}_appointments_${SCHEMA_VERSION} 
      (doctor_id, patient_id, date, time, reason) VALUES (?, ?, ?, ?, ?)`,
      [doctorId, patientId, date, time, reason]
    );
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  }

  // Render main page
  return new Response(`
    <html>
      <head>
        <title>Hospital Booking System</title>
        <style>${css}</style>
      </head>
      <body>
        <div id="root"></div>
        <script src="https://esm.town/v/std/catch"></script>
        <script type="module" src="${import.meta.url}"></script>
      </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// CSS remains the same as in the previous version
const css = `
body {
  font-family: 'Arial', sans-serif;
  background-color: #f0f4f8;
  margin: 0;
  padding: 0;
  line-height: 1.6;
}
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
.login-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  padding: 30px;
  text-align: center;
}
.login-container form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.error-message {
  color: red;
  margin-bottom: 10px;
}
input, select, textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
button {
  background-color: #2c3e50;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.link-button {
  background: none;
  color: blue;
  text-decoration: underline;
  margin-left: 5px;
}
button:hover {
  background-color: #34495e;
}
.doctor-list, .appointments-list {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}
.doctor-card, .appointment-card {
  background: #f9f9f9;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 10px;
}
.logout-btn {
  background-color: #e74c3c;
}
.logout-btn:hover {
  background-color: #c0392b;
}
.source-link {
  display: block;
  text-align: center;
  margin-top: 20px;
  color: #666;
  text-decoration: none;
}
`;
