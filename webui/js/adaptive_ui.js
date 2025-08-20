// Adaptive and Intelligent UI Components
class AdaptiveUI {
    constructor() {
        this.userPreferences = this.loadUserPreferences();
        this.usagePatterns = new Map();
        this.adaptiveElements = new Map();
        this.intelligentSuggestions = new IntelligentSuggestions();
        this.contextualAdaptation = new ContextualAdaptation();
        this.init();
    }

    init() {
        this.setupAdaptiveElements();
        this.trackUserBehavior();
        this.setupIntelligentFeatures();
        this.startAdaptationEngine();
    }

    loadUserPreferences() {
        const stored = localStorage.getItem('agentZeroUserPreferences');
        return stored ? JSON.parse(stored) : {
            preferredTools: [],
            commonCommands: [],
            workflowPreferences: {},
            uiCustomizations: {},
            learningEnabled: true
        };
    }

    saveUserPreferences() {
        localStorage.setItem('agentZeroUserPreferences', JSON.stringify(this.userPreferences));
    }

    setupAdaptiveElements() {
        // Adaptive chat input with smart suggestions
        this.setupAdaptiveChatInput();
        
        // Dynamic toolbar based on usage
        this.setupDynamicToolbar();
        
        // Contextual sidebars
        this.setupContextualSidebars();
        
        // Adaptive themes
        this.setupAdaptiveThemes();
    }

