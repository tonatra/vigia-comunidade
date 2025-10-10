# VIGIA - Vigilância Integrada de Gestão de Infraestrutura e de Ações

Uma plataforma web e mobile para registrar, visualizar e acompanhar problemas urbanos de infraestrutura.

## 🎯 Sobre o Projeto

O VIGIA é um MVP funcional que permite cidadãos reportar problemas urbanos como buracos, esgoto, falta de água, energia, entre outros. A plataforma oferece:

- 📍 Visualização em mapa interativo
- 📝 Sistema de denúncias com fotos e localização
- 💬 Comentários e apoio a casos
- 📊 Painel administrativo para moderação
- 🤖 Estrutura preparada para integração com IA

## 🛠️ Stack Tecnológica

- **Frontend**: React + TypeScript + Vite
- **Estilização**: Tailwind CSS
- **Componentes UI**: shadcn/ui
- **Mapas**: Leaflet.js
- **Roteamento**: React Router
- **Persistência**: LocalStorage (pronto para migração para Supabase)

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes shadcn/ui
│   ├── Header.tsx      # Cabeçalho com navegação
│   ├── MapView.tsx     # Visualização de mapa
│   └── LocationPicker.tsx  # Seletor de localização
├── contexts/           # Contextos React
│   └── VigiaContext.tsx    # Estado global da aplicação
├── lib/               # Bibliotecas e utilitários
│   ├── ai/           # Módulo de IA (placeholder)
│   │   └── index.ts  # Funções para cálculo de IIR
│   ├── auth/         # Módulo de autenticação
│   │   └── index.ts  # Adapter layer para Supabase Auth
│   └── utils.ts      # Funções utilitárias
├── pages/            # Páginas da aplicação
│   ├── Home.tsx      # Listagem e mapa de casos
│   ├── NewCase.tsx   # Criar nova denúncia
│   ├── CaseDetail.tsx    # Detalhes de um caso
│   ├── Admin.tsx     # Painel administrativo
│   ├── Login.tsx     # Login
│   ├── Signup.tsx    # Cadastro
│   ├── ForgotPassword.tsx    # Recuperação de senha
│   └── Profile.tsx   # Perfil do usuário
└── App.tsx           # Configuração de rotas
```

## 🚀 Rotas Principais

| Rota | Descrição |
|------|-----------|
| `/` | Mapa e listagem de casos |
| `/novo` | Criar nova denúncia |
| `/caso/:id` | Visualizar detalhes de um caso |
| `/admin` | Painel de moderação (admin only) |
| `/login` | Página de login |
| `/signup` | Página de cadastro |
| `/forgot-password` | Recuperação de senha |
| `/profile` | Perfil do usuário |

## 🤖 Integração com IA (Futura)

O sistema está preparado para integração com IA através do módulo localizado em `src/lib/ai/index.ts`.

### Funções Disponíveis

#### `computeIIR(reportData)`

Calcula o **IIR (Índice de Insatisfação e Relevância)** baseado em:
- Número de pessoas afetadas
- Prioridade do caso
- Número de apoios
- Tempo desde a criação
- Casos similares na área

```typescript
import { computeIIR } from '@/lib/ai';

const iir = await computeIIR({
  title: "Buraco na via",
  description: "...",
  category: "road",
  priority: "high",
  location: { lat: -23.5505, lng: -46.6333 },
  affectedPeople: 150,
  supports: 25,
  createdAt: new Date().toISOString()
});
```

#### `estimateAffectedPeople(reportData)`

Estima o número de pessoas afetadas quando o usuário seleciona "Não sei informar".

```typescript
import { estimateAffectedPeople } from '@/lib/ai';

