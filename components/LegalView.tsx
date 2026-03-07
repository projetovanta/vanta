import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { TYPOGRAPHY } from '../constants';

// ── Termos de Uso ────────────────────────────────────────────────────────────

const TERMOS_CONTEUDO = `
## 1. Aceitação dos Termos

Ao criar uma conta na plataforma VANTA, você declara que leu, compreendeu e concorda integralmente com estes Termos de Uso e com a nossa Política de Privacidade. A utilização dos serviços está condicionada à aceitação expressa de ambos os documentos. Caso não concorde com qualquer disposição, não utilize a plataforma.

## 2. Definições

- **VANTA**: VANTA TECNOLOGIA E EVENTOS LTDA., inscrita no CNPJ sob o n.º [a definir], com sede no Rio de Janeiro/RJ, operadora da plataforma.
- **Usuário**: pessoa física que se cadastra e utiliza a plataforma.
- **Organizador**: pessoa física ou jurídica que cria e gerencia eventos na plataforma.
- **Plataforma**: o aplicativo VANTA, disponível como PWA (Progressive Web App) para dispositivos móveis e navegadores.
- **MAIS VANTA**: programa de influência e benefícios exclusivo da plataforma.

## 3. Descrição do Serviço

A VANTA é uma plataforma digital de eventos e networking social que permite:
- Descobrir e participar de eventos sociais
- Adquirir ingressos para eventos de forma segura
- Conectar-se com outros membros da comunidade
- Participar do programa MAIS VANTA (clube de influência)
- Gerenciar perfil social, interesses e configurações de privacidade
- Enviar e receber mensagens entre membros conectados

A VANTA atua como intermediária tecnológica na venda de ingressos. A responsabilidade pela realização, qualidade e segurança dos eventos é do respectivo Organizador.

## 4. Cadastro e Conta

### 4.1 Requisitos
- Idade mínima de 16 (dezesseis) anos. Usuários entre 16 e 18 anos declaram possuir autorização de responsável legal
- Informações pessoais verdadeiras, completas e atualizadas
- Captura de foto biométrica facial (selfie) no ato do cadastro, utilizada exclusivamente para verificação de identidade e prevenção de fraudes (conforme detalhado na Política de Privacidade)

### 4.2 Responsabilidade da Conta
Você é o único responsável por manter a confidencialidade da sua senha e por todas as atividades realizadas com sua conta. Notifique-nos imediatamente pelo e-mail suporte@vanta.app em caso de uso não autorizado ou suspeita de violação de segurança.

### 4.3 Veracidade das Informações
Informações falsas, perfis duplicados, uso de identidade de terceiros ou qualquer tentativa de fraude resultarão em suspensão imediata ou exclusão permanente da conta, sem prejuízo das medidas legais cabíveis.

## 5. Uso da Plataforma

### 5.1 Conduta do Usuário
Ao utilizar a VANTA, você concorda em:
- Não publicar conteúdo ofensivo, discriminatório, difamatório ou ilegal
- Não assediar, intimidar, ameaçar ou constranger outros usuários
- Não utilizar a plataforma para fins comerciais não autorizados ou spam
- Não tentar acessar dados de outros usuários sem autorização
- Não utilizar bots, scrapers ou meios automatizados de acesso
- Respeitar as regras específicas de cada evento e comunidade
- Não violar direitos de propriedade intelectual de terceiros

### 5.2 Conteúdo do Usuário
Ao publicar fotos, textos ou qualquer conteúdo na plataforma, você concede à VANTA uma licença não exclusiva, gratuita e revogável para exibir esse conteúdo dentro da plataforma, exclusivamente para a prestação do serviço. A VANTA não utilizará seu conteúdo para fins publicitários sem seu consentimento prévio.

### 5.3 Moderação
A VANTA reserva-se o direito de remover conteúdo que viole estes Termos, a legislação vigente ou que seja denunciado por outros usuários, sem necessidade de aviso prévio.

## 6. Ingressos e Compras

### 6.1 Política de Ingressos
- Ingressos são pessoais e intransferíveis, exceto pela funcionalidade de transferência dentro da plataforma
- O QR Code do ingresso é único e válido para uma única entrada
- Ingressos utilizados, cancelados ou expirados perdem a validade
- O valor total do ingresso (incluindo taxas de serviço) é exibido antes da confirmação da compra, conforme art. 6º, III do CDC (Lei 8.078/90)

### 6.2 Meia-Entrada (Lei 12.933/2013)
- A VANTA respeita o Estatuto da Meia-Entrada (Lei Federal 12.933/2013)
- Eventos com mais de 40% de ingressos vendidos como meia-entrada seguem a regulamentação vigente
- Categorias elegíveis: estudantes (com CIE/carteirinha válida), idosos (60+), PCD e jovens de baixa renda (ID Jovem)
- O comprovante do benefício poderá ser exigido na portaria do evento
- Caso o Usuário não comprove o direito à meia-entrada no momento do acesso, deverá pagar a diferença para o valor da inteira na portaria ou terá a entrada negada, sem direito a reembolso

### 6.3 Taxa de Serviço (Conveniência)
- A VANTA cobra uma taxa de serviço sobre cada ingresso adquirido pela plataforma, referente à intermediação tecnológica, emissão do QR Code, suporte ao comprador e infraestrutura de pagamento
- O valor da taxa é exibido de forma clara e destacada antes da confirmação da compra, em conformidade com o dever de informação (art. 6º, III, CDC)
- A taxa de serviço é devida à VANTA e não é de responsabilidade do Organizador do evento

### 6.4 Direito de Arrependimento (CDC, art. 49)
- Compras realizadas online: o Usuário tem o prazo de 7 (sete) dias corridos, contados da data da compra, para solicitar o cancelamento e reembolso integral (valor do ingresso + taxa de serviço), sem necessidade de justificativa
- A solicitação deve ser feita pela plataforma ou pelo e-mail suporte@vanta.app
- O reembolso será processado na mesma forma de pagamento utilizada na compra, em até 15 (quinze) dias úteis

### 6.5 Desistência Voluntária Após os 7 Dias
- Após o prazo do art. 49 do CDC, a política de cancelamento e reembolso do valor do ingresso fica a critério do Organizador do evento
- Caso o Organizador autorize o reembolso, será devolvido o valor do ingresso. A taxa de serviço da VANTA não será restituída, pois o serviço de intermediação já foi efetivamente prestado
- O Usuário pode consultar a política de cancelamento específica de cada evento antes da compra

### 6.6 Cancelamento de Evento pelo Organizador
- Evento cancelado: reembolso integral automático a todos os compradores (valor do ingresso + taxa de serviço), sem necessidade de solicitação por parte do Usuário
- O custo integral do reembolso — incluindo a taxa de serviço da VANTA — é de responsabilidade do Organizador, uma vez que o serviço de intermediação foi efetivamente prestado
- O reembolso ao consumidor será processado em até 15 (quinze) dias úteis, na mesma forma de pagamento utilizada na compra

### 6.7 Adiamento de Evento
- Evento adiado com nova data definida: o ingresso permanece válido automaticamente para a nova data. Caso o Usuário não possa comparecer, poderá solicitar reembolso integral em até 30 (trinta) dias após o anúncio da nova data
- Evento adiado sem nova data definida: se o Organizador não definir nova data em até 90 (noventa) dias corridos, o evento será tratado como cancelado e o reembolso será automático (conforme seção 6.6)

### 6.8 Alteração Substancial do Evento
- Se o Organizador alterar a atração principal, o local do evento ou outras características essenciais que descaracterizem o serviço originalmente contratado, o Usuário terá direito a reembolso integral (ingresso + taxa), conforme proteção do CDC contra alteração unilateral de contrato
- A solicitação deve ser feita em até 30 (trinta) dias após o anúncio da alteração

### 6.9 Força Maior e Caso Fortuito
- Em caso de cancelamento por força maior (desastre natural, pandemia, decreto governamental, interdição do local ou outra circunstância imprevisível), o Usuário tem direito ao reembolso integral
- O custo do reembolso é de responsabilidade do Organizador, que assume o risco inerente à realização do evento
- O reembolso será processado em até 15 (quinze) dias úteis

### 6.10 Não Comparecimento (No-Show)
- Caso o Usuário não compareça ao evento e o evento tenha ocorrido normalmente, não haverá direito a reembolso
- O ingresso não utilizado perde a validade após o encerramento do evento

### 6.11 Transferência de Ingresso
- Ingressos podem ser transferidos para outros usuários cadastrados na plataforma, através da funcionalidade de transferência
- Após a conclusão da transferência, o ingresso passa a pertencer ao novo titular, que herda todos os direitos e obrigações
- O usuário que transferiu o ingresso perde o direito a reembolso sobre aquele ingresso

### 6.12 Registro e Auditoria
Toda transação (compra, reembolso, transferência, cancelamento) é registrada com timestamp, identificação do usuário, motivo e responsável pela ação, para fins de auditoria, compliance fiscal e eventual contestação.

## 7. MAIS VANTA (Clube de Influência)

### 7.1 Participação
- A adesão ao MAIS VANTA está sujeita a análise e aprovação da curadoria
- Membros devem manter perfil ativo no Instagram com conta pública
- A participação é gratuita, porém sujeita ao cumprimento das obrigações do programa

### 7.2 Obrigações dos Membros
- Publicar conteúdo do evento nas redes sociais conforme acordado
- Manter dados cadastrais e perfil do Instagram atualizados
- Respeitar os prazos e regras de cada ativação

### 7.3 Sistema de Infrações
- 1ª infração: advertência com bloqueio temporário (30 dias)
- 2ª infração: bloqueio estendido (60 dias)
- 3ª infração: exclusão permanente do programa
- Cada infração é registrada com data, motivo e notificação ao membro

## 8. Propriedade Intelectual

Todo o conteúdo da plataforma VANTA — incluindo, mas não limitado a, design, código-fonte, marca, logotipos, textos e elementos visuais — é protegido pela Lei de Direitos Autorais (Lei 9.610/98) e pela Lei de Propriedade Industrial (Lei 9.279/96). É proibida a reprodução, distribuição ou uso não autorizado sem consentimento expresso e por escrito da VANTA.

## 9. Limitação de Responsabilidade

A VANTA não se responsabiliza por:
- Conteúdo publicado por usuários ou organizadores de eventos
- A realização, qualidade, segurança ou pontualidade de eventos organizados por terceiros
- Problemas de acesso causados por falhas de internet, dispositivo ou infraestrutura de terceiros
- Prejuízos decorrentes de uso indevido da conta por terceiros em razão de negligência do Usuário
- Caso fortuito ou força maior que impeça a prestação dos serviços

A responsabilidade da VANTA, quando aplicável, limita-se ao valor efetivamente pago pelo Usuário na transação em questão.

## 10. Suspensão e Encerramento

### 10.1 Pela VANTA
A VANTA poderá suspender ou encerrar contas que violem estes Termos, mediante notificação ao Usuário com exposição dos motivos. Em caso de atividade fraudulenta comprovada, a suspensão poderá ser imediata.

### 10.2 Pelo Usuário
O Usuário pode solicitar a exclusão da sua conta a qualquer momento pelas Configurações do perfil ou pelo e-mail suporte@vanta.app. A exclusão seguirá o procedimento descrito na Política de Privacidade (retenção e anonimização de dados).

## 11. Resolução de Conflitos

O Usuário poderá registrar reclamações diretamente pela plataforma ou pelo e-mail suporte@vanta.app. A VANTA se compromete a responder em até 15 (quinze) dias úteis. O Usuário também pode recorrer aos órgãos de defesa do consumidor (Procon) e à plataforma consumidor.gov.br.

## 12. Modificações dos Termos

A VANTA poderá modificar estes Termos a qualquer momento. Alterações significativas serão notificadas com antecedência mínima de 30 (trinta) dias por meio de notificação na plataforma e/ou e-mail cadastrado. O uso continuado da plataforma após o período de notificação constitui aceitação dos novos termos.

## 13. Legislação Aplicável e Foro

Estes Termos são regidos exclusivamente pela legislação da República Federativa do Brasil, incluindo o Código de Defesa do Consumidor (Lei 8.078/90), o Marco Civil da Internet (Lei 12.965/14) e a Lei Geral de Proteção de Dados (Lei 13.709/18). Fica eleito o foro da Comarca do Rio de Janeiro/RJ para dirimir quaisquer controvérsias, ressalvado o foro do domicílio do consumidor quando aplicável (art. 101, I, CDC).

---

*Última atualização: Março de 2026*
`;

