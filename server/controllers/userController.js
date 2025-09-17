import User from '../models/User.js';
import Question from '../models/Question.js';
import Submission from '../models/Submission.js';

// @desc    Update user's solved problems
// @route   PUT /api/users/progress
// @access  Private
const updateUserProgress = async (req, res) => {
    const { questionId } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            if (!user.solvedProblems.includes(questionId)) {
                user.solvedProblems.push(questionId);
                await user.save();
            }
            res.status(200).json({ solvedProblems: user.solvedProblems });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("ERROR UPDATING PROGRESS:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user's progress stats for dashboard
// @route   GET /api/users/stats
// @access  Private
const getUserStats = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const solvedProblemIds = user.solvedProblems || [];
        const solvedQuestions = await Question.find({ '_id': { $in: solvedProblemIds } });

        let easySolved = 0;
        let mediumSolved = 0;
        let hardSolved = 0;
        const topicCounts = {};

        solvedQuestions.forEach(q => {
            if (q.difficulty === 'Easy') easySolved++;
            if (q.difficulty === 'Medium') mediumSolved++;
            if (q.difficulty === 'Hard') hardSolved++;
            topicCounts[q.topic] = (topicCounts[q.topic] || 0) + 1;
        });
        
        const solvedByTopic = Object.keys(topicCounts).map(topic => ({
            topic: topic,
            count: topicCounts[topic]
        }));

        // totals
        const totalQuestions = await Question.countDocuments({});

        // weekly solved (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const weeklySolved = await Submission.countDocuments({
            user: req.user.id,
            status: 'Accepted',
            createdAt: { $gte: sevenDaysAgo }
        });

        // streak days (consecutive days incl. today with >=1 Accepted per day)
        const acceptedSubs = await Submission.find({ user: req.user.id, status: 'Accepted' })
            .select('createdAt')
            .sort({ createdAt: -1 })
            .lean();

        const dayKey = (d) => {
            const dt = new Date(d);
            return `${dt.getUTCFullYear()}-${dt.getUTCMonth()}-${dt.getUTCDate()}`;
        };
        const daysWithAccepted = new Set(acceptedSubs.map(s => dayKey(s.createdAt)));

        let streakDays = 0;
        const today = new Date();
        // Count back from today
        for (let i = 0; i < 365; i++) { // cap to 1 year for safety
            const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
            d.setUTCDate(d.getUTCDate() - i);
            if (daysWithAccepted.has(dayKey(d))) {
                streakDays += 1;
            } else {
                // If today has no accepted, streak is zero unless there was an acceptance today
                if (i === 0) {
                    streakDays = 0;
                }
                break;
            }
        }

        const weeklyGoal = 10; // default; could be user-configurable later

        const stats = {
            totalSolved: solvedProblemIds.length,
            easySolved,
            mediumSolved,
            hardSolved,
            solvedByTopic,
            totalQuestions,
            weeklySolved,
            weeklyGoal,
            streakDays
        };

        res.status(200).json(stats);
    } catch (error) {
        console.error("ERROR FETCHING STATS:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user's solved problem IDs
// @route   GET /api/users/progress
// @access  Private
const getUserProgress = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('solvedProblems');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.solvedProblems);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Recent submissions for dashboard/activity
// @route   GET /api/users/submissions?limit=10
// @access  Private
const getRecentSubmissions = async (req, res) => {
    try {
        const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 10));
        const submissions = await Submission.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('question', 'title topic difficulty')
            .lean();

        return res.json(submissions.map(s => ({
            _id: s._id,
            status: s.status,
            submittedAt: s.createdAt,
            question: s.question ? {
                _id: s.question._id,
                title: s.question.title,
                topic: s.question.topic,
                difficulty: s.question.difficulty,
            } : null
        })));
    } catch (error) {
        console.error('ERROR FETCHING RECENT SUBMISSIONS:', error);
        return res.status(500).json({ message: 'Server Error' });
    }
};

export { updateUserProgress, getUserStats, getUserProgress, getRecentSubmissions };