// Enhanced UI Features and Interactions
class EnhancedUI {
    constructor() {
        this.networkVisualizer = null;
        this.analytics = null;
        this.memorySystem = null;
        this.smartSuggestions = new SmartSuggestions();
        this.contextualHelp = new ContextualHelp();
        this.performanceMonitor = new PerformanceMonitor();
        this.init();
    }

    init() {
        this.setupEnhancedAnimations();
        this.setupSmartInteractions();
        this.setupPerformanceMonitoring();
        this.setupContextualHelp();
        this.initializeAnalytics();
    }

    setupEnhancedAnimations() {
        // Add micro-interactions to buttons
        document.querySelectorAll('.config-button, .text-button, .chat-button').forEach(button => {
            button.addEventListener('click', (e) => {
                button.classList.add('micro-pulse');
                setTimeout(() => button.classList.remove('micro-pulse'), 600);
            });
        });

        // Add bounce animation to new messages
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.classList.contains('message-container')) {
                        node.classList.add('micro-bounce');
                        setTimeout(() => node.classList.remove('micro-bounce'), 400);
                    }
                });
            });
        });

        observer.observe(document.getElementById('chat-history'), {
            childList: true,
            subtree: true
        });
    }

    setupSmartInteractions() {
        // Enhanced focus management
        document.querySelectorAll('input, textarea, select').forEach(element => {
            element.classList.add('enhanced-focus');
        });

        // Smart scrolling behavior
        this.setupSmartScrolling();
        
        // Intelligent keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    setupSmartScrolling() {
        let isUserScrolling = false;
        let scrollTimeout;

        const chatHistory = document.getElementById('chat-history');
        
        chatHistory.addEventListener('scroll', () => {
            isUserScrolling = true;
            clearTimeout(scrollTimeout);
            
            scrollTimeout = setTimeout(() => {
                isUserScrolling = false;
            }, 1000);
        });

        // Enhanced auto-scroll with smooth transitions
        const originalScrollBehavior = chatHistory.style.scrollBehavior;
        
        window.smartScroll = (force = false) => {
            if (!isUserScrolling || force) {
                chatHistory.style.scrollBehavior = 'smooth';
                chatHistory.scrollTop = chatHistory.scrollHeight;
                setTimeout(() => {
                    chatHistory.style.scrollBehavior = originalScrollBehavior;
                }, 500);
            }
        };
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter: Send message
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                window.sendMessage();
            }
            
            // Ctrl/Cmd + K: Focus input
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('chat-input').focus();
            }
            
            // Ctrl/Cmd + Shift + N: New chat
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
                e.preventDefault();
                window.newChat();
            }
            
            // Ctrl/Cmd + Shift + R: Reset chat
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
                e.preventDefault();
                window.resetChat();
            }
            
            // Escape: Close modals
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    closeAllModals() {
        // Close all open modals
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            const alpineData = Alpine.$data(modal);
            if (alpineData && alpineData.isOpen) {
                alpineData.isOpen = false;
            }
        });
    }

    setupPerformanceMonitoring() {
        this.performanceMonitor.start();
    }

    setupContextualHelp() {
        this.contextualHelp.init();
    }

    initializeAnalytics() {
        this.analytics = new AnalyticsDashboard();
        this.analytics.startRecording();
    }

    // Enhanced visual feedback for user actions
    showActionFeedback(element, type = 'success') {
        const feedback = document.createElement('div');
        feedback.className = `action-feedback ${type}`;
        feedback.innerHTML = type === 'success' ? '✓' : '✗';
        
        const rect = element.getBoundingClientRect();
        feedback.style.position = 'fixed';
        feedback.style.left = `${rect.right - 20}px`;
        feedback.style.top = `${rect.top - 10}px`;
        feedback.style.zIndex = '9999';
        feedback.style.pointerEvents = 'none';
        feedback.style.fontSize = '18px';
        feedback.style.fontWeight = 'bold';
        feedback.style.color = type === 'success' ? '#00ff88' : '#ff6b6b';
        feedback.style.animation = 'feedbackFloat 1s ease-out forwards';
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            document.body.removeChild(feedback);
        }, 1000);
    }

    // Dynamic theme adaptation
    adaptThemeToContent(content) {
        const sentiment = this.analyzeSentiment(content);
        const root = document.documentElement;
        
        if (sentiment.positive > 0.7) {
            root.style.setProperty('--color-accent', '#00ff88');
        } else if (sentiment.negative > 0.7) {
            root.style.setProperty('--color-accent', '#ff6b6b');
        } else {
            root.style.setProperty('--color-accent', '#cf6679');
        }
    }

    analyzeSentiment(text) {
        const positiveWords = ['success', 'complete', 'good', 'excellent', 'perfect', 'done'];
        const negativeWords = ['error', 'failed', 'wrong', 'issue', 'problem', 'bad'];
        
        const words = text.toLowerCase().split(/\W+/);
        const positive = words.filter(word => positiveWords.includes(word)).length;
        const negative = words.filter(word => negativeWords.includes(word)).length;
        const total = words.length;
        
        return {
            positive: positive / total,
            negative: negative / total,
            neutral: (total - positive - negative) / total
        };
    }
}

