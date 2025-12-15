// feed.js - Intégration API pour le fil d'actualité
const POSTS_API_URL = "http://localhost:3000/api/posts";

// Récupérer le token JWT depuis localStorage
function getToken() {
    try {
        return localStorage.getItem('token') || '';
    } catch (e) {
        return '';
    }
}

// Afficher les posts depuis l'API backend
async function loadPostsFromAPI() {
    try {
        const response = await fetch(`${POSTS_API_URL}/timeline`);
        if (!response.ok) {
            console.error('Erreur API:', response.status);
            return [];
        }
        const posts = await response.json();
        return posts || [];
    } catch (error) {
        console.error('Erreur chargement posts:', error);
        return [];
    }
}

// Publier un nouveau post
async function publishPostToAPI(content) {
    const token = getToken();
    
    if (!token) {
        console.error('Pas de token - utilisateur non authentifié');
        return false;
    }

    try {
        const response = await fetch(POSTS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Erreur API:', error.message || error.error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Erreur publication:', error);
        return false;
    }
}

// Fonction pour formater les posts depuis l'API
function formatAPIPost(apiPost) {
    return {
        id: apiPost.id,
        text: apiPost.content,
        ts: new Date(apiPost.created_at).getTime(),
        likes: 0,
        comments: [],
        imageUrl: apiPost.image_url || null,
        imageData: apiPost.image_data || null,
        authorName: apiPost.username || 'Utilisateur',
        authorHandle: `@${apiPost.username || 'user'}`,
        authorInitials: (apiPost.username || 'U').substring(0, 2).toUpperCase(),
        avatarurl: apiPost.avatarurl || 'https://i.pravatar.cc/150'
    };
}

// Intégration avec renderFeed existant
async function loadFeedFromAPI() {
    try {
        const apiPosts = await loadPostsFromAPI();
        const formattedPosts = apiPosts.map(formatAPIPost);
        
        // Fusionner avec les posts locaux si nécessaire
        localState.posts = formattedPosts;
        renderFeed();
    } catch (error) {
        console.error('Erreur fusion posts:', error);
    }
}