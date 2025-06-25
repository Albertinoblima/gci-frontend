// src/pages/TesteChatPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Textarea pode ser melhor para chat
// Supondo que você tem um apiClient configurado como no exemplo da autenticação
import apiClient from '@/services/apiClient'; // Ou sua forma de fazer chamadas API

export default function TesteChatPage() {
    const [atendimentoId, setAtendimentoId] = useState(''); // Para o usuário digitar o ID do atendimento
    const [mensagens, setMensagens] = useState([]);
    const [novaMensagem, setNovaMensagem] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const mensagensEndRef = useRef(null); // Para scroll automático

    const scrollToBottom = () => {
        mensagensEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [mensagens]);

    const carregarMensagens = async () => {
        if (!atendimentoId) {
            setError("Por favor, insira um ID de Atendimento.");
            setMensagens([]);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.get(`/atendimentos/${atendimentoId}/mensagens?limit=100&order=asc`);
            setMensagens(response.data.data || []); // A API retorna { data: [mensagens], ... }
        } catch (err) {
            console.error("Erro ao carregar mensagens:", err);
            setError(err.response?.data?.error || "Falha ao carregar mensagens.");
            setMensagens([]);
        } finally {
            setIsLoading(false);
        }
    };

    const enviarMensagem = async (e) => {
        e.preventDefault();
        if (!novaMensagem.trim() || !atendimentoId) return;
        setIsLoading(true); // Pode ter um loading específico para envio
        try {
            const response = await apiClient.post(`/atendimentos/${atendimentoId}/mensagens`, {
                conteudo_texto: novaMensagem,
                // remetente_tipo e agente_id serão definidos no backend a partir do token
            });
            // Adiciona a nova mensagem à lista localmente para feedback imediato
            // Idealmente, a resposta do POST conteria a mensagem completa criada
            setMensagens(prev => [...prev, response.data]);
            setNovaMensagem('');
        } catch (err) {
            console.error("Erro ao enviar mensagem:", err);
            setError(err.response?.data?.error || "Falha ao enviar mensagem.");
        } finally {
            setIsLoading(false); // Reset loading do envio
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Teste de Chat</h1>

            <div className="mb-4 flex gap-2">
                <Input
                    type="text"
                    placeholder="ID do Atendimento"
                    value={atendimentoId}
                    onChange={(e) => setAtendimentoId(e.target.value)}
                    className="flex-grow"
                />
                <Button onClick={carregarMensagens} disabled={isLoading || !atendimentoId}>
                    {isLoading && !mensagens.length ? 'Carregando...' : 'Carregar Mensagens'}
                </Button>
            </div>

            {error && <p className="text-red-500 mb-2">{error}</p>}

            <div className="h-96 border rounded-md p-4 overflow-y-auto mb-4 bg-slate-50 dark:bg-slate-800">
                {isLoading && mensagens.length === 0 && <p>Carregando histórico...</p>}
                {!isLoading && mensagens.length === 0 && atendimentoId && <p>Nenhuma mensagem neste atendimento ou ID inválido.</p>}
                {mensagens.map((msg) => (
                    <div
                        key={msg.id}
                        className={`mb-2 p-2 rounded-lg max-w-[80%] ${msg.remetente_tipo === 'agente' // Assumindo que o token do usuário logado é o agente
                                ? 'bg-blue-500 text-white ml-auto text-right'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 mr-auto text-left'
                            }`}
                    >
                        <p className="text-xs opacity-70 mb-1">
                            {msg.remetente_tipo === 'agente' ? `Agente ${msg.agente_id || ''}` : `Cidadão ${msg.cidadao_id || ''}`}
                            {' - '}
                            {msg.timestamp_mensagem ? new Date(msg.timestamp_mensagem).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </p>
                        {msg.conteudo_texto}
                        {msg.tipo_midia !== 'texto' && msg.url_midia && (
                            <a href={msg.url_midia} target="_blank" rel="noopener noreferrer" className="block text-sm underline mt-1">
                                Ver {msg.tipo_midia}
                            </a>
                        )}
                    </div>
                ))}
                <div ref={mensagensEndRef} />
            </div>

            <form onSubmit={enviarMensagem} className="flex gap-2">
                <Textarea
                    placeholder="Digite sua mensagem..."
                    value={novaMensagem}
                    onChange={(e) => setNovaMensagem(e.target.value)}
                    rows={2}
                    className="flex-grow dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                    disabled={!atendimentoId || isLoading}
                />
                <Button type="submit" disabled={!atendimentoId || isLoading || !novaMensagem.trim()}>
                    {isLoading && novaMensagem ? 'Enviando...' : 'Enviar'}
                </Button>
            </form>
        </div>
    );
}
