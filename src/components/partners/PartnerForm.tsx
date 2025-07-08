
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePartners, NewPartner } from "@/hooks/usePartners";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  name: z.string().min(2, { message: "O nome da empresa é obrigatório." }),
  city: z.string().min(2, { message: "A cidade é obrigatória." }),
  segment: z.string().min(2, { message: "O segmento é obrigatório." }),
  contact_email: z.string().email({ message: "Por favor, insira um email válido." }).optional().or(z.literal('')),
  contact_whatsapp: z.string().optional(),
  website_link: z.string().url({ message: "Por favor, insira um link válido." }).optional().or(z.literal('')),
  message: z.string().optional(),
  category: z.enum(['local', 'regional', 'estadual']),
  logo: z.any().refine((files) => files?.length >= 1, 'Logo é obrigatório.'),
});

export function PartnerForm() {
  const { submitRequest, isSubmitting } = usePartners();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      city: "",
      segment: "",
      contact_email: "",
      contact_whatsapp: "",
      website_link: "",
      message: "",
      category: 'local',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    let logoUrl = '';
    
    if (values.logo && values.logo.length > 0) {
      const file = values.logo[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      setIsUploading(true);
      const { error: uploadError } = await supabase.storage
        .from('partner-logos')
        .upload(filePath, file);
      setIsUploading(false);
        
      if (uploadError) {
        toast({
          title: "Erro no upload do logo",
          description: `Certifique-se que o bucket 'partner-logos' existe e é público. Erro: ${uploadError.message}`,
          variant: "destructive",
        });
        return;
      }
      
      const { data } = supabase.storage.from('partner-logos').getPublicUrl(filePath);
      logoUrl = data.publicUrl;
    }

    const partnerData: NewPartner = {
      name: values.name,
      city: values.city,
      segment: values.segment,
      contact_email: values.contact_email,
      contact_whatsapp: values.contact_whatsapp,
      website_link: values.website_link,
      message: values.message,
      category: values.category,
      logo_url: logoUrl,
      status: 'pending',
    };
    
    submitRequest(partnerData, {
        onSuccess: () => {
            form.reset();
            navigate('/parceiros');
        },
    });
  }

  const isLoading = isSubmitting || isUploading;
  const inputStyles = "bg-white/10 border-gray-600 text-white placeholder:text-gray-400 focus:ring-offset-gray-900";
  const labelStyles = "text-gray-300";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Informações da Empresa</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className={labelStyles}>Nome da empresa</FormLabel>
                    <FormControl>
                        <Input placeholder="Nome da sua empresa" {...field} className={inputStyles} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className={labelStyles}>Logo</FormLabel>
                    <FormControl>
                        <Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files)} className={`${inputStyles} file:text-gray-300 file:border-0 file:bg-white/20 file:rounded-md`} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className={labelStyles}>Cidade</FormLabel>
                    <FormControl>
                        <Input placeholder="Campo Grande" {...field} className={inputStyles} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="segment"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className={labelStyles}>Segmento</FormLabel>
                    <FormControl>
                        <Input placeholder="Hotelaria, Restaurante, etc." {...field} className={inputStyles} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className={labelStyles}>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger className={inputStyles}>
                            <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="local">Local</SelectItem>
                            <SelectItem value="regional">Regional</SelectItem>
                            <SelectItem value="estadual">Estadual</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="website_link"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className={labelStyles}>Site ou Rede Social</FormLabel>
                    <FormControl>
                        <Input placeholder="https://..." {...field} className={inputStyles} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
        </div>

        <div className="space-y-4">
             <h3 className="text-lg font-medium text-white">Informações de Contato</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="contact_email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className={labelStyles}>E-mail de contato</FormLabel>
                    <FormControl>
                        <Input type="email" placeholder="contato@empresa.com" {...field} className={inputStyles} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="contact_whatsapp"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className={labelStyles}>WhatsApp de Contato (Opcional)</FormLabel>
                    <FormControl>
                        <Input placeholder="(67) 99999-9999" {...field} className={inputStyles} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
        </div>
       
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelStyles}>Mensagem (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Deixe uma mensagem para nossa equipe. Fale um pouco sobre como sua empresa pode contribuir para o turismo local."
                  className={`resize-none ${inputStyles}`}
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full text-lg py-6 font-bold bg-ms-secondary-yellow text-ms-primary-blue hover:bg-ms-secondary-yellow/90">
            {isLoading ? "Enviando..." : "Enviar Solicitação de Parceria"}
        </Button>
      </form>
    </Form>
  )
}
