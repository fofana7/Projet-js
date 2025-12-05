// backend/controllers/friendsController.js

let users = [
    { id: "1", name: "Alice", friends: ["2"], requests: [] },
    { id: "2", name: "Bob", friends: ["1"], requests: ["3"] },
    { id: "3", name: "Charlie", friends: [], requests: [] },
];

module.exports = {
    getAllUsers: (req, res) => {
        res.json(users);
    },

    sendFriendRequest: (req, res) => {
        const { fromId, toId } = req.body;

        const target = users.find(u => u.id === toId);
        if (!target) return res.status(404).json({ error: "Utilisateur introuvable" });

        if (!target.requests.includes(fromId))
            target.requests.push(fromId);

        res.json({ success: true });
    },

    acceptFriendRequest: (req, res) => {
        const { userId, fromId } = req.body;

        const user = users.find(u => u.id === userId);
        const from = users.find(u => u.id === fromId);

        user.friends.push(fromId);
        from.friends.push(userId);

        user.requests = user.requests.filter(r => r !== fromId);

        res.json({ success: true });
    },

    removeFriend: (req, res) => {
        const { userId, friendId } = req.body;

        let user = users.find(u => u.id === userId);
        let friend = users.find(u => u.id === friendId);

        user.friends = user.friends.filter(id => id !== friendId);
        friend.friends = friend.friends.filter(id => id !== userId);

        res.json({ success: true });
    }
};
