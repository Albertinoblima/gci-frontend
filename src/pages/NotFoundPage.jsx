// src/pages/NotFoundPage.jsx
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home } from 'lucide-react';
import { createPageUrl } from '../utils/urls.js'; // Assumindo que está em utils

export default function NotFoundPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center bg-slate-100 dark:bg-slate-900 p-6">
            <AlertTriangle className="w-20 h-20 text-orange-400 dark:text-orange-500 mb-8 animate-bounce" />
            <h1 className="text-5xl md:text-7xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                404
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8">
                Oops! A página que você está procurando não foi encontrada.
            </p>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
                Parece que você se perdeu. Não se preocupe, acontece com os melhores!
            </p>
            <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white">
                <RouterLink to={createPageUrl('Dashboard')}>
                    <Home className="w-5 h-5 mr-2" />
                    Voltar para o Dashboard
                </RouterLink>
            </Button>
        </div>
    );
}