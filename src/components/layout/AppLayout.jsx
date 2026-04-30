// src/components/layout/AppLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';

function LayoutInner() {
    const { collapsed } = useSidebar();

    return (
        <div className="flex flex-col min-h-screen w-full bg-slate-50 dark:bg-slate-900">

            {/* ── Header: ocupa toda a largura ── */}
            <Header />

            {/* ── Abaixo do header: sidebar + conteúdo ── */}
            <div className="flex flex-1 overflow-hidden">

                {/* Sidebar fixa desktop */}
                <div className={cn(
                    'hidden md:flex shrink-0 transition-all duration-300 ease-in-out',
                    collapsed ? 'w-[60px]' : 'w-64'
                )}>
                    <Sidebar />
                </div>

                {/* Área de conteúdo */}
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-y-auto min-w-0">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default function AppLayout() {
    return (
        <SidebarProvider>
            <LayoutInner />
        </SidebarProvider>
    );
}