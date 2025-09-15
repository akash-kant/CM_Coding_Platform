import User from '../models/User.js';
import Question from '../models/Question.js';

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

        const stats = {
            totalSolved: solvedProblemIds.length,
            easySolved,
            mediumSolved,
            hardSolved,
            solvedByTopic
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

export { updateUserProgress, getUserStats, getUserProgress };