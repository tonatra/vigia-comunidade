import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Plus, Filter, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVigia, CaseStatus, CasePriority } from '@/contexts/VigiaContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MapView from '@/components/MapView';
import Header from '@/components/Header';

const Home = () => {
  const { cases, currentUser } = useVigia();
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<CasePriority | 'all'>('all');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  const filteredCases = cases.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && c.priority !== priorityFilter) return false;
    return true;
  });

  const getStatusColor = (status: CaseStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'in_progress': return 'bg-blue-500';
      case 'resolved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
    }
  };

  const getPriorityColor = (priority: CasePriority) => {
    switch (priority) {
      case 'low': return 'bg-gray-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Casos Reportados</h1>
            <p className="text-muted-foreground">Acompanhe problemas urbanos na sua cidade</p>
          </div>
          
          {currentUser && (
            <Button asChild>
              <Link to="/novo">
                <Plus className="mr-2 h-4 w-4" />
                Nova Denúncia
              </Link>
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CaseStatus | 'all')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="resolved">Resolvido</SelectItem>
              <SelectItem value="rejected">Rejeitado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as CasePriority | 'all')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Prioridades</SelectItem>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="critical">Crítica</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              onClick={() => setViewMode('map')}
            >
              <MapPin className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {viewMode === 'map' ? (
          <div className="mb-6">
            <MapView cases={filteredCases} />
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCases.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mb-4" />
              <p>Nenhum caso encontrado</p>
            </div>
          ) : (
            filteredCases.map(caso => (
              <Link key={caso.id} to={`/caso/${caso.id}`} className="block">
                <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                  {caso.image && (
                    <img
                      src={caso.image}
                      alt={caso.title}
                      className="w-full h-48 object-cover rounded-md mb-4"
                    />
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg text-foreground">{caso.title}</h3>
                      <Badge className={getPriorityColor(caso.priority)}>
                        {caso.priority}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {caso.description}
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{caso.location.address || 'Localização no mapa'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <Badge variant="outline" className={getStatusColor(caso.status)}>
                        {caso.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        IIR: {caso.iir}
                      </span>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(caso.createdAt), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
