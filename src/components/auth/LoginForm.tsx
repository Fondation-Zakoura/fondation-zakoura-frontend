import React, { useState } from "react";
import { useLoginUserMutation } from "../../features/api/authApi";
import { useDispatch } from "react-redux";
import { login } from "../../features/user/userSlice";
import { useNavigate } from "react-router-dom";
import girl from "../../../src/assets/images/login/girl.png"; // Assuming this path is correct
import logo from "/zakoura-logo.svg"; // Import the logo

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginUser, { isLoading, error }] = useLoginUserMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await loginUser({ email, password }).unwrap();
      dispatch(login({ name: result.name, token: result.token }));
      console.log("user logged in successfully");
      navigate("/");
    } catch (err) {
      console.error("Failed to login:", err);
    }
  };

  return (
    // Outer container for the whole page background and centering
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center "
      style={{
        backgroundImage: "url('/src/assets/images/login/course-lg.jpg')",
      }}
    >
      <div className="flex flex-col md:flex-row bg-white shadow-2xl rounded-lg  max-w-2xl w-full lg:mx-7 mx-3  lg:max-w-4xl  ">
        <div className="relative w-full md:w-2/5 flex-shrink-1 ">
          {/* Main image covering the section */}
          <img
            src={girl}
            alt="Illustration of a girl"
            className="object-cover md:w-full md:h-full w-full h-55 rounded-lg md:rounded-none"
          />

          <div className="absolute lg:inset-x-0 lg:bottom-14 bottom-5 p-8 text-white text-left ">
            <p className="lg:text-3xl text-lg font-semibold mb-2">
              Le devoir d'agir
            </p>
            <p className="text-sm">
              Veuillez utiliser vos identifiants pour vous connecter.
              <br />
              Si vous n'êtes pas membre, veuillez nous contacter.
            </p>
          </div>
        </div>

        <div className=" flex-1 p-8 flex flex-col  gap-7 lg:m-4 lg:mx-7 ">
          <div className="flex  ">
            <img src={logo} alt="Zakoura Logo" className="h-9" />
          </div>
          <h6 className="text-start font-medium text-gray-500">Se connecter</h6>
          <form onSubmit={handleSubmit} className="flex flex-col gap-7 ">
            <div className="relative">
              <label
                className="block absolute text-gray-500 bg-white px-0.5 text-sm -top-2.5 left-8 bg-clip-border  mb-2"
                htmlFor="email"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className=" px-2 w-full py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div className="relative">
              <label
                className="block absolute bg-white px-0.5 text-sm -top-2.5 left-8  text-gray-500 mb-2"
                htmlFor="password"
              >
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div className="flex justify-between">
              <button className="text-sm text-gray-600 cursor-pointer hover:text-blue-900">
                Mot de passe oublié ?
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className=" py-3 text-sm lg:px-11 px-8 bg-[#00365a] hover:bg-[#001E31] cursor-pointer text-white font-semibold rounded-full transition-colors shadow-lg duration-200 disabled:opacity-60"
              >
                Connexion
              </button>
            </div>
            {error && (
              <p className="text-red-600 text-center mt-2">
                Login failed. Please check your credentials.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
