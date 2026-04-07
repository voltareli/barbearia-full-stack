import './login.scss';
import Foto from '../../images/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import bcrypt from "bcryptjs";
import axios from 'axios';
import Swal from 'sweetalert2';

function Login() {

  const [Senha, setSenha] = useState('');
  const [Telefone, setTelefone] = useState('');
  const [condicao, setCondicao] = useState(false);
  const navigate = useNavigate();
  const TknAcessoAdm = 'validadoAdm'

  async function validacaoCadastro() {
    if(Telefone == 'adm' && Senha == 'adm123'){
       localStorage.setItem('AcessoRestrito', TknAcessoAdm);
       window.location.href = "http://localhost:3000/agendamento/adm"
       return;
      }

    if (!Senha || !Telefone) {
      Swal.fire({
        icon: 'warning',
        title: 'Atenção',
        text: 'Preencha todos os dados!',
        confirmButtonColor: '#3F3D56'
      });
      return;
    }

    if (Telefone.length !== 11) {
      Swal.fire({
        icon: 'error',
        title: 'Telefone Inválido',
        text: 'Adicione um telefone válido!',
        confirmButtonColor: '#3F3D56'
      });
      return;
    }

    setCondicao(true);


       
    try {
      const url = 'http://localhost:3010/validar';
      let info = { telefone: Telefone, senha: Senha };

      const resposta = await axios.post(url, info);

      let sucesso = resposta.data.sucesso;
      let dados = resposta.data.dados;

      if (!sucesso || !dados) {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Telefone incorreto!',
          confirmButtonColor: '#3F3D56'
        });
        setCondicao(false);
        return;
      }

      let senhaHash = dados.senha;
      let senhaCorreta = await bcrypt.compare(Senha, senhaHash);

      if (!senhaCorreta) {
        Swal.fire({
          icon: 'error',
          title: 'Senha incorreta!',
          text: 'Tente novamente.',
          confirmButtonColor: '#3F3D56'
        });
        setCondicao(false);
        return;
      }

      let token = resposta.data.token;

      let id_usuario = dados.id_usuario;
      localStorage.setItem('id_usuario', id_usuario);
      localStorage.setItem('TokenAcesso', token);

     window.location.href = "http://localhost:3000/principal"
      

    } catch (err) {
      console.error("ERRO:", err);
      Swal.fire({
        icon: 'error',
        title: 'Erro no servidor',
        text: 'Não foi possível conectar.',
        confirmButtonColor: '#3F3D56'
      });
      setCondicao(false);
    }
  }

  return (
    <div className="Principal2">

      <div className='conteudo'>

        <div className='imagem'>
          <img src={Foto} alt="logo" />
        </div>

        {!condicao ? (
          <div className='infos-cadastro'>
            <div className='inputs'>
              <div className='input-individual'>
                <label>Telefone</label>
                <input
                  type="text"
                  maxLength={11}
                  placeholder='Digite seu Telefone'
                  value={Telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                />
              </div>
              <div className='input-individual'>
                <label>Senha</label>
                <input
                  type="password"
                  placeholder='Digite sua Senha'
                  value={Senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
              </div>
            </div>

            <div className='texts'>
              <p>Não possuo uma conta, ir para o</p>
              <Link to={'/Registro'} className='escuro'>Cadastro</Link>
            </div>
          </div>
        ) : (
          <div className='spines-config'>
            <div className="spinner"></div>
            <h3 className="loading-text">Carregando<span className="dots"></span></h3>
          </div>
        )}

        {!condicao && (
          <div className='botao'>
            <button className='botao-personalizado' onClick={validacaoCadastro}>
              Entrar
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default Login;