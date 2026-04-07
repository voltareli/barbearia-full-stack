import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import cors from 'cors';
import twilio from "twilio";
import jwt from "jsonwebtoken";

function gerarToken(payload, chave, expira) {
    return jwt.sign(payload, chave, { expiresIn: expira });
}


dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

async function connectdb() {
    try {
        const connection = await mysql.createConnection({
            host: "127.0.0.1",
            user: "root",
            database: "db_cabeleleiro"
        });
        console.log('✅ Conectado ao banco de dados com sucesso!');
        return connection;
    } catch (error) {
        console.error("❌ Erro ao conectar no banco de dados:", error);
        throw error;
    }
}

app.get('/', (req, res) => {
    res.json('Hello World!');
});


app.post('/enviarSms', async (req, res) => {
    const { telefone } = req.body;

    if (!telefone) {
        return res.status(400).json({ erro: "Telefone não enviado" });
    }

    const gerarCodigo = () => Math.floor(1000 + Math.random() * 9000);
    const codigo = gerarCodigo();

    //coloque seus acessos nos x's
    const client = twilio(
        "x",
        "x"
    );

    try {
        await client.messages.create({
            body: `Olá! Seu código de verificação é: ${codigo}`,
            from: 'x',
            to: `+55${telefone}`
        });

        return res.status(200).json(codigo);

    } catch (erro) {
        console.error("Erro ao enviar SMS:", erro);
        return res.status(500).json({ erro: "Falha ao enviar SMS" });
    }
});


app.post('/enviar-aviso', async (req, res) => {
    const { telefone, nome } = req.body;

    if (!telefone || !nome) {
        return res.status(400).json({ erro: "Telefone ou nome não enviado" });
    }

    const client = twilio(
        "x",
        "x"
    );

    try {
        await client.messages.create({
            body: `Olá ${nome}, sou o Nicolas da Barber Shop e infelizmente seu agendamento foi cancelado por motivos pessoais!
Para remarcar basta acessar o nosso site!`,
            from: 'x',
            to: `+55${telefone}`
        });

        return res.status(200);

    } catch (erro) {
        console.error("Erro ao enviar SMS:", erro);
        return res.status(500).json({ erro: "Falha ao enviar SMS" });
    }
});

app.post('/validar', async (req, res) => {
    const { telefone, senha } = req.body;

    if (!telefone || !senha) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios." });
    }

    let conn;

    try {
        conn = await connectdb();
        const [rows] = await conn.execute(`
            SELECT id_usuario, telefone, nome, senha
            FROM tb_registro
            WHERE telefone = ?
        `, [telefone]);

        if (rows.length === 0) {
            return res.json({ sucesso: false });
        }

        const usuario = rows[0];


        const token = gerarToken(
            { id_usuario: usuario.id_usuario, telefone: usuario.telefone },
            "AcessoPrivado",
            "1h"
        );

        return res.json({
            sucesso: true,
            token: token,
            dados: usuario
        });

    } catch (error) {
        return res.status(500).json({ sucesso: false, error: error.message });
    } finally {
        if (conn) conn.end();
    }
});

app.post('/validar2', async (req, res) => {
    const { id_usuario } = req.body;

    if (!id_usuario) {
        return res.status(400).json({ message: "ID obrigatório" });
    }

    let conn;

    try {
        conn = await connectdb();
        const [rows] = await conn.execute(`
            SELECT nome FROM tb_registro WHERE id_usuario = ?
        `, [id_usuario]);

        if (rows.length === 0) return res.json({ sucesso: false });

        return res.json({ dados: rows });

    } catch (error) {
        return res.status(500).json({ sucesso: false, error: error.message });
    } finally {
        if (conn) conn.end();
    }
});



app.post('/adicionarRegistro', async (req, res) => {
    const { telefone, nome, senha } = req.body;

    if (!telefone || !nome || !senha) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios." });
    }

    let conn;

    try {
        conn = await connectdb();

        const [result] = await conn.execute(`
            INSERT INTO tb_registro (telefone, nome, senha)
            VALUES (?, ?, ?)
        `, [telefone, nome, senha]);

        const id_usuario = result.insertId;
        const token = gerarToken(
            { id_usuario: id_usuario, telefone: telefone },
            "AcessoPrivado",
            "1h"
        );

        return res.json({
            sucesso: true,
            id_usuario,
            token
        });

    } catch (error) {
        return res.status(500).json({ sucesso: false, error: error.message });
    } finally {
        if (conn) conn.end();
    }
});


function gerarHorariosFixos() {
    const horarios = [];
    let inicio = 8 * 60;
    const fim = 20 * 60;
    const pausaInicio = 12 * 60;
    const pausaFim = pausaInicio + 40;

    while (inicio < fim) {


        if (inicio >= pausaInicio && inicio < pausaFim) {
            inicio = pausaFim;
            continue;
        }

        const h = Math.floor(inicio / 60).toString().padStart(2, '0');
        const m = (inicio % 60).toString().padStart(2, '0');

        horarios.push(`${h}:${m}`);

        inicio += 40;
    }

    return horarios;
}


