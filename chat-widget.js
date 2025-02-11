(function() {
    // Inject styles
    const styles = `
        .n8n-chat-widget {
            --chat--color-primary: var(--n8n-chat-primary-color, #854fff);
            --chat--color-secondary: var(--n8n-chat-secondary-color, #6b3fd4);
            --chat--color-background: var(--n8n-chat-background-color, #ffffff);
            --chat--color-font: var(--n8n-chat-font-color, #333333);
            font-family: 'Geist Sans', sans-serif;
        }
        .n8n-chat-widget .chat-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            width: 380px;
            height: 600px;
            background: var(--chat--color-background);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(133, 79, 255, 0.15);
            border: 1px solid rgba(133, 79, 255, 0.2);
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    
    // Configuration
    const config = window.ChatWidgetConfig || {
        webhook: { url: '', route: '' },
        branding: { logo: '', name: '', welcomeText: 'Bienvenue ! Comment puis-je vous aider ?', responseTimeText: '' },
        style: { primaryColor: '#854fff', secondaryColor: '#6b3fd4', backgroundColor: '#ffffff', fontColor: '#333333' }
    };
    
    // Création du widget
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'n8n-chat-widget';
    
    const chatContainer = document.createElement('div');
    chatContainer.className = 'chat-container open'; // Ouvre automatiquement le chat
    chatContainer.innerHTML = `
        <div class="brand-header">
            <img src="${config.branding.logo}" alt="${config.branding.name}">
            <span>${config.branding.name}</span>
            <button class="close-button">×</button>
        </div>
        <div class="chat-messages"></div>
        <div class="chat-input">
            <textarea placeholder="Écrivez votre message..."></textarea>
            <button type="submit">Envoyer</button>
        </div>
    `;
    
    widgetContainer.appendChild(chatContainer);
    document.body.appendChild(widgetContainer);
    
    const messagesContainer = chatContainer.querySelector('.chat-messages');
    const textarea = chatContainer.querySelector('textarea');
    const sendButton = chatContainer.querySelector('button[type="submit"]');
    
    async function sendMessage(message) {
        const messageData = { action: "sendMessage", chatInput: message };
        messagesContainer.innerHTML += `<div class='chat-message user'>${message}</div>`;
        
        try {
            const response = await fetch(config.webhook.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messageData)
            });
            const data = await response.json();
            messagesContainer.innerHTML += `<div class='chat-message bot'>${data.output}</div>`;
        } catch (error) {
            console.error('Erreur:', error);
        }
    }
    
    sendButton.addEventListener('click', () => {
        const message = textarea.value.trim();
        if (message) {
            sendMessage(message);
            textarea.value = '';
        }
    });
    
    textarea.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const message = textarea.value.trim();
            if (message) {
                sendMessage(message);
                textarea.value = '';
            }
        }
    });

    // Fermer le chat
    const closeButton = chatContainer.querySelector('.close-button');
    closeButton.addEventListener('click', () => {
        chatContainer.classList.remove('open');
    });
})();
