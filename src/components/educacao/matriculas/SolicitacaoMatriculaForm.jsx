// src/components/educacao/matriculas/SolicitacaoMatriculaForm.jsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';

const STATUS_OPCOES = ['recebida', 'em_analise', 'deferida', 'indeferida', 'lista_espera', 'matricula_efetivada', 'cancelada'];

const formSchema = z.object({
    status_solicitacao: z.string().min(1, "O status é obrigatório."),
    observacoes_secretaria: z.string().optional(),
});

export default function SolicitacaoMatriculaForm({ isOpen, onClose, onSuccess, initialData, mutation }) {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: { status_solicitacao: '', observacoes_secretaria: '' },
    });

    useEffect(() => {
        if (initialData) {
            form.reset(initialData);
        }
    }, [initialData, form]);

    const onSubmit = (values) => { mutation.mutate(values); };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Alterar Status da Solicitação</DialogTitle>
                    <DialogDescription>Aluno: {initialData?.nome_aluno}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="status_solicitacao" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Novo Status *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione um status..." /></SelectTrigger></FormControl>
                                    <SelectContent>{STATUS_OPCOES.map(s => <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>)}</SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="observacoes_secretaria" render={({ field }) => (
                            <FormItem><FormLabel>Observações Internas</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
                            <Button type="submit" disabled={mutation.isPending}>{mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Salvar Alterações</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}