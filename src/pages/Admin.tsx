import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Download, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useVigia, Case, CaseStatus, CasePriority } from '@/contexts/VigiaContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Header from '@/components/Header';

const Admin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cases, updateCase, deleteCase, currentUser } = useVigia();
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [editForm, setEditForm] = useState<Partial<Case>>({});

  if (!currentUser?.isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Acesso Negado</h2>
          <p className="text-muted-foreground mb-4">Você precisa ser administrador para acessar esta página.</p>
          <Button onClick={() => navigate('/')}>Voltar</Button>
        </Card>
      </div>
    );
  }

  const handleEdit = (caso: Case) => {
    setEditingCase(caso);
    setEditForm(caso);
  };

  const handleSaveEdit = () => {
    if (editingCase && editForm) {
      updateCase(editingCase.id, editForm);
      setEditingCase(null);
      setEditForm({});
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este caso?')) {
      deleteCase(id);
    }
  };

  const generateReport = () => {
    const report = {
      totalCases: cases.length,
      byStatus: {
        pending: cases.filter(c => c.status === 'pending').length,
        in_progress: cases.filter(c => c.status === 'in_progress').length,
        resolved: cases.filter(c => c.status === 'resolved').length,
        rejected: cases.filter(c => c.status === 'rejected').length,
      },
      byPriority: {
        low: cases.filter(c => c.priority === 'low').length,
        medium: cases.filter(c => c.priority === 'medium').length,
        high: cases.filter(c => c.priority === 'high').length,
        critical: cases.filter(c => c.priority === 'critical').length,
      },
      avgIIR: cases.reduce((sum, c) => sum + c.iir, 0) / cases.length,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vigia-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Painel Administrativo</h1>
          </div>
          
          <Button onClick={generateReport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar Relatório
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total de Casos</h3>
            <p className="text-3xl font-bold text-foreground">{cases.length}</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Pendentes</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {cases.filter(c => c.status === 'pending').length}
            </p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Em Andamento</h3>
            <p className="text-3xl font-bold text-blue-600">
              {cases.filter(c => c.status === 'in_progress').length}
            </p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Resolvidos</h3>
            <p className="text-3xl font-bold text-green-600">
              {cases.filter(c => c.status === 'resolved').length}
            </p>
          </Card>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>IIR</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.map(caso => (
                <TableRow key={caso.id}>
                  <TableCell className="font-medium">{caso.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{caso.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge>{caso.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge>{caso.priority}</Badge>
                  </TableCell>
                  <TableCell>{caso.iir}</TableCell>
                  <TableCell>
                    {format(new Date(caso.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(caso)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(caso.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Dialog open={!!editingCase} onOpenChange={() => setEditingCase(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Caso</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(v) => setEditForm({ ...editForm, status: v as CaseStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="resolved">Resolvido</SelectItem>
                    <SelectItem value="rejected">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Prioridade</Label>
                <Select
                  value={editForm.priority}
                  onValueChange={(v) => setEditForm({ ...editForm, priority: v as CasePriority })}
                >
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

              <div>
                <Label>IIR</Label>
                <Input
                  type="number"
                  value={editForm.iir}
                  onChange={(e) => setEditForm({ ...editForm, iir: parseInt(e.target.value) })}
                />
              </div>

              <Button onClick={handleSaveEdit} className="w-full">
                Salvar Alterações
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Admin;