app.post('/horariosDisponiveis', async (req, res) => {
    const { dia } = req.body;
    let conn;

    try {
        conn = await connectdb();

        const [result] = await conn.execute(`
            SELECT horario_inicio
            FROM tb_agendamentos
            WHERE dia = ?
        `, [dia]);

        const ocupados = result.map(r => r.horario_inicio.substring(0, 5));
        const todos = gerarHorariosFixos();

        const livres = todos.filter(h => !ocupados.includes(h));

        return res.json({
            sucesso: true,
            horarios_disponiveis: livres
        });

    } catch (error) {
        return res.status(500).json({ sucesso: false, error: error.message });
    } finally {
        if (conn) conn.end();
    }
});

function calcularHorarioFim(horarioInicio) {
    const [h, m] = horarioInicio.split(':').map(Number);
    const inicioMin = h * 60 + m;
    const fimMin = inicioMin + 40;

    const fh = Math.floor(fimMin / 60).toString().padStart(2, '0');
    const fm = (fimMin % 60).toString().padStart(2, '0');

    return `${fh}:${fm}`;
}


app.post('/adicionarAgendamento', async (req, res) => {
    const { id_usuario, dia, horario_inicio, servicos, valor } = req.body;

    let conn;

    try {
        conn = await connectdb();

        const horario_fim = calcularHorarioFim(horario_inicio);

        const [result] = await conn.execute(`
            INSERT INTO tb_agendamentos
            (id_usuario, dia, horario_inicio, horario_fim, servicos, valor)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            id_usuario,
            dia,
            horario_inicio,
            horario_fim,
            JSON.stringify(servicos),
            valor
        ]);

        return res.json({
            sucesso: true,
            id_agendamento: result.insertId
        });

    } catch (error) {
        return res.status(500).json({ sucesso: false, error: error.message });
    } finally {
        if (conn) conn.end();
    }
});

app.post("/listarAgendamentos", async (req, res) => {
    const { id_usuario } = req.body;

    try {
        const conn = await connectdb();
        await conn.execute("SET lc_time_names = 'pt_BR'");

        const comando = `
            SELECT 
                id_agendamento,
                dia,
                DATE_FORMAT(dia, '%a, %d de %M de %Y') AS dia_formatado,
                horario_inicio,
                horario_fim,
                servicos,
                valor
            FROM tb_agendamentos
            WHERE id_usuario = ?
            ORDER BY dia ASC, horario_inicio ASC
        `;

        const [rows] = await conn.execute(comando, [id_usuario]);

        const resultado = rows.map(r => ({
            id_agendamento: r.id_agendamento,
            dia_formatado: r.dia_formatado,
            horario_inicio: r.horario_inicio,
            horario_fim: r.horario_fim,
            servicos: JSON.parse(r.servicos)
        }));

        return res.json({
            sucesso: true,
            agendamentos: resultado
        });

    } catch (err) {
        console.log(err);
        return res.json({ sucesso: false });
    }
});


app.post("/listarAgendamentosGeral", async (req, res) => {
    try {
        const { Dia } = req.body;

        if (!Dia) {
            return res.json({
                sucesso: false,
                mensagem: "Envie o dia no formato YYYY-MM-DD"
            });
        }

        const conn = await connectdb();
        await conn.execute("SET lc_time_names = 'pt_BR'");

        const comando = `
        SELECT 
            a.id_agendamento,
            a.dia,
            DATE_FORMAT(a.dia, '%a, %d de %M de %Y') AS dia_formatado,
            a.horario_inicio,
            a.horario_fim,
            a.servicos,
            a.valor,
            a.id_usuario,
            u.nome,
            u.telefone
        FROM tb_agendamentos a
        JOIN tb_registro u ON u.id_usuario = a.id_usuario
        WHERE DATE(a.dia) = ?
        ORDER BY a.horario_inicio ASC
        `;

        const [rows] = await conn.execute(comando, [Dia]);

        const resultado = rows.map(r => ({
            id_agendamento: r.id_agendamento,
            dia_formatado: r.dia_formatado,
            horario_inicio: r.horario_inicio,
            horario_fim: r.horario_fim,
            servicos: JSON.parse(r.servicos),
            id_usuario: r.id_usuario,
            nome: r.nome,
            telefone: r.telefone,
            valor: r.valor
        }));

        return res.json({
            sucesso: true,
            agendamentos: resultado
        });

    } catch (err) {
        console.log(err);
        return res.json({ sucesso: false });
    }
});

app.post("/cancelarAgendamento", async (req, res) => {
    const { id_agendamento } = req.body;

    if (!id_agendamento) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "Dados inválidos"
        });
    }

    try {
        const conn = await connectdb();

        const comando = `
            DELETE FROM tb_agendamentos 
            WHERE id_agendamento = ? 
        `;

        const [result] = await conn.execute(comando, [id_agendamento]);

        if (result.affectedRows === 0) {
            return res.json({
                sucesso: false,
                mensagem: "Agendamento não encontrado ou não pertence ao usuário"
            });
        }

        return res.json({
            sucesso: true,
            mensagem: "Agendamento cancelado com sucesso!"
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao cancelar agendamento"
        });

    }
});
const port = 3010;
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});