import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FileText, Image, Map, Globe, Compass, Home, Building } from "lucide-react";
import InstitutionalContentManager from "./InstitutionalContentManager";

// Define proper type interfaces for our content
interface BaseContent {
  title: string;
  description?: string;
  subtitle?: string;
  cta?: string;
}

interface Section {
  id: string;
  page: string;
  name: string;
  content: BaseContent;
}

interface Region {
  id: string;
  name: string;
  description: string;
}

// Here we'd typically fetch these from a database
const mockSections: Section[] = [
  {
    id: "home_hero",
    page: "home",
    name: "Hero Principal",
    content: {
      title: "Explore o Mato Grosso do Sul",
      subtitle: "Descubra as maravilhas naturais e culturais do coração do Brasil",
      cta: "Explorar Destinos"
    }
  },
  {
    id: "destinations_main",
    page: "destinos",
    name: "Cabeçalho de Destinos", 
    content: {
      title: "Destinos",
      description: "Explore os mais belos e diversos destinos de Mato Grosso do Sul"
    }
  },
  {
    id: "map_hero",
    page: "mapa",
    name: "Hero do Mapa",
    content: {
      title: "Mapa do Turismo",
      description: "Explore interativamente as regiões turísticas, destinos e infraestrutura de todo o Mato Grosso do Sul"
    }
  }
];

// Mock regions
const mockRegions: Region[] = [
  { id: "pantanal", name: "Pantanal", description: "A maior planície alagável do mundo, o Pantanal é um paraíso para observação de fauna e experiências de ecoturismo únicas." },
  { id: "bonito", name: "Bonito/Serra da Bodoquena", description: "Conhecida por suas águas cristalinas e grutas espetaculares, Bonito é um destino imperdível para os amantes da natureza." },
  { id: "campo_grande", name: "Campo Grande e Região", description: "A capital do estado combina charme urbano com cultura regional, eventos e gastronomia diversificada." },
  { id: "corumba", name: "Corumbá", description: "Portal de entrada para o Pantanal norte, com rica história fronteiriça e patrimônio cultural." }
];

// Form schema for section editing
const sectionFormSchema = z.object({
  title: z.string().min(2, { message: "O título deve ter pelo menos 2 caracteres" }),
  description: z.string().optional(),
  subtitle: z.string().optional(),
  cta: z.string().optional()
});

// Form schema for region editing
const regionFormSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres" }),
  description: z.string().min(10, { message: "A descrição deve ter pelo menos 10 caracteres" })
});

