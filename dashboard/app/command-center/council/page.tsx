'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://command-center-api.onrender.com';

interface CouncilProposal {
  id: string;
  title: string;
  description: string;
  proposedBy: string;
  projectId: string | null;
  proposalType: string;
  status: string;
  requiredVotes: number;
  voteThreshold: number;
  votingClosesAt: string | null;
  metadata: any;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  votes: CouncilVote[];
  discussions: CouncilDiscussion[];
}

interface CouncilVote {
  id: string;
  proposalId: string;
  agentId: string;
  vote: string;
  reasoning: string | null;
  weight: number;
  createdAt: string;
}

interface CouncilDiscussion {
  id: string;
  proposalId: string;
  agentId: string;
  message: string;
  discussionType: string;
  parentId: string | null;
  createdAt: string;
}

// Council members (C-suite only)
const COUNCIL_MEMBERS = [
  { id: 'main', name: 'Unc Lumen', role: 'CTO', emoji: '💎' },
  { id: 'luna-cos', name: 'Luna', role: 'Chief of Staff', emoji: '🌙' },
  { id: 'maven-cpo', name: 'Maven', role: 'Chief Product Officer', emoji: '📋' },
];

export default function CouncilPage() {
  const router = useRouter();
  const [proposals, setProposals] = useState<CouncilProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<CouncilProposal | null>(null);

  // New proposal form state
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    proposedBy: 'main',
    proposalType: 'decision',
    requiredVotes: 3,
    voteThreshold: 0.67,
  });

  useEffect(() => {
    fetchProposals();
  }, [filter]);

  const fetchProposals = async () => {
    try {
      const url = filter === 'all' 
        ? `${API_URL}/api/council/proposals`
        : `${API_URL}/api/council/proposals?status=${filter}`;
      
      const response = await fetch(url);
      const data = await response.json();
      setProposals(data.proposals || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      setLoading(false);
    }
  };

  const createProposal = async () => {
    try {
      const response = await fetch(`${API_URL}/api/council/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProposal),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setNewProposal({
          title: '',
          description: '',
          proposedBy: 'main',
          proposalType: 'decision',
          requiredVotes: 3,
          voteThreshold: 0.67,
        });
        fetchProposals();
      }
    } catch (error) {
      console.error('Error creating proposal:', error);
    }
  };

  const castVote = async (proposalId: string, vote: string, reasoning: string) => {
    try {
      await fetch(`${API_URL}/api/council/proposals/${proposalId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'main', // TODO: Get from auth
          vote,
          reasoning,
        }),
      });
      fetchProposals();
      if (selectedProposal?.id === proposalId) {
        fetchProposalDetails(proposalId);
      }
    } catch (error) {
      console.error('Error casting vote:', error);
    }
  };

  const addDiscussion = async (proposalId: string, message: string, type: string = 'comment') => {
    try {
      await fetch(`${API_URL}/api/council/proposals/${proposalId}/discuss`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'main', // TODO: Get from auth
          message,
          discussionType: type,
        }),
      });
      fetchProposals();
      if (selectedProposal?.id === proposalId) {
        fetchProposalDetails(proposalId);
      }
    } catch (error) {
      console.error('Error adding discussion:', error);
    }
  };

  const fetchProposalDetails = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/council/proposals/${id}`);
      const data = await response.json();
      setSelectedProposal(data.proposal);
    } catch (error) {
      console.error('Error fetching proposal details:', error);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-950';
      case 'rejected': return 'text-red-400 bg-red-950';
      case 'voting': return 'text-blue-400 bg-blue-950';
      case 'deliberating': return 'text-yellow-400 bg-yellow-950';
      case 'open': return 'text-gray-400 bg-gray-800';
      case 'withdrawn': return 'text-gray-500 bg-gray-900';
      default: return 'text-gray-400 bg-gray-800';
    }
  };

  const typeEmoji = (type: string) => {
    switch (type) {
      case 'decision': return '⚖️';
      case 'policy': return '📜';
      case 'architecture': return '🏗️';
      case 'priority': return '🎯';
      default: return '📝';
    }
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getVoteSummary = (proposal: CouncilProposal) => {
    const total = proposal.votes.length;
    const approve = proposal.votes.filter(v => v.vote === 'approve').length;
    const reject = proposal.votes.filter(v => v.vote === 'reject').length;
    const abstain = proposal.votes.filter(v => v.vote === 'abstain').length;
    const approvalRate = total > 0 ? (approve / total) * 100 : 0;
    const meetsThreshold = approvalRate >= proposal.voteThreshold * 100;
    const meetsQuorum = total >= proposal.requiredVotes;

    return { total, approve, reject, abstain, approvalRate, meetsThreshold, meetsQuorum };
  };

  const proposalsByStatus = {
    open: proposals.filter(p => p.status === 'open').length,
    voting: proposals.filter(p => p.status === 'voting').length,
    deliberating: proposals.filter(p => p.status === 'deliberating').length,
    approved: proposals.filter(p => p.status === 'approved').length,
    rejected: proposals.filter(p => p.status === 'rejected').length,
  };

  if (loading) {
    return <div className="text-center py-12 text-[#a1a1aa]">Loading Council...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            🏛️ Council
          </h1>
          <p className="text-[#a1a1aa] mt-1">Executive decision-making forum</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[#6366f1] text-white rounded-lg hover:bg-[#5558e3] transition-colors"
        >
          + New Proposal
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-[#111113] rounded-lg p-4">
          <div className="text-2xl font-bold">{proposalsByStatus.open}</div>
          <div className="text-sm text-[#a1a1aa]">Open</div>
        </div>
        <div className="bg-[#111113] rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-400">{proposalsByStatus.voting}</div>
          <div className="text-sm text-[#a1a1aa]">Voting</div>
        </div>
        <div className="bg-[#111113] rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-400">{proposalsByStatus.deliberating}</div>
          <div className="text-sm text-[#a1a1aa]">Deliberating</div>
        </div>
        <div className="bg-[#111113] rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">{proposalsByStatus.approved}</div>
          <div className="text-sm text-[#a1a1aa]">Approved</div>
        </div>
        <div className="bg-[#111113] rounded-lg p-4">
          <div className="text-2xl font-bold text-red-400">{proposalsByStatus.rejected}</div>
          <div className="text-sm text-[#a1a1aa]">Rejected</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        {['all', 'open', 'voting', 'deliberating', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm ${
              filter === status
                ? 'bg-[#6366f1] text-white'
                : 'bg-[#18181b] text-[#a1a1aa] hover:text-white'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {proposals.map((proposal) => {
          const voteSummary = getVoteSummary(proposal);
          
          return (
            <div
              key={proposal.id}
              onClick={() => {
                setSelectedProposal(proposal);
                fetchProposalDetails(proposal.id);
              }}
              className="bg-[#111113] rounded-lg p-6 hover:bg-[#18181b] transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{typeEmoji(proposal.proposalType)}</span>
                    <h3 className="text-xl font-bold">{proposal.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs ${statusColor(proposal.status)}`}>
                      {proposal.status}
                    </span>
                  </div>
                  <p className="text-[#a1a1aa] text-sm line-clamp-2">{proposal.description}</p>
                </div>
              </div>

              {/* Vote Summary */}
              <div className="flex items-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-[#71717a]">Votes:</span>
                  <span className="text-green-400">{voteSummary.approve} ✓</span>
                  <span className="text-red-400">{voteSummary.reject} ✗</span>
                  <span className="text-gray-500">{voteSummary.abstain} ○</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#71717a]">Approval:</span>
                  <span className={voteSummary.meetsThreshold ? 'text-green-400' : 'text-[#a1a1aa]'}>
                    {voteSummary.approvalRate.toFixed(0)}%
                  </span>
                  <span className="text-[#71717a]">
                    (need {(proposal.voteThreshold * 100).toFixed(0)}%)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#71717a]">Comments:</span>
                  <span>{proposal.discussions.length}</span>
                </div>
                <div className="flex items-center gap-2 ml-auto text-[#71717a]">
                  {timeAgo(proposal.createdAt)} by {proposal.proposedBy}
                </div>
              </div>

              {/* Progress bar */}
              {proposal.status !== 'approved' && proposal.status !== 'rejected' && proposal.status !== 'withdrawn' && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-[#71717a] mb-1">
                    <span>Quorum: {voteSummary.total}/{proposal.requiredVotes}</span>
                    <span>{voteSummary.meetsQuorum ? '✓' : '○'} Threshold: {voteSummary.meetsThreshold ? '✓' : '○'}</span>
                  </div>
                  <div className="w-full bg-[#27272a] rounded-full h-2">
                    <div
                      className={`${voteSummary.meetsThreshold ? 'bg-green-500' : 'bg-blue-500'} h-2 rounded-full transition-all`}
                      style={{ width: `${Math.min(voteSummary.approvalRate, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {proposals.length === 0 && (
        <div className="text-center py-12 text-[#71717a]">
          No proposals found. Create the first one!
        </div>
      )}

      {/* Create Proposal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#111113] rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Create New Proposal</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#a1a1aa] mb-2">Title</label>
                <input
                  type="text"
                  value={newProposal.title}
                  onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-4 py-2 text-white"
                  placeholder="Proposal title..."
                />
              </div>

              <div>
                <label className="block text-sm text-[#a1a1aa] mb-2">Description</label>
                <textarea
                  value={newProposal.description}
                  onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-4 py-2 text-white h-32"
                  placeholder="Detailed description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#a1a1aa] mb-2">Type</label>
                  <select
                    value={newProposal.proposalType}
                    onChange={(e) => setNewProposal({ ...newProposal, proposalType: e.target.value })}
                    className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-4 py-2 text-white"
                  >
                    <option value="decision">Decision</option>
                    <option value="policy">Policy</option>
                    <option value="architecture">Architecture</option>
                    <option value="priority">Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[#a1a1aa] mb-2">Proposed By</label>
                  <select
                    value={newProposal.proposedBy}
                    onChange={(e) => setNewProposal({ ...newProposal, proposedBy: e.target.value })}
                    className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-4 py-2 text-white"
                  >
                    {COUNCIL_MEMBERS.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.emoji} {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[#a1a1aa] mb-2">Required Votes</label>
                  <input
                    type="number"
                    value={newProposal.requiredVotes}
                    onChange={(e) => setNewProposal({ ...newProposal, requiredVotes: parseInt(e.target.value) })}
                    className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-4 py-2 text-white"
                    min="1"
                    max="3"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#a1a1aa] mb-2">Approval Threshold (%)</label>
                  <input
                    type="number"
                    value={newProposal.voteThreshold * 100}
                    onChange={(e) => setNewProposal({ ...newProposal, voteThreshold: parseInt(e.target.value) / 100 })}
                    className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-4 py-2 text-white"
                    min="50"
                    max="100"
                    step="1"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={createProposal}
                className="px-6 py-2 bg-[#6366f1] text-white rounded-lg hover:bg-[#5558e3] transition-colors"
              >
                Create Proposal
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-2 bg-[#27272a] text-white rounded-lg hover:bg-[#3f3f46] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Proposal Detail Modal */}
      {selectedProposal && (
        <ProposalDetailModal
          proposal={selectedProposal}
          onClose={() => setSelectedProposal(null)}
          onVote={castVote}
          onDiscuss={addDiscussion}
        />
      )}
    </div>
  );
}

// Proposal Detail Modal Component
function ProposalDetailModal({
  proposal,
  onClose,
  onVote,
  onDiscuss,
}: {
  proposal: CouncilProposal;
  onClose: () => void;
  onVote: (proposalId: string, vote: string, reasoning: string) => void;
  onDiscuss: (proposalId: string, message: string, type: string) => void;
}) {
  const [voteChoice, setVoteChoice] = useState<string>('');
  const [voteReasoning, setVoteReasoning] = useState<string>('');
  const [discussionMessage, setDiscussionMessage] = useState<string>('');

  const handleVote = () => {
    if (voteChoice && voteReasoning) {
      onVote(proposal.id, voteChoice, voteReasoning);
      setVoteChoice('');
      setVoteReasoning('');
    }
  };

  const handleDiscuss = () => {
    if (discussionMessage) {
      onDiscuss(proposal.id, discussionMessage, 'comment');
      setDiscussionMessage('');
    }
  };

  const typeEmoji = (type: string) => {
    switch (type) {
      case 'decision': return '⚖️';
      case 'policy': return '📜';
      case 'architecture': return '🏗️';
      case 'priority': return '🎯';
      default: return '📝';
    }
  };

  const voteSummary = {
    total: proposal.votes.length,
    approve: proposal.votes.filter(v => v.vote === 'approve').length,
    reject: proposal.votes.filter(v => v.vote === 'reject').length,
    abstain: proposal.votes.filter(v => v.vote === 'abstain').length,
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111113] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#27272a]">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{typeEmoji(proposal.proposalType)}</span>
                <h2 className="text-2xl font-bold">{proposal.title}</h2>
              </div>
              <p className="text-[#a1a1aa]">{proposal.description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-[#71717a] hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          <div className="flex items-center gap-6 mt-4 text-sm text-[#71717a]">
            <span>Proposed by: {proposal.proposedBy}</span>
            <span>Type: {proposal.proposalType}</span>
            <span>Status: {proposal.status}</span>
            <span>Required: {proposal.requiredVotes} votes</span>
            <span>Threshold: {(proposal.voteThreshold * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Voting Section */}
          <div className="bg-[#18181b] rounded-lg p-4">
            <h3 className="font-bold mb-4">Votes ({voteSummary.total})</h3>
            
            {/* Vote summary */}
            <div className="flex items-center gap-6 mb-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓ Approve:</span>
                <span>{voteSummary.approve}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-400">✗ Reject:</span>
                <span>{voteSummary.reject}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">○ Abstain:</span>
                <span>{voteSummary.abstain}</span>
              </div>
            </div>

            {/* Individual votes */}
            <div className="space-y-2 mb-4">
              {proposal.votes.map((vote) => (
                <div key={vote.id} className="flex items-start gap-3 p-3 bg-[#111113] rounded">
                  <span className="text-lg">
                    {vote.vote === 'approve' ? '✓' : vote.vote === 'reject' ? '✗' : '○'}
                  </span>
                  <div className="flex-1">
                    <div className="font-bold text-sm">{vote.agentId}</div>
                    {vote.reasoning && (
                      <div className="text-sm text-[#a1a1aa] mt-1">{vote.reasoning}</div>
                    )}
                  </div>
                  <div className="text-xs text-[#71717a]">
                    {new Date(vote.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Cast vote */}
            {proposal.status !== 'approved' && proposal.status !== 'rejected' && proposal.status !== 'withdrawn' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setVoteChoice('approve')}
                    className={`flex-1 px-4 py-2 rounded-lg ${
                      voteChoice === 'approve'
                        ? 'bg-green-600 text-white'
                        : 'bg-[#27272a] text-[#a1a1aa] hover:text-white'
                    }`}
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => setVoteChoice('reject')}
                    className={`flex-1 px-4 py-2 rounded-lg ${
                      voteChoice === 'reject'
                        ? 'bg-red-600 text-white'
                        : 'bg-[#27272a] text-[#a1a1aa] hover:text-white'
                    }`}
                  >
                    ✗ Reject
                  </button>
                  <button
                    onClick={() => setVoteChoice('abstain')}
                    className={`flex-1 px-4 py-2 rounded-lg ${
                      voteChoice === 'abstain'
                        ? 'bg-gray-600 text-white'
                        : 'bg-[#27272a] text-[#a1a1aa] hover:text-white'
                    }`}
                  >
                    ○ Abstain
                  </button>
                </div>
                {voteChoice && (
                  <>
                    <textarea
                      value={voteReasoning}
                      onChange={(e) => setVoteReasoning(e.target.value)}
                      placeholder="Reasoning for your vote..."
                      className="w-full bg-[#111113] border border-[#27272a] rounded-lg px-4 py-2 text-white h-20"
                    />
                    <button
                      onClick={handleVote}
                      className="w-full px-4 py-2 bg-[#6366f1] text-white rounded-lg hover:bg-[#5558e3] transition-colors"
                    >
                      Submit Vote
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Discussion Section */}
          <div className="bg-[#18181b] rounded-lg p-4">
            <h3 className="font-bold mb-4">Discussion ({proposal.discussions.length})</h3>
            
            {/* Add comment */}
            <div className="mb-4 space-y-2">
              <textarea
                value={discussionMessage}
                onChange={(e) => setDiscussionMessage(e.target.value)}
                placeholder="Add to the discussion..."
                className="w-full bg-[#111113] border border-[#27272a] rounded-lg px-4 py-2 text-white h-20"
              />
              <button
                onClick={handleDiscuss}
                className="px-4 py-2 bg-[#6366f1] text-white rounded-lg hover:bg-[#5558e3] transition-colors"
              >
                Post Comment
              </button>
            </div>

            {/* Comments */}
            <div className="space-y-3">
              {proposal.discussions.map((discussion) => (
                <div key={discussion.id} className="p-3 bg-[#111113] rounded">
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-bold text-sm">{discussion.agentId}</div>
                    <div className="text-xs text-[#71717a]">
                      {new Date(discussion.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-[#a1a1aa] text-sm">{discussion.message}</div>
                </div>
              ))}
            </div>

            {proposal.discussions.length === 0 && (
              <div className="text-center py-6 text-[#71717a] text-sm">
                No comments yet. Start the discussion!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