class SmartSuggestions {
    constructor() {
        this.suggestions = [];
        this.commonCommands = [
            { text: "Create a Python script to", category: "Code" },
            { text: "Search for information about", category: "Research" },
            { text: "Analyze the file", category: "Analysis" },
            { text: "Download and process", category: "Data" },
            { text: "Generate a report on", category: "Report" },
            { text: "Debug the issue with", category: "Debug" },
            { text: "Optimize the performance of", category: "Optimization" },
            { text: "Create a visualization of", category: "Visualization" }
        ];
    }

    getSuggestions(partialInput) {
        if (partialInput.length < 3) return [];
        
        const filtered = this.commonCommands.filter(cmd => 
            cmd.text.toLowerCase().includes(partialInput.toLowerCase()) ||
            cmd.category.toLowerCase().includes(partialInput.toLowerCase())
        );
        
        return filtered.slice(0, 5);
    }

    addToHistory(command) {
        // Learn from user commands
        const words = command.split(' ').slice(0, 4).join(' ');
        if (words.length > 10 && !this.commonCommands.some(cmd => cmd.text === words)) {
            this.commonCommands.unshift({
                text: words,
                category: "Custom",
                usage: 1
            });
            
            // Keep only top 50 commands
            if (this.commonCommands.length > 50) {
                this.commonCommands.pop();
            }
        }
    }
}

class ContextualHelp {
    constructor() {
        this.helpData = {
            'chat-input': {
                title: 'Smart Chat Input',
                content: 'Use natural language to instruct Agent Zero. Try commands like "Create a Python script" or "Search for information about..."',
                shortcuts: ['Ctrl+Enter: Send', 'Ctrl+K: Focus', 'Shift+Enter: New line']
            },
            'agent-network': {
                title: 'Agent Network',
                content: 'Real-time visualization of agent hierarchy and communication flow. Blue nodes are active, red nodes are paused.',
                features: ['Drag nodes to reposition', 'Click for details', 'Live status updates']
            }
        };
    }

    init() {
        this.createHelpTooltips();
        this.setupHelpSystem();
    }