    setupAdaptiveChatInput() {
        const chatInput = document.getElementById('chat-input');
        if (!chatInput) return;

        let suggestionContainer = document.getElementById('smart-suggestions');
        if (!suggestionContainer) {
            suggestionContainer = document.createElement('div');
            suggestionContainer.id = 'smart-suggestions';
            suggestionContainer.className = 'input-suggestions';
            chatInput.parentNode.insertBefore(suggestionContainer, chatInput);
        }

        // Smart autocomplete based on user patterns
        let debounceTimer;
        chatInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this.updateSmartSuggestions(e.target.value, suggestionContainer);
            }, 300);
        });

        // Hide suggestions when input loses focus
        chatInput.addEventListener('blur', () => {
            setTimeout(() => {
                suggestionContainer.classList.remove('visible');
            }, 150);
        });

        // Show suggestions when input gains focus
        chatInput.addEventListener('focus', () => {
            if (chatInput.value.length > 2) {
                this.updateSmartSuggestions(chatInput.value, suggestionContainer);
            }
        });
    }

    updateSmartSuggestions(input, container) {
        const suggestions = this.intelligentSuggestions.generateSuggestions(input);
        
        if (suggestions.length === 0) {
            container.classList.remove('visible');
            return;
        }

        container.innerHTML = suggestions.map((suggestion, index) => `
            <div class="suggestion-item ${index === 0 ? 'selected' : ''}" 
                 data-suggestion="${suggestion.text}">
                <div class="suggestion-icon">${suggestion.icon}</div>
                <div class="suggestion-content">
                    <div class="suggestion-text">${suggestion.text}</div>
                    <div class="suggestion-category">${suggestion.category}</div>
                </div>
                <div class="suggestion-score">${Math.round(suggestion.score)}%</div>
            </div>
        `).join('');

        // Add click handlers
        container.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const chatInput = document.getElementById('chat-input');
                chatInput.value = item.dataset.suggestion;
                container.classList.remove('visible');
                chatInput.focus();
            });
        });

        container.classList.add('visible');
    }

    setupDynamicToolbar() {
        const toolbarContainer = document.querySelector('.text-buttons-row');
        if (!toolbarContainer) return;

        // Analyze most used tools and prioritize them
        this.updateToolbarBasedOnUsage();
        
        // Update toolbar every 5 minutes
        setInterval(() => {
            this.updateToolbarBasedOnUsage();
        }, 5 * 60 * 1000);
    }

    updateToolbarBasedOnUsage() {
        const toolUsage = this.userPreferences.preferredTools;
        const toolbarContainer = document.querySelector('.text-buttons-row');
        
        if (!toolbarContainer || toolUsage.length === 0) return;

        // Sort tools by usage and show most used ones first
        const sortedTools = [...toolUsage].sort((a, b) => b.usage - a.usage);
        
        // Reorganize toolbar buttons
        const buttons = Array.from(toolbarContainer.children);
        buttons.forEach(button => {
            const toolName = button.textContent.trim();
            const usage = sortedTools.find(t => t.name === toolName);
            if (usage) {
                button.style.order = -usage.usage; // Higher usage = lower order (appears first)
                button.classList.add('frequently-used');
            }
        });
    }

    setupContextualSidebars() {
        // Create dynamic context sidebar
        const sidebar = document.createElement('div');
        sidebar.id = 'contextual-sidebar';
        sidebar.className = 'context-sidebar';
        sidebar.innerHTML = `
            <div class="context-section">
                <h4>Context Insights</h4>
                <div id="context-insights"></div>
            </div>
            <div class="context-section">
                <h4>Suggested Actions</h4>
                <div id="suggested-actions"></div>
            </div>
            <div class="context-section">
                <h4>Performance</h4>
                <div id="performance-indicators"></div>
            </div>
        `;
        
        document.body.appendChild(sidebar);
        
        // Update context information periodically
        this.updateContextualSidebar();
        setInterval(() => this.updateContextualSidebar(), 10000);
    }

    async updateContextualSidebar() {
        const sidebar = document.getElementById('contextual-sidebar');
        if (!sidebar) return;

        // Get current context insights
        const insights = await this.contextualAdaptation.getContextInsights();
        
        // Update insights section
        const insightsContainer = sidebar.querySelector('#context-insights');
        insightsContainer.innerHTML = insights.map(insight => `
            <div class="insight-item ${insight.type}">
                <div class="insight-icon">${insight.icon}</div>
                <div class="insight-text">${insight.text}</div>
            </div>
        `).join('');

        // Update suggested actions
        const actionsContainer = sidebar.querySelector('#suggested-actions');
        const actions = this.intelligentSuggestions.getSuggestedActions();
        actionsContainer.innerHTML = actions.map(action => `
            <button class="suggested-action" onclick="window.enhancedUI.executeAction('${action.id}')">
                ${action.icon} ${action.text}
            </button>
        `).join('');

        // Update performance indicators
        const performanceContainer = sidebar.querySelector('#performance-indicators');
        const performance = await this.getPerformanceIndicators();
        performanceContainer.innerHTML = `
            <div class="performance-meter">
                <label>Efficiency</label>
                <div class="performance-bar">
                    <div class="performance-fill" style="width: ${performance.efficiency}%"></div>
                </div>
                <span class="performance-value">${performance.efficiency}%</span>
            </div>
            <div class="performance-meter">
                <label>Speed</label>
                <div class="performance-bar">
                    <div class="performance-fill" style="width: ${performance.speed}%"></div>
                </div>
                <span class="performance-value">${performance.speed}%</span>
            </div>
        `;
    }

    setupAdaptiveThemes() {
        // Dynamic theme adaptation based on content and time
        this.adaptThemeToContext();
        
        // Update theme every minute
        setInterval(() => {
            this.adaptThemeToContext();
        }, 60000);
    }

    adaptThemeToContext() {
        const hour = new Date().getHours();
        const root = document.documentElement;
        
        // Time-based theme adaptation
        if (hour >= 22 || hour <= 6) {
            // Night mode - darker, warmer colors
            root.style.setProperty('--color-background', '#0a0a0a');
            root.style.setProperty('--color-panel', '#141414');
        } else if (hour >= 6 && hour <= 8) {
            // Morning mode - energetic colors
            root.style.setProperty('--color-accent', '#00ff88');
        } else if (hour >= 18 && hour <= 22) {
            // Evening mode - relaxed colors
            root.style.setProperty('--color-accent', '#9c27b0');
        }

        // Content-based adaptation
        const messages = document.querySelectorAll('.message-container');
        const recentMessages = Array.from(messages).slice(-5);
        
        let errorCount = 0;
        let successCount = 0;
        
        recentMessages.forEach(msg => {
            if (msg.querySelector('.message-error')) errorCount++;
            if (msg.querySelector('.message-agent-response')) successCount++;
        });

        if (errorCount > successCount) {
            root.style.setProperty('--color-accent', '#ff6b6b');
        } else if (successCount > 0) {
            root.style.setProperty('--color-accent', '#00ff88');
        }
    }

    trackUserBehavior() {
        // Track clicks
        document.addEventListener('click', (e) => {
            this.recordUserAction('click', {
                element: e.target.tagName,
                class: e.target.className,
                id: e.target.id
            });
        });

        // Track tool usage
        const originalSendMessage = window.sendMessage;
        window.sendMessage = (...args) => {
            this.recordUserAction('message_sent', {
                timestamp: Date.now(),
                inputLength: document.getElementById('chat-input').value.length
            });
            return originalSendMessage.apply(this, args);
        };

        // Track modal usage
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.classList.contains('modal-overlay')) {
                        this.recordUserAction('modal_opened', {
                            modalType: node.id || 'unknown'
                        });
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    recordUserAction(action, data) {
        const timestamp = Date.now();
        const actionKey = `${action}_${timestamp}`;
        
        this.usagePatterns.set(actionKey, {
            action,
            data,
            timestamp
        });

        // Learn from user patterns
        this.learnFromAction(action, data);

        // Keep only recent patterns (last 24 hours)
        const cutoff = timestamp - (24 * 60 * 60 * 1000);
        for (let [key, pattern] of this.usagePatterns) {
            if (pattern.timestamp < cutoff) {
                this.usagePatterns.delete(key);
            }
        }
    }

    learnFromAction(action, data) {
        if (!this.userPreferences.learningEnabled) return;

        // Learn tool preferences
        if (action === 'message_sent') {
            // Analyze the message content for tool hints
            const input = document.getElementById('chat-input').value.toLowerCase();
            
            const toolHints = {
                'code_execution_tool': ['code', 'python', 'script', 'run', 'execute'],
                'knowledge_tool': ['search', 'find', 'information', 'research', 'lookup'],
                'browser_tool': ['website', 'web', 'browse', 'navigate', 'click'],
                'memory_tool': ['remember', 'save', 'memorize', 'recall', 'forget']
            };

            Object.entries(toolHints).forEach(([tool, hints]) => {
                if (hints.some(hint => input.includes(hint))) {
                    this.updateToolPreference(tool);
                }
            });
        }

        // Learn command patterns
        if (action === 'message_sent' && data.inputLength > 10) {
            const command = document.getElementById('chat-input').value.substring(0, 50);
            this.addToCommandHistory(command);
        }

        this.saveUserPreferences();
    }

    updateToolPreference(toolName) {
        let tool = this.userPreferences.preferredTools.find(t => t.name === toolName);
        if (tool) {
            tool.usage++;
            tool.lastUsed = Date.now();
        } else {
            this.userPreferences.preferredTools.push({
                name: toolName,
                usage: 1,
                lastUsed: Date.now()
            });
        }

        // Keep only top 20 tools
        this.userPreferences.preferredTools.sort((a, b) => b.usage - a.usage);
        this.userPreferences.preferredTools = this.userPreferences.preferredTools.slice(0, 20);
    }

    addToCommandHistory(command) {
        if (!this.userPreferences.commonCommands.includes(command)) {
            this.userPreferences.commonCommands.unshift(command);
            
            // Keep only 50 recent commands
            this.userPreferences.commonCommands = this.userPreferences.commonCommands.slice(0, 50);
        }
    }

    setupIntelligentFeatures() {
        this.setupSmartCompletion();
        this.setupPredictiveActions();
        this.setupAdaptiveLayouts();
    }

    setupSmartCompletion() {
        const chatInput = document.getElementById('chat-input');
        if (!chatInput) return;

        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && !e.shiftKey) {
                e.preventDefault();
                this.completeCurrentInput();
            }
        });
    }

    completeCurrentInput() {
        const chatInput = document.getElementById('chat-input');
        const currentValue = chatInput.value;
        const completion = this.intelligentSuggestions.getSmartCompletion(currentValue);
        
        if (completion && completion !== currentValue) {
            chatInput.value = completion;
            
            // Show completion feedback
            this.showCompletionFeedback(chatInput);
        }
    }

    showCompletionFeedback(element) {
        element.classList.add('smart-completed');
        setTimeout(() => {
            element.classList.remove('smart-completed');
        }, 1000);
    }

    setupPredictiveActions() {
        // Predict next likely actions based on current context
        this.startPredictiveEngine();
    }

    startPredictiveEngine() {
        setInterval(() => {
            this.updatePredictiveActions();
        }, 5000);
    }

    updatePredictiveActions() {
        const currentContext = this.analyzeCurrentContext();
        const predictions = this.predictNextActions(currentContext);
        
        this.updatePredictiveUI(predictions);
    }

    analyzeCurrentContext() {
        const lastMessages = Array.from(document.querySelectorAll('.message-container')).slice(-3);
        const context = {
            messageTypes: lastMessages.map(msg => {
                const classes = Array.from(msg.classList);
                return classes.find(cls => cls.startsWith('message-')) || 'unknown';
            }),
            hasErrors: lastMessages.some(msg => msg.querySelector('.message-error')),
            isWaitingForResponse: document.querySelector('.shiny-text') !== null,
            inputLength: document.getElementById('chat-input').value.length
        };

        return context;
    }

    predictNextActions(context) {
        const predictions = [];

        if (context.hasErrors) {
            predictions.push({
                action: 'debug_help',
                text: 'Debug assistance',
                icon: '🔧',
                probability: 0.8
            });
        }

        if (context.isWaitingForResponse) {
            predictions.push({
                action: 'pause_agent',
                text: 'Pause current task',
                icon: '⏸️',
                probability: 0.6
            });
        }

        if (context.inputLength > 100) {
            predictions.push({
                action: 'expand_input',
                text: 'Open full editor',
                icon: '📝',
                probability: 0.7
            });
        }

        return predictions.sort((a, b) => b.probability - a.probability);
    }

    updatePredictiveUI(predictions) {
        let predictiveContainer = document.getElementById('predictive-actions');
        
        if (!predictiveContainer) {
            predictiveContainer = document.createElement('div');
            predictiveContainer.id = 'predictive-actions';
            predictiveContainer.className = 'predictive-actions-container';
            
            const inputSection = document.getElementById('input-section');
            inputSection.appendChild(predictiveContainer);
        }

        if (predictions.length === 0) {
            predictiveContainer.style.display = 'none';
            return;
        }

        predictiveContainer.style.display = 'flex';
        predictiveContainer.innerHTML = predictions.slice(0, 3).map(prediction => `
            <button class="predictive-action" 
                    onclick="window.enhancedUI.executePredictedAction('${prediction.action}')"
                    title="Confidence: ${Math.round(prediction.probability * 100)}%">
                ${prediction.icon} ${prediction.text}
            </button>
        `).join('');
    }

    setupAdaptiveLayouts() {
        // Adapt layout based on screen size and usage patterns
        this.optimizeLayoutForUser();
        
        window.addEventListener('resize', () => {
            this.optimizeLayoutForUser();
        });
    }

    optimizeLayoutForUser() {
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight,
            aspectRatio: window.innerWidth / window.innerHeight
        };

        // Adapt for different screen sizes
        if (viewport.width < 768) {
            this.enableMobileOptimizations();
        } else if (viewport.width > 1920) {
            this.enableWideScreenOptimizations();
        }

        // Adapt based on usage patterns
        const recentActions = Array.from(this.usagePatterns.values())
            .filter(pattern => pattern.timestamp > Date.now() - 3600000) // Last hour
            .map(pattern => pattern.action);

        if (recentActions.filter(action => action === 'modal_opened').length > 5) {
            // User frequently opens modals, make them more accessible
            this.enhanceModalAccessibility();
        }
    }

    enableMobileOptimizations() {
        document.body.classList.add('mobile-optimized');
        
        // Larger touch targets
        document.querySelectorAll('.chat-button, .text-button').forEach(button => {
            button.style.minHeight = '44px';
            button.style.minWidth = '44px';
        });
    }

    enableWideScreenOptimizations() {
        document.body.classList.add('widescreen-optimized');
        
        // Use extra space effectively
        const rightPanel = document.getElementById('right-panel');
        if (rightPanel) {
            rightPanel.style.maxWidth = '1200px';
            rightPanel.style.margin = '0 auto';
        }
    }

    enhanceModalAccessibility() {
        // Add keyboard shortcuts for frequently used modals
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'h':
                        e.preventDefault();
                        window.openHistoryModal();
                        break;
                    case 'm':
                        e.preventDefault();
                        window.fileBrowserModalProxy.openModal();
                        break;
                    case ',':
                        e.preventDefault();
                        window.settingsModalProxy.openModal();
                        break;
                }
            }
        });
    }

    startAdaptationEngine() {
        // Continuously adapt UI based on usage patterns
        setInterval(() => {
            this.adaptBasedOnPatterns();
        }, 30000); // Every 30 seconds
    }

    adaptBasedOnPatterns() {
        const patterns = this.analyzeUsagePatterns();
        
        // Adapt based on discovered patterns
        patterns.forEach(pattern => {
            switch (pattern.type) {
                case 'frequent_errors':
                    this.enableErrorPreventionFeatures();
                    break;
                case 'long_sessions':
                    this.enableFocusMode();
                    break;
                case 'frequent_interruptions':
                    this.enableQuickActions();
                    break;
            }
        });
    }

    analyzeUsagePatterns() {
        const patterns = [];
        const recentActions = Array.from(this.usagePatterns.values())
            .filter(pattern => pattern.timestamp > Date.now() - 3600000); // Last hour

        // Detect error frequency
        const errorMessages = document.querySelectorAll('.message-error');
        if (errorMessages.length > 3) {
            patterns.push({ type: 'frequent_errors', confidence: 0.8 });
        }

        // Detect session length
        const sessionDuration = Date.now() - this.userPreferences.sessionStart;
        if (sessionDuration > 2 * 60 * 60 * 1000) { // 2 hours
            patterns.push({ type: 'long_sessions', confidence: 0.9 });
        }

        // Detect interruption patterns
        const pauseActions = recentActions.filter(action => action.action === 'pause_agent');
        if (pauseActions.length > 2) {
            patterns.push({ type: 'frequent_interruptions', confidence: 0.7 });
        }

        return patterns;
    }

    enableErrorPreventionFeatures() {
        // Add real-time validation to inputs
        this.setupInputValidation();
        
        // Show proactive error hints
        this.enableProactiveHints();
    }

    enableFocusMode() {
        // Minimize distractions for long sessions
        document.body.classList.add('focus-mode');
        
        // Hide non-essential UI elements
        document.querySelectorAll('.message-util').forEach(msg => {
            msg.style.display = 'none';
        });
    }

    enableQuickActions() {
        // Add quick action buttons
        this.addQuickActionBar();
    }

    addQuickActionBar() {
        let quickBar = document.getElementById('quick-actions-bar');
        
        if (!quickBar) {
            quickBar = document.createElement('div');
            quickBar.id = 'quick-actions-bar';
            quickBar.className = 'quick-actions-bar';
            quickBar.innerHTML = `
                <button onclick="window.pauseAgent(true)" title="Quick Pause">⏸️</button>
                <button onclick="window.resetChat()" title="Quick Reset">🔄</button>
                <button onclick="window.newChat()" title="New Chat">➕</button>
            `;
            
            const inputSection = document.getElementById('input-section');
            inputSection.insertBefore(quickBar, inputSection.firstChild);
        }
    }

    async getPerformanceIndicators() {
        // Calculate real-time performance indicators
        const recentMessages = Array.from(document.querySelectorAll('.message-container')).slice(-10);
        
        let efficiency = 100;
        let speed = 100;

        // Calculate efficiency based on error rate
        const errorMessages = recentMessages.filter(msg => msg.querySelector('.message-error'));
        efficiency -= (errorMessages.length / recentMessages.length) * 50;

        // Calculate speed based on response times (estimated)
        const progressElement = document.getElementById('progress-bar-h');
        if (progressElement && progressElement.textContent.trim()) {
            speed = Math.max(20, speed - 30); // Assume slower when processing
        }

        return {
            efficiency: Math.round(Math.max(0, efficiency)),
            speed: Math.round(Math.max(0, speed))
        };
    }

    executeAction(actionId) {
        // Execute predicted actions
        switch (actionId) {
            case 'debug_help':
                this.showDebugHelp();
                break;
            case 'pause_agent':
                window.pauseAgent(true);
                break;
            case 'expand_input':
                window.fullScreenInputModalProxy.openModal();
                break;
            default:
                console.log(`Unknown action: ${actionId}`);
        }
    }

    executePredictedAction(actionId) {
        this.executeAction(actionId);
        
        // Record that the prediction was used
        this.recordUserAction('predicted_action_used', { actionId });
    }

    showDebugHelp() {
        const debugContent = `
            <div class="debug-help-content">
                <h3>🔧 Debug Assistant</h3>
                <div class="debug-sections">
                    <div class="debug-section">
                        <h4>Recent Errors</h4>
                        <div id="recent-errors"></div>
                    </div>
                    <div class="debug-section">
                        <h4>Suggested Solutions</h4>
                        <div id="suggested-solutions"></div>
                    </div>
                    <div class="debug-section">
                        <h4>Quick Fixes</h4>
                        <div id="quick-fixes"></div>
                    </div>
                </div>
            </div>
        `;
        
        window.genericModalProxy.openModal('Debug Assistant', '', debugContent, ['debug-modal']);
        
        // Populate debug information
        setTimeout(() => {
            this.populateDebugInfo();
        }, 100);
    }

    populateDebugInfo() {
        // Analyze recent errors
        const errorMessages = Array.from(document.querySelectorAll('.message-error'));
        const recentErrors = errorMessages.slice(-3);
        
        const errorsContainer = document.getElementById('recent-errors');
        if (errorsContainer) {
            errorsContainer.innerHTML = recentErrors.map((errorMsg, index) => `
                <div class="error-item">
                    <div class="error-text">${errorMsg.textContent.substring(0, 100)}...</div>
                    <button onclick="window.enhancedUI.analyzeError(${index})">Analyze</button>
                </div>
            `).join('') || '<p>No recent errors found.</p>';
        }

        // Generate suggested solutions
        const solutionsContainer = document.getElementById('suggested-solutions');
        if (solutionsContainer) {
            const solutions = this.generateErrorSolutions(recentErrors);
            solutionsContainer.innerHTML = solutions.map(solution => `
                <div class="solution-item">
                    <div class="solution-icon">${solution.icon}</div>
                    <div class="solution-text">${solution.text}</div>
                    <button onclick="window.enhancedUI.applySolution('${solution.id}')">Apply</button>
                </div>
            `).join('') || '<p>No specific solutions available.</p>';
        }

        // Add quick fixes
        const fixesContainer = document.getElementById('quick-fixes');
        if (fixesContainer) {
            fixesContainer.innerHTML = `
                <button class="quick-fix-btn" onclick="window.resetChat()">🔄 Reset Conversation</button>
                <button class="quick-fix-btn" onclick="window.pauseAgent(false)">▶️ Resume Agent</button>
                <button class="quick-fix-btn" onclick="window.nudge()">👋 Nudge Agent</button>
            `;
        }
    }

    generateErrorSolutions(errorMessages) {
        // Intelligent error analysis and solution generation
        const solutions = [];
        
        errorMessages.forEach((errorMsg, index) => {
            const errorText = errorMsg.textContent.toLowerCase();
            
            if (errorText.includes('connection') || errorText.includes('network')) {
                solutions.push({
                    id: `network_${index}`,
                    icon: '🌐',
                    text: 'Check network connection and try again',
                    action: 'check_network'
                });
            }
            
            if (errorText.includes('memory') || errorText.includes('limit')) {
                solutions.push({
                    id: `memory_${index}`,
                    icon: '🧠',
                    text: 'Clear conversation history to free memory',
                    action: 'clear_memory'
                });
            }
            
            if (errorText.includes('timeout') || errorText.includes('slow')) {
                solutions.push({
                    id: `performance_${index}`,
                    icon: '⚡',
                    text: 'Switch to a faster model for better performance',
                    action: 'optimize_performance'
                });
            }
        });

        return solutions;
    }

    applySolution(solutionId) {
        const [type, index] = solutionId.split('_');
        
        switch (type) {
            case 'network':
                window.toast('Checking network connection...', 'info');
                // Trigger connection check
                window.sendJsonData('/health', {}).catch(() => {
                    window.toast('Network connection issue detected', 'error');
                });
                break;
                
            case 'memory':
                if (confirm('Clear conversation history? This cannot be undone.')) {
                    window.resetChat();
                }
                break;
                
            case 'performance':
                window.toast('Consider switching to a faster model in Settings', 'info');
                // Optionally open settings modal
                break;
        }
    }

    startAdaptationEngine() {
        // Main adaptation loop
        setInterval(() => {
            this.runAdaptationCycle();
        }, 60000); // Every minute
    }

    runAdaptationCycle() {
        // Analyze current state
        const currentState = this.getCurrentState();
        
        // Apply adaptations
        this.applyAdaptations(currentState);
        
        // Learn from outcomes
        this.learnFromAdaptations(currentState);
    }

    getCurrentState() {
        return {
            timestamp: Date.now(),
            activeElements: document.querySelectorAll(':hover').length,
            messageCount: document.querySelectorAll('.message-container').length,
            errorCount: document.querySelectorAll('.message-error').length,
            isProcessing: document.querySelector('.shiny-text') !== null,
            inputFocused: document.activeElement === document.getElementById('chat-input')
        };
    }

    applyAdaptations(state) {
        // Apply intelligent UI adaptations
        if (state.errorCount > 0) {
            this.emphasizeErrorPrevention();
        }
        
        if (state.messageCount > 20) {
            this.enableMessageOptimization();
        }
        
        if (state.isProcessing) {
            this.enhanceProcessingFeedback();
        }
    }

    emphasizeErrorPrevention() {
        // Highlight validation and help features
        const helpElements = document.querySelectorAll('[data-help]');
        helpElements.forEach(element => {
            element.classList.add('emphasized');
        });
    }

    enableMessageOptimization() {
        // Suggest message cleanup for performance
        if (!document.getElementById('optimization-suggestion')) {
            const suggestion = document.createElement('div');
            suggestion.id = 'optimization-suggestion';
            suggestion.className = 'optimization-suggestion';
            suggestion.innerHTML = `
                <div class="suggestion-content">
                    📊 Long conversation detected. Consider starting a new chat for better performance.
                    <button onclick="window.newChat()">New Chat</button>
                    <button onclick="this.parentElement.parentElement.remove()">Dismiss</button>
                </div>
            `;
            
            document.getElementById('chat-history').appendChild(suggestion);
        }
    }

    enhanceProcessingFeedback() {
        // Add enhanced visual feedback during processing
        const progressBar = document.getElementById('progress-bar-h');
        if (progressBar && !progressBar.classList.contains('enhanced-processing')) {
            progressBar.classList.add('enhanced-processing');
            setTimeout(() => {
                progressBar.classList.remove('enhanced-processing');
            }, 2000);
        }
    }

    learnFromAdaptations(state) {
        // Learn which adaptations are effective
        setTimeout(() => {
            const newState = this.getCurrentState();
            const improvement = this.calculateImprovement(state, newState);
            
            if (improvement > 0) {
                // Adaptation was successful, reinforce it
                this.reinforceSuccessfulAdaptations(state);
            }
        }, 5000);
    }

    calculateImprovement(beforeState, afterState) {
        // Simple improvement calculation
        let score = 0;
        
        if (afterState.errorCount < beforeState.errorCount) score += 10;
        if (afterState.activeElements > beforeState.activeElements) score += 5;
        if (!afterState.isProcessing && beforeState.isProcessing) score += 15;
        
        return score;
    }

    reinforceSuccessfulAdaptations(state) {
        // Store successful adaptation patterns
        this.userPreferences.workflowPreferences.successfulAdaptations = 
            this.userPreferences.workflowPreferences.successfulAdaptations || [];
        
        this.userPreferences.workflowPreferences.successfulAdaptations.push({
            timestamp: Date.now(),
            state: state,
            adaptationType: 'automatic'
        });
        
        this.saveUserPreferences();
    }
}

