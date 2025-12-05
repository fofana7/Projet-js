// backend/controllers/messageController.js

let conversations = [];  // tu remplaceras ça par ta base de données plus tard

module.exports = {
    getPrivateMessages: (req, res) => {
        res.json(conversations);
    },

    sendMessage: (req, res) => {
        const { convId, authorId, author, text, fileUrl } = req.body;

        const message = {
            id: crypto.randomUUID(),
            author,
            authorId,
            text,
            fileUrl,
            ts: Date.now()
        };

        let conv = conversations.find(c => c.id === convId);
        if (!conv) return res.status(404).json({ error: "Conversation non trouvée" });

        conv.messages.push(message);
        conv.lastTs = message.ts;

        res.json({ success: true, message });
    }
};
