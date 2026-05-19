import type { AgentRowData } from '../components/agents/AgentTableRow'

export const AGENTS: AgentRowData[] = [
  {
    id: 1, name: 'Customer support',
    description: 'Helps callers with billing questions and account issues',
    voice: { initial: 'C', name: 'Clara', color: '#6366f1' },
    calls: 584, avgTtfb: '720ms', interruptions: '9%', flow: { nodes: 4 }, status: 'Active',
  },
  {
    id: 2, name: 'Sales assistant',
    description: 'Qualifies new leads before connecting to a sales rep',
    voice: { initial: 'J', name: 'James', color: '#64748b' },
    calls: 312, avgTtfb: '840ms', interruptions: '14%', flow: { nodes: 6 }, status: 'Active',
  },
  {
    id: 3, name: 'Appointment booking',
    description: 'Books and reschedules appointments automatically',
    voice: { initial: 'S', name: 'Sophie', color: '#0891b2' },
    calls: 241, avgTtfb: '680ms', interruptions: '6%', flow: { nodes: 5 }, status: 'Active',
  },
  {
    id: 4, name: 'IT helpdesk',
    description: 'Handles common IT questions and password resets',
    voice: { initial: 'M', name: 'Marcus', color: '#475569' },
    calls: 147, avgTtfb: '410ms', interruptions: '11%', flow: { nodes: 3 }, status: 'Inactive',
  },
  {
    id: 5, name: 'Complaint handler',
    description: 'Manages escalated complaints with empathy',
    voice: { initial: 'A', name: 'Aria', color: '#8b5cf6' },
    calls: 63, avgTtfb: null, interruptions: null, flow: null, status: 'Inactive',
  },
  {
    id: 6, name: 'Post-call survey',
    description: 'Collects customer satisfaction scores after each call',
    voice: { initial: 'E', name: 'Emma', color: '#0284c7' },
    calls: 208, avgTtfb: '750ms', interruptions: '3%', flow: { nodes: 2 }, status: 'Active',
  },
  {
    id: 7, name: 'Onboarding guide',
    description: 'Walks new customers through product setup step by step',
    voice: { initial: 'L', name: 'Lily', color: '#0d9488' },
    calls: 95, avgTtfb: '610ms', interruptions: '4%', flow: { nodes: 7 }, status: 'Active',
  },
  {
    id: 8, name: 'Billing support',
    description: 'Resolves invoice disputes and payment failures',
    voice: { initial: 'R', name: 'Ryan', color: '#b45309' },
    calls: 178, avgTtfb: '730ms', interruptions: '8%', flow: { nodes: 4 }, status: 'Active',
  },
  {
    id: 9, name: 'Technical support',
    description: 'Diagnoses and resolves product technical issues',
    voice: { initial: 'N', name: 'Nova', color: '#7c3aed' },
    calls: 224, avgTtfb: '790ms', interruptions: '10%', flow: { nodes: 6 }, status: 'Active',
  },
  {
    id: 10, name: 'Lead qualifier',
    description: 'Scores inbound leads before routing to sales team',
    voice: { initial: 'D', name: 'Dan', color: '#0369a1' },
    calls: 410, avgTtfb: '660ms', interruptions: '5%', flow: { nodes: 3 }, status: 'Active',
  },
  {
    id: 11, name: 'Return handler',
    description: 'Processes product return and refund requests',
    voice: { initial: 'Z', name: 'Zara', color: '#be185d' },
    calls: 89, avgTtfb: null, interruptions: null, flow: null, status: 'Inactive',
  },
  {
    id: 12, name: 'Renewal reminder',
    description: 'Reminds customers of upcoming subscription renewals',
    voice: { initial: 'O', name: 'Oscar', color: '#15803d' },
    calls: 301, avgTtfb: '540ms', interruptions: '2%', flow: { nodes: 5 }, status: 'Active',
  },
  {
    id: 13, name: 'Return handler',
    description: 'Processes product return and refund requests',
    voice: { initial: 'Z', name: 'Zara', color: '#be185d' },
    calls: 89, avgTtfb: null, interruptions: null, flow: null, status: 'Inactive',
  },
  {
    id: 14, name: 'Renewal reminder',
    description: 'Reminds customers of upcoming subscription renewals',
    voice: { initial: 'O', name: 'Oscar', color: '#15803d' },
    calls: 301, avgTtfb: '540ms', interruptions: '2%', flow: { nodes: 5 }, status: 'Active',
  },
]
