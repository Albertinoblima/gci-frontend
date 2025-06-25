// src/pages/admin/MunicipioForm.jsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from 'lucide-react';
import { ESTADOS } from '@/constants/estados';

// 1. ADICIONAR 'estado_id' AO SCHEMA DO ZOD E REMOVER 'estado'
const formSchema = z.object({
    nome: z.string().min(3, "O nome é obrigatório."),
    sigla_protocolo: z.string().min(2, "A sigla é obrigatória.").max(5),
    estado: z.string().length(2, "O estado deve ter 2 caracteres (ex: SP)."), // usado só no form, não enviado
    ativo: z.boolean().default(true),
    logo_url: z.string().url("URL inválida.").or(z.literal('')).optional(),
    // Campos da API da Meta
    whatsapp_phone_number_id: z.string().optional(),
    messenger_page_id: z.string().optional(),
    instagram_page_id: z.string().optional(),
    access_token: z.string().optional(),
});

// 2. ADICIONAR 'estado' AOS VALORES PADRÃO
const defaultValues = {
    nome: '',
    sigla_protocolo: '',
    estado: '', // sigla do estado
    ativo: true,
    logo_url: '',
    // Campos da API da Meta
    whatsapp_phone_number_id: '',
    messenger_page_id: '',
    instagram_page_id: '',
    access_token: '',
};

export default function MunicipioForm({ isOpen, onClose, onSuccess, initialData, mutation }) {
    const isEditing = !!initialData?.id;

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    useEffect(() => {
        if (isOpen) {
            if (isEditing && initialData) {
                form.reset({
                    nome: initialData.nome || '',
                    sigla_protocolo: initialData.sigla_protocolo || '',
                    estado: initialData.estado || '', // Adicionado
                    ativo: initialData.ativo ?? true,
                    logo_url: initialData.logo_url || '',
                    // Campos da API da Meta
                    whatsapp_phone_number_id: initialData.config_meta_api?.whatsapp_phone_number_id || '',
                    messenger_page_id: initialData.config_meta_api?.messenger_page_id || '',
                    instagram_page_id: initialData.config_meta_api?.instagram_page_id || '',
                    access_token: initialData.config_meta_api?.access_token || '',
                });
            } else {
                form.reset(defaultValues);
            }
        }
    }, [isOpen, initialData, isEditing, form]);

    const onSubmit = (values) => {
        // Busca o id do estado pela sigla
        const estadoObj = ESTADOS.find(e => e.sigla === values.estado);
        if (!estadoObj) {
            alert('Estado inválido!');
            return;
        }

        // Monta config_meta_api apenas com campos preenchidos
        let config_meta_api = null;
        if (values.whatsapp_phone_number_id || values.messenger_page_id || values.instagram_page_id || values.access_token) {
            config_meta_api = {
                whatsapp_phone_number_id: values.whatsapp_phone_number_id || undefined,
                messenger_page_id: values.messenger_page_id || undefined,
                instagram_page_id: values.instagram_page_id || undefined,
                access_token: values.access_token || undefined,
            };
        }

        const dataToSubmit = {
            nome: values.nome,
            sigla_protocolo: values.sigla_protocolo,
            estado_id: estadoObj.id,
            ativo: values.ativo,
            logo_url: values.logo_url || null,
            config_meta_api: config_meta_api,
        };

        const mutationData = isEditing ? { id: initialData.id, data: dataToSubmit } : dataToSubmit;
        mutation.mutate(mutationData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Município' : 'Novo Município'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Edite as informações do município.' : 'Preencha as informações para cadastrar um novo município.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField control={form.control} name="nome" render={({ field }) => (
                                <FormItem><FormLabel>Nome *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="sigla_protocolo" render={({ field }) => (
                                <FormItem><FormLabel>Sigla *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        {/* 3. ADICIONAR O CAMPO 'estado' AO FORMULÁRIO JSX */}
                        <FormField control={form.control} name="estado" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Estado *</FormLabel>
                                <FormControl>
                                    <select {...field} className="input input-bordered w-full">
                                        <option value="">Selecione o estado</option>
                                        {ESTADOS.map(e => (
                                            <option key={e.id} value={e.sigla}>{e.nome} ({e.sigla})</option>
                                        ))}
                                    </select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="logo_url" render={({ field }) => (
                            <FormItem><FormLabel>URL da Logo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />

                        {/* Configurações da API da Meta */}
                        <div className="space-y-3 pt-4 border-t">
                            <h3 className="text-lg font-semibold">Configurações API da Meta</h3>
                            <div className="grid grid-cols-1 gap-3">
                                <FormField control={form.control} name="whatsapp_phone_number_id" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ID do Número WhatsApp</FormLabel>
                                        <FormControl><Input {...field} placeholder="Ex: 123456789012345" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="messenger_page_id" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ID da Página do Messenger</FormLabel>
                                        <FormControl><Input {...field} placeholder="Ex: 987654321098765" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="instagram_page_id" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ID da Conta Profissional Instagram</FormLabel>
                                        <FormControl><Input {...field} placeholder="Ex: 192837465019283" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="access_token" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Token de Acesso da Página/App Meta</FormLabel>
                                        <FormControl><Input {...field} type="password" placeholder="Deixe vazio para não alterar" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                        </div>

                        <FormField control={form.control} name="ativo" render={({ field }) => (
                            <FormItem className="flex items-center space-x-3 pt-2">
                                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                <FormLabel>Ativo</FormLabel>
                            </FormItem>
                        )} />
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEditing ? 'Salvar' : 'Criar'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}