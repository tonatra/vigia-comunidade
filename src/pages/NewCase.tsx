import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Upload, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVigia, CaseCategory, CasePriority } from '@/contexts/VigiaContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import LocationPicker from '@/components/LocationPicker';

const NewCase = () => {
  const navigate = useNavigate();
  const { addCase, currentUser } = useVigia();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CaseCategory>('other');
  const [priority, setPriority] = useState<CasePriority>('medium');
  const [location, setLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [image, setImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para criar uma denúncia',
        variant: 'destructive',
      });
      return;
    }

    if (!location) {
      toast({
        title: 'Erro',
        description: 'Selecione uma localização no mapa',
        variant: 'destructive',
      });
      return;
    }

    const iir = Math.floor(Math.random() * 100);

    addCase({
      title,
      description,
      category,
      priority,
      status: 'pending',
      location,
      image: image || undefined,
      iir,
    });

    toast({
      title: 'Sucesso!',
      description: 'Denúncia criada com sucesso',
    });

    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6 text-foreground">Nova Denúncia</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Buraco na Rua Principal"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o problema em detalhes..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as CaseCategory)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="water">Falta de Água</SelectItem>
                    <SelectItem value="road">Buraco na Rua</SelectItem>
                    <SelectItem value="sewage">Esgoto</SelectItem>
                    <SelectItem value="energy">Energia</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Prioridade</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as CasePriority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Foto (Opcional)</Label>
              <div className="mt-2">
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-accent transition-colors">
                    {image ? (
                      <img src={image} alt="Preview" className="max-h-48 mx-auto rounded-md" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Upload className="h-8 w-8" />
                        <span>Clique para fazer upload</span>
                      </div>
                    )}
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Localização
              </Label>
              <div className="mt-2">
                <LocationPicker onLocationSelect={setLocation} />
              </div>
              {location && (
                <p className="text-sm text-muted-foreground mt-2">
                  Coordenadas: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full">
              Criar Denúncia
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default NewCase;
