export type Banner = {
  id: string;
  image: string;
  kicker: string;
  title: string;
  text: string;
  ctaText?: string;
  ctaAction?: "quote" | "calculator" | "vehicles";
};

export type GalleryImage = {
  url: string;
  caption: string;
};

export type Vehicle = {
  id: string;
  brand: string;
  model: string;
  category: string;
  price: number;
  image: string;
  gallery: GalleryImage[];
  transmission: string;
  fuel: string;
  seats: string;
  engine: string;
  trunk: string;
  consumption: string;
  highlights: string[];
  features: string[];
  description: string;
};

export type PlanCategory = {
  id: string;
  label: string;
  base: number;
  description: string;
};

export const banners: Banner[] = [
  {
    id: "proximo-carro",
    image: "/banners/assinatura.jpg",
    kicker: "Locação Inteligente",
    title: "Seu próximo carro. Sem precisar comprar.",
    text: "Desfrute de um veículo moderno com IPVA, seguro total e manutenções inclusos em uma mensalidade previsível, sem entrada nem burocracia.",
    ctaText: "Simular meu plano",
    ctaAction: "calculator",
  },
  {
    id: "liberdade-dirigir",
    image: "/banners/troca.jpg",
    kicker: "Mobilidade Sem Amarras",
    title: "Mais liberdade para dirigir. Menos preocupações.",
    text: "Esqueça a depreciação e as revisões imprevistas. Escolha o prazo, a quilometragem e troque de carro com praticidade ao término do contrato.",
    ctaText: "Ver veículos disponíveis",
    ctaAction: "vehicles",
  },
  {
    id: "cuidamos-do-resto",
    image: "/banners/incluso.jpg",
    kicker: "Experiência Completa",
    title: "Escolha seu carro. A gente cuida do resto.",
    text: "Assistência 24 horas em todo o país, vistoria certificada e suporte contínuo para você focar no que realmente importa: o seu caminho.",
    ctaText: "Solicitar orçamento",
    ctaAction: "quote",
  },
];

