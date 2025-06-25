// src/components/layout/AppLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout() {
    return (
        // Layout principal com grid. A sidebar some em telas pequenas ('hidden').
        // 'md:grid' ativa o layout de duas colunas em telas médias e maiores.
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">

            {/* Sidebar Fixa para Desktop */}
            <div className="hidden border-r bg-slate-50 dark:bg-slate-950 dark:border-slate-800 md:block">
                <Sidebar />
            </div>

            {/* Conteúdo Principal (Header + Página Atual) */}
            <div className="flex flex-col">
                <Header />
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-slate-50 dark:bg-slate-900 overflow-y-auto">
                    {/* O React Router renderizará o componente da página aqui */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
}