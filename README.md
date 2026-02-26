# fastmvp

FastMVP is a base for creating an app quickly: you interact with AI agents, the flow refines your idea, and from there it generates a complete app with backend and frontend automatically.

## What it does
- Starts from a short idea and turns it into a clear specification using **AI Agents**.
- Defines API contracts with OpenAPI as the source of truth.
- Implements backend and frontend following clean architecture and Feature-Sliced.

## How it works (Agent-based flow)
The primary way to use FastMVP is through **Copilot Agents** (e.g., `@FastMVP`, `@Feature Builder`, `@Bug Fixer`). These agents orchestrate the entire workflow automatically:
1) **Specify**: The agent turns your idea into a spec.
2) **Contracts**: Updates OpenAPI.
3) **Tasks & Implementation (API)**: Breaks down and implements the backend.
4) **Figma prompts (optional)**: Prepares UI prompts.
5) **Tasks & Implementation (Web)**: Breaks down and implements the frontend.

*(Note: The legacy 7-step flow using prompt files is still maintained and available for manual step-by-step execution, but agents are the recommended approach).*

The full usage details and agent architecture are in [WORKFLOW.md](WORKFLOW.md).

## Coming Soon (Roadmap)
- **Documentation Agents**: Automated generation and maintenance of project documentation.
- **CI/CD Agents**: Controlled, step-by-step releases to production environments.
- **Multi-language Skills**: Agents equipped with skills for different programming languages beyond the current stack.