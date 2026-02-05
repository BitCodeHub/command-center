// Phase 4: Council Deliberation API
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Create a proposal
router.post('/proposals', async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      proposedBy,
      projectId,
      proposalType = 'decision',
      requiredVotes = 3,
      voteThreshold = 0.6,
      votingClosesAt
    } = req.body;

    if (!title || !description || !proposedBy) {
      return res.status(400).json({ error: 'title, description, and proposedBy are required' });
    }

    const proposal = await prisma.councilProposal.create({
      data: {
        title,
        description,
        proposedBy,
        projectId,
        proposalType,
        requiredVotes,
        voteThreshold,
        votingClosesAt: votingClosesAt ? new Date(votingClosesAt) : undefined
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        type: 'system',
        agentId: proposedBy,
        title: `Council Proposal: ${title}`,
        description: description.substring(0, 200),
        metadata: { proposalId: proposal.id, proposalType }
      }
    });

    res.json({ success: true, proposal });
  } catch (error: any) {
    console.error('Error creating proposal:', error);
    res.status(500).json({ error: 'Failed to create proposal', details: error.message });
  }
});

// Get all proposals
router.get('/proposals', async (req: Request, res: Response) => {
  try {
    const { status, proposedBy, limit = 50, offset = 0 } = req.query;

    let where: any = {};
    if (status) where.status = status;
    if (proposedBy) where.proposedBy = proposedBy;

    const proposals = await prisma.councilProposal.findMany({
      where,
      include: {
        votes: true,
        discussions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset)
    });

    const total = await prisma.councilProposal.count({ where });

    res.json({ success: true, proposals, total });
  } catch (error: any) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({ error: 'Failed to fetch proposals', details: error.message });
  }
});

// Get single proposal with full details
router.get('/proposals/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const proposal = await prisma.councilProposal.findUnique({
      where: { id },
      include: {
        votes: true,
        discussions: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // Calculate vote statistics
    const totalVotes = proposal.votes.length;
    const approveVotes = proposal.votes.filter(v => v.vote === 'approve').length;
    const rejectVotes = proposal.votes.filter(v => v.vote === 'reject').length;
    const abstainVotes = proposal.votes.filter(v => v.vote === 'abstain').length;
    const approvalRate = totalVotes > 0 ? approveVotes / totalVotes : 0;

    res.json({
      success: true,
      proposal,
      stats: {
        totalVotes,
        approveVotes,
        rejectVotes,
        abstainVotes,
        approvalRate,
        meetsThreshold: approvalRate >= proposal.voteThreshold,
        meetsQuorum: totalVotes >= proposal.requiredVotes
      }
    });
  } catch (error: any) {
    console.error('Error fetching proposal:', error);
    res.status(500).json({ error: 'Failed to fetch proposal', details: error.message });
  }
});

// Cast a vote
router.post('/proposals/:id/vote', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { agentId, vote, reasoning, weight = 1.0 } = req.body;

    if (!agentId || !vote) {
      return res.status(400).json({ error: 'agentId and vote are required' });
    }

    if (!['approve', 'reject', 'abstain'].includes(vote)) {
      return res.status(400).json({ error: 'vote must be approve, reject, or abstain' });
    }

    const proposal = await prisma.councilProposal.findUnique({
      where: { id },
      include: { votes: true }
    });

    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    if (proposal.status !== 'open' && proposal.status !== 'voting') {
      return res.status(400).json({ error: 'Proposal is not open for voting' });
    }

    // Create or update vote
    const newVote = await prisma.councilVote.upsert({
      where: {
        proposalId_agentId: {
          proposalId: id,
          agentId
        }
      },
      create: {
        proposalId: id,
        agentId,
        vote,
        reasoning,
        weight
      },
      update: {
        vote,
        reasoning,
        weight
      }
    });

    // Update proposal status to voting if still open
    if (proposal.status === 'open') {
      await prisma.councilProposal.update({
        where: { id },
        data: { status: 'voting' }
      });
    }

    // Check if voting should conclude
    const allVotes = await prisma.councilVote.findMany({
      where: { proposalId: id }
    });

    if (allVotes.length >= proposal.requiredVotes) {
      const approveVotes = allVotes.filter(v => v.vote === 'approve').length;
      const approvalRate = approveVotes / allVotes.length;

      if (approvalRate >= proposal.voteThreshold) {
        await prisma.councilProposal.update({
          where: { id },
          data: {
            status: 'approved',
            resolvedAt: new Date()
          }
        });
      } else {
        await prisma.councilProposal.update({
          where: { id },
          data: {
            status: 'rejected',
            resolvedAt: new Date()
          }
        });
      }
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        type: 'system',
        agentId,
        title: `Vote: ${vote} on "${proposal.title}"`,
        description: reasoning || `Agent ${agentId} voted ${vote}`,
        metadata: { proposalId: id, vote }
      }
    });

    res.json({ success: true, vote: newVote });
  } catch (error: any) {
    console.error('Error casting vote:', error);
    res.status(500).json({ error: 'Failed to cast vote', details: error.message });
  }
});

// Add discussion comment
router.post('/proposals/:id/discuss', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { agentId, message, discussionType = 'comment', parentId } = req.body;

    if (!agentId || !message) {
      return res.status(400).json({ error: 'agentId and message are required' });
    }

    const proposal = await prisma.councilProposal.findUnique({
      where: { id }
    });

    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    const discussion = await prisma.councilDiscussion.create({
      data: {
        proposalId: id,
        agentId,
        message,
        discussionType,
        parentId
      }
    });

    // Update proposal status to deliberating if still open
    if (proposal.status === 'open') {
      await prisma.councilProposal.update({
        where: { id },
        data: { status: 'deliberating' }
      });
    }

    res.json({ success: true, discussion });
  } catch (error: any) {
    console.error('Error adding discussion:', error);
    res.status(500).json({ error: 'Failed to add discussion', details: error.message });
  }
});

// Withdraw proposal
router.post('/proposals/:id/withdraw', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;

    const proposal = await prisma.councilProposal.findUnique({
      where: { id }
    });

    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    if (proposal.proposedBy !== agentId) {
      return res.status(403).json({ error: 'Only the proposer can withdraw' });
    }

    if (proposal.status === 'approved' || proposal.status === 'rejected') {
      return res.status(400).json({ error: 'Cannot withdraw resolved proposal' });
    }

    await prisma.councilProposal.update({
      where: { id },
      data: {
        status: 'withdrawn',
        resolvedAt: new Date()
      }
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error withdrawing proposal:', error);
    res.status(500).json({ error: 'Failed to withdraw proposal', details: error.message });
  }
});

export default router;
