-- Remove Hyundai Dealership Agents and EU AI Compliance SaaS projects
-- Executed: 2026-02-05 per CEO directive (AgentShield-only focus)

DELETE FROM "Project" WHERE name IN ('Hyundai Dealership Agents', 'EU AI Compliance SaaS');

-- Verify remaining projects
SELECT id, name, status, progress FROM "Project" ORDER BY name;
