// src/components/dashboard/TopSecretarias.jsx
import React, { useMemo } from 'react'; // Adicionado useMemo
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Building2, TrendingUp, CheckCircle } from "lucide-react"; // Adicionado ícones

const SkeletonItem = () => (
    <div className="animate-pulse space-y-2">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                <div className="space-y-1">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                </div>
            </div>
            <div className="space-y-1 text-right">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-8"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-12"></div>
            </div>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
        <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
    </div>
);

export default function TopSecretarias({ secretarias, atendimentos, isLoading }) {
    // Memoizar o cálculo das estatísticas para evitar recálculos desnecessários
    // se secretarias ou atendimentos não mudarem.
    const secretariasComStats = useMemo(() => {
        if (!secretarias || !atendimentos) return [];

        return secretarias.map(secretaria => {
            const atendimentosSecretaria = atendimentos.filter(a => String(a.secretaria_id) === String(secretaria.id));
            const resolvidos = atendimentosSecretaria.filter(a => a.status === 'resolvido').length;
            const percentualResolucao = atendimentosSecretaria.length > 0
                ? (resolvidos / atendimentosSecretaria.length) * 100
                : 0;

            return {
                ...secretaria,
                totalAtendimentos: atendimentosSecretaria.length,
                resolvidos,
                percentualResolucao: Math.round(percentualResolucao)
            };
        })
            .filter(s => s.totalAtendimentos > 0) // Mostrar apenas secretarias com alguma atividade
            .sort((a, b) => b.totalAtendimentos - a.totalAtendimentos) // Ordenar por mais atendimentos
            .slice(0, 5); // Pegar o top 5
    }, [secretarias, atendimentos]);

    // Max atendimentos para a barra de progresso, garantindo que não seja 0
    const maxAtendimentos = useMemo(() => {
        if (secretariasComStats.length === 0) return 1;
        return Math.max(...secretariasComStats.map(s => s.totalAtendimentos), 1);
    }, [secretariasComStats]);


    if (isLoading) {
        return (
            <Card className="dark:bg-slate-850 dark:border-slate-700">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        <Building2 className="w-5 h-5" />
                        Secretarias Mais Ativas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Array(3).fill(0).map((_, i) => <SkeletonItem key={i} />)}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="dark:bg-slate-850 dark:border-slate-700">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                    <Building2 className="w-5 h-5" />
                    Top 5 Secretarias Ativas
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {secretariasComStats.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma atividade de secretaria para exibir.</p>
                    </div>
                ) : (
                    secretariasComStats.map((secretaria) => (
                        <div key={secretaria.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${secretaria.cor_tema ? '' : 'from-emerald-100 to-emerald-200 dark:from-emerald-800/50 dark:to-emerald-700/50'} flex items-center justify-center`}
                                        style={secretaria.cor_tema ? { backgroundColor: secretaria.cor_tema, opacity: 0.2 } : {}} // Exemplo de uso de cor_tema
                                    >
                                        <span className="text-xl text-slate-700 dark:text-slate-300"
                                            style={secretaria.cor_tema ? { color: secretaria.cor_tema, opacity: 1 } : {}}>
                                            {secretaria.emoji || '🏛️'}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                                            {secretaria.nome}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {secretaria.totalAtendimentos} {secretaria.totalAtendimentos === 1 ? 'atendimento' : 'atendimentos'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-end">
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        {secretaria.percentualResolucao}%
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                        {secretaria.resolvidos} resolvidos
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                {/* Barra de progresso para volume de atendimentos */}
                                <Progress
                                    value={(secretaria.totalAtendimentos / maxAtendimentos) * 100}
                                    className="h-2 [&>div]:bg-emerald-500 dark:[&>div]:bg-emerald-600"
                                    aria-label={`Volume de atendimentos: ${secretaria.totalAtendimentos}`}
                                />
                                {/* Barra de progresso para taxa de resolução */}
                                {/* <Progress 
                  value={secretaria.percentualResolucao} 
                  className="h-1 [&>div]:bg-blue-500 dark:[&>div]:bg-blue-600"
                  aria-label={`Taxa de resolução: ${secretaria.percentualResolucao}%`}
                /> */}
                                {/* Decidi remover a segunda barra para não poluir muito, a info já está no texto */}
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
