import { RunnableConfig } from "@langchain/core/runnables";
import { BaseAgent } from "../core/base.agent";
import { AppState, StateDiff } from "../core/types";

export class ArchitectureAgent extends BaseAgent {
  name() {
    return "architecture";
  }

  async run(state: AppState, config?: RunnableConfig): Promise<StateDiff> {
    const threadId = config?.configurable?.thread_id as string | undefined;
    this.log("start", threadId);

    const prompt = `You are a pragmatic senior software architect who makes CONCRETE technical decisions for a production-ready system.

Extended brief:
"${state.expandedBrief}"

User stories:
"${
      state.userStoryList
        ? JSON.stringify(state.userStoryList, null, 2)
        : "No user stories provided"
    }"

IMPORTANT: You must make DEFINITIVE choices, not suggestions. Say "We will use X" not "Consider using X or Y".

Architectural principles:
- START SIMPLE: Choose monolith or modular monolith (only choose microservices if absolutely necessary with clear justification)
- USE RELATIONAL DATABASES: Choose PostgreSQL or MySQL as primary datastore (only choose NoSQL if there's a specific, justified use case)
- Prefer boring, proven technology over cutting-edge solutions
- Design for the current scale, not hypothetical future scale
- MANDATORY: Use Node.js with TypeScript for all backend code
- MANDATORY: Use TypeScript for all frontend code

YOU MUST DECIDE AND SPECIFY:

1. **System Architecture Pattern**
   - DECIDE: Monolith, modular monolith, or microservices (with justification)
   - List the core modules/components with their specific responsibilities

2. **Technology Stack**
   - Backend: MUST use Node.js with TypeScript. CHOOSE the framework (e.g., "Express", "Fastify", "NestJS", "Hono")
   - Frontend: MUST use TypeScript. CHOOSE the framework (e.g., "React with Next.js", "Vue 3 with Nuxt", "SvelteKit", "Solid Start")
   - CHOOSE: Database (e.g., "PostgreSQL 15", "MySQL 8")
   - CHOOSE: ORM/Query Builder if needed (e.g., "Prisma", "Drizzle ORM", "TypeORM", "Kysely")
   - CHOOSE: Caching layer if needed (e.g., "Redis 7 for session storage and API caching")

3. **Database Design**
   - List the main database tables/entities needed
   - Specify migration strategy (e.g., "Flyway", "Alembic", "Prisma migrations")
   - Identify key indexes needed

4. **API Design**
   - DECIDE: REST, GraphQL, or hybrid (with justification)
   - Specify API versioning strategy (e.g., "URL versioning: /api/v1/")
   - Define authentication approach (e.g., "JWT with refresh tokens", "Session-based with httpOnly cookies")

5. **Security & Auth**
   - CHOOSE: Authentication mechanism (e.g., "JWT with access/refresh tokens")
   - CHOOSE: Authorization approach (e.g., "RBAC with 3 roles: user, admin, super-admin")
   - List security measures to implement

6. **Infrastructure & Deployment**
   - CHOOSE: Hosting platform (e.g., "AWS", "Vercel + Railway", "DigitalOcean")
   - SPECIFY: Deployment strategy (e.g., "Docker containers on AWS ECS", "Vercel for frontend, Railway for backend")
   - SPECIFY: CI/CD pipeline (e.g., "GitHub Actions with automated tests and deployment")

7. **Observability**
   - CHOOSE: Logging solution (e.g., "Winston + CloudWatch", "Pino + Loki")
   - CHOOSE: Monitoring (e.g., "Prometheus + Grafana", "DataDog")
   - CHOOSE: Error tracking (e.g., "Sentry")

8. **Scalability Approach**
   - Define initial scalability strategy (e.g., "Vertical scaling up to 8GB RAM, then horizontal with load balancer")
   - Specify any caching strategy (e.g., "Redis for API responses with 5min TTL")

Provide 12-20 concrete technical decisions as bullet points. Each decision should be specific and actionable.
Use "We will...", "The system uses...", "Authentication is handled by..." not "Consider..." or "Could use..."`;

    const architecture = await this.ask(prompt);

    this.log("done", threadId);
    return {
      architectureDesign: architecture,
      messages: this.aiNote("Technical architecture ready."),
    };
  }
}
