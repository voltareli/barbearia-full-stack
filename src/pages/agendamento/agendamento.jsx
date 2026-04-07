import './agendamento.scss';
import Foto from '../../images/logo.png';
import { useState } from 'react';
import axios from 'axios';


import Bigode from '../../images/bigode.png';
import Luzes from '../../images/luzes.png';
import Corte from '../../images/corte.png';
import Sobrancelha from '../../images/sobrancelha.png';
import Barba from '../../images/barba.png';
import Raspar from '../../images/careca.png';
import Platinado from '../../images/platinado.png';
import Progressiva from '../../images/progressiva.png';
import Penteado from '../../images/penteado.png';
import { Link, useNavigate } from 'react-router-dom';

import Swal from 'sweetalert2';

function NovoAgendamento() {
  const [modoEnvio, setModoEnvio] = useState(false);
  const [status, setStatus] = useState(""); 
  const [servicosSelecionados, setServicosSelecionados] = useState([]);
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [valor, setValor] = useState(0);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const navigate = useNavigate('');

  const servicos = [
    { nome: "Corte", preco: 35, imagem: Corte },
    { nome: "Barba", preco: 20, imagem: Barba },
    { nome: "Bigode", preco: 10, imagem: Bigode },
    { nome: "Sobrancelha", preco: 10, imagem: Sobrancelha },
    { nome: "Progressiva", preco: 70, imagem: Progressiva },
    { nome: "Luzes", preco: 80, imagem: Luzes },
    { nome: "Platinado", preco: 120, imagem: Platinado },
    { nome: "Raspagem", preco: 20, imagem: Raspar },
    { nome: "Penteado", preco: 10, imagem: Penteado }
  ];

  async function carregarHorarios(dia) {
    try {
      const resp = await axios.post("http://localhost:3010/horariosDisponiveis", { dia });

      if (resp.data.sucesso) {
        setHorariosDisponiveis(resp.data.horarios_disponiveis);
      } else {
        setHorariosDisponiveis([]);
      }
    } catch (erro) {
      console.log("Erro ao carregar horários:", erro);
      setHorariosDisponiveis([]);
    }
  }

  function selecionarServico(nome, preco) {
    let lista = [...servicosSelecionados];

    if (lista.includes(nome)) {
      lista = lista.filter(x => x !== nome);
      setValor(valor - preco);
    } else {
      lista.push(nome);
      setValor(valor + preco);
    }

    setServicosSelecionados(lista);
  }

  async function salvarAgendamento() {
    if (!data || !horario) {
      Swal.fire({
        icon: 'warning',
        title: 'Atenção',
        text: 'Selecione a data e o horário!',
        confirmButtonColor: '#3F3D56'
      });
      return;
    }

    const dados = {
      id_usuario: localStorage.getItem("id_usuario"),
      dia: data,
      horario_inicio: horario,
      servicos: servicosSelecionados,
      valor
    };

    try {
      setModoEnvio(true);
      setStatus("loading");

      const resp = await axios.post("http://localhost:3010/adicionarAgendamento", dados);

      if (resp.data.sucesso) {
        setStatus("sucesso");

        setHorario("");
        setServicosSelecionados([]);
        setValor(0);
        carregarHorarios(data);

        setTimeout(() => {
          setModoEnvio(false);
          setStatus("");
          navigate('/principal');
        }, 2000);

        return;
      }

      setStatus("erro");

      setTimeout(() => {
        setModoEnvio(false);
        setStatus("");
      }, 2000);

    } catch (err) {
      console.log(err);
      setStatus("erro");

      setTimeout(() => {
        setModoEnvio(false);
        setStatus("");
      }, 2000);
    }
  }

  const condicao = status !== "";

  return (
    <div className="PrincipalNovo">

      {!condicao ? (
        <div className='conteudoNovo'>

          <div className="logo">
            <img src={Foto} alt="logo" />
          </div>

          <h2 className='titulo'>Novo Agendamento</h2>

          <h3 className="subtitulo">Selecione os serviços:</h3>

          <div className="lista-servicos">
            {servicos.map(s => (
              <div className="servico" key={s.nome} onClick={() => selecionarServico(s.nome, s.preco)}>
                <p><img src={s.imagem} alt="" />{s.nome}</p>
                <input type="checkbox" checked={servicosSelecionados.includes(s.nome)} readOnly />
              </div>
            ))}
          </div>

          <h3 className='subtitulo'>Dia e Horário</h3>

          <div className="linha-data">
            <input
              type="date"
              value={data}
              onChange={e => {
                const novaData = e.target.value;
                setData(novaData);
                carregarHorarios(novaData);
              }}
            />

            <select value={horario} onChange={e => setHorario(e.target.value)}>
              <option value="">Selecione</option>
              {horariosDisponiveis.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          <p className='valor'>
            Valor Estimado: <strong>R$ {valor},00</strong>
          </p>

          <div className="botoes">
            <Link to={"/principal"}><button className="voltar">Voltar</button></Link>
            <button className="avancar" onClick={salvarAgendamento}>Agendar</button>
          </div>

        </div>
      ) : (
        <div className='spiner-logo'>
          <img src={Foto} alt="" />

          <div className='spines-config'>
            {status === "loading" && <>
              <div className="spinner"></div>
              <h3 className="loading-text">Agendando<span className="dots"></span></h3>
            </>}

            {status === "sucesso" && <>
              <div className="icon-sucesso">✓</div>
              <p className="msg-sucesso">Agendado com sucesso!</p>
            </>}

            {status === "erro" && <>
              <div className="icon-erro">✗</div>
              <p className="msg-erro">Falha ao agendar. Tente novamente.</p>
            </>}
          </div>
        </div>
      )}
    </div>
  );
}

export default NovoAgendamento;