class IntelligentSuggestions {
    constructor() {
        this.suggestionEngine = new Map();
        this.contextPatterns = new Map();
        this.commandTemplates = this.initializeCommandTemplates();
    }

    initializeCommandTemplates() {
        return [
            {
                pattern: /create.*(?:script|code|program)/i,
                template: "Create a {language} script that {functionality}",
                variables: ["language", "functionality"],
                category: "Development",
                icon: "💻"
            },
            {
                pattern: /search.*(?:for|about|information)/i,
                template: "Search for information about {topic} and {action}",
                variables: ["topic", "action"],
                category: "Research",
                icon: "🔍"
            },
            {
                pattern: /analyze.*(?:data|file|content)/i,
                template: "Analyze the {data_type} and provide {analysis_type}",
                variables: ["data_type", "analysis_type"],
                category: "Analysis",
                icon: "📊"
            },
            {
                pattern: /download.*(?:file|video|content)/i,
                template: "Download {content_type} from {source}",
                variables: ["content_type", "source"],
                category: "Download",
                icon: "⬇️"
            }
        ];
    }

    generateSuggestions(input) {
        const suggestions = [];
        const inputLower = input.toLowerCase();

        // Template-based suggestions
        this.commandTemplates.forEach(template => {
            if (template.pattern.test(input)) {
                suggestions.push({
                    text: this.fillTemplate(template.template, input),
                    category: template.category,
                    icon: template.icon,
                    score: 0.9,
                    type: 'template'
                });
            }
        });

        // Context-based suggestions
        const contextSuggestions = this.getContextualSuggestions(input);
        suggestions.push(...contextSuggestions);

        // History-based suggestions
        const historySuggestions = this.getHistoryBasedSuggestions(input);
        suggestions.push(...historySuggestions);

        // Sort by relevance score
        return suggestions
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
    }