    createHelpTooltips() {
        Object.keys(this.helpData).forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) {
                this.attachTooltip(element, this.helpData[elementId]);
            }
        });
    }

    attachTooltip(element, helpData) {
        let tooltip = null;
        let showTimeout, hideTimeout;

        const showTooltip = (e) => {
            clearTimeout(hideTimeout);
            showTimeout = setTimeout(() => {
                if (tooltip) tooltip.remove();
                
                tooltip = document.createElement('div');
                tooltip.className = 'enhanced-tooltip';
                tooltip.innerHTML = `
                    <h4>${helpData.title}</h4>
                    <p>${helpData.content}</p>
                    ${helpData.shortcuts ? `
                        <div class="tooltip-shortcuts">
                            ${helpData.shortcuts.map(shortcut => `<code>${shortcut}</code>`).join('')}
                        </div>
                    ` : ''}
                `;
                
                document.body.appendChild(tooltip);
                
                // Position tooltip
                const rect = element.getBoundingClientRect();
                tooltip.style.left = `${rect.left}px`;
                tooltip.style.top = `${rect.bottom + 10}px`;
                
                setTimeout(() => tooltip.classList.add('visible'), 10);
            }, 1000);
        };

        const hideTooltip = () => {
            clearTimeout(showTimeout);
            hideTimeout = setTimeout(() => {
                if (tooltip) {
                    tooltip.classList.remove('visible');
                    setTimeout(() => tooltip.remove(), 200);
                }
            }, 100);
        };

        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    }

    setupHelpSystem() {
        // Create floating help button
        const helpButton = document.createElement('button');
        helpButton.className = 'fab help-fab';
        helpButton.innerHTML = '?';
        helpButton.style.bottom = '6rem';
        helpButton.onclick = () => this.openHelpModal();
        
        document.body.appendChild(helpButton);
    }

    openHelpModal() {
        const helpContent = `
            <div class="help-modal-content">
                <h2>Agent Zero Enhanced Features</h2>
                <div class="help-sections">
                    <div class="help-section">
                        <h3>🎯 Smart Commands</h3>
                        <ul>
                            <li>Use natural language for complex tasks</li>
                            <li>Agent Zero learns from your patterns</li>
                            <li>Context-aware suggestions</li>
                        </ul>
                    </div>
                    <div class="help-section">
                        <h3>🔄 Agent Network</h3>
                        <ul>
                            <li>Real-time agent hierarchy visualization</li>
                            <li>Live status and activity monitoring</li>
                            <li>Interactive network manipulation</li>
                        </ul>
                    </div>
                    <div class="help-section">
                        <h3>📊 Advanced Analytics</h3>
                        <ul>
                            <li>Performance metrics and insights</li>
                            <li>Token usage optimization</li>
                            <li>Tool usage statistics</li>
                        </ul>
                    </div>
                    <div class="help-section">
                        <h3>⌨️ Keyboard Shortcuts</h3>
                        <ul>
                            <li><code>Ctrl+Enter</code> - Send message</li>
                            <li><code>Ctrl+K</code> - Focus input</li>
                            <li><code>Ctrl+Shift+N</code> - New chat</li>
                            <li><code>Ctrl+Shift+R</code> - Reset chat</li>
                            <li><code>Escape</code> - Close modals</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
        window.genericModalProxy.openModal('Enhanced Features Help', '', helpContent, ['help-modal']);
    }
}

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            frameRate: [],
            memoryUsage: [],
            loadTimes: []
        };
        this.isMonitoring = false;
    }

    start() {
        this.isMonitoring = true;
        this.monitorFrameRate();
        this.monitorMemoryUsage();
    }

    stop() {
        this.isMonitoring = false;
    }

    monitorFrameRate() {
        let lastTime = performance.now();
        let frameCount = 0;

        const countFrame = (currentTime) => {
            if (!this.isMonitoring) return;

            frameCount++;
            const deltaTime = currentTime - lastTime;

            if (deltaTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / deltaTime);
                this.metrics.frameRate.push({
                    timestamp: Date.now(),
                    fps: fps
                });

                // Keep only last 60 entries (1 minute at 1fps)
                if (this.metrics.frameRate.length > 60) {
                    this.metrics.frameRate.shift();
                }

                frameCount = 0;
                lastTime = currentTime;
            }

            requestAnimationFrame(countFrame);
        };

        requestAnimationFrame(countFrame);
    }

    monitorMemoryUsage() {
        if (!performance.memory) return;

        const collectMemoryStats = () => {
            if (!this.isMonitoring) return;

            this.metrics.memoryUsage.push({
                timestamp: Date.now(),
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            });

            // Keep only last 120 entries (10 minutes at 5s intervals)
            if (this.metrics.memoryUsage.length > 120) {
                this.metrics.memoryUsage.shift();
            }

            setTimeout(collectMemoryStats, 5000);
        };

        collectMemoryStats();
    }

    getHealthScore() {
        const recentFrameRate = this.metrics.frameRate.slice(-10);
        const avgFps = recentFrameRate.length > 0 
            ? recentFrameRate.reduce((sum, entry) => sum + entry.fps, 0) / recentFrameRate.length 
            : 60;

        const recentMemory = this.metrics.memoryUsage.slice(-5);
        const avgMemoryUsage = recentMemory.length > 0
            ? recentMemory.reduce((sum, entry) => sum + (entry.used / entry.total), 0) / recentMemory.length
            : 0.5;

        // Calculate health score (0-100)
        let score = 100;
        
        // Penalize low frame rate
        if (avgFps < 30) score -= 30;
        else if (avgFps < 45) score -= 15;
        
        // Penalize high memory usage
        if (avgMemoryUsage > 0.9) score -= 25;
        else if (avgMemoryUsage > 0.7) score -= 10;

        return Math.max(0, Math.min(100, score));
    }
}

class ContextualHelp {
    constructor() {
        this.currentContext = null;
        this.helpHistory = [];
    }

    init() {
        this.trackUserBehavior();
        this.setupProactiveHelp();
    }

    trackUserBehavior() {
        // Track clicks on various elements
        document.addEventListener('click', (e) => {
            const element = e.target.closest('[data-help]');
            if (element) {
                this.showContextualHelp(element, element.dataset.help);
            }
        });

        // Track form interactions
        document.addEventListener('focusin', (e) => {
            if (e.target.matches('input, textarea, select')) {
                this.currentContext = e.target.id || e.target.name;
            }
        });
    }

    setupProactiveHelp() {
        // Show help after periods of inactivity
        let inactivityTimer;
        let lastActivity = Date.now();

        const resetTimer = () => {
            lastActivity = Date.now();
            clearTimeout(inactivityTimer);
            
            inactivityTimer = setTimeout(() => {
                this.showProactiveHelp();
            }, 30000); // Show help after 30 seconds of inactivity
        };

        document.addEventListener('mousemove', resetTimer);
        document.addEventListener('keypress', resetTimer);
        document.addEventListener('click', resetTimer);
        
        resetTimer();
    }

    showContextualHelp(element, helpKey) {
        const helpData = this.getHelpForContext(helpKey);
        if (!helpData) return;

        const helpPopup = document.createElement('div');
        helpPopup.className = 'contextual-help-popup';
        helpPopup.innerHTML = `
            <div class="help-content">
                <h4>${helpData.title}</h4>
                <p>${helpData.description}</p>
                ${helpData.tips ? `
                    <div class="help-tips">
                        <strong>Tips:</strong>
                        <ul>${helpData.tips.map(tip => `<li>${tip}</li>`).join('')}</ul>
                    </div>
                ` : ''}
            </div>
            <button class="help-close" onclick="this.parentElement.remove()">×</button>
        `;

        // Position near the element
        const rect = element.getBoundingClientRect();
        helpPopup.style.position = 'fixed';
        helpPopup.style.left = `${rect.right + 10}px`;
        helpPopup.style.top = `${rect.top}px`;
        helpPopup.style.zIndex = '10000';

        document.body.appendChild(helpPopup);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (helpPopup.parentElement) {
                helpPopup.remove();
            }
        }, 10000);
    }

    showProactiveHelp() {
        const tips = [
            "💡 Try using voice input by clicking the microphone button!",
            "🎯 Use the agent network view to see how your agents are working together.",
            "📊 Check the analytics dashboard to optimize your workflow.",
            "⌨️ Use Ctrl+Enter to quickly send messages.",
            "🔍 Explore the enhanced memory system for better context awareness."
        ];

        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        window.toast(randomTip, 'info', 8000);
    }

    getHelpForContext(helpKey) {
        const helpDatabase = {
            'agent-network': {
                title: 'Agent Network Visualization',
                description: 'This view shows the real-time hierarchy and communication between your agents.',
                tips: [
                    'Blue nodes indicate active agents',
                    'Red nodes show paused agents',
                    'Line thickness represents communication strength',
                    'Drag nodes to reorganize the view'
                ]
            },
            'analytics': {
                title: 'Performance Analytics',
                description: 'Monitor your Agent Zero performance and usage patterns.',
                tips: [
                    'Track token usage to optimize costs',
                    'Monitor response times for performance tuning',
                    'Analyze tool usage patterns',
                    'Export data for detailed analysis'
                ]
            },
            'enhanced-memory': {
                title: 'Enhanced Memory System',
                description: 'Advanced memory management with semantic clustering and relationship mapping.',
                tips: [
                    'Memories are automatically clustered by concepts',
                    'Related memories are linked for better context',
                    'Search supports semantic similarity',
                    'Temporal indexing enables time-based queries'
                ]
            }
        };

        return helpDatabase[helpKey];
    }
}

// CSS for enhanced animations
const enhancedAnimationCSS = `
    @keyframes feedbackFloat {
        0% {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
        100% {
            opacity: 0;
            transform: translateY(-30px) scale(1.2);
        }
    }

    .contextual-help-popup {
        background: var(--color-panel);
        border: 1px solid var(--color-border);
        border-radius: 8px;
        padding: 1rem;
        max-width: 300px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        animation: modalSlideIn 0.3s ease;
        position: relative;
    }

    .help-close {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        color: var(--color-text);
        opacity: 0.7;
    }

    .help-close:hover {
        opacity: 1;
    }

    .help-content h4 {
        margin: 0 0 0.5rem 0;
        color: var(--color-primary);
    }

    .help-content p {
        margin: 0 0 1rem 0;
        font-size: 0.9rem;
        line-height: 1.4;
    }

    .help-tips {
        font-size: 0.85rem;
    }

    .help-tips ul {
        margin: 0.5rem 0 0 0;
        padding-left: 1.5rem;
    }

    .help-tips li {
        margin-bottom: 0.25rem;
    }

    .help-fab {
        background: linear-gradient(135deg, #9c27b0, #673ab7) !important;
    }

    .help-modal .help-sections {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
    }

    .help-section {
        background: var(--color-background);
        padding: 1rem;
        border-radius: 8px;
        border: 1px solid var(--color-border);
    }

    .help-section h3 {
        margin: 0 0 1rem 0;
        color: var(--color-primary);
    }

    .help-section ul {
        margin: 0;
        padding-left: 1.5rem;
    }

    .help-section li {
        margin-bottom: 0.5rem;
        line-height: 1.4;
    }

    .help-section code {
        background: var(--color-secondary);
        padding: 0.2rem 0.4rem;
        border-radius: 3px;
        font-size: 0.85rem;
    }
`;

// Inject CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = enhancedAnimationCSS;
document.head.appendChild(styleSheet);

// Initialize enhanced UI
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedUI = new EnhancedUI();
});

// Export for global use
window.EnhancedUI = EnhancedUI;