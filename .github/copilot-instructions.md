# AsteHub — Contexto do Produto e Diretrizes de Desenvolvimento

Você está trabalhando no **AsteHub**, uma plataforma SaaS B2B multi-tenant para gestão da presença digital de empresas do setor de locação de veículos.

Este documento é contexto permanente do projeto. Antes de implementar qualquer tarefa, considere estas regras, o domínio do produto e a arquitetura existente.

---

## 1. Visão do produto

O AsteHub permite que empresas de locação de veículos gerenciem, em uma única plataforma:

- seus sites;
- unidades/filiais;
- catálogo de veículos;
- informações comerciais;
- conteúdo publicado;
- usuários e permissões;
- formulários;
- leads recebidos pelos sites.

Cada empresa utiliza a mesma plataforma, mas possui seus próprios dados, usuários, configurações, identidade visual, domínio e site público.

O objetivo não é criar sites manualmente para cada cliente. O objetivo é construir **um único produto SaaS configurável e reutilizável por diferentes empresas do mesmo segmento**.

---

## 2. Público-alvo inicial

O público principal são **locadoras de veículos**, especialmente empresas pequenas e médias e redes regionais que possuem uma ou mais unidades e precisam administrar sua presença digital.

Exemplos:

- locadoras de carros;
- locadoras com várias filiais;
- locadoras de utilitários;
- empresas de locação de veículos comerciais;
- redes ou grupos de locadoras.

A arquitetura pode futuramente permitir expansão para negócios próximos, como revendas, frotas comerciais ou locação de equipamentos.

Entretanto, **não generalize o domínio prematuramente apenas para atender mercados hipotéticos**.

O produto atual deve ser pensado prioritariamente para locadoras.

---

## 3. Problema que estamos resolvendo

Uma locadora pode possuir:

- várias unidades;
- dezenas ou centenas de veículos;
- diferentes categorias;
- informações comerciais que mudam frequentemente;
- diferentes usuários administrando conteúdo;
- site institucional;
- catálogo online;
- formulários de solicitação de orçamento;
- leads provenientes de diferentes páginas ou unidades.

Sem uma plataforma centralizada, alterações podem depender de desenvolvedores, diferentes sistemas ou processos manuais.

O AsteHub centraliza essa operação.

Exemplo:

Empresa possui três unidades.

No dashboard, um usuário autorizado:

1. cadastra um veículo;
2. adiciona imagens e características;
3. determina em quais unidades ele está disponível;
4. publica o veículo;
5. o conteúdo passa a aparecer no site público da empresa;
6. um visitante encontra o veículo e solicita uma cotação;
7. o lead é registrado no AsteHub e associado à empresa/unidade correspondente.

Esse tipo de fluxo deve orientar decisões de arquitetura.

---

## 4. O que o AsteHub NÃO é

Neste momento, o AsteHub não pretende ser:

- ERP;
- sistema financeiro;
- sistema de manutenção de frota;
- plataforma de telemetria;
- sistema contábil;
- marketplace de veículos;
- construtor visual genérico como Wix/Webflow;
- sistema completo de reservas;
- plataforma de pagamentos;
- CRM completo;
- software personalizado diferente para cada cliente.

Esses limites são importantes.

Não introduza funcionalidades desses domínios sem uma tarefa explicitamente solicitada.

---

## 5. Modelo SaaS multi-tenant

O AsteHub é multi-tenant.

Uma `Organization` representa uma empresa cliente da plataforma.

Exemplo:

```text
AsteHub
│
├── Locadora A
│   ├── usuários
│   ├── unidades
│   ├── veículos
│   ├── site
│   └── leads
│
├── Locadora B
│   ├── usuários
│   ├── unidades
│   ├── veículos
│   ├── site
│   └── leads
│
└── Locadora C
    └── ...
```

Todas utilizam a mesma aplicação e infraestrutura, mas seus dados precisam permanecer logicamente isolados.

**Isolamento entre tenants é requisito de segurança, não apenas regra de interface.**

Nunca confie somente em IDs de organização enviados pelo frontend para determinar autorização.

A API é responsável por validar a identidade, membership e permissões antes de acessar recursos pertencentes a uma organização.

---

## 6. Usuários e organizações

`User` representa a identidade global de uma pessoa.

`Organization` representa uma empresa cliente.

A relação ocorre através de `Membership`.

```text
User
  │
  └── Membership
           │
           └── Organization
```

Um usuário pode futuramente pertencer a mais de uma organização.

O papel do usuário pertence ao `Membership`, e não ao `User`.

Papéis iniciais:

```text
OWNER
ADMIN
MEMBER
```

Nunca introduza um `organizationId` diretamente em `User` como substituto dessa relação.

---

## 7. Arquitetura do monorepo

O projeto utiliza uma arquitetura monorepo.

Estrutura conceitual:

