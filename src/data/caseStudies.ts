export interface Outcome {
  value: string
  label: string
}

export interface CaseStudy {
  title: string
  sector: string
  tags: string[]
  description: string
  outcomes: Outcome[]
}

export const caseStudies: CaseStudy[] = [
  {
    title: 'Enterprise AI Strategy & Operating Model for a Multi-Brand Consumer Group',
    sector: 'Manufacturing & FMCG \u2014 ASX-Listed',
    tags: ['AI Strategy', 'Architecture'],
    description:
      'Designed and executed an end-to-end enterprise AI strategy for a listed consumer goods group spanning multiple brands and business units. Established a dedicated AI Acceleration Squad, governance framework, and investment prioritisation model \u2014 moving the organisation from ad hoc experimentation to a structured, commercially accountable AI delivery function.',
    outcomes: [
      { value: '60\u00d7', label: 'Planning throughput uplift via AI' },
      { value: '7\u00d7', label: 'Tender response capacity increase' },
    ],
  },
  {
    title: '3-Year Technology Strategy & Architecture for a Global Mining Services Organisation',
    sector: 'Mining Services \u2014 Global',
    tags: ['Technology Strategy', 'Architecture'],
    description:
      'Defined a comprehensive 3-year technology strategy across business, data, application, and infrastructure domains for a globally operating mining services company. Strategic direction was presented directly to the board. Delivered alongside a cloud transformation and application rationalisation program that recovered multi-millions in total cost of ownership.',
    outcomes: [
      { value: '6mo\u2192min', label: 'Compliance cycle time reduction via automation' },
    ],
  },
  {
    title: '$100m+ Legislative Transformation for a State Government Regulatory Body',
    sector: 'Government & Regulatory',
    tags: ['Program Leadership', 'PMO'],
    description:
      'Led PMO mobilisation and delivery governance for a large-scale legislative and technology transformation program at a state government regulator. Established governance, delivery cadence, and executive reporting frameworks from the ground up \u2014 bringing structure to a complex, politically sensitive program operating under intense scrutiny.',
    outcomes: [],
  },
  {
    title: '$8bn+ Financial Services Separation Program Architecture & Governance',
    sector: 'Financial Services',
    tags: ['Program Leadership', 'Architecture'],
    description:
      'Led architecture and program governance across two major financial services divestments totalling more than $8bn in combined transaction value. Delivered in a high-pressure, time-constrained environment where architecture decisions had direct legal and regulatory consequences \u2014 requiring cross-functional alignment between technology, legal, compliance, and the acquiring entities.',
    outcomes: [],
  },
  {
    title: '$120m Core Insurance Platform Replacement \u2014 MVP in 13 Months',
    sector: 'Insurance',
    tags: ['Core System Replacement', 'PMO'],
    description:
      'Established the PMO and led delivery for a $120m core insurance system replacement at a major insurer. Coordinated a large cross-functional program across vendor, technology, and business teams \u2014 delivering a production-ready MVP within 13 months of program inception, significantly ahead of industry benchmarks for programs of equivalent scale and complexity.',
    outcomes: [
      { value: '13mo', label: 'Inception to MVP in production' },
    ],
  },
  {
    title: 'Production Agentic AI Platform \u2014 Enterprise Intelligence from Day One',
    sector: 'Technology Consulting',
    tags: ['Agentic AI Platform'],
    description:
      'Designed and built a production-grade agentic AI platform from the ground up \u2014 covering multi-agent orchestration, meeting intelligence, document automation, workflow integration, Jira and Miro connectivity, and structured knowledge management. The platform demonstrates what enterprise AI delivery looks like when architecture, governance, and product thinking are applied from the start \u2014 not bolted on after the fact.',
    outcomes: [],
  },
]