const estimate = await estimateAffectedPeople({
  title: "Falta de água",
  category: "water",
  location: { lat: -23.5505, lng: -46.6333 },
  // ...
});
```

### Como Integrar a IA

1. Substitua os retornos `null` nas funções por chamadas à sua API de IA
2. Configure as variáveis de ambiente necessárias (API keys)
3. Implemente o modelo de ML ou conecte-se a um serviço externo
4. Atualize a interface para exibir os valores calculados

## 🔐 Sistema de Autenticação

O sistema de autenticação está localizado em `src/lib/auth/index.ts` e funciona como uma **camada de adaptação** para futura migração ao Supabase Auth.

### Funcionalidades Implementadas

- ✅ Cadastro com email e senha
- ✅ Login e logout
- ✅ Verificação de email (simulada)
- ✅ Recuperação de senha
- ✅ Atualização de perfil
- ✅ Gerenciamento de sessões
- ✅ Rate limiting (proteção contra força bruta)
- ✅ Diferentes níveis de acesso (user, moderator, admin)

### Migração para Supabase Auth

Para substituir pela autenticação real do Supabase:

1. **Instale o Supabase Client**
```bash
npm install @supabase/supabase-js
```

2. **Configure o Cliente Supabase**
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

3. **Atualize as Funções em `src/lib/auth/index.ts`**

Substitua as implementações existentes por chamadas ao Supabase:

```typescript
// Exemplo: signUp
async signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  })
  return { user: data.user, error: error?.message || null }
}

// Exemplo: signIn
async signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { session: data.session, error: error?.message || null }
}
```

4. **Configure Row-Level Security (RLS) no Supabase**

Crie políticas de segurança para proteger os dados:

```sql
-- Exemplo: apenas o dono pode editar seus casos
create policy "Users can update own cases"
  on cases for update
  using (auth.uid() = user_id);
```

## 📊 Dados e Estruturas

### Interface `Case`

```typescript
interface Case {
  id: string;
  title: string;
  description: string;
  category: 'water' | 'road' | 'sewage' | 'energy' | 'other';
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  image?: string;
  iir: number | null;  // Será calculado pela IA
  affectedPeople?: number;
  affectedPeopleUnknown?: boolean;
  supports: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  userName: string;
}
```

## 🎨 Design System

O projeto utiliza um design system configurado via Tailwind CSS com tokens semânticos:

- **Cores primárias**: Azul (#0080FF)
- **Cores de acento**: Verde (#22C55E)
- **Tons neutros**: Cinza e branco

Todas as cores são definidas em `src/index.css` usando variáveis CSS HSL para suportar tema claro e escuro.

## 🔒 Segurança

### Implementado
- Rate limiting em endpoints de autenticação
- Validação de input client-side
- Sessões com expiração
- Separação de permissões por role

### Para Produção
- [ ] Migrar para Supabase Auth (autenticação real)
- [ ] Implementar HTTPS obrigatório
- [ ] Configurar CORS adequadamente
- [ ] Adicionar RLS (Row-Level Security) no banco
- [ ] Implementar refresh tokens
- [ ] Adicionar 2FA real (não simulado)
- [ ] Validação server-side completa
- [ ] Sanitização de uploads de imagem

## 🚀 Como Executar

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build de produção
npm run preview
```

## 📝 Funcionalidades Principais

### Para Usuários
- Criar denúncias com foto e localização
- Comentar em casos
- Apoiar (upvote) casos
- Visualizar casos no mapa
- Acompanhar status de casos

### Para Administradores
- Visualizar todas as denúncias
- Editar status e prioridade
- Deletar casos inapropriados
- Gerar relatórios
- Visualizar estatísticas

## 🔄 Próximos Passos

1. **Backend Real**
   - Migrar de localStorage para Supabase
   - Configurar banco de dados PostgreSQL
   - Implementar autenticação real

2. **Integração com IA**
   - Conectar API de IA para cálculo de IIR
   - Implementar estimativa de pessoas afetadas
   - Análise de padrões e clustering de casos

3. **Features Adicionais**
   - Notificações em tempo real
   - Sistema de hashtags/tags
   - Filtros avançados
   - Exportação de relatórios em PDF
   - Integração com redes sociais

4. **Mobile**
   - PWA completo
   - App nativo (React Native)
   - Notificações push

## 📄 Licença

Este é um projeto MVP para demonstração.

## 🤝 Contribuindo

Este é um projeto em desenvolvimento. Sugestões e melhorias são bem-vindas!

---

**VIGIA** - Transformando problemas urbanos em ações concretas 🏙️