export const vehicles: Vehicle[] = [
  {
    id: "fiat-pulse",
    brand: "Fiat",
    model: "Pulse Impetus 1.0 Turbo",
    category: "SUV Compacto",
    price: 2190,
    image: "/vehicles/pulse.jpg",
    gallery: [
      {
        url: "/vehicles/pulse.jpg",
        caption: "Design frontal arrojado e perfil SUV esportivo",
      },
      {
        url: "/about-drive.jpg",
        caption: "Cockpit ergonômico e dirigibilidade dinâmica",
      },
      {
        url: "/banners/assinatura.jpg",
        caption: "Conforto e estabilidade no trânsito urbano",
      },
      {
        url: "/banners/incluso.jpg",
        caption: "Tecnologia de iluminação Full LED e acabamento refinado",
      },
    ],
    transmission: "Automático CVT",
    fuel: "Flex",
    seats: "5 lugares",
    engine: "1.0 Turbo 200 Flex (130 cv)",
    trunk: "370 Litros",
    consumption: "12,0 km/l (urbano) / 14,4 km/l (estrada)",
    highlights: [
      "Central 10.1''",
      "Frenagem autônoma",
      "Faróis Full LED",
      "Câmera de ré",
    ],
    features: [
      "Central multimídia 10.1'' com Apple CarPlay e Android Auto sem fio",
      "Frenagem autônoma de emergência e alerta de mudança de faixa",
      "Câmera de ré com linhas dinâmicas e sensores dianteiros/traseiros",
      "Carregador de smartphone por indução (wireless charger)",
      "Ar-condicionado automático digital com filtro antipoluição",
      "Rodas de liga leve aro 17'' diamantadas",
    ],
    description:
      "Design imponente e excelente desempenho urbano com motor turbo, conectividade sem fio e itens avançados de segurança ativa para acompanhar a sua rotina com total conforto.",
  },
  {
    id: "chevrolet-onix",
    brand: "Chevrolet",
    model: "Onix Premier 1.0 Turbo",
    category: "Hatch Premium",
    price: 1890,
    image: "/vehicles/onix.jpg",
    gallery: [
      {
        url: "/vehicles/onix.jpg",
        caption: "Linhas compactas e marcantes para a cidade",
      },
      {
        url: "/about-drive.jpg",
        caption: "Interior espaçoso com excelente acústica",
      },
      {
        url: "/banners/troca.jpg",
        caption: "Conectividade avançada com Wi-Fi nativo",
      },
      {
        url: "/banners/assinatura.jpg",
        caption: "Agilidade e máxima economia em percursos urbanos",
      },
    ],
    transmission: "Automático 6 marchas",
    fuel: "Flex",
    seats: "5 lugares",
    engine: "1.0 Turbo ECOTEC (116 cv)",
    trunk: "275 Litros",
    consumption: "13,5 km/l (urbano) / 16,0 km/l (estrada)",
    highlights: [
      "Wi-Fi nativo",
      "Alerta de ponto cego",
      "Carregador por indução",
      "Park Assist",
    ],
    features: [
      "Wi-Fi nativo para até 7 dispositivos e sistema de concierge OnStar",
      "Sistema de alerta de ponto cego nos retrovisores externos",
      "Easy Park (assistente de estacionamento semiautônomo)",
      "6 airbags de série (frontais, laterais e de cortina)",
      "Controle eletrônico de estabilidade e tração com assistente de partida em rampa",
      "Chave presencial com abertura de portas por aproximação e partida por botão",
    ],
    description:
      "Referência nacional em economia e dirigibilidade ágil na cidade, equipado com pacote completo de tecnologia e conectividade integrada para quem valoriza praticidade diária.",
  },
  {
    id: "toyota-corolla",
    brand: "Toyota",
    model: "Corolla Altis 1.8 Hybrid",
    category: "Sedan Médio",
    price: 2890,
    image: "/vehicles/corolla.jpg",
    gallery: [
      {
        url: "/vehicles/corolla.jpg",
        caption: "Elegância executiva e presença imponente",
      },
      {
        url: "/about-drive.jpg",
        caption: "Silêncio a bordo e acabamento premium",
      },
      {
        url: "/banners/assinatura.jpg",
        caption: "Eficiência exemplar com motorização híbrida flex",
      },
      {
        url: "/banners/incluso.jpg",
        caption: "Tecnologia de segurança ativa Toyota Safety Sense",
      },
    ],
    transmission: "Automático Hybrid CVT",
    fuel: "Híbrido / Flex",
    seats: "5 lugares",
    engine: "1.8 Híbrido Flex (122 cv combinados)",
    trunk: "470 Litros",
    consumption: "17,9 km/l (urbano) / 15,4 km/l (estrada)",
    highlights: [
      "Motorização Híbrida",
      "Toyota Safety Sense",
      "Painel digital 12.3''",
      "Silêncio a bordo",
    ],
    features: [
      "Pacote Toyota Safety Sense com piloto automático adaptativo e frenagem autônoma",
      "Painel de instrumentos totalmente digital de 12.3'' personalizável",
      "Bancos com revestimento em couro e ajustes elétricos para o motorista",
      "Sistema híbrido auto-recarregável de alta durabilidade e baixo consumo",
      "Ar-condicionado automático dual zone com saídas traseiras",
      "Faróis dianteiros e lanternas traseiras 100% em LED",
    ],
    description:
      "Conforto inigualável, sofisticação executiva e a máxima eficiência energética da tecnologia híbrida flex mais confiável do mercado automotivo mundial.",
  },
  {
    id: "jeep-compass",
    brand: "Jeep",
    model: "Compass Longitude T270",
    category: "SUV Médio",
    price: 3390,
    image: "/vehicles/compass.jpg",
    gallery: [
      {
        url: "/vehicles/compass.jpg",
        caption: "Robustez clássica aliada ao design contemporâneo",
      },
      {
        url: "/about-drive.jpg",
        caption: "Posição de dirigir elevada e ampla visão panorâmica",
      },
      {
        url: "/banners/troca.jpg",
        caption: "Potência turbo de 185 cv pronta para qualquer viagem",
      },
      {
        url: "/banners/incluso.jpg",
        caption: "Espaço generoso e conforto para toda a família",
      },
    ],
    transmission: "Automático 6 marchas",
    fuel: "Flex",
    seats: "5 lugares",
    engine: "1.3 Turbo T270 Flex (185 cv)",
    trunk: "476 Litros",
    consumption: "10,5 km/l (urbano) / 13,0 km/l (estrada)",
    highlights: [
      "Motor Turbo T270",
      "Bancos em couro",
      "Cluster digital 7''",
      "Ar Dual-Zone",
    ],
    features: [
      "Motor Turbo T270 com 270 Nm de torque para retomadas rápidas e seguras",
      "Central multimídia Uconnect de 10.1'' com navegação e comandos inteligentes",
      "Bancos anatômicos em couro com acabamento de alto padrão",
      "Controle de estabilidade para reboque e tração eletrônica avançada",
      "Rodas de liga leve aro 18'' com acabamento esportivo",
      "Retrovisor interno eletrocrômico e sensores crepuscular e de chuva",
    ],
    description:
      "Robustez, espaço de sobra para toda a família e potência para viagens longas com acabamento refinado, isolamento acústico superior e a autenticidade Jeep.",
  },
  {
    id: "vw-tcross",
    brand: "Volkswagen",
    model: "T-Cross Highline 250 TSI",
    category: "SUV Urbano",
    price: 2990,
    image: "/vehicles/tcross.jpg",
    gallery: [
      {
        url: "/vehicles/tcross.jpg",
        caption: "Visual urbano marcante com DNA esportivo",
      },
      {
        url: "/about-drive.jpg",
        caption: "Cockpit interativo e direção precisa alemã",
      },
      {
        url: "/banners/assinatura.jpg",
        caption: "Teto solar panorâmico Sky View e sensação de amplitude",
      },
      {
        url: "/banners/troca.jpg",
        caption: "Espaço modular para bagagens e compras",
      },
    ],
    transmission: "Automático 6 marchas",
    fuel: "Flex",
    seats: "5 lugares",
    engine: "1.4 TSI 250 Flex (150 cv)",
    trunk: "420 Litros (ajustável)",
    consumption: "11,8 km/l (urbano) / 14,2 km/l (estrada)",
    highlights: [
      "Painel Active Info",
      "Piloto adaptativo ACC",
      "Teto panorâmico",
      "Porta-malas modular",
    ],
    features: [
      "Painel digital configurável Active Info Display de 10.25''",
      "Piloto automático adaptativo (ACC) com frenagem automática de emergência",
      "Teto solar panorâmico elétrico com abertura ampla",
      "Bancos com revestimento especial em couro bi-color",
      "Sistema de som premium com alta fidelidade acústica",
      "Seletor de perfil de condução (Eco, Normal, Sport e Individual)",
    ],
    description:
      "Dinamismo alemão com excelente espaço interno, tecnologias de condução semiautônoma e porta-malas ajustável para quem exige versatilidade urbana.",
  },
  {
    id: "fiat-strada",
    brand: "Fiat",
    model: "Strada Volcano CD 1.3 CVT",
    category: "Utilitário / Picape",
    price: 2490,
    image: "/vehicles/strada.jpg",
    gallery: [
      {
        url: "/vehicles/strada.jpg",
        caption: "Versatilidade incomparável com cabine dupla 4 portas",
      },
      {
        url: "/about-drive.jpg",
        caption: "Conforto de automóvel de passeio na cabine",
      },
      {
        url: "/banners/incluso.jpg",
        caption: "Capacidade de carga de 650 kg e caçamba de 844L",
      },
      {
        url: "/banners/troca.jpg",
        caption: "Pronta tanto para atividades produtivas quanto para lazer",
      },
    ],
    transmission: "Automático CVT",
    fuel: "Flex",
    seats: "5 lugares",
    engine: "1.3 Firefly Flex (107 cv)",
    trunk: "Caçamba de 844 Litros / 650 kg",
    consumption: "12,1 km/l (urbano) / 13,3 km/l (estrada)",
    highlights: [
      "Cabine dupla 4 portas",
      "Direção elétrica",
      "Capota marítima",
      "Controle TC+",
    ],
    features: [
      "Cabine dupla homologada para 5 ocupantes com 4 portas de acesso prático",
      "Transmissão automática tipo CVT com 7 marchas simuladas e modo Sport",
      "Sistema TC+ (Traction Control Plus) para superar terrenos de baixa aderência",
      "Direção elétrica com assistência progressiva leve para manobras",
      "Capota marítima de fábrica e protetor integral de caçamba",
      "Faróis em LED com assinatura luminosa DRL integrada",
    ],
    description:
      "Versatilidade incomparável que une a robustez e capacidade de carga para trabalho ao conforto de rodagem e tecnologia necessários para o lazer da família.",
  },
];

