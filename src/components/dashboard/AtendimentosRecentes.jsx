import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function AtendimentosRecentes({ recentesData, isLoading }) {
    const navigate = useNavigate();
    return (
        <Card>
            <CardHeader><CardTitle>Atendimentos Recentes</CardTitle><CardDescription>Atendimentos que necessitam de atenção.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
                {isLoading && Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                {!isLoading && recentesData?.map((atendimento) => (
                    <div className="flex items-center gap-4 cursor-pointer" key={atendimento.id} onClick={() => navigate(`/chat/${atendimento.id}`)}>
                        <Avatar className="hidden h-9 w-9 sm:flex"><AvatarFallback>{atendimento.cidadao_nome?.substring(0, 2) || 'C'}</AvatarFallback></Avatar>
                        <div className="grid gap-1"><p className="text-sm font-medium leading-none">{atendimento.cidadao_nome}</p><p className="text-xs text-muted-foreground">{atendimento.assunto_breve}</p></div>
                        <div className="ml-auto font-medium text-xs text-muted-foreground">{atendimento.protocolo_str}</div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}