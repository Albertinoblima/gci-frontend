// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifier, NOTIFICATION_TYPES } from '@/contexts/NotificationContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogIn } from 'lucide-react';

// CORREÇÃO: Importe sua logo a partir da pasta de assets.
// O Vite irá processar essa imagem e fornecer o caminho correto.
import gciLogo from '@/assets/logo-gci-completo.svg'; // <-- SUBSTITUA PELO NOME DO SEU ARQUIVO

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const { notify } = useNotifier();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            notify("Por favor, preencha o e-mail e a senha.", NOTIFICATION_TYPES.WARNING);
            return;
        }

        setIsLoading(true);
        try {
            // A função login do AuthContext já deve lidar com a chamada da API
            // e o armazenamento do token/usuário.
            await login(email, password); // password será mapeado para senha
            // O redirecionamento será tratado pelo PublicRoute/ProtectedRoute
        } catch (error) {
            const errorMessage = error.message || "Falha no login. Verifique suas credenciais.";
            notify(errorMessage, NOTIFICATION_TYPES.ERROR);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-900 px-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    {/* ÁREA DA IMAGEM */}
                    <img
                        src={gciLogo}
                        alt="Logo GCI"
                        className="mx-auto h-16 w-auto mb-4" // Ajuste o tamanho conforme necessário (ex: h-16, h-20)
                    />
                    <CardTitle className="text-2xl" data-cy="login-title">Acesso ao Painel</CardTitle>
                    <CardDescription>
                        Use suas credenciais para entrar no sistema.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                data-cy="login-email-input"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                data-cy="login-password-input"
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading} data-cy="login-submit-button">
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" data-testid="loading-spinner" />
                            ) : (
                                <LogIn className="mr-2 h-4 w-4" />
                            )}
                            Entrar
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}