const API_URL = "http://localhost:8080/api";

// --- UTILS ---
function toggleAuth() {
    document.getElementById('login-section').classList.toggle('hidden');
    document.getElementById('register-section').classList.toggle('hidden');
}

function timeAgo(dateString) {
    if(!dateString) return "Recently";
    const date = new Date(dateString);
    if(isNaN(date)) return "Recently";

    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "Just now";
}

// --- AUTH ---
function logout() {
    localStorage.removeItem('jwtToken');
    window.location.href = 'index.html';
}

async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('jwtToken');
    if (!token) return null;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };
    return fetch(url, { ...options, headers });
}

async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('jwtToken', data.token);
            window.location.href = 'feed.html';
        } else {
            document.getElementById('login-error').innerText = "Invalid credentials!";
        }
    } catch (e) { console.error(e); }
}

async function register() {
    const user = {
        username: document.getElementById('reg-username').value,
        email: document.getElementById('reg-email').value,
        password: document.getElementById('reg-password').value,
        role: document.getElementById('reg-role').value,
        faculty: document.getElementById('reg-faculty').value,
        department: document.getElementById('reg-dept').value
    };
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        if (response.ok) {
            alert("Account created! Please sign in.");
            toggleAuth();
        } else { document.getElementById('reg-error').innerText = "Registration failed."; }
    } catch (e) { console.error(e); }
}

// --- POSTS & COMMENTS ---

async function loadPosts() {
    const container = document.getElementById('posts-container');
    if(!container) return;

    try {
        const response = await fetchWithAuth(`${API_URL}/posts`);
        const posts = await response.json();
        container.innerHTML = '';

        posts.forEach(post => {
            const author = post.author ? post.author.username : 'Anonymous';
            const time = post.createdAt ? timeAgo(post.createdAt) : 'Recently';

            // Construim HTML-ul pentru postare + secțiunea de comentarii (ascunsă inițial)
            container.innerHTML += `
                <div class="card">
                    <div class="post-header">
                        <div class="user-info"><strong>${author}</strong><span>${time}</span></div>
                    </div>
                    <h3>${post.title || ''}</h3>
                    <p>${post.content}</p>
                    
                    <div class="post-actions">
                        <button class="action-btn" onclick="likePost(${post.id})">❤️ Like</button>
                        <button class="action-btn" onclick="toggleComments(${post.id})">💬 Comments</button>
                    </div>

                    <div id="comments-section-${post.id}" class="hidden" style="margin-top: 15px; border-top: 1px solid #eee; padding-top: 10px;">
                        <div id="comments-list-${post.id}" style="margin-bottom: 10px;">
                            <p style="font-size: 0.8rem; color: #888;">Loading comments...</p>
                        </div>
                        
                        <div style="display: flex; gap: 5px;">
                            <input type="text" id="input-comment-${post.id}" placeholder="Write a comment..." style="margin-bottom: 0; font-size: 0.9rem;">
                            <button class="btn btn-sm" onclick="submitComment(${post.id})">Post</button>
                        </div>
                    </div>
                </div>`;
        });
    } catch (e) { console.error(e); }
}

async function createPost() {
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    if(!content) return;
    await fetchWithAuth(`${API_URL}/posts`, { method: 'POST', body: JSON.stringify({ title, content }) });
    document.getElementById('post-title').value = '';
    document.getElementById('post-content').value = '';
    loadPosts();
}

async function likePost(id) {
    await fetchWithAuth(`${API_URL}/posts/${id}/like`, { method: 'POST' });
    loadPosts();
}

// --- LOGICA PENTRU COMENTARII ---

function toggleComments(postId) {
    const section = document.getElementById(`comments-section-${postId}`);
    section.classList.toggle('hidden');

    // Dacă tocmai am deschis secțiunea, încărcăm comentariile
    if (!section.classList.contains('hidden')) {
        loadComments(postId);
    }
}

async function loadComments(postId) {
    const listContainer = document.getElementById(`comments-list-${postId}`);
    try {
        const response = await fetchWithAuth(`${API_URL}/comments/post/${postId}`);
        if(response.ok) {
            const comments = await response.json();
            listContainer.innerHTML = '';

            if (comments.length === 0) {
                listContainer.innerHTML = '<p style="font-size: 0.8rem; color: #888;">No comments yet.</p>';
                return;
            }

            comments.forEach(comm => {
                const author = comm.author ? comm.author.username : 'User';
                // Stil simplu pentru un comentariu
                listContainer.innerHTML += `
                    <div style="background: #f9fafb; padding: 8px; border-radius: 5px; margin-bottom: 5px; font-size: 0.9rem;">
                        <strong>${author}:</strong> ${comm.content}
                    </div>
                `;
            });
        }
    } catch (error) {
        console.error("Error loading comments", error);
        listContainer.innerHTML = '<p style="color:red;">Error loading comments</p>';
    }
}

async function submitComment(postId) {
    const input = document.getElementById(`input-comment-${postId}`);
    const content = input.value;

    if (!content) return;

    try {
        const response = await fetchWithAuth(`${API_URL}/comments/post/${postId}`, {
            method: 'POST',
            body: JSON.stringify({ content: content })
        });

        if (response.ok) {
            input.value = ''; // Golim inputul
            loadComments(postId); // Reîncărcăm lista ca să vedem noul comentariu
        } else {
            alert("Failed to post comment.");
        }
    } catch (error) {
        console.error(error);
    }
}


