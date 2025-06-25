import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';
import { useNotifier } from '../contexts/NotificationContext';

export default function DiagnosticPage() {
    const { user, token, isAuthenticated, login, logout } = useAuth();
    const { notify } = useNotifier();
    const [isLoading, setIsLoading] = useState(false);

    const handleTestLogin = async () => {
        setIsLoading(true);
        try {
            await login('admin.teste@gci.com', '123456789');
            notify('Login de teste realizado com sucesso!', 'success');
        } catch (error) {
            notify(`Erro no login: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTestApi = async () => {
        try {
            const response = await fetch('/api/especialidades-medicas', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            notify(`API Test: Status ${response.status} - ${JSON.stringify(data)}`, 'info');
        } catch (error) {
            notify(`Erro na API: ${error.message}`, 'error');
        }
    };

    const clearStorage = () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">🔍 Página de Diagnóstico</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Estado de Autenticação */}
                <div className="border rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-4">Estado de Autenticação</h2>
                    <div className="space-y-2 text-sm">
                        <div><strong>Autenticado:</strong> {isAuthenticated ? '✅ Sim' : '❌ Não'}</div>
                        <div><strong>Token existe:</strong> {token ? '✅ Sim' : '❌ Não'}</div>
                        <div><strong>Token localStorage:</strong> {localStorage.getItem('authToken') ? '✅ Sim' : '❌ Não'}</div>
                        {user && (
                            <>
                                <div><strong>Nome:</strong> {user.nome_completo}</div>
                                <div><strong>Email:</strong> {user.email}</div>
                                <div><strong>Role:</strong> {user.role}</div>
                                <div><strong>Município ID:</strong> {user.municipio_id || 'N/A'}</div>
                            </>
                        )}
                    </div>
                </div>

                {/* Informações do Sistema */}
                <div className="border rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-4">Informações do Sistema</h2>
                    <div className="space-y-2 text-sm">
                        <div><strong>URL atual:</strong> {window.location.href}</div>
                        <div><strong>Base URL API:</strong> {import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}</div>
                        <div><strong>Navegador:</strong> {navigator.userAgent.split(' ')[0]}</div>
                    </div>
                </div>

                {/* Ações de Teste */}
                <div className="border rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-4">Ações de Teste</h2>
                    <div className="space-y-3">
                        <button
                            onClick={handleTestLogin}
                            disabled={isLoading}
                            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
                        >
                            {isLoading ? 'Testando...' : 'Testar Login'}
                        </button>

                        <button
                            onClick={handleTestApi}
                            disabled={!token}
                            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:opacity-50"
                        >
                            Testar API
                        </button>

                        <button
                            onClick={logout}
                            disabled={!isAuthenticated}
                            className="w-full bg-orange-500 text-white p-2 rounded hover:bg-orange-600 disabled:opacity-50"
                        >
                            Fazer Logout
                        </button>

                        <button
                            onClick={clearStorage}
                            className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
                        >
                            Limpar Storage
                        </button>
                    </div>
                </div>

                {/* Logs do Console */}
                <div className="border rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-4">Console Logs</h2>
                    <div className="text-xs bg-gray-100 p-2 rounded max-h-40 overflow-y-auto">
                        <p>Verifique o console do navegador (F12) para logs detalhados</p>
                        <p>Procure por:</p>
                        <ul className="list-disc ml-4">
                            <li>Erros 401 (Unauthorized)</li>
                            <li>Erros CORS</li>
                            <li>Falhas de rede</li>
                            <li>Erros de JavaScript</li>
                        </ul>
                    </div>
                </div>
            </div>

            {token && (
                <div className="mt-6 border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Token JWT (primeiros 100 caracteres):</h3>
                    <code className="text-xs bg-gray-100 p-2 rounded block break-all">
                        {token.substring(0, 100)}...
                    </code>
                </div>
            )}
        </div>
    );
}
