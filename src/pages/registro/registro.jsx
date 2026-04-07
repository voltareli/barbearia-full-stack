import './registro.scss';
import Foto from '../../images/logo.png'
import { Link, useNavigate } from 'react-router-dom';
import bcrypt from "bcryptjs";
import { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; // IMPORTANTE

function Registro() {
  const [Telefone, setTelefone] = useState('');
  const [Nome, setNome] = useState('');
  const [Senha, setSenha] = useState('');
  const navigate = useNavigate()

  async function SalvarInfos() {


    if (!Nome && !Telefone && !Senha) {
      Swal.fire({
        icon: "warning",
        title: "Campos vazios",
        text: "Preencha todos os campos antes de continuar.",
        confirmButtonColor: "#000"
      });
      return;
    }

    if (!Nome) {
      Swal.fire({
        icon: "warning",
        title: "Nome faltando",
        text: "Por favor, preencha seu nome.",
        confirmButtonColor: "#000"
      });
      return;
    }

    if (!Senha) {
      Swal.fire({
        icon: "warning",
        title: "Senha faltando",
        text: "Digite uma senha válida.",
        confirmButtonColor: "#000"
      });
      return;
    }

    if (!Telefone) {
      Swal.fire({
        icon: "warning",
        title: "Telefone faltando",
        text: "Informe seu número de telefone.",
        confirmButtonColor: "#000"
      });
      return;
    }

    if (Telefone.length !== 11) {
      Swal.fire({
        icon: "error",
        title: "Telefone inválido",
        text: "O telefone deve conter exatamente 11 dígitos.",
        confirmButtonColor: "#000"
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(Senha, salt);

    try {
      const url = 'http://localhost:3010/enviarSms';
      let info = { telefone: Telefone };

      const resposta = await axios.post(url, info);

      localStorage.clear();
      localStorage.setItem('tokenValidacao', resposta.data);
      localStorage.setItem('Senha', hash);
      localStorage.setItem('Telefone', Telefone);
      localStorage.setItem('Nome', Nome);
      localStorage.setItem('tknRestricao', "liberadoParaVerificar");

      let opcao = localStorage.getItem('tknRestricao');
      console.log(opcao);
      

      if (opcao === "liberadoParaVerificar") {
        Swal.fire({
          icon: "success",
          title: "Código enviado!",
          text: "Enviamos o código de verificação para seu celular.",
          confirmButtonColor: "#000"
        });
        window.location.href = "/validacao";
      }

    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Erro ao enviar SMS",
        text: "Tente novamente mais tarde.",
        confirmButtonColor: "#000"
      });
    }
  }

  return (
    <div className="Principal">

      <div className='conteudo'>

        <div className='imagem'>
          <img src={Foto} alt="logo" />
        </div>

        <div className='infos-cadastro'>

          <div className='inputs'>
            <div className='input-individual'>
              <label>Telefone</label>
              <input type="text" maxLength={11} placeholder='Digite seu Telefone' value={Telefone} onChange={(e) => setTelefone(e.target.value)} />
            </div>
            <div className='input-individual'>
              <label>Nome</label>
              <input type="text" placeholder='Digite seu Nome' value={Nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div className='input-individual'>
              <label>Senha</label>
              <input type="password" placeholder='Digite sua Senha' value={Senha} onChange={(e) => setSenha(e.target.value)} />
            </div>
          </div>

          <div className='texts'>
            <p>Já possuo uma conta, ir para o</p>
            <Link to={'/'} className='escuro'>Login</Link>
          </div>
        </div>

        <div className='botao'>
          <button className='botao-personalizado' onClick={SalvarInfos}>
            Registrar
          </button>
        </div>

      </div>

    </div>
  );
}

export default Registro;