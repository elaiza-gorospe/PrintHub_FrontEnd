import './App.css';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import backgroundImage from './assets/images/pmg-image.jpg';
import AdminLoginPage from './Admin/Admin-login';
import AdminRegistrationPage from './Admin/Admin-registration';
import UserLoginPage from './Customer/User-login';
import UserRegistrationPage from './Customer/User-regis';
import UserHomePage from './Customer/User-home';
import UserOtpPage from './Customer/User-otp';
import CustomerDashboard from './Customer/User-dashboard';
import RoleSelectionPage from './RoleSelection';
import AdminDashboard from './Admin/Admin-dashboard';
import AdminProfile from './Admin/Admin-profile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/login" element={<RoleSelectionPage />} />
        <Route path="/user-login" element={<UserLoginPage />} />
        <Route path="/user-register" element={<UserRegistrationPage />} />
        <Route path="/user-otp" element={<UserOtpPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/user-dashboard" element={<CustomerDashboard/>} />
        <Route path="/admin-register" element={<AdminRegistrationPage />} />
        <Route path="/user-home" element={<UserHomePage />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

function NavbarComponent() {
  const navigate = useNavigate();
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <span onClick={() => navigate('/')}>PMG</span>
        </div>

        <ul className="navbar-menu">
          <li><a href="#home" onClick={() => navigate('/')}>Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
          <li><a href="#login" onClick={() => navigate('/login')} className="navbar-login">Login</a></li>
        </ul>
      </div>
    </nav>
  );
}

function HomePage() {
  const navigate = useNavigate();
  
  return (
    <div className="App">
      <NavbarComponent />
      <header className="App-header"
      
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
      </header>
      
      <main className="main-content">
        <section className="content-section">
          <h2>About PrintHub</h2>
          <p>PrintHub is a modern printing management platform designed to streamline your printing needs.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '20px' }}>
          </div>
        </section>
      </main>
    </div>
  );
}



export default App;
