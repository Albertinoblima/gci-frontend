// src/components/servicos/ServicoForm.jsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TIPOS_SERVICO_OPCOES } from '@/constants';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
    nome: z.string().min(3, "O nome é obrigatório."),
    descricao_curta: z.string().optional(),
    tipo_servico: z.string().min(1, "O tipo de serviço é obrigatório."),
    ativo: z.boolean().default(true),
});

export default function ServicoForm({ isOpen, onClose, onSuccess, initialData, mutation }) {
    const isEditing = !!initialData?.id;
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: { nome: '', descricao_curta: '', tipo_servico: '', ativo: true },
    });

    useEffect(() => {
        if (isOpen) {
            form.reset(isEditing ? initialData : { nome: '', descricao_curta: '', tipo_servico: '', ativo: true });
        }
    }, [isOpen, initialData, isEditing, form]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Edite as informações do serviço.' : 'Preencha as informações para cadastrar um novo serviço.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(mutation.mutate)} className="space-y-4">
                        <FormField control={form.control} name="nome" render={({ field }) => (<FormItem><FormLabel>Nome *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="tipo_servico" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de Serviço *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione um tipo..." /></SelectTrigger></FormControl>
                                    <SelectContent>{TIPOS_SERVICO_OPCOES.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                                </Select><FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="descricao_curta" render={({ field }) => (<FormItem><FormLabel>Descrição Curta</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="ativo" render={({ field }) => (<FormItem className="flex items-center space-x-3 pt-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Ativo</FormLabel></FormItem>)} />
                        <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose><Button type="submit" disabled={mutation.isPending}>{mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{isEditing ? 'Salvar' : 'Criar'}</Button></DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}