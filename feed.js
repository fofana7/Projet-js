// feed.js
const POSTS_API_URL = "http://localhost:3000/api/posts";

const FeedManager = {
    elements: {
        postForm: document.getElementById('postForm'),
        postContent: document.getElementById('postContent'),
        postsContainer: document.getElementById('postsContainer')
    },

    init() {
        // Optionnel: protégez la page principale si elle doit être vue uniquement par les utilisateurs connectés
        // window.protectPage(); 
        
        this.bindEvents();
        this.loadTimeline();
    },

    bindEvents() {
        if (this.elements.postForm) {
            this.elements.postForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleNewPost();
            });
        }
    },

    // Crée les headers d'autorisation JWT
    getAuthHeaders() {
        // window.getToken() vient de auth.js
        const token = window.getToken(); 
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        };
    },

    // Récupère le fil d'actualité depuis le Backend (GET /api/posts/timeline)
    async loadTimeline() {
        try {
            const res = await fetch(`${POSTS_API_URL}/timeline`);
            const posts = await res.json();
            
            if (!res.ok) throw new Error(posts.message || "Échec du chargement du fil.");

            this.renderPosts(posts);
        } catch (error) {
            console.error("Erreur de chargement du fil:", error);
            // Afficher un message d'erreur dans l'interface
            this.elements.postsContainer.innerHTML = `<p style="color:red;">Erreur: ${error.message}</p>`;
        }
    },

    // Publie un nouveau post (POST /api/posts)
    async handleNewPost() {
        const content = this.elements.postContent.value.trim();
        if (!content) return alert("Le contenu ne peut être vide.");

        try {
            const res = await fetch(POSTS_API_URL, {
                method: 'POST',
                // --- ENVOI DU JWT POUR CRÉER LE POST ---
                headers: this.getAuthHeaders(),
                // ----------------------------------------
                body: JSON.stringify({ content })
            });
            
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || data.error || "Échec de la publication.");

            // Réussite : vide le champ et recharge le fil d'actualité
            this.elements.postContent.value = ''; 
            this.loadTimeline(); 

        } catch (error) {
            alert(`Erreur de publication: ${error.message}`);
        }
    },

    // Génère le HTML pour les posts (Vue)
    renderPosts(posts) {
        if (!this.elements.postsContainer) return;
        this.elements.postsContainer.innerHTML = ''; 

        if (posts.length === 0) {
             this.elements.postsContainer.innerHTML = '<p>Aucune publication pour l\'instant. Soyez le premier !</p>';
             return;
        }

        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post-card';
            postElement.innerHTML = `
                <div class="post-header">
                    <img src="${post.avatarurl || 'avatar-placeholder.png'}" alt="Avatar" class="post-avatar">
                    <span class="post-author">${post.username}</span>
                    <span class="post-date">${new Date(post.created_at).toLocaleDateString()}</span>
                </div>
                <p class="post-content">${post.content}</p>
                ${post.image_url ? `<img src="${post.image_url}" class="post-image" alt="Post Image">` : ''}
            `;
            this.elements.postsContainer.appendChild(postElement);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    FeedManager.init();
});