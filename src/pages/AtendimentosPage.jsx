// src/pages/AtendimentosPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
// Supondo que Atendimento, Secretaria, Municipio são classes/objetos da sua camada de API/serviço
// Exemplo: import { AtendimentoService, SecretariaService, MunicipioService } from "@/services";
// Para este exemplo, manterei a nomenclatura original que você usou.
// import { Atendimento, Secretaria, Municipio } from "@/entities/all"; // TODO: Implementar entities

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Badge não está sendo usado diretamente aqui, mas pode ser se expandir os cards de stats
import { Card, CardContent } from "@/components/ui/card"; // CardHeader, CardTitle não usados diretamente nos stats rápidos
import {
    Search,
    Plus,
    MessageSquare,
    Clock,
    UserCheck, // Ícone diferente para "Em Andamento"
    CheckCircle2, // Ícone diferente para "Resolvidos"
    Loader2, // Para o botão de refresh
    ServerCrash // Para estado de erro
} from "lucide-react";

import FiltrosAtendimento from "../components/atendimentos/FiltrosAtendimento.jsx"; // Ajuste o caminho se necessário
import ListaAtendimentos from "../components/atendimentos/ListaAtendimentos.jsx";
import ModalAtendimento from "../components/atendimentos/ModalAtendimento.jsx";

// Componente para os cards de estatísticas rápidas
const StatCard = ({ title, value, icon: Icon, colorClass = "text-emerald-600 dark:text-emerald-500" }) => (
    <Card className="dark:bg-slate-850 dark:border-slate-700">
        <CardContent className="p-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{title}</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
                </div>
                <Icon className={`w-7 h-7 sm:w-8 sm:h-8 ${colorClass}`} />
            </div>
        </CardContent>
    </Card>
);