```text
astehub/
│
├── apps/
│   ├── api/
│   ├── dashboard/
│   └── web/
│
├── packages/
│   ├── ui/
│   ├── contracts/
│   ├── typescript/
│   └── eslint-config/
│
└── infra/
```

Adapte-se sempre à estrutura que realmente existe no repositório. Não recrie diretórios ou configurações apenas porque aparecem neste documento.

### apps/api

Backend responsável pelas regras de negócio.

Stack principal:

- Node.js;
- TypeScript;
- NestJS;
- Prisma;
- PostgreSQL.

A API é responsável por:

- autenticação;
- autorização;
- isolamento multi-tenant;
- regras de negócio;
- persistência;
- validação;
- publicação;
- leads;
- integrações futuras.

Frontend nunca deve acessar PostgreSQL diretamente.

### apps/dashboard

Aplicação administrativa.

Stack:

- Next.js;
- React;
- TypeScript.

Utilizada por funcionários e administradores das empresas clientes.

Exemplos de funcionalidades futuras:

```text
Dashboard
├── Visão geral
├── Veículos
├── Categorias
├── Unidades
├── Site
├── Leads
├── Usuários
└── Configurações
```

O dashboard consome a API.

Não coloque regras críticas de negócio exclusivamente no frontend.

### apps/web

Aplicação responsável pelos sites públicos das empresas.

Também baseada em Next.js.

Um único código deve ser capaz de servir diferentes clientes através de domínio/configuração/tenant.

Exemplo:

```text
locadora-a.com.br
        ↓
      AsteHub
        ↓
Organization A

locadora-b.com.br
        ↓
      AsteHub
        ↓
Organization B
```

Os sites podem variar em:

- identidade visual;
- domínio;
- logotipo;
- informações;
- páginas;
- unidades;
- veículos;
- conteúdo.

Isso não significa criar uma aplicação Next.js separada para cada cliente.

---

## 8. Banco de dados

Banco principal:

**PostgreSQL**

ORM:

**Prisma**

A modelagem deve priorizar integridade relacional e isolamento multi-tenant.

Entidades já existentes ou planejadas incluem:

```text
Organization
User
Membership
Session

Location
Vehicle
VehicleCategory

Site
Domain
Page
Publication
Media

Lead
```

Nem todas precisam existir agora.

**Não implemente entidades futuras apenas porque estão listadas neste contexto.**

Crie somente o necessário para a tarefa atual.

---

## 9. Conceitos principais do domínio futuro

### Organization

Empresa cliente do AsteHub.

É a principal raiz do tenant.

### Location

Unidade ou filial da locadora.

Uma organização pode possuir várias unidades.

### Vehicle

Veículo publicado ou administrado pela organização.

Pode estar relacionado a categorias e unidades.

### VehicleCategory

Classificação comercial do veículo.

Exemplos:

- econômico;
- compacto;
- sedan;
- SUV;
- utilitário.

Não fixe essas categorias em código. São exemplos de domínio.

### Site

Representa a presença digital de uma organização.

### Domain

Domínio associado ao site.

### Page

Conteúdo administrável do site.

### Lead

Contato ou oportunidade comercial proveniente do site.

Exemplo:

```text
Visitante
   ↓
Site público
   ↓
Veículo
   ↓
Solicitar cotação
   ↓
Lead
   ↓
Organization
   ↓
Location
```

---

## 10. Publicação

Existe uma diferença conceitual entre:

**conteúdo administrativo**

e

**conteúdo publicado**.

Alterações realizadas no dashboard não necessariamente precisam ser imediatamente públicas.

A arquitetura deve poder evoluir para estados como:

```text
DRAFT
PUBLISHED
ARCHIVED
```

Não implemente versionamento complexo sem necessidade, mas evite decisões arquiteturais que tornem impossível separar edição de publicação futuramente.

---

## 11. Autenticação

O módulo inicial de autenticação já faz parte do projeto.

A autenticação utiliza sessões persistidas no servidor.

Princípios:

- cookies `HttpOnly`;
- `Secure` em produção;
- `SameSite` apropriado;
- senhas armazenadas somente como hash seguro;
- tokens de sessão não devem ser armazenados em texto puro;
- frontend não armazena token de autenticação em `localStorage`;
- autorização é responsabilidade da API.

Antes de alterar autenticação, analise a implementação existente e seus testes.

Não substitua a estratégia de autenticação sem justificativa explícita.

---

## 12. Desenvolvimento orientado a testes

O projeto utiliza **TDD**.

Para novas regras de negócio:

```text
RED
↓
escrever teste que representa o comportamento desejado

GREEN
↓
implementar o mínimo necessário

REFACTOR
↓
melhorar a implementação mantendo os testes verdes
```

Não escreva toda a funcionalidade primeiro para adicionar testes posteriormente e chamar isso de TDD.

Priorize testes para:

- regras de negócio;
- autorização;
- isolamento multi-tenant;
- validação;
- casos de erro;
- integrações importantes;
- comportamento observável.

Evite testes que apenas reproduzem detalhes internos da implementação.