    fillTemplate(template, input) {
        // Intelligent template filling based on input analysis
        const words = input.split(' ');
        
        let filled = template;
        
        // Simple variable substitution
        filled = filled.replace('{language}', this.detectLanguage(input) || 'Python');
        filled = filled.replace('{functionality}', this.extractFunctionality(input) || 'performs the required task');
        filled = filled.replace('{topic}', this.extractTopic(input) || 'the specified topic');
        filled = filled.replace('{action}', this.extractAction(input) || 'summarizes the findings');
        filled = filled.replace('{data_type}', this.detectDataType(input) || 'data');
        filled = filled.replace('{analysis_type}', this.extractAnalysisType(input) || 'detailed analysis');
        filled = filled.replace('{content_type}', this.detectContentType(input) || 'content');
        filled = filled.replace('{source}', this.extractSource(input) || 'the specified source');
        
        return filled;
    }

    detectLanguage(input) {
        const languages = ['python', 'javascript', 'java', 'c++', 'go', 'rust', 'typescript'];
        return languages.find(lang => input.toLowerCase().includes(lang));
    }

    extractFunctionality(input) {
        // Extract what the script should do
        const functionalityKeywords = input.match(/(?:that|to|will)\s+([^.]+)/i);
        return functionalityKeywords ? functionalityKeywords[1].trim() : null;
    }