export default function AtendimentosPage() {
    const [atendimentos, setAtendimentos] = useState([]);
    const [secretarias, setSecretarias] = useState([]);
    const [municipios, setMunicipios] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null); // Estado para erros de carregamento

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAtendimento, setSelectedAtendimento] = useState(null);
    // Modal agora controlado por isOpen
    // const [showModal, setShowModal] = useState(false); 

    const [filtros, setFiltros] = useState({
        status: "todos",
        secretaria: "todas",
        canal: "todos",
        prioridade: "todas"
    });

    const loadData = useCallback(async (isRefresh = false) => {
        if (!isRefresh) setIsLoading(true); // Só mostra loading total na carga inicial
        setError(null);
        try {
            // Idealmente, sua camada de serviço/API trataria erros internos.
            // Ex: AtendimentoService.list(...)
            const [atendimentosData, secretariasData, municipiosData] = await Promise.all([
                Atendimento.list("-created_date"), // Ordenação pode vir da API
                Secretaria.list(),
                Municipio.list()
            ]);

            setAtendimentos(atendimentosData || []);
            setSecretarias(secretariasData || []);
            setMunicipios(municipiosData || []);
        } catch (err) {
            console.error("Erro ao carregar dados da página de atendimentos:", err);
            setError("Falha ao carregar os dados. Tente novamente."); // Mensagem para o usuário
        } finally {
            setIsLoading(false);
        }
    }, []); // useCallback com dependências vazias para que a função não seja recriada a cada render

    useEffect(() => {
        loadData();
    }, [loadData]); // loadData agora é estável devido ao useCallback

    const handleSelectAtendimento = useCallback((atendimento) => {
        setSelectedAtendimento(atendimento);
        // setShowModal(true); // O modal agora é controlado por selectedAtendimento !== null
    }, []);

    const handleCloseModal = useCallback(() => {
        // setShowModal(false);
        setSelectedAtendimento(null);
    }, []);

    // Memoizar os atendimentos filtrados
    const filteredAtendimentos = useMemo(() => {
        return atendimentos.filter(atendimento => {
            if (!atendimento) return false; // Adicionar guarda para atendimento nulo/undefined

            const searchTermLower = searchTerm.toLowerCase();
            const matchSearch =
                atendimento.cidadao_nome?.toLowerCase().includes(searchTermLower) ||
                atendimento.assunto?.toLowerCase().includes(searchTermLower) ||
                atendimento.protocolo?.toLowerCase().includes(searchTermLower);

            const matchStatus = filtros.status === "todos" || atendimento.status === filtros.status;
            // Garantir que secretaria_id seja comparado como string se filtros.secretaria for string
            const matchSecretaria = filtros.secretaria === "todas" || String(atendimento.secretaria_id) === filtros.secretaria;
            const matchCanal = filtros.canal === "todos" || atendimento.canal_origem === filtros.canal;
            const matchPrioridade = filtros.prioridade === "todas" || atendimento.prioridade === filtros.prioridade;

            return matchSearch && matchStatus && matchSecretaria && matchCanal && matchPrioridade;
        });
    }, [atendimentos, searchTerm, filtros]);

    // Memoizar o cálculo das estatísticas
    const stats = useMemo(() => ({
        total: filteredAtendimentos.length,
        aguardando: filteredAtendimentos.filter(a => a.status === 'aguardando').length,
        em_andamento: filteredAtendimentos.filter(a => a.status === 'em_andamento').length,
        resolvido: filteredAtendimentos.filter(a => a.status === 'resolvido').length
    }), [filteredAtendimentos]);

    const handleOpenNewAtendimentoModal = () => {
        // Lógica para abrir um modal/página de criação de novo atendimento
        // Ex: setSelectedAtendimento({}); // Para um modal de criação
    };

    // Função para abrir o chat (passada para o ModalAtendimento)
    const handleOpenChat = useCallback((atendimento) => {
        // Lógica para navegar para a tela de chat ou abrir um modal de chat
        // Ex: history.push(`/atendimentos/${atendimento.id}/chat`);
    }, []);

    // Função para editar o atendimento (passada para o ModalAtendimento)
    const handleEditAtendimento = useCallback((atendimento) => {
        // Lógica para abrir um modal/página de edição
        // Ex: setSelectedAtendimento(atendimento); setIsEditModalOpen(true);
        // Por enquanto, o modal atual é de visualização.
    }, []);


    if (error && !isLoading) { // Mostrar erro apenas se não estiver carregando e houver erro
        return (
            <div className="p-6 md:p-8 flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
                <ServerCrash className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">Oops! Algo deu errado.</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
                <Button onClick={() => loadData(true)} className="gap-2">
                    <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Tentar Novamente
                </Button>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                        Gerenciar Atendimentos
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base">
                        Visualize e gerencie todos os atendimentos do sistema.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => loadData(true)} variant="outline" size="icon" title="Atualizar Lista" className="dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700">
                        <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button onClick={handleOpenNewAtendimentoModal} className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 dark:text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Atendimento
                    </Button>
                </div>
            </div>

            {/* Cards de estatísticas rápidas */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard title="Total Filtrado" value={stats.total} icon={MessageSquare} colorClass="text-blue-600 dark:text-blue-500" />
                <StatCard title="Aguardando" value={stats.aguardando} icon={Clock} colorClass="text-orange-600 dark:text-orange-500" />
                <StatCard title="Em Andamento" value={stats.em_andamento} icon={UserCheck} colorClass="text-purple-600 dark:text-purple-500" />
                <StatCard title="Resolvidos" value={stats.resolvido} icon={CheckCircle2} colorClass="text-green-600 dark:text-green-500" />
            </div>

            {/* Barra de busca e filtros */}
            <Card className="dark:bg-slate-850 dark:border-slate-700">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col xl:flex-row gap-4">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                            <Input
                                placeholder="Buscar por nome, assunto ou protocolo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-full dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                                disabled={isLoading && atendimentos.length === 0} // Desabilita se estiver carregando E não houver dados antigos
                            />
                        </div>
                        <FiltrosAtendimento
                            filtros={filtros}
                            setFiltros={setFiltros}
                            secretarias={secretarias}
                            isLoading={isLoading && atendimentos.length === 0}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Lista de atendimentos */}
            <ListaAtendimentos
                atendimentos={filteredAtendimentos}
                secretarias={secretarias}
                // municipios não é usado por ListaAtendimentos diretamente, mas ModalAtendimento precisa
                // Se ModalAtendimento for filho direto de AtendimentosPage, pode pegar de lá.
                // Se ListaAtendimentos renderiza o Modal, então precisa passar.
                // Pelo código original, ModalAtendimento é renderizado aqui, então municipios é necessário.
                municipios={municipios}
                isLoading={isLoading && atendimentos.length === 0} // Mostrar loading da lista só na carga inicial completa
                onSelectAtendimento={handleSelectAtendimento}
            />

            {/* Modal de atendimento */}
            {selectedAtendimento && ( // Controla a abertura do modal pela existência de selectedAtendimento
                <ModalAtendimento
                    atendimento={selectedAtendimento}
                    secretarias={secretarias}
                    municipios={municipios}
                    isOpen={!!selectedAtendimento} // Passar isOpen
                    onClose={handleCloseModal}
                    // onUpdate={loadData} // Para recarregar dados se o modal permitir edição no futuro
                    onOpenChat={handleOpenChat}
                    onEditAtendimento={handleEditAtendimento}
                />
            )}
        </div>
    );
}
