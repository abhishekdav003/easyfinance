import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginAdmin } from '../services/api'; // import your login service
import { loginAgent } from '../services/agentAPI';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loginType, setLoginType] = useState('');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (location.state && location.state.loginType) {
      setLoginType(location.state.loginType);
    }
  }, [location]);

    const handleSubmit = async (e) => {
      e.preventDefault();

      try {
        const formData = { emailOrUsername, password };
        console.log('Logging in with:', formData, 'as', loginType);

        let res;
        if (loginType === 'admin') {
          res = await loginAdmin(formData); // Admin login request
          localStorage.setItem('admin', JSON.stringify(res.data.data));  // Store admin data
          navigate('/admin-dashboard');
        } else if (loginType === 'agent') {
          // For agent, adjust payload to match the backend expectations
          const agentData = { emailOrUsername, password };  // Use emailOrUsername as input
          res = await loginAgent(agentData);  // Agent login request

          // Since backend sets cookies, no need to store tokens in localStorage
          // But you can store the agent's profile data if needed for immediate use
          localStorage.setItem('agent', JSON.stringify(res.data.data.agent)); // Store agent data (excluding password)

          navigate('/agent-dashboard');
        }

        alert(res.data.message); // Show success message
      } catch (err) {
        console.error('Full error:', err);

        if (err.response) {
          console.error('Error response:', err.response);
          alert(err.response.data?.message || 'Login failed');
        } else {
          console.error('Error message:', err.message);
          alert('Network error: ' + err.message);
        }
      }
    };


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 text-white">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
            <p>
              {loginType === 'admin'
                ? 'Admin Portal Access'
                : loginType === 'agent'
                ? 'Agent Portal Access'
                : 'Account Login'}
            </p>
          </div>
        </div>

        <div className="p-8">
          {!loginType ? (
            <div className="mb-6 space-y-4">
              <button
                onClick={() => setLoginType('admin')}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors duration-300"
              >
                Login as Admin
              </button>
              <button
                onClick={() => setLoginType('agent')}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-300"
              >
                Login as Agent
              </button>
              <div className="text-center mt-6">
                <button
                  onClick={() => navigate('/agent-dashboard')}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Back to Home
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Username or Email
                </label>
                <input
                  id="usernameOrEmail"
                  type="text"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your username or email"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800">
                    Forgot Password?
                  </a>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300"
              >
                Sign In
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setLoginType('')}
                  className="text-gray-600 hover:text-gray-800 text-sm"
                >
                  Change Login Type
                </button>
              </div>

              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Back to Home
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