    extractTopic(input) {
        // Extract topic from search queries
        const topicMatch = input.match(/(?:about|for|on)\s+([^.]+)/i);
        return topicMatch ? topicMatch[1].trim() : null;
    }

    extractAction(input) {
        const actions = ['summarize', 'analyze', 'compare', 'evaluate', 'explain'];
        return actions.find(action => input.toLowerCase().includes(action));
    }

    detectDataType(input) {
        const dataTypes = ['csv', 'json', 'xml', 'database', 'file', 'image', 'video'];
        return dataTypes.find(type => input.toLowerCase().includes(type));
    }

    extractAnalysisType(input) {
        const analysisTypes = ['statistical analysis', 'trend analysis', 'comparative analysis', 'detailed report'];
        return analysisTypes.find(type => input.toLowerCase().includes(type.split(' ')[0]));
    }

    detectContentType(input) {
        const contentTypes = ['video', 'audio', 'image', 'document', 'file'];
        return contentTypes.find(type => input.toLowerCase().includes(type));
    }

    extractSource(input) {
        // Extract URLs or source names
        const urlMatch = input.match(/(https?:\/\/[^\s]+)/i);
        if (urlMatch) return urlMatch[1];
        
        const sourceMatch = input.match(/from\s+([^.\s]+)/i);
        return sourceMatch ? sourceMatch[1] : null;
    }