export function getVehicleById(id: string): Vehicle | undefined {
  return vehicles.find((v) => v.id === id);
}

export const planCategories: PlanCategory[] = [
  {
    id: "hatch",
    label: "Hatch Compacto",
    base: 1890,
    description: "Ágil e econômico para a rotina diária.",
  },
  {
    id: "sedan",
    label: "Sedan Médio",
    base: 2490,
    description: "Conforto executivo e porta-malas generoso.",
  },
  {
    id: "suv",
    label: "SUV Médio",
    base: 2990,
    description: "Posição elevada, espaço e tecnologia para a família.",
  },
  {
    id: "utilitario",
    label: "Utilitário / Picape",
    base: 2490,
    description: "Capacidade de carga e robustez no trabalho.",
  },
];

export const terms = [12, 24, 36] as const;
export const distances = [1000, 2000, 3000] as const;

export type Term = (typeof terms)[number];
export type Distance = (typeof distances)[number];

export function estimateMonthly(input: {
  categoryId?: string;
  basePrice?: number;
  months: Term;
  km: Distance;
}) {
  let base = 2490;
  if (input.basePrice) {
    base = input.basePrice;
  } else if (input.categoryId) {
    const category = planCategories.find(
      (item) => item.id === input.categoryId,
    );
    if (category) {
      base = category.base;
    }
  }

  // Fatores de cálculo transparentes e mockados
  const termFactor =
    input.months === 12 ? 1.12 : input.months === 36 ? 0.9 : 1.0;
  const kmFactor = input.km === 1000 ? 0.94 : input.km === 3000 ? 1.16 : 1.0;

  return Math.round(base * termFactor * kmFactor);
}

