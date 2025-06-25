// Script para validar as páginas de saúde
import React from 'react';

export default function TestPageSaude() {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Teste das Páginas de Saúde</h1>
            <div className="space-y-4">
                <div className="p-4 border rounded">
                    <h2 className="text-xl font-semibold">Unidades de Saúde</h2>
                    <p>Esta página deveria mostrar uma lista de unidades de saúde</p>
                </div>
                <div className="p-4 border rounded">
                    <h2 className="text-xl font-semibold">Especialidades Médicas</h2>
                    <p>Esta página deveria mostrar uma lista de especialidades</p>
                </div>
                <div className="p-4 border rounded">
                    <h2 className="text-xl font-semibold">Agendas</h2>
                    <p>Esta página deveria mostrar horários disponíveis</p>
                </div>
            </div>
        </div>
    );
}
