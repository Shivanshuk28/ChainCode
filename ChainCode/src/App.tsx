import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Login from './components/pages/login';
import Signup from './components/pages/signup';
import Problems from './components/pages/problems';
import { ProblemProvider } from './context/ProblemContext';
import LandingPage from './components/pages/landingPage';
import NFTPage from './components/pages/nftpage';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      setToken(data.token);
      // Redirect to problems page or dashboard
      window.location.href = '/problems';
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  };

  const handleSignup = async (username: string, email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        throw new Error('Signup failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      setToken(data.token);
      // Redirect to problems page or dashboard
      window.location.href = '/problems';
    } catch (error) {
      console.error('Signup error:', error);
      alert('Signup failed. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    // Redirect to landing page
    window.location.href = '/';
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup onSignup={handleSignup} />} />
        <Route 
          path="/problems" 
          element={
            token ? (
              <ProblemProvider>
                <Problems handleLogout={handleLogout} />
              </ProblemProvider>
            ) : (
              <Login onLogin={handleLogin} />
            )
          } 
        />
        <Route path="/nft" element={<NFTPage />} />
      </Routes>
    </Router>
  );
}

export default App;
