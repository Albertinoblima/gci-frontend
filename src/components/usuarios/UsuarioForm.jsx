// src/components/usuarios/UsuarioForm.jsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth.js';
import { useNotifier, NOTIFICATION_TYPES } from '@/contexts/NotificationContext.jsx';
import { ROLES_DISPONIVEIS } from '@/constants/index.js';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
import municipioService from '@/services/municipioService.js';

const formSchema = z.object({
    nome_completo: z.string().min(3, "O nome é obrigatório."),
    email: z.string().email("E-mail inválido."),
    senha: z.string().optional(),
    municipio_id: z.string().min(1, "Município é obrigatório."),
    role: z.string().min(1, "A função é obrigatória."),
    cargo: z.string().optional(),
    ativo: z.boolean().default(true),
});

export default function UsuarioForm({ isOpen, onClose, onSuccess, initialData, mutation }) {
    const { user: usuarioLogado } = useAuth();
    const isEditing = !!initialData?.id;
    const isUserAdminSistema = usuarioLogado?.role === 'admin_sistema';

    const { data: municipiosData, isLoading: isLoadingMunicipios } = useQuery({
        queryKey: ['municipios'],
        queryFn: () => municipioService.getAll().then(res => res.data.municipios),
        enabled: isUserAdminSistema,
    });

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: { nome_completo: '', email: '', senha: '', municipio_id: '', role: '', cargo: '', ativo: true },
    });

    useEffect(() => {
        if (isOpen) {
            if (isEditing && initialData) {
                form.reset({ ...initialData, municipio_id: String(initialData.municipio_id), senha: '' });
            } else {
                form.reset({
                    nome_completo: '', email: '', senha: '',
                    municipio_id: isUserAdminSistema ? '' : String(usuarioLogado?.municipio_id),
                    role: '', cargo: '', ativo: true
                });
            }
        }
    }, [isOpen, initialData, isEditing, form, isUserAdminSistema, usuarioLogado]);

    const onSubmit = (values) => {
        if (!isEditing && !values.senha) {
            form.setError("senha", { type: "manual", message: "A senha é obrigatória para novos usuários." });
            return;
        }
        const dataToSubmit = { ...values, municipio_id: Number(values.municipio_id) };
        if (!values.senha) delete dataToSubmit.senha;

        mutation.mutate(dataToSubmit);
    };

    const availableRoles = isUserAdminSistema ? [...ROLES_DISPONIVEIS, { value: "admin_sistema", label: "Admin. Sistema" }] : ROLES_DISPONIVEIS;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader><DialogTitle>{isEditing ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle></DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        <FormField control={form.control} name="nome_completo" render={({ field }) => (<FormItem><FormLabel>Nome Completo *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email *</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="senha" render={({ field }) => (<FormItem><FormLabel>{isEditing ? 'Nova Senha (opcional)' : 'Senha *'}</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField control={form.control} name="municipio_id" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Município *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={!isUserAdminSistema}>
                                        <FormControl>
                                            <SelectTrigger disabled={isLoadingMunicipios}>
                                                <SelectValue placeholder={
                                                    isUserAdminSistema
                                                        ? "Selecione..."
                                                        : (initialData?.municipio_nome || "Município atual")
                                                } />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {isLoadingMunicipios ? (
                                                <Loader2 className="m-auto h-4 w-4 animate-spin" />
                                            ) : (
                                                municipiosData?.map(m => (
                                                    <SelectItem key={m.id} value={String(m.id)}>
                                                        <div className="flex flex-col text-left">
                                                            <span className="font-medium">{m.nome}</span>
                                                            {m.estado && (
                                                                <span className="text-xs text-gray-500">{m.estado}</span>
                                                            )}
                                                        </div>
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {!isUserAdminSistema && initialData?.municipio_nome && (
                                        <div className="text-sm text-gray-600 mt-1 p-2 bg-gray-50 rounded">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{initialData.municipio_nome}</span>
                                                {initialData.municipio_estado && (
                                                    <span className="text-xs">{initialData.municipio_estado}</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="role" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Função (Role) *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                        <SelectContent>{availableRoles.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                                    </Select><FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <FormField control={form.control} name="cargo" render={({ field }) => (<FormItem><FormLabel>Cargo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="ativo" render={({ field }) => (<FormItem className="flex items-center space-x-3 pt-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Usuário ativo</FormLabel></FormItem>)} />
                        <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose><Button type="submit" disabled={mutation.isPending}>{mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{isEditing ? 'Salvar' : 'Criar'}</Button></DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}