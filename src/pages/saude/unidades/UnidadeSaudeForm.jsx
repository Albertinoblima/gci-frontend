// src/components/saude/unidades/UnidadeSaudeForm.jsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from 'lucide-react';

// Opções válidas para tipo de unidade
const TIPOS_UNIDADE = [
    { value: "PSF", label: "PSF" },
    { value: "UBS", label: "UBS" },
    { value: "USB", label: "USB" },
    { value: "Hospital", label: "Hospital" },
    { value: "Clinica", label: "Clínica" },
    { value: "Clinica Especializada", label: "Clínica Especializada" },
    { value: "Laboratorio", label: "Laboratório" },
    { value: "UPA", label: "UPA" },
    { value: "Outro", label: "Outro" }
];

const formSchema = z.object({
    nome: z.string()
        .min(2, "O nome deve ter pelo menos 2 caracteres")
        .max(255, "O nome deve ter no máximo 255 caracteres"),
    endereco_completo: z.string().optional(),
    tipo_unidade: z.string().optional(),
    ativo: z.boolean().default(true),
    municipio_id: z.number().optional(),
});

export default function UnidadeSaudeForm({ isOpen, onClose, onSuccess, initialData, mutation, municipioId }) {
    const isEditing = !!initialData?.id;
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nome: '',
            endereco_completo: '',
            tipo_unidade: '',
            ativo: true,
            ...(municipioId && { municipio_id: Number(municipioId) })
        },
    }); useEffect(() => {
        if (isOpen) {
            if (isEditing && initialData) {
                const editValues = {
                    nome: initialData.nome || '',
                    // Garantir que null seja tratado como string vazia no formulário
                    endereco_completo: initialData.endereco_completo || '',
                    tipo_unidade: initialData.tipo_unidade || '',
                    ativo: Boolean(initialData.ativo),
                    ...(municipioId && { municipio_id: Number(municipioId) })
                };

                form.reset(editValues);
            } else {
                const defaultValues = {
                    nome: '',
                    endereco_completo: '',
                    tipo_unidade: '',
                    ativo: true,
                    ...(municipioId && { municipio_id: Number(municipioId) })
                };
                form.reset(defaultValues);
            }
        }
    }, [isOpen, initialData, isEditing, form, municipioId]); const onSubmit = async (values) => {
        console.log('🔍 [DEBUG] Valores do formulário:', values);
        console.log('🔍 [DEBUG] isEditing:', isEditing);

        // Validar rigorosamente se o nome está presente
        if (!values.nome || !values.nome.trim() || values.nome.trim().length < 2) {
            console.error('❌ Nome é obrigatório e deve ter pelo menos 2 caracteres');
            return;
        }

        // Criar payload com validação rigorosa
        const payload = {};

        // Nome é obrigatório
        payload.nome = String(values.nome).trim();

        // Campos opcionais - só incluir se tiver valor válido
        if (values.tipo_unidade && String(values.tipo_unidade).trim() !== '' && values.tipo_unidade !== 'none') {
            payload.tipo_unidade = String(values.tipo_unidade).trim();
        }

        if (values.endereco_completo && String(values.endereco_completo).trim() !== '') {
            payload.endereco_completo = String(values.endereco_completo).trim();
        }

        // Ativo sempre incluído
        payload.ativo = Boolean(values.ativo);

        // Município ID apenas para CREATE
        if (!isEditing && values.municipio_id && typeof values.municipio_id === 'number') {
            payload.municipio_id = values.municipio_id;
        }

        console.log('📤 [DEBUG] Payload final:', payload);

        try {
            await mutation.mutateAsync(payload);
        } catch (error) {
            console.error('❌ Erro na mutação:', error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar' : 'Nova'} Unidade de Saúde</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Edite as informações da unidade de saúde.' : 'Preencha as informações para cadastrar uma nova unidade de saúde.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="nome"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome *</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Ex: UBS Central, Hospital Municipal..."
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="tipo_unidade"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo (Opcional)</FormLabel>
                                    <Select
                                        value={field.value || "none"}
                                        onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o tipo da unidade" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">Não especificado</SelectItem>
                                            {TIPOS_UNIDADE.map((tipo) => (
                                                <SelectItem key={tipo.value} value={tipo.value}>
                                                    {tipo.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="endereco_completo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Endereço (Opcional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Ex: Rua das Flores, 123 - Centro"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="ativo"
                            render={({ field }) => (
                                <FormItem className="flex items-center space-x-3 pt-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormLabel>Unidade Ativa</FormLabel>
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    Cancelar
                                </Button>
                            </DialogClose>
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