---

## 13. Estratégia de desenvolvimento

O AsteHub deve evoluir através de **fluxos verticais pequenos**.

Evite construir toda a API e somente depois começar os frontends.

Exemplo de fluxo futuro:

```text
Criar veículo
      ↓
API
      ↓
PostgreSQL
      ↓
Dashboard
      ↓
Publicar
      ↓
Site público
```

Depois que esse fluxo estiver funcionando de ponta a ponta, ele pode ser expandido.

Essa abordagem tem prioridade sobre implementar dezenas de CRUDs desconectados.

---

## 14. Princípios técnicos

Ao implementar qualquer funcionalidade:

1. Prefira soluções simples antes de abstrações genéricas.
2. Não crie microsserviços sem necessidade.
3. Não introduza dependências sem justificar sua função.
4. Evite duplicação entre aplicações quando existir compartilhamento legítimo.
5. Não mova código para `packages` apenas porque duas coisas parecem semelhantes.
6. Mantenha regras de negócio no backend.
7. Valide toda entrada externa.
8. Trate autorização como parte da regra de negócio.
9. Toda consulta multi-tenant deve considerar o tenant autorizado.
10. Não exponha entidades Prisma diretamente como contrato público sem avaliar o acoplamento.
11. Migrations devem ser versionadas.
12. Não altere migrations já aplicadas; crie novas migrations quando necessário.
13. Nunca use `db push` como substituto silencioso para migrations versionadas.
14. Nunca declare que testes passaram sem executá-los.
15. Não faça refactors amplos fora do escopo da tarefa.

---

## 15. Desenvolvimento local

A infraestrutura atual utiliza Docker para PostgreSQL.

Banco principal de desenvolvimento:

```text
infra-postgres-1
```

Exposto atualmente através de:

```text
localhost:5433
```

A configuração real do ambiente e do `DATABASE_URL` é sempre a fonte de verdade.

Não fixe portas, usuários, senhas ou URLs diretamente no código.

Use variáveis de ambiente.

Existe PostgreSQL instalado localmente na máquina, mas o projeto deve utilizar o banco definido pela infraestrutura do próprio repositório.

---

## 16. Segurança multi-tenant

Este é um requisito central.

Uma requisição autenticada como usuário da Organization A jamais pode obter, alterar ou excluir recursos pertencentes à Organization B sem possuir membership autorizado nela.

Considere esse cenário em:

- repositories;
- services;
- queries Prisma;
- guards;
- policies;
- testes de integração.

Ao implementar qualquer recurso relacionado a organizações, inclua testes negativos de isolamento.

Exemplo obrigatório de raciocínio:

```text
User A → Organization A → Vehicle A
User B → Organization B → Vehicle B

User A tenta consultar Vehicle B
                  ↓
               NEGADO
```

Não dependa do frontend para impedir isso.

---

## 17. Escopo do MVP

O MVP deverá caminhar para permitir:

```text
Empresa cria conta
        ↓
Configura organização
        ↓
Cadastra unidades
        ↓
Cadastra veículos
        ↓
Configura site
        ↓
Publica catálogo
        ↓
Visitante acessa site
        ↓
Consulta veículos
        ↓
Envia solicitação
        ↓
Lead aparece no dashboard
```

Funcionalidades fora desse fluxo devem possuir justificativa clara antes de serem introduzidas.

---

## 18. Evolução futura

Depois de validar o produto com locadoras, poderão ser avaliados:

- templates adicionais;
- SEO avançado;
- analytics;
- distribuição automática de leads;
- integrações;
- CRM;
- disponibilidade;
- reservas;
- pagamentos;
- automações;
- outras verticais próximas.

São possibilidades, não requisitos atuais.

Não antecipe essas funcionalidades na arquitetura a ponto de aumentar desnecessariamente a complexidade do MVP.

---

## 19. Regra antes de executar qualquer tarefa

Antes de escrever código:

1. Leia este contexto.
2. Inspecione o código existente relacionado à tarefa.
3. Identifique padrões e dependências já utilizados.
4. Identifique quais aplicações/packages serão afetados.
5. Defina o comportamento esperado.
6. Escreva ou atualize os testes primeiro quando houver mudança de comportamento.
7. Implemente somente o escopo solicitado.
8. Execute testes, lint e typecheck relevantes.
9. Informe exatamente o que foi alterado e quais comandos foram realmente executados.

Se houver conflito entre este contexto e o código existente, não reestruture silenciosamente o projeto. Identifique o conflito e preserve compatibilidade até que exista uma decisão explícita.

---

## 20. Princípio central

Ao tomar decisões, priorize esta ideia:

> O AsteHub é um produto SaaS multi-tenant para permitir que diferentes locadoras administrem sua presença digital, catálogo, unidades e geração de leads através de uma única plataforma, mantendo seus dados e operações isolados.

Construa para o problema atual, mantendo espaço para evolução futura sem implementar o futuro antes de ele existir.