const ContentManager = () => {
  const [sections, setSections] = useState<Section[]>(mockSections);
  const [regions, setRegions] = useState<Region[]>(mockRegions);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState("institutional");
  const { toast } = useToast();

  // Section form
  const sectionForm = useForm<z.infer<typeof sectionFormSchema>>({
    resolver: zodResolver(sectionFormSchema),
    defaultValues: {
      title: "",
      description: "",
      subtitle: "",
      cta: ""
    }
  });

  // Region form
  const regionForm = useForm<z.infer<typeof regionFormSchema>>({
    resolver: zodResolver(regionFormSchema),
    defaultValues: {
      name: "",
      description: ""
    }
  });

  // Handle section selection
  useEffect(() => {
    if (selectedSection) {
      const section = sections.find(s => s.id === selectedSection);
      if (section) {
        sectionForm.reset({
          title: section.content.title || "",
          description: section.content.description || "",
          subtitle: section.content.subtitle || "",
          cta: section.content.cta || ""
        });
      }
    }
  }, [selectedSection, sections]);

  // Handle region selection
  useEffect(() => {
    if (selectedRegion) {
      const region = regions.find(r => r.id === selectedRegion);
      if (region) {
        regionForm.reset({
          name: region.name,
          description: region.description
        });
      }
    }
  }, [selectedRegion, regions]);

  // Save section changes
  const onSectionSubmit = (values: z.infer<typeof sectionFormSchema>) => {
    if (!selectedSection) return;
    
    setSections(prevSections => 
      prevSections.map(section => 
        section.id === selectedSection 
          ? { 
              ...section, 
              content: {
                ...section.content,
                title: values.title,
                description: values.description,
                subtitle: values.subtitle,
                cta: values.cta
              } 
            }
          : section
      )
    );
    
    toast({
      title: "Conteúdo atualizado",
      description: "As alterações foram salvas com sucesso.",
    });
  };

  // Save region changes
  const onRegionSubmit = (values: z.infer<typeof regionFormSchema>) => {
    if (!selectedRegion) return;
    
    setRegions(prevRegions => 
      prevRegions.map(region => 
        region.id === selectedRegion 
          ? { ...region, name: values.name, description: values.description }
          : region
      )
    );
    
    toast({
      title: "Informações da região atualizadas",
      description: "As alterações foram salvas com sucesso.",
    });
  };

  // Get icon based on page name
  const getPageIcon = (pageName: string) => {
    switch(pageName) {
      case 'home': return <Home size={16} />;
      case 'destinos': return <Compass size={16} />;
      case 'mapa': return <Map size={16} />;
      default: return <FileText size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gerenciador de Conteúdo</h2>
      <p className="text-gray-500">
        Edite os textos e descrições exibidos em diferentes partes do aplicativo.
      </p>
      
      <Tabs defaultValue="institutional" value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="institutional" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Conteúdo Institucional
          </TabsTrigger>
          <TabsTrigger value="sections" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Seções do Site
          </TabsTrigger>
          <TabsTrigger value="regions" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Regiões
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="institutional">
          <InstitutionalContentManager />
        </TabsContent>

        {/* Seções do Site */}
        <TabsContent value="sections">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Seções</CardTitle>
                  <CardDescription>Selecione uma seção para editar</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {sections.map(section => (
                      <div 
                        key={section.id} 
                        className={`p-2 rounded-md flex items-center cursor-pointer ${selectedSection === section.id ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                        onClick={() => setSelectedSection(section.id)}
                      >
                        {getPageIcon(section.page)}
                        <span className="ml-2 text-sm">{section.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="col-span-1 md:col-span-3">
              {selectedSection ? (
                <Card>
                  <CardHeader>
                    <CardTitle>{sections.find(s => s.id === selectedSection)?.name}</CardTitle>
                    <CardDescription>
                      Página: {sections.find(s => s.id === selectedSection)?.page}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...sectionForm}>
                      <form onSubmit={sectionForm.handleSubmit(onSectionSubmit)} className="space-y-6">
                        <FormField
                          control={sectionForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Título</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {sectionForm.getValues("subtitle") !== undefined && (
                          <FormField
                            control={sectionForm.control}
                            name="subtitle"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Subtítulo</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        
                        {sectionForm.getValues("description") !== undefined && (
                          <FormField
                            control={sectionForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Descrição</FormLabel>
                                <FormControl>
                                  <Textarea rows={4} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        
                        {sectionForm.getValues("cta") !== undefined && (
                          <FormField
                            control={sectionForm.control}
                            name="cta"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Texto do Botão (CTA)</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        
                        <Button type="submit">Salvar Alterações</Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Editor de Conteúdo</CardTitle>
                    <CardDescription>
                      Selecione uma seção ao lado para começar a editar o conteúdo.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText size={48} className="text-gray-300 mb-2" />
                    <p className="text-gray-500">Nenhuma seção selecionada</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* Regiões */}
        <TabsContent value="regions">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Regiões</CardTitle>
                  <CardDescription>Selecione uma região para editar</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {regions.map(region => (
                      <div 
                        key={region.id} 
                        className={`p-2 rounded-md flex items-center cursor-pointer ${selectedRegion === region.id ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                        onClick={() => setSelectedRegion(region.id)}
                      >
                        <Globe size={16} />
                        <span className="ml-2 text-sm">{region.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="col-span-1 md:col-span-3">
              {selectedRegion ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Editar Região</CardTitle>
                    <CardDescription>
                      ID: {selectedRegion}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...regionForm}>
                      <form onSubmit={regionForm.handleSubmit(onRegionSubmit)} className="space-y-6">
                        <FormField
                          control={regionForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome da Região</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={regionForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descrição</FormLabel>
                              <FormControl>
                                <Textarea rows={6} {...field} />
                              </FormControl>
                              <FormMessage />
                              <FormDescription>
                                Esta descrição será exibida na página de mapas e detalhes da região.
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit">Salvar Alterações</Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Editor de Regiões</CardTitle>
                    <CardDescription>
                      Selecione uma região ao lado para começar a editar.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Map size={48} className="text-gray-300 mb-2" />
                    <p className="text-gray-500">Nenhuma região selecionada</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentManager;
