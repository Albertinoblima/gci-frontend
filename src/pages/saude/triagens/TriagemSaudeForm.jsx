// src/components/saude/triagens/TriagemSaudeForm.jsx
import React, { useState, useEffect, useContext } from 'react';
import { triagemSaudeApiService } from '../../../services/saude/triagemSaudeService.js';
import { cidadaoApiService } from '../../../services/cidadaoService.js'; // Para buscar cidadão
import { atendimentoApiService } from '../../../services/atendimentoService.js'; // Para buscar atendimento
import { useNotifier, NOTIFICATION_TYPES } from '../../../hooks/useNotifier.js';
import { AuthContext } from '../../../contexts/AuthContext.jsx';
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from "@/components/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Loader2, Save, Search } from 'lucide-react';
import { format, parseISO } from 'date-fns';

// Exemplo, idealmente viriam do backend ou config
const CLASSIFICACAO_RISCO = ["Vermelho", "Laranja", "Amarelo", "Verde", "Azul", "Branco"];
const STATUS_TRIAGEM = ["aguardando_analise", "em_analise", "analisada", "encaminhada", "finalizada_sem_agendamento", "agendamento_realizado"];

export default function TriagemSaudeForm({
    isOpen,
    onClose,
    onSuccess,
    initialData,
    municipioIdParaForm, // Obrigatório para filtrar unidades/profissionais
    listaUnidades,       // Unidades do município
    // listaProfissionaisTriagem // Usuários do sistema com permissão para triagem
}) {
    const { user: usuarioLogado } = useContext(AuthContext);
    const { notify } = useNotifier();
    const [formData, setFormData] = useState({
        atendimento_id: '',
        cidadao_id: '', // Será preenchido após busca
        municipio_id: '', // Será municipioIdParaForm
        unidade_saude_id: '',
        data_triagem: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        profissional_triagem_id: String(usuarioLogado?.id || ''), // Default para usuário logado
        queixa_principal: '',
        dados_coletados: {}, // { historico: '', alergias: '', medicamentos_uso: '', sinais_vitais: {pa: '', fc:'', fr:'', temp:''} }
        classificacao_risco: '',
        encaminhamento_sugerido: '',
        agendamento_gerado_id: '', // Se a triagem gerar um agendamento
        status_triagem: 'aguardando_analise',
    });

    const [cidadaoBusca, setCidadaoBusca] = useState('');
    const [cidadaosEncontrados, setCidadaosEncontrados] = useState([]);
    const [cidadaoSelecionado, setCidadaoSelecionado] = useState(null);

    const [atendimentoBusca, setAtendimentoBusca] = useState(''); // Para buscar por protocolo
    const [atendimentoVinculado, setAtendimentoVinculado] = useState(null);


    const [isLoading, setIsLoading] = useState(false);
    const [isBuscandoCidadao, setIsBuscandoCidadao] = useState(false);
    const [isBuscandoAtendimento, setIsBuscandoAtendimento] = useState(false);
    const [error, setError] = useState(null);
    const isEditing = Boolean(initialData && initialData.id);

    useEffect(() => {
        if (isOpen) {
            const defaultMunicipioId = municipioIdParaForm ? String(municipioIdParaForm) : '';
            if (isEditing && initialData) {
                setFormData({
                    atendimento_id: String(initialData.atendimento_id || ''),
                    cidadao_id: String(initialData.cidadao_id || ''),
                    municipio_id: String(initialData.municipio_id || defaultMunicipioId),
                    unidade_saude_id: String(initialData.unidade_saude_id || ''),
                    data_triagem: initialData.data_triagem ? format(parseISO(initialData.data_triagem), "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                    profissional_triagem_id: String(initialData.profissional_triagem_id || usuarioLogado?.id || ''),
                    queixa_principal: initialData.queixa_principal || '',
                    dados_coletados: typeof initialData.dados_coletados === 'object' && initialData.dados_coletados !== null ? initialData.dados_coletados : {},
                    classificacao_risco: initialData.classificacao_risco || '',
                    encaminhamento_sugerido: initialData.encaminhamento_sugerido || '',
                    agendamento_gerado_id: String(initialData.agendamento_gerado_id || ''),
                    status_triagem: initialData.status_triagem || 'aguardando_analise',
                });
                // Se editando, buscar e setar o cidadão e atendimento vinculados para exibição
                if (initialData.cidadao_id) cidadaoApiService.getById(initialData.cidadao_id).then(setCidadaoSelecionado);
                if (initialData.atendimento_id) atendimentoApiService.getByIdOrProtocolo(initialData.atendimento_id).then(setAtendimentoVinculado);

            } else { // Novo
                setFormData({
                    atendimento_id: '', cidadao_id: '', municipio_id: defaultMunicipioId, unidade_saude_id: '',
                    data_triagem: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                    profissional_triagem_id: String(usuarioLogado?.id || ''),
                    queixa_principal: '', dados_coletados: {}, classificacao_risco: '',
                    encaminhamento_sugerido: '', agendamento_gerado_id: '', status_triagem: 'aguardando_analise',
                });
                setCidadaoBusca(''); setCidadaosEncontrados([]); setCidadaoSelecionado(null);
                setAtendimentoBusca(''); setAtendimentoVinculado(null);
            }
            setError(null);
        }
    }, [isOpen, isEditing, initialData, municipioIdParaForm, usuarioLogado]);

    const handleBuscaCidadao = async () => {
        if (!cidadaoBusca.trim()) return;
        setIsBuscandoCidadao(true);
        try {
            // Ajustar filtros conforme a API de cidadãos (ex: search, cpf)
            const resultado = await cidadaoApiService.list({ search: cidadaoBusca, limit: 5 });
            setCidadaosEncontrados(resultado.data || []);
            if (resultado.data.length === 0) notify("Nenhum cidadão encontrado.", NOTIFICATION_TYPES.INFO);
        } catch (err) { notify("Erro ao buscar cidadão.", NOTIFICATION_TYPES.ERROR); }
        finally { setIsBuscandoCidadao(false); }
    };

    const handleSelecionaCidadao = (cid) => {
        setCidadaoSelecionado(cid);
        setFormData(prev => ({ ...prev, cidadao_id: String(cid.id) }));
        setCidadaosEncontrados([]); // Limpa resultados da busca
    };

    const handleBuscaAtendimento = async () => {
        if (!atendimentoBusca.trim()) return;
        setIsBuscandoAtendimento(true);
        try {
            const atendimento = await atendimentoApiService.getByIdOrProtocolo(atendimentoBusca);
            if (atendimento) {
                setAtendimentoVinculado(atendimento);
                setFormData(prev => ({ ...prev, atendimento_id: String(atendimento.id), cidadao_id: String(atendimento.cidadao_id) }));
                // Buscar e selecionar o cidadão do atendimento
                cidadaoApiService.getById(atendimento.cidadao_id).then(setCidadaoSelecionado);
                notify(`Atendimento ${atendimento.protocolo_str} vinculado.`, NOTIFICATION_TYPES.SUCCESS);
            } else {
                notify("Atendimento não encontrado.", NOTIFICATION_TYPES.INFO);
                setAtendimentoVinculado(null);
            }
        } catch (err) { notify("Erro ao buscar atendimento.", NOTIFICATION_TYPES.ERROR); }
        finally { setIsBuscandoAtendimento(false); }
    };


    const handleChange = (e) => { /* ... */ }; // Similar aos outros forms
    const handleDadosColetadosChange = (subField, value) => { /* ... */ }; // Para o JSONB
    const handleSelectChange = (name, value) => { /* ... */ };

    const handleSubmit = async (e) => { /* ... */ }; // Similar, chamando triagemSaudeApiService

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-2xl md:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Triagem' : 'Nova Triagem de Saúde'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Edite as informações da triagem de saúde.' : 'Preencha as informações para registrar uma nova triagem de saúde.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 p-1 mt-2">
                    {/* Busca e Seleção de Cidadão */}
                    <fieldset className="border p-3 rounded-md dark:border-slate-700">
                        <legend className="text-sm font-medium px-1 dark:text-slate-300">Cidadão</legend>
                        {!cidadaoSelecionado ? (
                            <div className="flex items-end gap-2">
                                <Input value={cidadaoBusca} onChange={e => setCidadaoBusca(e.target.value)} placeholder="Buscar por nome, CPF, telefone..." />
                                <Button type="button" onClick={handleBuscaCidadao} disabled={isBuscandoCidadao} size="icon">
                                    {isBuscandoCidadao ? <Loader2 className="animate-spin" /> : <Search />}
                                </Button>
                            </div>
                        ) : (
                            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded flex justify-between items-center">
                                <span>{cidadaoSelecionado.nome_perfil_canal || `ID ${cidadaoSelecionado.id}`} ({cidadaoSelecionado.telefone_principal || cidadaoSelecionado.email_principal || 'Sem contato'})</span>
                                <Button type="button" variant="link" size="sm" onClick={() => { setCidadaoSelecionado(null); setFormData(p => ({ ...p, cidadao_id: '' })); }}>Alterar</Button>
                            </div>
                        )}
                        {cidadaosEncontrados.length > 0 && !cidadaoSelecionado && (
                            <ul className="mt-2 border rounded-md max-h-40 overflow-y-auto dark:border-slate-600">
                                {cidadaosEncontrados.map(c => (
                                    <li key={c.id} onClick={() => handleSelecionaCidadao(c)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer border-b dark:border-slate-600 last:border-b-0">
                                        {c.nome_perfil_canal} ({c.id_canal_origem ? `${c.canal_comunicacao}: ${c.id_canal_origem}` : c.email_principal || c.telefone_principal})
                                    </li>
                                ))}
                            </ul>
                        )}
                    </fieldset>

                    {/* Vínculo com Atendimento (Opcional) */}
                    {/* ... (similar à busca de cidadão, para vincular a um protocolo existente) ... */}

                    {/* Dados da Triagem */}
                    {/* ... (campos: unidade_saude_id (Select), data_triagem (datetime-local), 
                       profissional_triagem_id (Select com usuários do sistema), 
                       queixa_principal (Textarea), 
                       dados_coletados (campos de input para cada sub-dado do JSONB),
                       classificacao_risco (Select),
                       encaminhamento_sugerido (Textarea),
                       status_triagem (Select),
                       agendamento_gerado_id (Input ou Select de agendamentos se for editar)
                   ) ... */}

                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <DialogFooter className="mt-6">
                        <DialogClose asChild><Button type="button" variant="outline" onClick={onClose}>Cancelar</Button></DialogClose>
                        <Button type="submit" disabled={isLoading || !formData.cidadao_id} className="bg-sky-600 hover:bg-sky-700 text-white">
                            {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                            {isEditing ? 'Salvar Triagem' : 'Registrar Triagem'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}