export function formatMonthly(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export const hiringSteps = [
  {
    stepNumber: "01",
    tagline: "Vitrine Digital",
    title: "Escolha seu veículo",
    text: "Explore nossa vitrine de modelos disponíveis e encontre o carro ideal para seu perfil, família ou atividade profissional.",
    highlight: "Modelos 0km ou seminovos revisados",
  },
  {
    stepNumber: "02",
    tagline: "Sob Medida",
    title: "Personalize seu plano",
    text: "Selecione o prazo de permanência desejado (12, 24 ou 36 meses) e a franquia mensal de quilometragem adequada à sua rodagem.",
    highlight: "Franquia e prazo flexíveis",
  },
  {
    stepNumber: "03",
    tagline: "Zero Burocracia",
    title: "Solicite sua proposta",
    text: "Envie seus dados cadastrais para uma análise rápida, sem burocracia, e receba atendimento exclusivo com proposta personalizada.",
    highlight: "Aprovação ágil e 100% online",
  },
  {
    stepNumber: "04",
    tagline: "Chave na Mão",
    title: "Comece a dirigir",
    text: "Com o contrato aprovado e assinado digitalmente, retire seu veículo revisado e pronto para a estrada, com tudo incluso.",
    highlight: "Seguro, IPVA e revisões inclusos",
  },
];

export const includedServices = [
  {
    title: "Manutenção preventiva",
    description:
      "Revisões programadas, trocas periódicas e peças de desgaste cobertas conforme o plano.",
  },
  {
    title: "Documentação e tributos",
    description:
      "IPVA, taxa de licenciamento e custo de emplacamento totalmente quitados pela locadora.",
  },
  {
    title: "Assistência 24 horas",
    description:
      "Reboque, socorro mecânico emergencial, chaveiro e troca de pneus em território nacional.",
  },
  {
    title: "Proteção veicular completa",
    description:
      "Cobertura contra roubo, furto, colisão e danos a terceiros com franquia clara.",
  },
  {
    title: "Quilometragem contratada",
    description:
      "Franquia mensal calculada sob medida para seu uso, com transparência e flexibilidade.",
  },
  {
    title: "Suporte durante a assinatura",
    description:
      "Canais ágeis para agendamento de revisões, gestão de sinistros e esclarecimento de dúvidas.",
  },
];

export const advantages = [
  {
    id: "previsibilidade",
    title: "Previsibilidade",
    text: "Mensalidade fixa planejada. Sem surpresas com IPVA no início do ano ou gastos imprevisíveis de oficina.",
    highlight: true,
  },
  {
    id: "praticidade",
    title: "Praticidade",
    text: "Menos burocracia e zero preocupações com despachante, emplacamento e vistorias de transferência.",
    highlight: true,
  },
  {
    id: "flexibilidade",
    title: "Flexibilidade",
    text: "Contratos de 12, 24 ou 36 meses com liberdade para renovar ou trocar de categoria no fim do período.",
    highlight: false,
  },
  {
    id: "conveniencia",
    title: "Conveniência",
    text: "Serviços essenciais concentrados em um único contrato e canal de atendimento direto ao condutor.",
    highlight: false,
  },
  {
    id: "mobilidade",
    title: "Mobilidade",
    text: "Acesso a veículos novos sem descapitalizar suas economias com altas entradas ou taxas de juros de financiamento.",
    highlight: true,
  },
  {
    id: "tranquilidade",
    title: "Tranquilidade",
    text: "Assistência técnica permanente e suporte 24 horas para você e sua família rodarem em segurança.",
    highlight: false,
  },
];

export const faqs = [
  {
    question: "Como funciona a assinatura de um carro?",
    answer:
      "A assinatura de veículos é um modelo de locação de longo prazo (normalmente 12, 24 ou 36 meses) no qual você utiliza um carro zero km ou seminovo revisado pagando uma mensalidade fixa. Ao contrário da compra tradicional, você não precisa dar entrada, não perde dinheiro com depreciação e tem IPVA, seguro e manutenção preventiva inclusos no valor.",
  },
  {
    question: "O que está incluso na mensalidade?",
    answer:
      "A mensalidade contempla o uso regular do veículo, tributos anuais (IPVA e licenciamento), seguro veicular ou proteção com cobertura contra terceiros, manutenções preventivas programadas pelo fabricante e assistência 24 horas em todo o Brasil. Custos como combustível, pedágios, lavagens e eventuais multas de trânsito permanecem por conta do condutor.",
  },
  {
    question: "Posso escolher a quilometragem do plano?",
    answer:
      "Sim. No momento da simulação e contratação você escolhe a franquia mensal que melhor se adequa ao seu perfil de uso (por exemplo, 1.000 km, 2.000 km ou 3.000 km por mês). O controle é cumulativo ao longo dos meses do contrato, e caso ultrapasse a franquia final, a quilometragem excedente é calculada conforme o valor previsto na tabela contratual.",
  },
  {
    question: "Existe análise de crédito para contratar?",
    answer:
      "Sim. O processo de contratação passa por uma análise cadastral e de crédito rápida e desburocratizada. É necessário apresentar CNH definitiva válida, comprovante de residência e dados de renda. Todo o envio de informações e assinatura do contrato são feitos de forma 100% digital e segura.",
  },
  {
    question: "O que acontece ao final do contrato?",
    answer:
      "Ao concluir o período contratado e após a vistoria padrão de devolução, você tem total liberdade: pode renovar a assinatura retirando um carro novinho de outra categoria, manter o mesmo veículo com novas condições ou simplesmente encerrar o plano sem precisar negociar venda ou assumir prejuízo com a desvalorização do bem.",
  },
];