    getContextualSuggestions(input) {
        const suggestions = [];
        
        // Based on recent messages
        const recentMessages = Array.from(document.querySelectorAll('.message-container')).slice(-3);
        const hasErrors = recentMessages.some(msg => msg.querySelector('.message-error'));
        
        if (hasErrors && input.length > 5) {
            suggestions.push({
                text: `Debug the previous error and ${input}`,
                category: "Debug",
                icon: "🔧",
                score: 0.8,
                type: "contextual"
            });
        }

        return suggestions;
    }

    getHistoryBasedSuggestions(input) {
        // Suggestions based on command history
        const suggestions = [];
        const preferences = JSON.parse(localStorage.getItem('agentZeroUserPreferences') || '{}');
        const commonCommands = preferences.commonCommands || [];
        
        const matching = commonCommands.filter(cmd => 
            cmd.toLowerCase().includes(input.toLowerCase()) ||
            input.toLowerCase().includes(cmd.toLowerCase())
        );

        matching.slice(0, 3).forEach(cmd => {
            suggestions.push({
                text: cmd,
                category: "History",
                icon: "📜",
                score: 0.7,
                type: "history"
            });
        });

        return suggestions;
    }

    getSmartCompletion(input) {
        // Smart completion for partial inputs
        if (input.length < 5) return input;

        const completions = this.commandTemplates
            .filter(template => template.pattern.test(input))
            .map(template => this.fillTemplate(template.template, input));

        return completions.length > 0 ? completions[0] : input;
    }

