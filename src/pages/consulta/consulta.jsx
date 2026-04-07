import './consulta.scss';
import Foto from '../../images/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import Calendario from '../../images/calendario.png';
import Lixeira from '../../images/lixeira.png';
import Sair from '../../images/sair.png';
import Perfil from '../../images/perfil.png';
import Seta from '../../images/seta.png';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Tel from '../../images/bolha-de-bate-papo.png'
import Cifrao from '../../images/cifrao (1).png'

function ConsultaADM() {
    const [carregando, setCarregando] = useState(true);
    const [Dia, setDia] = useState(() => {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const dia = String(hoje.getDate()).padStart(2, '0');
        return `${ano}-${mes}-${dia}`;
    });
    const [agendamentos, setAgendamentos] = useState([]);
    const navigate = useNavigate()



    function ExitPagina() {
        localStorage.clear()
        navigate('/')
    }

    useEffect(() => {
        carregarAgendamentos();
    }, [Dia]);

    async function carregarAgendamentos() {
        try {

            const resp = await axios.post("http://localhost:3010/listarAgendamentosGeral", { Dia }
            );

            if (resp.data.sucesso) {
                setAgendamentos(resp.data.agendamentos);
            } else {
                setAgendamentos([]);
            }

        } catch (err) {
            console.log("Erro ao carregar agendamentos:", err);
            setAgendamentos([]);
        }
    }



    async function cancelarAgendamento(id_agendamento, telefone, nome) {


        const confirmar = await Swal.fire({
            title: "Cancelar agendamento?",
            text: "Isso não poderá ser desfeito.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sim, cancelar",
            cancelButtonText: "Não",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#000"
        });

        if (!confirmar.isConfirmed) return;

        try {
            const resp = await axios.post(
                "http://localhost:3010/cancelarAgendamento",
                {
                    id_agendamento
                }
            );

            if (resp.data.sucesso) {

                Swal.fire({
                    icon: "success",
                    title: "Agendamento cancelado!",
                    confirmButtonColor: "#000"
                }).then(() => {
                    window.location.reload();   
                });

                try {
                    await axios.post("http://localhost:3010/enviar-aviso", {
                        telefone,
                        nome
                    });

                } catch (err) {
                    console.log("Erro ao enviar aviso:", err);
                }

               
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Erro",
                    text: resp.data.mensagem,
                    confirmButtonColor: "#000"
                });
            }

        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Erro ao cancelar!",
                text: "Tente novamente mais tarde.",
                confirmButtonColor: "#000"
            });
        }
    }

    useEffect(() => {
        async function carregarTudo() {
            await carregarAgendamentos();
            setCarregando(false);
        }

        carregarTudo();
    }, []);

    return (
        <div className="PrincipalHome2">

            {carregando ? (
                <div className="conteudo2">
                    <div className="imagem">
                        <img src={Foto} alt="logo" />
                    </div>

                    <div className="spines-config">
                        <div className="spinner"></div>
                        <h3 className="loading-text">Carregando<span className="dots"></span></h3>
                    </div>
                </div>
            ) : (
                <>
                    <header className="topo">
                        <div className='topo-1'>
                            <div className="menu-icon"><img src={Perfil} />
                                Administrador</div>
                            <div className="alert-icon">
                                <img className='diferente' src={Sair} onClick={() => ExitPagina()} />
                            </div>
                        </div>
                        <div className='linha'></div>
                    </header>

                    <div className="conteudoHome">

                        <div className="logo">
                            <img src={Foto} alt="logo" />
                        </div>

                        <h2 className="saudacao">Olá, Administrador!</h2>

                        <div className='linha2'></div>
                        <div className='data-container'>

                            <div className='data'>
                                <label>Selecione uma data:</label>
                                <input value={Dia} type="date" onChange={(e) => setDia(e.target.value)} />
                            </div>
                        </div>
                        <div className="agendamentos-ativos">
                            <p>Agendamentos do dia</p>

                            {agendamentos.length === 0 && (
                                <p style={{ color: "#888", marginTop: "20px" }}>Nenhum agendamento encontrado.</p>
                            )}

                            {agendamentos.map(item => (
                                <div className="card-agendamento" key={item.id_agendamento}>

                                    <div className="info-linha">
                                        <div className='inicial'>

                                            <div className="icone">
                                                <img src={Calendario} />
                                            </div>

                                            <div className='infos'>
                                                <p className='person'>{item.dia_formatado}</p>
                                                <p className="horario">{item.horario_inicio} - {item.horario_fim}</p>

                                                <div className='infos2'>
                                                    <div className='outro'>

                                                        <img src={Perfil} /><p className='person'>{item.nome}</p>
                                                    </div>
                                                    <div className='outro'>

                                                        <img src={Tel} /><p className="person">{item.telefone} </p>
                                                    </div>
                                                     <div className='outro'>

                                                      <img src={Cifrao} /> <p className="person"> {item.valor} </p>
                                                    </div>
                                                </div>
                                            </div>


                                        </div>

                                        <div className='icones'>

                                            <div className="icone" onClick={() => cancelarAgendamento(item.id_agendamento, item.telefone, item.nome)}>
                                                <img src={Lixeira} />
                                            </div>
                                        </div>
                                    </div>

                                    <p className="servicos">{item.servicos.join(", ")}</p>
                                </div>
                            ))}

                        </div>

                    </div>
                </>
            )}
        </div>
    );
}

export default ConsultaADM;