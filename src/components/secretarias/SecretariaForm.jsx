// src/components/secretarias/SecretariaForm.jsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
    nome: z.string().min(3, "O nome é obrigatório.").max(100),
    descricao: z.string().optional(),
    email_responsavel: z.string().email("E-mail inválido.").optional().or(z.literal('')),
    ativo: z.boolean().default(true),
});

export default function SecretariaForm({ isOpen, onClose, onSuccess, initialData, mutation, municipioId }) {
    const isEditing = !!initialData?.id;

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: { nome: '', descricao: '', email_responsavel: '', ativo: true },
    });

    useEffect(() => {
        if (isOpen) {
            form.reset(isEditing ? initialData : { nome: '', descricao: '', email_responsavel: '', ativo: true });
        }
    }, [isOpen, initialData, isEditing, form]);

    const onSubmit = (values) => {
        const mutationData = { municipioId, data: values };
        if (isEditing) {
            mutationData.secretariaId = initialData.id;
        }
        mutation.mutate(mutationData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader><DialogTitle>{isEditing ? 'Editar Secretaria' : 'Nova Secretaria'}</DialogTitle></DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="nome" render={({ field }) => (<FormItem><FormLabel>Nome *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="descricao" render={({ field }) => (<FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="email_responsavel" render={({ field }) => (<FormItem><FormLabel>E-mail do Responsável</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="ativo" render={({ field }) => (<FormItem className="flex items-center space-x-3 pt-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Ativa</FormLabel></FormItem>)} />
                        <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose><Button type="submit" disabled={mutation.isPending}>{mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{isEditing ? 'Salvar' : 'Criar'}</Button></DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}