// ── Política de Privacidade ──────────────────────────────────────────────────

const PRIVACIDADE_CONTEUDO = `
## 1. Introdução

A VANTA TECNOLOGIA E EVENTOS LTDA. ("VANTA"), inscrita no CNPJ sob o n.º [a definir], com sede no Rio de Janeiro/RJ, na qualidade de Controladora de dados pessoais, apresenta esta Política de Privacidade em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD — Lei 13.709/2018), o Marco Civil da Internet (Lei 12.965/2014) e demais normas aplicáveis.

Esta Política descreve quais dados pessoais coletamos, por que os coletamos, como os utilizamos, com quem os compartilhamos, como os protegemos e quais são os seus direitos como titular.

## 2. Controlador e Encarregado (DPO)

- **Controlador**: VANTA TECNOLOGIA E EVENTOS LTDA.
- **Encarregado de Proteção de Dados (DPO)**: Acessível pelo e-mail dpo@vanta.app
- **Canal de privacidade**: privacidade@vanta.app

O Encarregado é o ponto de contato entre a VANTA, os titulares de dados e a Autoridade Nacional de Proteção de Dados (ANPD).

## 3. Dados Pessoais Coletados

### 3.1 Dados fornecidos diretamente por você
- **Identificação**: nome completo, e-mail, data de nascimento, gênero
- **Contato**: telefone celular (DDD + número)
- **Localização**: estado e cidade de residência
- **Redes sociais**: Instagram (handle e contagem de seguidores — opcional)
- **Dados biométricos**: foto facial (selfie) capturada no cadastro para verificação de identidade
- **Preferências**: interesses, biografia e fotos de perfil/álbum
- **Credenciais**: senha de acesso (armazenada em hash irreversível — nunca em texto claro)

### 3.2 Dados coletados automaticamente
- **Dados de uso**: páginas visitadas, eventos visualizados, cliques e interações
- **Dados do dispositivo**: tipo de dispositivo, sistema operacional, versão do navegador
- **Dados de geolocalização**: coordenadas aproximadas (somente quando você autoriza, para a funcionalidade Radar de eventos)

### 3.3 Dados sensíveis
A foto facial (selfie biométrica) é considerada dado pessoal sensível nos termos do art. 5º, II da LGPD. Sua coleta ocorre com base no consentimento específico (art. 11, I) e é utilizada exclusivamente para verificação de identidade e prevenção de fraudes. Você pode solicitar sua exclusão a qualquer momento.

## 4. Finalidades e Bases Legais (LGPD, art. 7º e 11)

Cada tratamento de dados pessoais possui uma finalidade específica e uma base legal correspondente:

- **Cadastro e autenticação** — Execução de contrato (art. 7º, V). Dados: nome, e-mail, senha, nascimento.
- **Verificação de identidade** — Consentimento específico (art. 11, I). Dados: selfie biométrica.
- **Verificação de idade (16+)** — Cumprimento de obrigação legal (art. 7º, II). Dados: data de nascimento.
- **Personalização de eventos** — Legítimo interesse (art. 7º, IX). Dados: localização, interesses.
- **Comunicação e notificações** — Execução de contrato (art. 7º, V). Dados: e-mail, telefone.
- **Prevenção de fraudes** — Legítimo interesse (art. 7º, IX). Dados: selfie, dados de dispositivo.
- **Processamento de compras** — Execução de contrato (art. 7º, V). Dados: identificação, transação.
- **MAIS VANTA** — Consentimento (art. 7º, I). Dados: Instagram, seguidores.
- **Geolocalização (Radar)** — Consentimento (art. 7º, I). Dados: coordenadas GPS.
- **Networking social** — Execução de contrato (art. 7º, V). Dados: perfil, conforme suas configurações de privacidade.
- **Analytics e melhoria** — Legítimo interesse (art. 7º, IX). Dados: dados de uso anonimizados e agregados.
- **Obrigações fiscais** — Cumprimento de obrigação legal (art. 7º, II). Dados: transações.

## 5. Compartilhamento de Dados

Seus dados podem ser compartilhados com terceiros apenas nas seguintes hipóteses:

- **Organizadores de eventos**: nome do titular e dados do ingresso, exclusivamente para controle de acesso ao evento
- **Processadores de pagamento**: dados necessários para completar transações financeiras, sujeitos às políticas de privacidade do processador
- **Provedores de infraestrutura e SDKs terceiros**:
- Supabase (banco de dados, autenticação e armazenamento de arquivos) — recebe todos os dados cadastrais, transações e arquivos de mídia. Servidores AWS (região US)
- Firebase / Google Cloud Messaging (notificações push) — recebe token do dispositivo e identificador do usuário para envio de notificações. Não recebe dados pessoais como nome, e-mail ou fotos
- Vercel Analytics (analytics de performance) — coleta dados de navegação de forma anônima e agregada (páginas visitadas, tempo de carregamento). Não coleta dados pessoais identificáveis
- **Autoridades públicas**: quando exigido por lei, regulamentação ou ordem judicial (art. 7º, II e VI da LGPD)

**Não vendemos, alugamos ou comercializamos seus dados pessoais a terceiros para fins de marketing.**

### 5.1 Transferência Internacional
Os dados podem ser armazenados e processados em servidores localizados fora do Brasil (Supabase/AWS, região US; Firebase/Google Cloud, região US). Essa transferência é realizada com base no art. 33 da LGPD, mediante cláusulas contratuais padrão que garantem nível adequado de proteção.

## 6. Controle de Privacidade pelo Usuário

Você tem controle granular sobre a visibilidade de seus dados para outros usuários, acessível pelas Configurações de Privacidade:

- E-mail — Todos / Amigos / Ninguém
- Instagram — Todos / Amigos / Ninguém
- Biografia — Todos / Amigos / Ninguém
- Aniversário — Todos / Amigos / Ninguém
- Telefone — Todos / Amigos / Ninguém
- Localização — Todos / Amigos / Ninguém
- Gênero — Todos / Amigos / Ninguém
- Interesses — Todos / Amigos / Ninguém
- Álbum de fotos — Todos / Amigos / Ninguém
- Conquistas — Todos / Amigos / Ninguém

"Todos" significa visível a qualquer usuário da plataforma. "Amigos" significa visível apenas a conexões mútuas. "Ninguém" significa visível somente para você.

## 7. Armazenamento e Segurança

Adotamos medidas técnicas e administrativas de segurança adequadas para proteger seus dados:

- Dados armazenados em servidores com criptografia em repouso (AES-256)
- Senhas protegidas com hash irreversível (bcrypt) — jamais armazenadas em texto claro
- Toda comunicação via HTTPS com criptografia TLS 1.2+
- Acesso aos dados restrito a colaboradores autorizados, mediante autenticação multifator
- Backups regulares com proteção contra perda e corrupção de dados
- Monitoramento contínuo de acessos e logs de auditoria
- Política de resposta a incidentes de segurança conforme art. 48 da LGPD

Em caso de incidente de segurança que possa acarretar risco ou dano relevante, notificaremos a ANPD e os titulares afetados em prazo razoável, conforme exigido pela LGPD.

## 8. Retenção e Eliminação de Dados

- **Dados de conta ativa**: mantidos enquanto a conta estiver ativa
- **Dados de transações financeiras**: mantidos por 5 (cinco) anos após a transação, em cumprimento a obrigações fiscais e tributárias (Código Tributário Nacional)
- **Selfie biométrica**: mantida enquanto a conta estiver ativa. Eliminada em até 30 dias após a exclusão da conta
- **Logs de auditoria**: mantidos por 2 (dois) anos para fins de compliance e segurança
- **Após exclusão da conta**: dados pessoais anonimizados ou eliminados em até 30 (trinta) dias, exceto os que devam ser retidos por obrigação legal

### 8.1 Exclusão de Conta
Você pode solicitar a exclusão da sua conta e de todos os seus dados pessoais a qualquer momento:
- Pelas Configurações do perfil na plataforma
- Pelo e-mail suporte@vanta.app
A solicitação será processada em até 15 (quinze) dias úteis.

## 9. Seus Direitos como Titular (LGPD, arts. 17 a 22)

Conforme a LGPD, você tem os seguintes direitos, exercíveis gratuitamente:

- **Confirmação**: confirmar se tratamos seus dados pessoais
- **Acesso**: acessar todos os dados pessoais que mantemos sobre você
- **Correção**: solicitar a correção de dados incompletos, inexatos ou desatualizados
- **Anonimização, bloqueio ou eliminação**: solicitar para dados desnecessários, excessivos ou tratados em desconformidade com a LGPD
- **Portabilidade**: solicitar cópia dos seus dados em formato estruturado e legível por máquina, para transferência a outro fornecedor
- **Eliminação**: solicitar a exclusão dos dados tratados com base no consentimento
- **Informação sobre compartilhamento**: saber com quais entidades públicas e privadas seus dados foram compartilhados
- **Informação sobre consentimento**: ser informado sobre a possibilidade de não fornecer consentimento e as consequências da negativa
- **Revogação**: revogar o consentimento a qualquer momento, de forma gratuita e facilitada
- **Revisão de decisões automatizadas**: solicitar revisão de decisões tomadas unicamente com base em tratamento automatizado (art. 20)

### 9.1 Como Exercer Seus Direitos
Envie sua solicitação pelo e-mail privacidade@vanta.app, informando seu nome completo e o direito que deseja exercer. Responderemos em até 15 (quinze) dias úteis. Caso não fique satisfeito com a resposta, você poderá recorrer à Autoridade Nacional de Proteção de Dados (ANPD) pelo site www.gov.br/anpd.

## 10. Cookies e Tecnologias de Armazenamento Local

A VANTA utiliza tecnologias de armazenamento local estritamente necessárias:

- **localStorage**: para manter sua sessão autenticada e armazenar preferências locais
- **Service Worker e Cache API**: para garantir o funcionamento da PWA (Progressive Web App) e acesso offline
- **Cookies essenciais**: para autenticação e segurança da sessão

Não utilizamos cookies de rastreamento de terceiros, cookies de publicidade ou pixels de rastreamento. Não compartilhamos dados de navegação com redes de anúncios.

## 11. Dados de Menores

A plataforma é destinada a pessoas com 16 (dezesseis) anos de idade ou mais. Não coletamos intencionalmente dados de menores de 16 anos. Caso identifiquemos uma conta pertencente a menor de 16 anos, a conta será suspensa e todos os dados pessoais serão eliminados em até 72 horas.

Usuários entre 16 e 18 anos devem contar com autorização de responsável legal para utilizar a plataforma, conforme art. 14, §1º da LGPD.

## 12. Informações para Lojas de Aplicativos

### 12.1 Apple App Store (Privacy Nutrition Labels)
Os seguintes tipos de dados são coletados pela VANTA, organizados conforme as categorias da Apple:

**Dados vinculados à identidade (Data Linked to You):**
- **Dados de contato**: nome, e-mail, telefone — usados para funcionalidade do app
- **Conteúdo do usuário**: fotos de perfil, álbum e biografia — usados para funcionalidade do app
- **Dados de identificação**: ID de usuário — usado para funcionalidade do app
- **Dados biométricos**: foto facial (selfie) — usada exclusivamente para verificação de identidade
- **Localização aproximada**: usada para funcionalidade do app (Radar de eventos), mediante consentimento explícito
- **Compras**: histórico de ingressos adquiridos — usado para funcionalidade do app

**Dados não vinculados à identidade (Data Not Linked to You):**
- **Dados de uso**: páginas visitadas e tempo de carregamento — coletados pelo Vercel Analytics de forma anônima e agregada, usados para analytics e melhoria de performance
- **Diagnóstico**: dados de performance do app — coletados de forma anônima

**Dados usados para rastreamento (Data Used to Track You):**
- Nenhum. A VANTA não rastreia usuários em apps ou sites de terceiros.

**SDKs terceiros incluídos no app:**
- Supabase SDK — autenticação, banco de dados e storage
- Firebase SDK — exclusivamente para notificações push (FCM). Não utilizado para analytics, crashlytics ou outros serviços
- Vercel Analytics — métricas de performance anônimas e agregadas

### 12.2 Google Play (Data Safety)

**Dados coletados:**
- Dados pessoais: nome, e-mail, telefone, data de nascimento, gênero
- Fotos e vídeos: fotos de perfil, álbum e selfie biométrica
- Localização aproximada: coordenadas GPS (mediante consentimento)
- Informações financeiras: histórico de compras de ingressos
- Identificadores do dispositivo: token FCM para notificações push

**Dados compartilhados com terceiros:**
- Organizadores de eventos: nome e dados do ingresso (controle de acesso)
- Supabase/AWS: todos os dados (infraestrutura de hospedagem)
- Firebase/Google: token do dispositivo e ID do usuário (notificações push)
- Vercel: dados de navegação anônimos (analytics de performance)

**Práticas de segurança:**
- Dados criptografados em trânsito (TLS 1.2+)
- Dados criptografados em repouso (AES-256)
- Política de exclusão de dados disponível

**Exclusão de dados:**
- O usuário pode solicitar exclusão de conta e dados pelas Configurações do app ou pelo e-mail suporte@vanta.app
- Processamento em até 15 dias úteis

## 13. Alterações desta Política

Esta Política poderá ser atualizada para refletir melhorias nos serviços, novas exigências legais ou regulatórias. Alterações significativas serão notificadas com antecedência mínima de 30 (trinta) dias por meio de notificação na plataforma e/ou e-mail cadastrado. A data da última atualização será sempre indicada ao final deste documento.

## 14. Contato

Para dúvidas, solicitações ou reclamações sobre privacidade e proteção de dados:
- **E-mail geral**: suporte@vanta.app
- **Privacidade**: privacidade@vanta.app
- **Encarregado (DPO)**: dpo@vanta.app
- **ANPD**: www.gov.br/anpd (caso deseje registrar reclamação junto à autoridade)

---

*Última atualização: Março de 2026*
`;

