/**
 * @file gci-backend/src/services/atendimentoService.js
 * @description Lógica de negócios para a entidade Atendimentos.
 */

import db from '../config/db.js';
import AppError from '../utils/AppError.js';

/**
 * Gera uma string de protocolo única para um novo atendimento.
 * Formato: [SIGLA_MUNICIPIO]-[ANO]-[SEQUENCIAL]
 * Ex: GYN-2025-00001
 * @param {number} municipioId - O ID do município para buscar a sigla.
 * @returns {Promise<string>} A string do protocolo gerada.
 */
const generateProtocolo = async (municipioId) => {
    const anio = new Date().getFullYear();

    // Busca a sigla do município e o último sequencial do ano
    const municipioResult = await db.query(
        'SELECT sigla_protocolo FROM municipios WHERE id = $1',
        [municipioId]
    );

    if (municipioResult.rows.length === 0) {
        throw new AppError('Município não encontrado para gerar protocolo.', 404);
    }
    const sigla = municipioResult.rows[0].sigla_protocolo;

    const lastProtocolResult = await db.query(
        `SELECT protocolo_str FROM atendimentos 
     WHERE municipio_id = $1 AND protocolo_str LIKE $2 
     ORDER BY created_at DESC LIMIT 1`,
        [municipioId, `${sigla}-${anio}-%`]
    );

    let sequencial = 1;
    if (lastProtocolResult.rows.length > 0) {
        const ultimoSequencial = parseInt(lastProtocolResult.rows[0].protocolo_str.split('-')[2], 10);
        sequencial = ultimoSequencial + 1;
    }

    // Formata o sequencial com 5 dígitos (ex: 00001)
    const sequencialFormatado = String(sequencial).padStart(5, '0');

    return `${sigla}-${anio}-${sequencialFormatado}`;
};

const atendimentoService = {
    /**
     * Cria um novo atendimento no sistema.
     * @param {object} dadosAtendimento - Dados do atendimento.
     * @param {number} dadosAtendimento.cidadao_id - ID do cidadão.
     * @param {number} dadosAtendimento.municipio_id - ID do município.
     * @param {number} [dadosAtendimento.secretaria_id] - ID da secretaria (opcional no início).
     * @param {number} [dadosAtendimento.servico_id] - ID do serviço (opcional no início).
     * @param {string} dadosAtendimento.canal_origem - Canal de origem (ex: 'whatsapp', 'instagram').
     * @returns {Promise<object>} O objeto do atendimento criado.
     */
    create: async ({ cidadao_id, municipio_id, secretaria_id, servico_id, canal_origem }) => {
        const protocolo_str = await generateProtocolo(municipio_id);
        const status = 'aguardando_atendimento'; // Status inicial padrão

        const query = `
      INSERT INTO atendimentos 
        (protocolo_str, cidadao_id, municipio_id, secretaria_id, servico_id, canal_origem, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
        const values = [protocolo_str, cidadao_id, municipio_id, secretaria_id, servico_id, canal_origem, status];

        try {
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            // Trata erro de chave estrangeira ou outra violação de constraint
            console.error("Erro ao criar atendimento no banco de dados:", error);
            throw new AppError('Não foi possível criar o atendimento. Verifique os dados fornecidos.', 500);
        }
    },

    /**
     * Busca um atendimento pelo seu ID ou pela string do protocolo.
     * Esta função é otimizada para a tela de chat, trazendo dados do cidadão associado.
     * @param {string|number} idOrProtocolo - O ID (numérico) ou a string de protocolo do atendimento.
     * @returns {Promise<object>} O objeto do atendimento com dados do cidadão.
     */
    findByIdOrProtocolo: async (idOrProtocolo) => {
        // Verifica se o identificador é numérico (ID) ou string (protocolo)
        const isNumericId = /^\d+$/.test(idOrProtocolo);

        const query = `
      SELECT 
        a.*,
        c.nome_perfil_canal,
        c.telefone_principal,
        c.email_principal
      FROM atendimentos a
      JOIN cidadaos c ON a.cidadao_id = c.id
      WHERE ${isNumericId ? 'a.id = $1' : 'a.protocolo_str = $1'};
    `;

        try {
            const result = await db.query(query, [idOrProtocolo]);

            if (result.rows.length === 0) {
                throw new AppError('Atendimento não encontrado.', 404);
            }
            return result.rows[0];
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error("Erro ao buscar atendimento por ID ou Protocolo:", error);
            throw new AppError('Erro interno ao buscar atendimento.', 500);
        }
    },

    /**
     * Lista todos os atendimentos com filtros e paginação.
     * @param {object} filtros - Objeto com os filtros.
     * @param {number} filtros.municipio_id - Obrigatório para filtrar por município.
     * @param {string} [filtros.status] - Filtra por status.
     * @param {number} [filtros.secretaria_id] - Filtra por secretaria.
     * @param {number} [filtros.page=1] - Página atual.
     * @param {number} [filtros.limit=10] - Itens por página.
     * @returns {Promise<{atendimentos: object[], total: number, pages: number}>} Lista paginada de atendimentos.
     */
    list: async ({ municipio_id, status, secretaria_id, page = 1, limit = 10 }) => {
        if (!municipio_id) {
            throw new AppError('O ID do município é obrigatório para listar atendimentos.', 400);
        }

        const offset = (page - 1) * limit;
        let queryParams = [municipio_id];
        let whereClauses = ['a.municipio_id = $1'];

        if (status) {
            queryParams.push(status);
            whereClauses.push(`a.status = $${queryParams.length}`);
        }
        if (secretaria_id) {
            queryParams.push(secretaria_id);
            whereClauses.push(`a.secretaria_id = $${queryParams.length}`);
        }

        const whereString = whereClauses.join(' AND ');

        const countQuery = `SELECT COUNT(*) FROM atendimentos a WHERE ${whereString}`;
        const dataQuery = `
        SELECT 
            a.id, a.protocolo_str, a.status, a.created_at, a.updated_at,
            c.nome_perfil_canal,
            s.nome as nome_servico
        FROM atendimentos a
        JOIN cidadaos c ON a.cidadao_id = c.id
        LEFT JOIN servicos s ON a.servico_id = s.id
        WHERE ${whereString}
        ORDER BY a.updated_at DESC
        LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2};
    `;

        try {
            const countResult = await db.query(countQuery, queryParams);
            const total = parseInt(countResult.rows[0].count, 10);

            const dataResult = await db.query(dataQuery, [...queryParams, limit, offset]);

            return {
                atendimentos: dataResult.rows,
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            };
        } catch (error) {
            console.error("Erro ao listar atendimentos:", error);
            throw new AppError('Erro interno ao listar atendimentos.', 500);
        }
    }

    // ... outras funções (updateStatus, assignToAgente, etc.) serão adicionadas aqui futuramente.
};

export default atendimentoService;