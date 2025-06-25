// src/pages/DashboardPage.jsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import dashboardService from '@/services/dashboardService';
import StatsCard from '@/components/dashboard/StatsCard';
import AtendimentosRecentes from '@/components/dashboard/AtendimentosRecentes';
import GraficoAtendimentos from '@/components/dashboard/GraficoAtendimentos';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { AlertCircle, BarChart2, MessageSquare, Users } from 'lucide-react';

export default function DashboardPage() {
    const { isAuthenticated } = useAuth();

    const { data: statsData, isLoading: isLoadingStats } = useQuery({
        queryKey: ['dashboardStats'],
        queryFn: async () => {
            try {
                const response = await dashboardService.getStats();
                return response?.data?.data?.stats || {};
            } catch (error) {
                console.error('Erro ao buscar estatísticas:', error);
                return {};
            }
        },
        enabled: isAuthenticated, // Só executa se estiver autenticado
        initialData: {},
        staleTime: 1000 * 60 * 5, // 5 minutos
    });

    const { data: chartData, isLoading: isLoadingChart } = useQuery({
        queryKey: ['dashboardChart'],
        queryFn: async () => {
            try {
                const response = await dashboardService.getAtendimentosPorSecretaria();
                return response?.data?.data?.chartData || [];
            } catch (error) {
                console.error('Erro ao buscar dados do gráfico:', error);
                return [];
            }
        },
        enabled: isAuthenticated, // Só executa se estiver autenticado
        initialData: [],
        staleTime: 1000 * 60 * 5, // 5 minutos
    });

    const { data: recentesData, isLoading: isLoadingRecentes } = useQuery({
        queryKey: ['dashboardRecentes'],
        queryFn: async () => {
            try {
                const response = await dashboardService.getAtendimentosRecentes();
                return response?.data?.data?.atendimentos || [];
            } catch (error) {
                console.error('Erro ao buscar atendimentos recentes:', error);
                return [];
            }
        },
        enabled: isAuthenticated, // Só executa se estiver autenticado
        initialData: [],
        staleTime: 1000 * 60 * 2, // 2 minutos
    });

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>

            {/* Cards de Estatísticas */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard title="Atendimentos Abertos" value={statsData?.atendimentos_abertos} isLoading={isLoadingStats} icon={<AlertCircle className="h-4 w-4 text-muted-foreground" />} />
                <StatsCard title="Atendimentos Resolvidos" value={statsData?.atendimentos_resolvidos} isLoading={isLoadingStats} icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />} />
                <StatsCard title="Total de Atendimentos" value={statsData?.total_atendimentos} isLoading={isLoadingStats} icon={<BarChart2 className="h-4 w-4 text-muted-foreground" />} />
                <StatsCard title="Cidadãos Cadastrados" value={statsData?.total_cidadaos} isLoading={isLoadingStats} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
            </div>

            {/* Gráficos e Listas */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-1 lg:col-span-4">
                    <GraficoAtendimentos chartData={chartData} isLoading={isLoadingChart} />
                </div>
                <div className="col-span-1 lg:col-span-3">
                    <AtendimentosRecentes recentesData={recentesData} isLoading={isLoadingRecentes} />
                </div>
            </div>
        </div>
    );
}