// ── Componente ───────────────────────────────────────────────────────────────

type LegalPage = 'TERMOS' | 'PRIVACIDADE';

export const LegalView: React.FC<{
  page: LegalPage;
  onBack: () => void;
}> = ({ page, onBack }) => {
  const titulo = page === 'TERMOS' ? 'Termos de Uso' : 'Política de Privacidade';
  const conteudo = page === 'TERMOS' ? TERMOS_CONTEUDO : PRIVACIDADE_CONTEUDO;

  return (
    <div className="absolute inset-0 z-[400] bg-[#0A0A0A] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
      <div
        className="shrink-0 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 px-6 pb-4 flex items-center justify-between"
        style={{ paddingTop: '1rem' }}
      >
        <button
          onClick={onBack}
          className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 style={TYPOGRAPHY.screenTitle} className="text-lg italic">
          {titulo}
        </h1>
        <div className="w-10" />
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-6">
        <div className="prose prose-invert prose-sm max-w-none">
          {conteudo.split('\n').map((line, i) => {
            if (line.startsWith('## ')) {
              return (
                <h2 key={i} className="text-[#FFD300] text-sm font-bold mt-8 mb-3 uppercase tracking-wider">
                  {line.replace('## ', '')}
                </h2>
              );
            }
            if (line.startsWith('### ')) {
              return (
                <h3 key={i} className="text-white text-xs font-bold mt-5 mb-2">
                  {line.replace('### ', '')}
                </h3>
              );
            }
            if (line.startsWith('- ')) {
              return (
                <p key={i} className="text-zinc-400 text-xs leading-relaxed pl-4 mb-1">
                  <span className="text-[#FFD300] mr-2">•</span>
                  {line.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '$1')}
                </p>
              );
            }
            if (line.startsWith('---')) {
              return <hr key={i} className="border-white/5 my-6" />;
            }
            if (line.startsWith('*') && line.endsWith('*')) {
              return (
                <p key={i} className="text-zinc-600 text-[10px] italic mt-4">
                  {line.replace(/^\*/, '').replace(/\*$/, '')}
                </p>
              );
            }
            if (line.startsWith('|')) return null; // tabelas — simplificadas acima
            if (line.trim() === '') return <div key={i} className="h-2" />;
            return (
              <p key={i} className="text-zinc-400 text-xs leading-relaxed mb-2">
                {line.replace(/\*\*(.*?)\*\*/g, '$1')}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── Hook para abrir LegalView inline ─────────────────────────────────────────

export const useLegalView = () => {
  const [legalPage, setLegalPage] = useState<LegalPage | null>(null);

  const openTermos = () => setLegalPage('TERMOS');
  const openPrivacidade = () => setLegalPage('PRIVACIDADE');
  const closeLegal = () => setLegalPage(null);

  return { legalPage, openTermos, openPrivacidade, closeLegal };
};
