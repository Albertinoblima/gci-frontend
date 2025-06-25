// src/components/educacao/escolas/EscolaForm.jsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
    nome: z.string().min(3, "O nome é obrigatório."),
    tipo_escola: z.string().min(3, "O tipo é obrigatório (Ex: Municipal, Estadual)."),
    ativo: z.boolean().default(true),
    municipio_id: z.number(),
});

export default function EscolaForm({ isOpen, onClose, onSuccess, initialData, mutation }) {
    const { user } = useAuth();
    const isEditing = !!initialData?.id;

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: { nome: '', tipo_escola: '', ativo: true, municipio_id: user.municipio_id },
    });

    useEffect(() => {
        if (isOpen) {
            const defaultValues = { nome: '', tipo_escola: '', ativo: true, municipio_id: user.municipio_id };
            form.reset(isEditing ? initialData : defaultValues);
        }
    }, [isOpen, initialData, isEditing, form, user]);

    const onSubmit = (values) => { mutation.mutate(values); };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar' : 'Nova'} Escola</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Edite as informações da escola.' : 'Preencha as informações para cadastrar uma nova escola.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="nome" render={({ field }) => (<FormItem><FormLabel>Nome *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="tipo_escola" render={({ field }) => (<FormItem><FormLabel>Tipo de Escola *</FormLabel><FormControl><Input placeholder="Ex: Municipal" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="ativo" render={({ field }) => (<FormItem className="flex items-center space-x-3 pt-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Ativa</FormLabel></FormItem>)} />
                        <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose><Button type="submit" disabled={mutation.isPending}>{mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{isEditing ? 'Salvar' : 'Criar'}</Button></DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}