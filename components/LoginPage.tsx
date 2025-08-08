
import React, { useState } from 'react';
import { BeerIcon } from '../constants.js';
import { Configuracion } from '../types.js';

interface LoginPageProps {
  onLogin: (username: string, passwordAttempt: string) => boolean;
  appTitle: string;
  appConfig: Configuracion;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, appTitle, appConfig }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!onLogin(username, password)) {
      setError('Usuario o contraseña incorrectos.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 p-4 transition-colors duration-500">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 shadow-2xl rounded-xl p-6 md:p-8"> {/* Adjusted padding */}
          <div className="flex flex-col items-center mb-6"> {/* Adjusted margin-bottom */}
            <BeerIcon className="h-16 w-16 text-orange-500 dark:text-orange-400 mb-2" /> {/* Adjusted size and margin-bottom */}
            <h1 className="text-4xl font-elegant-title text-orange-600 dark:text-orange-400" style={{ fontFamily: "'Brush Script MT', cursive" }}> {/* Adjusted size */}
              {appConfig.nombre_restaurante || appTitle}
            </h1>
            {appConfig.slogan_restaurante && (
                <p className="text-lg text-amber-700 dark:text-amber-500 italic mt-1">
                    {appConfig.slogan_restaurante}
                </p>
            )}
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">Por favor, inicie sesión para continuar.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5"> {/* Adjusted space-y */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Usuario
              </label>
              <input
                id="username"
                name="username"
                autoComplete="username"
                required
                className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-100" /* Adjusted padding */
                placeholder="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm dark:bg-slate-700 dark:text-slate-100" /* Adjusted padding */
                placeholder="Escriba su contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 dark:text-red-400 text-center bg-red-50 dark:bg-red-800/20 p-2 rounded-md">
                {error}
              </p>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 dark:bg-orange-600 dark:hover:bg-orange-700 dark:focus:ring-offset-slate-800 transition-colors duration-150" /* Adjusted padding */
              >
                Ingresar
              </button>
            </div>
          </form>
        </div>
        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400"> {/* Adjusted margin-top */}
          &copy; {new Date().getFullYear()} {appConfig.nombre_restaurante || appTitle}. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;