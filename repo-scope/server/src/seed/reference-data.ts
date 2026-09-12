export const TEAMS = [
  { id: "team-platform", name: "Platform Engineering", businessUnit: "Technology", description: "Owns shared infrastructure, CI/CD, and internal developer tooling." },
  { id: "team-payments", name: "Payments", businessUnit: "Commerce", description: "Owns payment processing, billing, and settlement systems." },
  { id: "team-identity", name: "Identity & Access", businessUnit: "Technology", description: "Owns authentication, authorization, and identity infrastructure." },
  { id: "team-customer-exp", name: "Customer Experience", businessUnit: "Commerce", description: "Owns customer-facing web and mobile applications." },
  { id: "team-data", name: "Data Engineering", businessUnit: "Analytics", description: "Owns data pipelines, warehousing, and analytics infrastructure." },
  { id: "team-logistics", name: "Logistics", businessUnit: "Operations", description: "Owns fulfillment, shipping, and warehouse systems." },
  { id: "team-marketing-tech", name: "Marketing Technology", businessUnit: "Marketing", description: "Owns campaign management, CRM integration, and marketing automation." },
  { id: "team-legacy-systems", name: "Legacy Systems", businessUnit: "Technology", description: "Maintains long-lived core systems pending modernization." },
] as const;

export const DOMAINS = [
  { id: "domain-payments", name: "Payments & Billing", description: "Capabilities related to processing payments, invoicing, and settlement." },
  { id: "domain-identity", name: "Identity & Security", description: "Authentication, authorization, and access management capabilities." },
  { id: "domain-customer", name: "Customer Engagement", description: "Customer-facing experiences including web, mobile, and notifications." },
  { id: "domain-fulfillment", name: "Fulfillment & Logistics", description: "Order fulfillment, shipping, warehouse, and inventory capabilities." },
  { id: "domain-analytics", name: "Analytics & Reporting", description: "Data pipelines, reporting, and business intelligence capabilities." },
  { id: "domain-marketing", name: "Marketing & Growth", description: "Campaign management, personalization, and marketing automation." },
  { id: "domain-platform", name: "Internal Platform", description: "Shared infrastructure, developer tooling, and cross-cutting services." },
] as const;

export const TECHNOLOGIES = [
  { id: "tech-react", name: "React", category: "Frontend", lifecycleStatus: "Current" },
  { id: "tech-typescript", name: "TypeScript", category: "Language", lifecycleStatus: "Current" },
  { id: "tech-java", name: "Java", category: "Language", lifecycleStatus: "Current" },
  { id: "tech-spring-boot", name: "Spring Boot", category: "Backend Framework", lifecycleStatus: "Current" },
  { id: "tech-dotnet", name: ".NET", category: "Backend Framework", lifecycleStatus: "Current" },
  { id: "tech-python", name: "Python", category: "Language", lifecycleStatus: "Current" },
  { id: "tech-nodejs", name: "Node.js", category: "Runtime", lifecycleStatus: "Current" },
  { id: "tech-postgresql", name: "PostgreSQL", category: "Database", lifecycleStatus: "Current" },
  { id: "tech-mysql", name: "MySQL", category: "Database", lifecycleStatus: "Current" },
  { id: "tech-mongodb", name: "MongoDB", category: "Database", lifecycleStatus: "Current" },
  { id: "tech-terraform", name: "Terraform", category: "Infrastructure", lifecycleStatus: "Current" },
  { id: "tech-kubernetes", name: "Kubernetes", category: "Infrastructure", lifecycleStatus: "Current" },
  { id: "tech-kafka", name: "Kafka", category: "Messaging", lifecycleStatus: "Current" },
  { id: "tech-rabbitmq", name: "RabbitMQ", category: "Messaging", lifecycleStatus: "Current" },
  { id: "tech-angularjs", name: "AngularJS", category: "Frontend", lifecycleStatus: "Deprecated" },
  { id: "tech-jquery", name: "jQuery", category: "Frontend", lifecycleStatus: "Deprecated" },
  { id: "tech-struts", name: "Apache Struts", category: "Backend Framework", lifecycleStatus: "Legacy" },
  { id: "tech-oracle-db", name: "Oracle DB", category: "Database", lifecycleStatus: "Legacy" },
  { id: "tech-cobol", name: "COBOL", category: "Language", lifecycleStatus: "Legacy" },
  { id: "tech-airflow", name: "Apache Airflow", category: "Data Orchestration", lifecycleStatus: "Current" },
] as const;

export type TeamId = (typeof TEAMS)[number]["id"];
export type DomainId = (typeof DOMAINS)[number]["id"];
export type TechId = (typeof TECHNOLOGIES)[number]["id"];
