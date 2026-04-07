import React from 'react';
import ReactDOM from 'react-dom/client';
import Registro from './pages/registro/registro.jsx';
import Login from './pages/login/login.jsx';
import Validacao from './pages/validacao/validacao.jsx';
import Principal from './pages/principal/principal.jsx';
import Agendamento from './pages/agendamento/agendamento.jsx';
import Consultas from './pages/consulta/consulta.jsx'
import { Route, Routes, BrowserRouter, Navigate } from 'react-router';
const token = localStorage.getItem("TokenAcesso");

function proteger(elemento) {
const token = localStorage.getItem("TokenAcesso");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return elemento;
}

function Restricao(elemento) {
  const tknRestricao = localStorage.getItem("tknRestricao");

  if (!tknRestricao) {
    return <Navigate to="/" replace />;
  }

  return elemento;
}

function Adm(elemento) {
  const tknAdm = localStorage.getItem("AcessoRestrito");

  if (!tknAdm) {
    return <Navigate to="/" replace />;
  }

  return elemento;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>

    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/Registro' element={<Registro />} />
       <Route
          path='/validacao'
          element={Restricao(<Validacao />)}
        />
          <Route
          path='/agendamento/adm'
          element={Adm(<Consultas/>)}
        />
        <Route
          path='/principal'
          element={proteger(<Principal />)}
        />

        <Route
          path='/agendamento'
          element={proteger(<Agendamento />)}
        />

      </Routes>
    </BrowserRouter>

  </React.StrictMode>
);