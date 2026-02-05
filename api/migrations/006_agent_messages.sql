-- Agent-to-Agent Messaging System
-- Phase 1: Direct messaging between agents

CREATE TABLE IF NOT EXISTS agent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_agent_id VARCHAR(100) NOT NULL,
  to_agent_id VARCHAR(100),  -- NULL for broadcast messages
  thread_id UUID,  -- For threaded conversations
  message TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'message',  -- message, question, help_request, announcement, decision
  priority VARCHAR(20) DEFAULT 'normal',  -- low, normal, high, urgent
  metadata JSONB DEFAULT '{}',
  mentions TEXT[] DEFAULT '{}',  -- Array of @mentioned agent IDs
  attachments JSONB DEFAULT '[]',
  read_by TEXT[] DEFAULT '{}',  -- Array of agent IDs who read this
  reactions JSONB DEFAULT '{}',  -- {emoji: [agent_ids]}
  parent_message_id UUID REFERENCES agent_messages(id),  -- For replies
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_messages_from ON agent_messages(from_agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_messages_to ON agent_messages(to_agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_messages_thread ON agent_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_agent_messages_created ON agent_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_messages_mentions ON agent_messages USING GIN(mentions);
CREATE INDEX IF NOT EXISTS idx_agent_messages_type ON agent_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_agent_messages_priority ON agent_messages(priority);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_agent_messages_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agent_messages_updated
BEFORE UPDATE ON agent_messages
FOR EACH ROW
EXECUTE FUNCTION update_agent_messages_timestamp();

-- Council Proposals & Deliberations
-- Phase 4: Multi-agent decision making

CREATE TABLE IF NOT EXISTS council_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  proposed_by VARCHAR(100) NOT NULL,
  project_id UUID REFERENCES projects(id),
  proposal_type VARCHAR(50) DEFAULT 'decision',  -- decision, policy, architecture, priority
  status VARCHAR(50) DEFAULT 'open',  -- open, voting, deliberating, approved, rejected, withdrawn
  required_votes INTEGER DEFAULT 3,  -- Minimum votes needed
  vote_threshold DECIMAL(3,2) DEFAULT 0.6,  -- % approval needed (0.6 = 60%)
  voting_closes_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS council_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES council_proposals(id) ON DELETE CASCADE,
  agent_id VARCHAR(100) NOT NULL,
  vote VARCHAR(20) NOT NULL,  -- approve, reject, abstain
  reasoning TEXT,
  weight DECIMAL(3,2) DEFAULT 1.0,  -- Vote weight (for weighted voting)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(proposal_id, agent_id)
);

CREATE TABLE IF NOT EXISTS council_discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES council_proposals(id) ON DELETE CASCADE,
  agent_id VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  discussion_type VARCHAR(50) DEFAULT 'comment',  -- comment, concern, support, question
  parent_id UUID REFERENCES council_discussions(id),  -- For threaded discussions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_council_proposals_status ON council_proposals(status);
CREATE INDEX IF NOT EXISTS idx_council_proposals_proposed_by ON council_proposals(proposed_by);
CREATE INDEX IF NOT EXISTS idx_council_proposals_created ON council_proposals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_council_votes_proposal ON council_votes(proposal_id);
CREATE INDEX IF NOT EXISTS idx_council_votes_agent ON council_votes(agent_id);
CREATE INDEX IF NOT EXISTS idx_council_discussions_proposal ON council_discussions(proposal_id);
CREATE INDEX IF NOT EXISTS idx_council_discussions_created ON council_discussions(created_at DESC);

-- Auto-update timestamp for proposals
CREATE TRIGGER council_proposals_updated
BEFORE UPDATE ON council_proposals
FOR EACH ROW
EXECUTE FUNCTION update_agent_messages_timestamp();

-- Task Assignments
-- Phase 2: Proper task assignment tracking

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(100);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS blocked_reason TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS help_requested BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES tasks(id);  -- For subtasks

CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_help_requested ON tasks(help_requested) WHERE help_requested = TRUE;