    getSuggestedActions() {
        // Generate contextual action suggestions
        const actions = [];
        
        // Based on current state
        const isProcessing = document.querySelector('.shiny-text') !== null;
        const hasErrors = document.querySelectorAll('.message-error').length > 0;
        const messageCount = document.querySelectorAll('.message-container').length;

        if (isProcessing) {
            actions.push({
                id: 'pause_processing',
                text: 'Pause Current Task',
                icon: '⏸️'
            });
        }

        if (hasErrors) {
            actions.push({
                id: 'debug_errors',
                text: 'Debug Errors',
                icon: '🔧'
            });
        }

        if (messageCount > 15) {
            actions.push({
                id: 'optimize_chat',
                text: 'Optimize Chat',
                icon: '⚡'
            });
        }

        actions.push({
            id: 'view_analytics',
            text: 'View Analytics',
            icon: '📊'
        });

        return actions;
    }
}

class ContextualAdaptation {
    constructor() {
        this.adaptationRules = new Map();
        this.contextHistory = [];
        this.learningRate = 0.1;
    }

    async getContextInsights() {
        const insights = [];
        
        // Analyze current conversation context
        const messages = Array.from(document.querySelectorAll('.message-container'));
        const recentMessages = messages.slice(-5);
        
        // Topic analysis
        const topics = this.extractTopics(recentMessages);
        if (topics.length > 0) {
            insights.push({
                type: 'topic',
                icon: '🎯',
                text: `Current focus: ${topics[0]}`
            });
        }

        // Complexity analysis
        const complexity = this.analyzeComplexity(recentMessages);
        insights.push({
            type: 'complexity',
            icon: complexity > 0.7 ? '🔴' : complexity > 0.4 ? '🟡' : '🟢',
            text: `Task complexity: ${complexity > 0.7 ? 'High' : complexity > 0.4 ? 'Medium' : 'Low'}`
        });

        // Progress analysis
        const progress = this.analyzeProgress(recentMessages);
        insights.push({
            type: 'progress',
            icon: '📈',
            text: `Progress trend: ${progress}`
        });

        return insights;
    }

    extractTopics(messages) {
        // Simple topic extraction from recent messages
        const topics = new Map();
        
        messages.forEach(msg => {
            const text = msg.textContent.toLowerCase();
            const words = text.split(/\W+/);
            
            // Look for technical terms, file names, etc.
            words.forEach(word => {
                if (word.length > 4 && /^[a-z]+$/.test(word)) {
                    topics.set(word, (topics.get(word) || 0) + 1);
                }
            });
        });

        return Array.from(topics.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([topic, count]) => topic);
    }

    analyzeComplexity(messages) {
        // Analyze task complexity based on message content
        let complexityScore = 0;
        
        messages.forEach(msg => {
            const text = msg.textContent;
            
            // Technical terms increase complexity
            const techTerms = ['algorithm', 'database', 'API', 'function', 'class', 'module'];
            complexityScore += techTerms.filter(term => 
                text.toLowerCase().includes(term)).length * 0.1;
            
            // Code blocks increase complexity
            if (text.includes('```') || text.includes('def ') || text.includes('function')) {
                complexityScore += 0.2;
            }
            
            // Multiple tools increase complexity
            const toolMentions = ['tool', 'execute', 'run', 'search', 'analyze'];
            complexityScore += toolMentions.filter(tool => 
                text.toLowerCase().includes(tool)).length * 0.05;
        });

        return Math.min(1, complexityScore);
    }

