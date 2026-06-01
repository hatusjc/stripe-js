export type LifeArea =
  | 'financas'
  | 'familia'
  | 'saude'
  | 'carreira'
  | 'patrimonio'
  | 'projetos'
  | 'conhecimento'
  | 'objetivos'
  | 'responsabilidades';

// Finance
export interface Transaction {
  id: string;
  type: 'receita' | 'despesa';
  category: string;
  description: string;
  amount: number;
  date: string;
  recurring?: boolean;
  installments?: number;
  currentInstallment?: number;
  tags?: string[];
  // Enhanced fields
  photo?: string;          // base64 data URL
  notes?: string;
  receipt?: string;        // base64 of receipt photo
  shared?: boolean;        // visible to partner
  addedBy?: string;        // userId who added
  fromNotification?: boolean;
}

// Couple system
export interface CoupleLink {
  myUserId: string;
  partnerId: string;
  partnerName: string;
  partnerEmail: string;
  linkedAt: string;
  sharedAreas: LifeArea[];
}

export interface CoupleNotification {
  id: string;
  fromUserId: string;
  fromName: string;
  toUserId: string;
  area: LifeArea | 'financas';
  action: 'add' | 'edit' | 'delete';
  entityType: string;
  entityTitle: string;
  details?: string;
  createdAt: string;
  read: boolean;
}

// Bank notification
export interface BankNotificationRaw {
  id: string;
  source: string;           // bank name
  rawText: string;
  parsedAmount?: number;
  parsedType?: 'receita' | 'despesa';
  parsedDescription?: string;
  parsedDate?: string;
  receivedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface PendingTransaction {
  id: string;
  bankNotificationId?: string;
  type: 'receita' | 'despesa';
  description: string;
  amount: number;
  date: string;
  category: string;
  photo?: string;
  notes?: string;
  source: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'corrente' | 'poupanca' | 'investimento' | 'cartao';
  balance: number;
  institution: string;
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
}

export interface Debt {
  id: string;
  creditor: string;
  totalAmount: number;
  remainingAmount: number;
  monthlyPayment: number;
  interestRate: number;
  dueDate: string;
}

// Projects
export type ProjectStatus = 'planejamento' | 'em_andamento' | 'em_risco' | 'pausado' | 'concluido';
export type TaskStatus = 'pendente' | 'em_andamento' | 'concluido';
export type Priority = 'baixa' | 'media' | 'alta' | 'critica';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  projectId?: string;
  responsibilityId?: string;
  area?: LifeArea;
  notes?: string;
}

export interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  priority: Priority;
  area: LifeArea;
  startDate: string;
  endDate?: string;
  progress: number;
  milestones: Milestone[];
  tasks: Task[];
  tags?: string[];
}

// Goals
export type GoalPeriod = '30dias' | '90dias' | 'anual' | '5anos';

export interface Goal {
  id: string;
  title: string;
  description: string;
  area: LifeArea;
  period: GoalPeriod;
  progress: number;
  targetDate: string;
  keyResults: KeyResult[];
  status: 'ativo' | 'concluido' | 'abandonado';
}

export interface KeyResult {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
}

// Responsibilities
export interface Responsibility {
  id: string;
  title: string;
  description: string;
  area: LifeArea;
  priority: Priority;
  relatedGoals: string[];
  relatedProjects: string[];
  risks: string[];
  costs?: number;
  people?: string[];
  healthScore: number;
}

// Family
export interface FamilyEvent {
  id: string;
  title: string;
  date: string;
  type: 'aniversario' | 'compromisso' | 'viagem' | 'saude' | 'educacao' | 'outro';
  person?: string;
  notes?: string;
  recurring?: boolean;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  birthDate?: string;
  notes?: string;
}

// Knowledge
export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  type: 'nota' | 'ideia' | 'estudo' | 'reuniao' | 'reflexao' | 'aprendizado';
}

// Patrimony
export interface Asset {
  id: string;
  name: string;
  type: 'imovel' | 'veiculo' | 'empresa' | 'investimento' | 'reserva' | 'outro';
  currentValue: number;
  acquisitionValue: number;
  acquisitionDate: string;
  description?: string;
}

// Decisions
export interface Decision {
  id: string;
  title: string;
  context: string;
  alternatives: DecisionAlternative[];
  risks: string[];
  benefits: string[];
  estimatedCost?: number;
  expectedImpact: string;
  status: 'pendente' | 'tomada' | 'revisando';
  decidedAt?: string;
  outcome?: string;
  createdAt: string;
}

export interface DecisionAlternative {
  id: string;
  title: string;
  pros: string[];
  cons: string[];
  score?: number;
}

// Life Score
export interface LifeScore {
  total: number;
  financas: number;
  saude: number;
  familia: number;
  carreira: number;
  patrimonio: number;
  organizacao: number;
  metas: number;
  execucao: number;
  updatedAt: string;
}

// Alerts
export interface Alert {
  id: string;
  type: 'financeiro' | 'projeto' | 'meta' | 'responsabilidade' | 'familia' | 'saude';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  area: LifeArea;
  createdAt: string;
  read: boolean;
  actionUrl?: string;
}

// Health
export interface HealthMetric {
  id: string;
  type: 'exercicio' | 'sono' | 'hidratacao' | 'alimentacao' | 'meditacao' | 'peso' | 'outro';
  value: number;
  unit: string;
  date: string;
  notes?: string;
}

export interface HealthGoal {
  id: string;
  title: string;
  metric: string;
  target: number;
  current: number;
  unit: string;
}
