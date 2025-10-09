import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, ThumbsUp, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useVigia } from '@/contexts/VigiaContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import Header from '@/components/Header';
import MapView from '@/components/MapView';

const CaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cases, comments, supportCase, addComment, currentUser } = useVigia();
  const [commentText, setCommentText] = useState('');

  const caso = cases.find(c => c.id === id);
  const caseComments = comments.filter(c => c.caseId === id);

  if (!caso) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Caso não encontrado</h2>
          <Button onClick={() => navigate('/')}>Voltar para Home</Button>
        </div>
      </div>
    );
  }

  const handleSupport = () => {
    if (!currentUser) {
      alert('Você precisa estar logado para apoiar');
      return;
    }
    supportCase(caso.id);
  };

  const handleAddComment = () => {
    if (!currentUser) {
      alert('Você precisa estar logado para comentar');
      return;
    }
    if (commentText.trim()) {
      addComment(caso.id, commentText);
      setCommentText('');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              {caso.image && (
                <img
                  src={caso.image}
                  alt={caso.title}
                  className="w-full h-96 object-cover rounded-lg mb-6"
                />
              )}

              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-foreground">{caso.title}</h1>
                <Badge variant="outline">{caso.status}</Badge>
              </div>

              <div className="flex gap-2 mb-4">
                <Badge>{caso.category}</Badge>
                <Badge>{caso.priority}</Badge>
              </div>

              <p className="text-muted-foreground mb-6">{caso.description}</p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{caso.location.address || 'Ver no mapa abaixo'}</span>
                </div>
                <span>•</span>
                <span>Por {caso.userName}</span>
                <span>•</span>
                <span>{format(new Date(caso.createdAt), "dd/MM/yyyy", { locale: ptBR })}</span>
              </div>

              <div className="flex items-center gap-4">
                <Button onClick={handleSupport} variant="outline">
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  Apoiar ({caso.supports})
                </Button>
                
                {currentUser?.isAdmin && (
                  <Button asChild variant="secondary">
                    <Link to={`/admin?caso=${caso.id}`}>Editar (Admin)</Link>
                  </Button>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Comentários ({caseComments.length})
              </h2>

              <div className="space-y-4 mb-6">
                {caseComments.map(comment => (
                  <div key={comment.id} className="border-l-2 border-primary pl-4 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{comment.userName}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(comment.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{comment.text}</p>
                  </div>
                ))}
              </div>

              {currentUser ? (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Adicione um comentário..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={3}
                  />
                  <Button onClick={handleAddComment} disabled={!commentText.trim()}>
                    Comentar
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Faça login para comentar
                </p>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Informações</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">IIR:</span>
                  <span className="ml-2 font-semibold">{caso.iir}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <span className="ml-2">{caso.status}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Prioridade:</span>
                  <span className="ml-2">{caso.priority}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Categoria:</span>
                  <span className="ml-2">{caso.category}</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-4">Localização</h3>
              <MapView cases={[caso]} height="300px" />
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CaseDetail;
