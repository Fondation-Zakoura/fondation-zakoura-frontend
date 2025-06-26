import React, { useState } from 'react';
import { useLoginUserMutation } from '../../features/api/authApi';
import { useDispatch } from 'react-redux';
import { login } from '../../features/user/userSlice';
import { useNavigate } from 'react-router-dom';
import girl from '../../../src/assets/images/login/girl.png'; // Assuming this path is correct
import logo from "../../../src/assets/images/zakoura-logo.svg"; // Import the logo

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginUser, { isLoading, error }] = useLoginUserMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await loginUser({ email, password }).unwrap();
      dispatch(login({ token: result.token }));
      console.log('user logged in successfully');
      navigate('/');
    } catch (err) {
      console.error('Failed to login:', err);
    }
  };

  return (
    // Outer container for the whole page background and centering
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center " // Ensures overall centering and background image behavior
      style={{ backgroundImage: "url('/src/assets/images/login/course-lg.jpg')" }}
    >
      {/* Inner container for the image and form, structured with flex for equal heights */}
      {/* flex-col stacks children on small screens, md:flex-row makes them row on medium and up */}
      {/* items-stretch ensures children (image section and form section) have equal height */}
      {/* max-w-4xl and mx-auto center the card, bg-white, shadow, and rounded-lg style it */}
      <div className="flex flex-col md:flex-row bg-white shadow-2xl rounded-lg overflow-hidden w-full max-w-4xl mx-auto items-stretch">

        {/* Image Section - now takes 2/5 (40%) width on medium screens and up */}
        {/* flex-shrink-0 prevents the image section from shrinking below its defined width */}
        <div className="relative w-full md:w-2/5 flex-shrink-0 ">
          {/* Main image covering the section */}
          <img
            src={girl}
            alt="Illustration of a girl"
            className="object-cover w-full h-full rounded-lg md:rounded-none"
          />

          <div className="absolute inset-0  rounded-lg md:rounded-none"></div>
        
          <div className="absolute inset-x-0 bottom-14 p-8 text-white text-left ">
            <p className="text-3xl font-semibold mb-2">Le devoir d'agir</p>
            <p className="text-sm">
              Veuillez utiliser vos identifiants pour vous connecter.<br />
              Si vous n'êtes pas membre, veuillez nous contacter.
            </p>
          </div>
        </div>


        <div className="w-full md:w-3/5 p-8 flex flex-col  gap-8 m-4 ">
    
          <div className="flex  ">
            <img src={logo} alt="Zakoura Logo" className="h-10" /> 
          </div>

          <form onSubmit={handleSubmit} >
            <div className='relative'>
              <label className="block absolute -top-3 left-8 bg-clip-border text-gray-700 mb-2" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className=" py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors duration-200 disabled:opacity-60"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
            {error && (
              <p className="text-red-600 text-center mt-2">Login failed. Please check your credentials.</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
