import './principal.scss';
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


function HomeAgendamentos() {
    const [carregando, setCarregando] = useState(true);
    const [nome, setNome] = useState('');
    const [agendamentos, setAgendamentos] = useState([]);
    const navigate = useNavigate()

    async function carregarUsuario() {
        try {
            const id_usuario = localStorage.getItem('id_usuario');

            const resp = await axios.post("http://localhost:3010/validar2", { id_usuario });

            setNome(resp.data.dados[0].nome);
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Erro!",
                text: "Erro ao buscar usuário.",
                confirmButtonColor: "#000"
            });
        }
    }

    function ExitPagina(){
        localStorage.clear()
        navigate('/')
    }

    useEffect(() => {
        carregarAgendamentos();
    }, []);

    async function carregarAgendamentos() {
        try {
            const id_usuario = localStorage.getItem("id_usuario");

            const resp = await axios.post("http://localhost:3010/listarAgendamentos", { id_usuario });

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

    

    async function cancelarAgendamento(id_agendamento) {


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
                    id_agendamento,
                    id_usuario: localStorage.getItem("id_usuario")
                }
            );

            if (resp.data.sucesso) {
                Swal.fire({
                    icon: "success",
                    title: "Agendamento cancelado!",
                    confirmButtonColor: "#000"
                });

                carregarAgendamentos();

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
            await carregarUsuario();
            await carregarAgendamentos();
            setCarregando(false);
        }

        carregarTudo();
    }, []);

    return (
        <div className="PrincipalHome">

            {carregando ? (
                <div className="conteudo">
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
                            {nome}</div>
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

                        <h2 className="saudacao">Olá, {nome}!</h2>

                        <Link className='novo-agendamento' to="/agendamento">
                            <div className="icone">
                                <img src={Calendario} />
                                <p>Novo Agendamento</p>
                            </div>
                            <div className='seta'><img src={Seta} /></div>
                        </Link>

                        <div className='linha2'></div>

                        <div className="agendamentos-ativos">
                            <p>Agendamentos Ativos</p>

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
                                            </div>
                                        </div>

                                        <div className='icones'>

                                            <div className="icone" onClick={() => cancelarAgendamento(item.id_agendamento)}>
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

export default HomeAgendamentos;