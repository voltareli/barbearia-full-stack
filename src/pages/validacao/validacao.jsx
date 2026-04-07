import './validacao.scss';

import Foto from '../../images/logo.png'
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

function Login() {

  const [Valor1, setValor1] = useState('');
  const [Valor2, setValor2] = useState('');
  const [Valor3, setValor3] = useState('');
  const [Valor4, setValor4] = useState('');
  const [Condicao, setCondicao] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const inputs = document.querySelectorAll(".code");

    inputs.forEach((inp, i) => {
      inp.addEventListener("input", () => {
        if (inp.value.length === 1) {
          inputs[i + 1]?.focus();
        }
      });

      inp.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && inp.value === "") {
          inputs[i - 1]?.focus();
        }
      });
    });
  }, []);

  const codigoToken = localStorage.getItem('tokenValidacao');
  const Senha = localStorage.getItem('Senha');
  const Telefone = localStorage.getItem('Telefone');
  const Nome = localStorage.getItem('Nome');
  let codigoTela = `${Valor1}${Valor2}${Valor3}${Valor4}`;

  async function ComaparacaoToken() {
    try {
      setCondicao(true);

      if (codigoTela !== codigoToken) {
        Swal.fire({
          icon: "error",
          title: "Código incorreto!",
          text: "Verifique o código e tente novamente.",
          confirmButtonColor: "#000",
        });
        setCondicao(false);
        return;
      }

      const url = "http://localhost:3010/adicionarRegistro";
      const info = {
        telefone: Telefone,
        nome: Nome,
        senha: Senha,
      };

      const resposta = await axios.post(url, info);

      if (resposta.status === 200) {

        Swal.fire({
          icon: "success",
          title: "Cadastro concluído!",
          text: resposta.data.message,
          confirmButtonColor: "#000",
        });

        localStorage.setItem('id_usuario', resposta.data.id_usuario);
        localStorage.setItem("TokenAcesso", resposta.data.token);
        setCondicao(false);

        window.location.href = "/principal";
      } else {
        Swal.fire({
          icon: "warning",
          title: "Erro ao cadastrar!",
          text: "Tente novamente mais tarde.",
          confirmButtonColor: "#000",
        });
        setCondicao(false);
      }

    } catch (erro) {
      console.error("Erro:", erro);

      Swal.fire({
        icon: "error",
        title: "Falha inesperada",
        text: "Não foi possível concluir o cadastro.",
        confirmButtonColor: "#000",
      });

      setCondicao(false);
    }
  }

  return (
    <div className="Principal3">

      <div className='conteudo'>

        <div className='imagem'>
          <img src={Foto} alt="logo" />
        </div>

        {!Condicao ? (
          <div className='titulo'>
            <h3>Verifique o código enviado no seu celular</h3>
          </div>
        ) : <div></div>}

        {!Condicao ? (
          <div className='infos-cadastro'>
            <div className='inputs'>
              <div className="input-individual">
                <input type="text" maxLength="1" inputMode="numeric" className="code"
                  value={Valor1} onChange={(e) => setValor1(e.target.value)} />
              </div>

              <div className="input-individual">
                <input type="text" maxLength="1" inputMode="numeric" className="code"
                  value={Valor2} onChange={(e) => setValor2(e.target.value)} />
              </div>

              <div className="input-individual">
                <input type="text" maxLength="1" inputMode="numeric" className="code"
                  value={Valor3} onChange={(e) => setValor3(e.target.value)} />
              </div>

              <div className="input-individual">
                <input type="text" maxLength="1" inputMode="numeric" className="code"
                  value={Valor4} onChange={(e) => setValor4(e.target.value)} />
              </div>
            </div>

            <div className='texts'>
              <p>Reenviar código de verificação</p>
            </div>
          </div>
        ) : (
          <div className='spines-config'>
            <div className="spinner"></div>
            <h3 className="loading-text">Carregando<span className="dots"></span></h3>
          </div>
        )}

        {!Condicao ? (
          <div className='botao'>
            <button className='botao-personalizado' onClick={ComaparacaoToken}>
              Verificar
            </button>
          </div>
        ) : <div></div>}

      </div>
    </div>
  );
}

export default Login;