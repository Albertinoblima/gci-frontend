// src/App.jsx

import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom'; // Importado aqui
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Importação dos Providers de Contexto
import { AuthProvider } from './contexts/AuthContext.jsx';
import { SocketProvider } from './contexts/SocketContext.jsx';
import { NotificationProvider } from './contexts/NotificationContext.jsx';

// Importação das rotas
import AppRoutes from './routes/AppRoutes.jsx';
import AxiosInterceptor from './components/shared/AxiosInterceptor.jsx';

// Importação da inicialização de serviços
import serviceInitializer from './utils/serviceInit.js';
import { useAuth } from './hooks/useAuth.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

// Componente wrapper para o DevTools que só aparece para admin_sistema
const AdminDevTools = () => {
  const { user, isLoadingAuth } = useAuth();

  // Só mostra o DevTools se o usuário for admin_sistema e não estiver carregando
  if (!isLoadingAuth && user?.role === 'admin_sistema') {
    return <ReactQueryDevtools initialIsOpen={false} />;
  }

  return null;
};

function App() {
  // Inicializar serviços quando a aplicação carrega
  useEffect(() => {
    serviceInitializer.initializeAll().catch(error => {
      console.error('❌ Erro na inicialização dos serviços:', error);
    });
  }, []);

  return (
    // 1. O BrowserRouter deve vir primeiro, envolvendo tudo que precisa de roteamento.
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      {/* 2. Provider do React Query */}
      <QueryClientProvider client={queryClient}>

        {/* 3. Provider de Notificações */}
        <NotificationProvider>

          {/* 4. Provider de Autenticação (agora dentro do BrowserRouter) */}
          <AuthProvider>

            {/* Envolva os filhos com o AxiosInterceptor */}
            <AxiosInterceptor>

              {/* 5. Provider de Socket.IO (dentro do AuthProvider) */}
              <SocketProvider>

                {/* 6. As rotas da aplicação */}
                <AppRoutes />

                {/* 7. DevTools do React Query - apenas para admin_sistema */}
                <AdminDevTools />

              </SocketProvider>
            </AxiosInterceptor>
          </AuthProvider>
        </NotificationProvider>

      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;