    analyzeProgress(messages) {
        // Analyze if the conversation is making progress
        const errorCount = messages.filter(msg => 
            msg.querySelector('.message-error')).length;
        const successCount = messages.filter(msg => 
            msg.querySelector('.message-agent-response')).length;
        
        if (successCount > errorCount * 2) {
            return 'Excellent';
        } else if (successCount > errorCount) {
            return 'Good';
        } else if (errorCount === 0) {
            return 'Steady';
        } else {
            return 'Needs attention';
        }
    }
}

// CSS for adaptive UI components
const adaptiveUICSS = `
    .smart-completed {
        background: linear-gradient(90deg, var(--color-input), #4248f150, var(--color-input));
        background-size: 200% 100%;
        animation: smartCompletionShine 1s ease;
    }

    @keyframes smartCompletionShine {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }

    .input-suggestions {
        max-height: 200px;
        overflow-y: auto;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    .suggestion-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .suggestion-item.selected {
        background: var(--color-primary);
        color: white;
    }

    .suggestion-content {
        flex: 1;
    }

    .suggestion-score {
        font-size: 0.75rem;
        opacity: 0.7;
        background: var(--color-secondary);
        padding: 0.2rem 0.5rem;
        border-radius: 12px;
    }

    .predictive-actions-container {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
        flex-wrap: wrap;
    }

    .predictive-action {
        padding: 0.4rem 0.8rem;
        background: linear-gradient(135deg, #4248f1, #00ff88);
        color: white;
        border: none;
        border-radius: 20px;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.2s ease;
        opacity: 0.8;
    }

    .predictive-action:hover {
        opacity: 1;
        transform: translateY(-1px);
    }

    .emphasized {
        animation: emphasize 2s ease-in-out;
        border: 2px solid #4248f1 !important;
    }

    @keyframes emphasize {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
    }

    .optimization-suggestion {
        background: linear-gradient(135deg, #ffa726, #ff9800);
        color: white;
        padding: 1rem;
        margin: 1rem 0;
        border-radius: 8px;
        animation: slideInFromTop 0.5s ease;
    }

    @keyframes slideInFromTop {
        0% {
            opacity: 0;
            transform: translateY(-20px);
        }
        100% {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .suggestion-content {
        display: flex;
        align-items: center;
        gap: 1rem;
        justify-content: space-between;
    }

    .suggestion-content button {
        padding: 0.5rem 1rem;
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 4px;
        color: white;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .suggestion-content button:hover {
        background: rgba(255, 255, 255, 0.3);
    }

    .enhanced-processing {
        position: relative;
        overflow: hidden;
    }

    .enhanced-processing::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(66, 72, 241, 0.3), transparent);
        animation: processingShine 2s infinite;
    }

    @keyframes processingShine {
        0% { left: -100%; }
        100% { left: 100%; }
    }

    .quick-actions-bar {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
        padding: 0.5rem;
        background: var(--color-background);
        border-radius: 6px;
        border: 1px solid var(--color-border);
    }

    .quick-actions-bar button {
        background: none;
        border: 1px solid var(--color-border);
        border-radius: 4px;
        padding: 0.4rem;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 1.2rem;
    }

    .quick-actions-bar button:hover {
        background: var(--color-secondary);
        transform: scale(1.1);
    }

    .mobile-optimized .chat-button,
    .mobile-optimized .text-button {
        min-height: 44px;
        min-width: 44px;
        touch-action: manipulation;
    }

    .widescreen-optimized #right-panel {
        max-width: 1200px;
        margin: 0 auto;
    }

    .focus-mode .message-util {
        display: none !important;
    }

    .focus-mode .left-panel-top {
        filter: blur(1px);
        opacity: 0.7;
    }

    .debug-help-content {
        padding: 1rem;
    }

    .debug-sections {
        display: grid;
        gap: 1rem;
        margin-top: 1rem;
    }

    .debug-section {
        background: var(--color-background);
        padding: 1rem;
        border-radius: 6px;
        border: 1px solid var(--color-border);
    }

    .error-item,
    .solution-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.5rem;
        margin: 0.5rem 0;
        background: var(--color-panel);
        border-radius: 4px;
    }

    .error-text,
    .solution-text {
        flex: 1;
        font-size: 0.9rem;
    }

    .quick-fix-btn {
        margin: 0.25rem;
        padding: 0.5rem 1rem;
        background: var(--color-primary);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .quick-fix-btn:hover {
        background: #353bc5;
        transform: translateY(-1px);
    }

    .insight-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;
        margin: 0.25rem 0;
        background: var(--color-background);
        border-radius: 4px;
        border-left: 3px solid transparent;
    }

    .insight-item.topic {
        border-left-color: #4248f1;
    }

    .insight-item.complexity {
        border-left-color: #ffa726;
    }

    .insight-item.progress {
        border-left-color: #00ff88;
    }

    .suggested-action {
        width: 100%;
        padding: 0.5rem;
        margin: 0.25rem 0;
        background: var(--color-secondary);
        border: 1px solid var(--color-border);
        border-radius: 4px;
        color: var(--color-text);
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: left;
    }

    .suggested-action:hover {
        background: var(--color-primary);
        color: white;
        transform: translateX(4px);
    }
`;

// Inject adaptive UI CSS
const adaptiveStyleSheet = document.createElement('style');
adaptiveStyleSheet.textContent = adaptiveUICSS;
document.head.appendChild(adaptiveStyleSheet);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.adaptiveUI = new AdaptiveUI();
});

// Export for global use
window.AdaptiveUI = AdaptiveUI;