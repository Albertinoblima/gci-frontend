// src/routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Componentes de Layout e Proteção
import AppLayout from '../components/layout/AppLayout.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import PublicRoute from './PublicRoute.jsx';

// Páginas Principais
import LoginPage from '../pages/LoginPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import ChatPage from '../pages/chat/ChatPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';

// Páginas de Administração
import MunicipiosPage from '../pages/admin/MunicipiosPage.jsx';
import UsuariosPage from '../pages/admin/UsuariosPage.jsx';
import ConfiguracoesPage from '../pages/admin/ConfiguracoesPage.jsx';
import DiagnosticPage from '../pages/DiagnosticPage.jsx';
import SecretariasPage from '../pages/SecretariasPage.jsx'; // Garanta que este import está correto
import ServicosPage from '../pages/ServicosPage.jsx';
import EspecialidadesMedicasPage from '../pages/saude/EspecialidadesMedicasPage.jsx';
import UnidadesSaudePage from '../pages/saude/UnidadesSaudePage.jsx';
import ProfissionaisSaudePage from '../pages/saude/ProfissionaisSaudePage.jsx';
import HorariosPage from '../pages/saude/HorariosPage.jsx';
import AgendamentosPage from '../pages/saude/AgendamentosPage.jsx';
import EscolasPage from '../pages/educacao/EscolasPage.jsx';
import SolicitacoesMatriculaPage from '../pages/educacao/SolicitacoesMatriculaPage.jsx';
import AtendimentosPage from '../pages/AtendimentosPage.jsx';
import CidadaosPage from '../pages/CidadaosPage.jsx';

/**
 * Componente que centraliza todas as definições de rotas da aplicação.
 * Versão final e robusta.
 */
const AppRoutes = () => {
    return (
        <Routes>
            {/* Rota Pública de Login */}
            <Route
                path="/login"
                element={<PublicRoute><LoginPage /></PublicRoute>}
            />

            {/* Rota Raiz redireciona para o dashboard */}
            <Route
                path="/"
                element={<Navigate to="/dashboard" replace />}
            />

            {/* 
              * ROTA PAI PARA TODAS AS PÁGINAS PROTEGIDAS 
              * Todas as rotas filhas aqui dentro serão renderizadas dentro do AppLayout.
            */}
            <Route
                path="/"
                element={<ProtectedRoute><AppLayout /></ProtectedRoute>}
            >
                {/* Rotas Comuns acessíveis a usuários logados */}
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="diagnostic" element={<DiagnosticPage />} />
                <Route path="chat" element={<ChatPage />} />
                <Route path="chat/:atendimentoId" element={<ChatPage />} />

                {/* Rota para configurações - acessível a usuários logados com roles específicos */}
                <Route
                    path="configuracoes"
                    element={
                        <ProtectedRoute roles={['admin_sistema', 'admin_municipio', 'gestor_secretaria', 'agente_saude', 'agente_educacao', 'agente_atendimento']}>
                            <ConfiguracoesPage />
                        </ProtectedRoute>
                    }
                />

                {/* Rota para atendimentos - acessível a agentes de atendimento e gestores */}
                <Route
                    path="atendimentos"
                    element={
                        <ProtectedRoute roles={['admin_sistema', 'admin_municipio', 'gestor_secretaria', 'agente_atendimento']}>
                            <AtendimentosPage />
                        </ProtectedRoute>
                    }
                />

                {/* Rota para cidadãos - acessível a gestores e administradores */}
                <Route
                    path="cidadaos"
                    element={
                        <ProtectedRoute roles={['admin_sistema', 'admin_municipio', 'gestor_secretaria']}>
                            <CidadaosPage />
                        </ProtectedRoute>
                    }
                />

                {/* --- ROTAS DE ADMINISTRAÇÃO --- */}

                {/* Rota para a lista de municípios */}
                <Route
                    path="admin/municipios"
                    element={
                        <ProtectedRoute roles={['admin_sistema']}>
                            <MunicipiosPage />
                        </ProtectedRoute>
                    }
                />

                {/* Rota para a lista de secretarias de um município específico */}
                <Route
                    path="admin/municipios/:municipioId/secretarias"
                    element={
                        <ProtectedRoute roles={['admin_sistema']}>
                            <SecretariasPage />
                        </ProtectedRoute>
                    }
                />

                {/* Rota para a lista de usuários */}
                <Route
                    path="admin/usuarios"
                    element={
                        <ProtectedRoute roles={['admin_sistema', 'admin_municipio']}>
                            <UsuariosPage />
                        </ProtectedRoute>
                    }
                />

                {/* Rota para a lista de serviços de uma secretaria específica */}
                <Route
                    path="admin/municipios/:municipioId/secretarias/:secretariaId/servicos"
                    element={<ProtectedRoute roles={['admin_sistema', 'admin_municipio', 'gestor_secretaria']}><ServicosPage /></ProtectedRoute>}
                />

                {/* Rota para a lista de especialidades médicas de um município específico */}
                <Route path="saude/especialidades" element={
                    <ProtectedRoute roles={['admin_sistema', 'admin_municipio', 'agente_saude', 'agente_atendimento']}>
                        <EspecialidadesMedicasPage />
                    </ProtectedRoute>
                } />

                {/* Rota para a lista de unidades de saúde de um município específico */}
                <Route path="saude/unidades" element={
                    <ProtectedRoute roles={['admin_sistema', 'admin_municipio']}>
                        <UnidadesSaudePage />
                    </ProtectedRoute>
                } />

                {/* Rota para a lista de profissionais de saúde de um município específico */}
                <Route path="saude/profissionais" element={
                    <ProtectedRoute roles={['admin_sistema', 'admin_municipio', 'gestor_secretaria']}>
                        <ProfissionaisSaudePage />
                    </ProtectedRoute>
                } />

                {/* Rota para a lista de horários/agendas de saúde de um município específico */}
                <Route path="saude/agendas" element={<ProtectedRoute roles={['admin_sistema', 'admin_municipio', 'agente_saude']}><HorariosPage /></ProtectedRoute>} />

                {/* Rota para a lista de agendamentos de saúde de um município específico */}
                <Route path="saude/agendamentos" element={<ProtectedRoute roles={['admin_sistema', 'admin_municipio', 'agente_saude']}><AgendamentosPage /></ProtectedRoute>} />

                {/* Rota para a lista de escolas de um município específico */}
                <Route path="educacao/escolas" element={<ProtectedRoute roles={['admin_sistema', 'admin_municipio', 'agente_educacao']}><EscolasPage /></ProtectedRoute>} />

                {/* Rota para solicitações de matrícula de um município específico */}
                <Route path="educacao/matriculas" element={<ProtectedRoute roles={['admin_sistema', 'admin_municipio', 'agente_educacao']}><SolicitacoesMatriculaPage /></ProtectedRoute>} />

                {/* Adicionar futuras rotas de admin aqui seguindo o mesmo padrão... */}

            </Route>

            {/* Rota de Fallback (404) - Sempre a última */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};

export default AppRoutes;