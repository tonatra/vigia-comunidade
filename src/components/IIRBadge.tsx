import { Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface IIRBadgeProps {
  iir: number | null;
  className?: string;
}

const IIRBadge = ({ iir, className }: IIRBadgeProps) => {
  if (iir === null) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={className}>
              <Info className="h-3 w-3 mr-1" />
              IIR: Pendente
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>O IIR (Índice de Insatisfação e Relevância) será calculado automaticamente por uma Inteligência Artificial em versão futura.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const getIIRColor = (value: number) => {
    if (value >= 80) return 'bg-red-500';
    if (value >= 60) return 'bg-orange-500';
    if (value >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`${getIIRColor(iir)} ${className}`}>
            IIR: {iir}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>Índice de Insatisfação e Relevância: mede o impacto e urgência do problema.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default IIRBadge;