// --- RESTUL FUNCȚIILOR (Events, Messages) ---
// (Acestea rămân neschimbate, dar le includem pentru completitudine)

async function loadInbox() {
    const container = document.getElementById('messages-list');
    if(!container) return;
    document.getElementById('tab-inbox').classList.add('active');
    document.getElementById('tab-sent').classList.remove('active');
    try {
        const response = await fetchWithAuth(`${API_URL}/messages/inbox`);
        const msgs = await response.json();
        container.innerHTML = '';
        if(msgs.length === 0) container.innerHTML = '<p>No received messages.</p>';
        msgs.forEach(msg => {
            const senderName = msg.sender ? msg.sender.username : 'Unknown';
            container.innerHTML += `
                <div class="message-card">
                    <div class="message-meta"><strong>From: ${senderName}</strong><span>${timeAgo(msg.sentAt)}</span></div>
                    <div class="message-content">${msg.content}</div>
                </div>`;
        });
    } catch (e) { console.error(e); }
}

async function loadSent() {
    const container = document.getElementById('messages-list');
    document.getElementById('tab-inbox').classList.remove('active');
    document.getElementById('tab-sent').classList.add('active');
    try {
        const response = await fetchWithAuth(`${API_URL}/messages/sent`);
        const msgs = await response.json();
        container.innerHTML = '';
        if(msgs.length === 0) container.innerHTML = '<p>No sent messages.</p>';
        msgs.forEach(msg => {
            const receiverName = msg.receiver ? msg.receiver.username : 'Unknown';
            container.innerHTML += `
                <div class="message-card" style="border-left-color: #9CA3AF;">
                    <div class="message-meta"><strong>To: ${receiverName}</strong><span>${timeAgo(msg.sentAt)}</span></div>
                    <div class="message-content">${msg.content}</div>
                </div>`;
        });
    } catch (e) { console.error(e); }
}

async function sendMessage() {
    const receiverId = document.getElementById('msg-receiver').value;
    const content = document.getElementById('msg-content').value;
    if(!receiverId || !content) return alert("Fill all fields");
    try {
        const response = await fetchWithAuth(`${API_URL}/messages/to/${receiverId}`, {
            method: 'POST',
            body: JSON.stringify({ content: content })
        });
        if(response.ok) {
            alert("Message sent!");
            document.getElementById('msg-content').value = '';
            loadSent();
        } else { alert("Failed. Check ID."); }
    } catch (e) { console.error(e); }
}

async function loadEvents() {
    const container = document.getElementById('events-container');
    if(!container) return;
    try {
        const response = await fetchWithAuth(`${API_URL}/events`);
        const events = await response.json();
        container.innerHTML = '';
        events.forEach(event => {
            const dateObj = new Date(event.date);
            const day = dateObj.getDate();
            const month = dateObj.toLocaleString('default', { month: 'short' });
            container.innerHTML += `
                <div class="card event-card">
                    <div class="event-date-badge"><span class="event-day">${day}</span><span class="event-month">${month}</span></div>
                    <div class="event-details">
                        <h3>${event.title || 'Unnamed Event'}</h3>
                        <p>${event.description || ''}</p>
                        <div class="event-meta"><span>📍 ${event.faculty || 'Campus'}</span></div>
                    </div>
                </div>`;
        });
    } catch (e) { console.error(e); }
}

async function createEvent() {
    // 1. Luăm valorile din HTML
    const titleValue = document.getElementById('evt-name').value; // Titlul
    const dateValue = document.getElementById('evt-date').value;  // Data
    const descValue = document.getElementById('evt-desc').value;  // Descrierea

    // 2. Validare simplă (să nu fie goale)
    if (!titleValue || !dateValue) {
        alert("Titlul și Data sunt obligatorii!");
        return;
    }

    // 3. Construim obiectul EXACT cum îl așteaptă Java (Event.java)
    const eventData = {
        title: titleValue,        // <--- AICI ERA PROBLEMA (trebuie 'title', nu 'name')
        date: dateValue,          // Formatul este YYYY-MM-DD (corect din input date)
        description: descValue,
        faculty: "General"        // Putem pune o valoare default sau să o luăm din profilul userului
    };

    console.log("Se trimite:", eventData); // Debugging: Vezi în consolă ce se trimite

    try {
        const response = await fetchWithAuth(`${API_URL}/events`, {
            method: 'POST',
            body: JSON.stringify(eventData)
        });

        if (response.ok) {
            alert("Eveniment creat cu succes! 🎉");
            // Golim formularul
            document.getElementById('evt-name').value = '';
            document.getElementById('evt-desc').value = '';
            document.getElementById('evt-date').value = '';

            // Reîncărcăm lista
            loadEvents();
        } else {
            // Dacă serverul zice NU, afișăm eroarea
            const errorText = await response.text(); // Uneori eroarea e text, nu JSON
            console.error("Eroare de la server:", errorText);
            alert("Nu s-a putut crea evenimentul. Verifică consola (F12).");
        }
    } catch (e) {
        console.error("Eroare de rețea:", e);
        alert("Eroare de conexiune cu serverul.");
    }
}