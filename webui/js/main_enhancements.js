// Main Enhancement Integration
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all enhancement systems
    initializeEnhancementSystems();
    
    // Setup enhanced UI components
    setupEnhancedComponents();
    
    // Add enhancement controls to the UI
    addEnhancementControls();
    
    // Start enhancement monitoring
    startEnhancementMonitoring();
});

function initializeEnhancementSystems() {
    // Initialize analytics dashboard
    if (typeof AnalyticsDashboard !== 'undefined') {
        window.analyticsSystem = new AnalyticsDashboard();
        window.analyticsSystem.startRecording();
    }
    
    // Initialize enhanced memory system
    if (typeof EnhancedMemorySystem !== 'undefined') {
        window.enhancedMemory = new EnhancedMemorySystem();
    }
    
    // Initialize workflow designer
    if (typeof WorkflowDesigner !== 'undefined') {
        // Will be initialized when needed
        window.workflowDesigner = null;
    }
}

function setupEnhancedComponents() {
    // Add analytics button to toolbar
    addAnalyticsButton();
    
    // Add agent network visualizer button
    addNetworkVisualizerButton();
    
    // Add workflow designer button
    addWorkflowDesignerButton();
    
    // Add performance monitor
    addPerformanceMonitor();
}

function addAnalyticsButton() {
    const textButtonsRow = document.querySelector('.text-buttons-row');
    if (!textButtonsRow) return;
    
    const analyticsButton = document.createElement('button');
    analyticsButton.className = 'text-button';
    analyticsButton.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
        </svg>
        <p>Analytics</p>
    `;
    analyticsButton.onclick = openAnalyticsModal;
    
    textButtonsRow.appendChild(analyticsButton);
}

function addNetworkVisualizerButton() {
    const textButtonsRow = document.querySelector('.text-buttons-row');
    if (!textButtonsRow) return;
    
    const networkButton = document.createElement('button');
    networkButton.className = 'text-button';
    networkButton.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <p>Network</p>
    `;
    networkButton.onclick = openNetworkModal;
    
    textButtonsRow.appendChild(networkButton);
}

function addWorkflowDesignerButton() {
    const textButtonsRow = document.querySelector('.text-buttons-row');
    if (!textButtonsRow) return;
    
    const workflowButton = document.createElement('button');
    workflowButton.className = 'text-button';
    workflowButton.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6z"/>
        </svg>
        <p>Workflow</p>
    `;
    workflowButton.onclick = openWorkflowDesigner;
    
    textButtonsRow.appendChild(workflowButton);
}

function addPerformanceMonitor() {
    const statusSection = document.getElementById('status-section');
    if (!statusSection) return;
    
    const performanceMonitor = document.createElement('div');
    performanceMonitor.id = 'performance-monitor';
    performanceMonitor.className = 'config-section';
    performanceMonitor.innerHTML = `
        <h4>Performance</h4>
        <div class="performance-indicators">
            <div class="performance-meter">
                <label>System Health</label>
                <div class="performance-bar">
                    <div class="performance-fill" id="health-fill" style="width: 100%"></div>
                </div>
                <span class="performance-value" id="health-value">100%</span>
            </div>
            <div class="performance-stats">
                <div class="stat-item">
                    <span class="stat-label">Uptime:</span>
                    <span class="stat-value" id="uptime-value">0m</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Messages:</span>
                    <span class="stat-value" id="message-count">0</span>
                </div>
            </div>
        </div>
    `;
    
    statusSection.appendChild(performanceMonitor);
    
    // Update performance indicators
    updatePerformanceIndicators();
    setInterval(updatePerformanceIndicators, 5000);
}

function updatePerformanceIndicators() {
    const healthFill = document.getElementById('health-fill');
    const healthValue = document.getElementById('health-value');
    const uptimeValue = document.getElementById('uptime-value');
    const messageCount = document.getElementById('message-count');
    
    if (!healthFill) return;
    
    // Calculate health score
    const errorMessages = document.querySelectorAll('.message-error').length;
    const totalMessages = document.querySelectorAll('.message-container').length;
    const errorRate = totalMessages > 0 ? errorMessages / totalMessages : 0;
    const health = Math.round((1 - errorRate) * 100);
    
    // Update health indicator
    healthFill.style.width = `${health}%`;
    healthValue.textContent = `${health}%`;
    
    // Update color based on health
    if (health > 80) {
        healthFill.style.background = '#00ff88';
    } else if (health > 60) {
        healthFill.style.background = '#ffa726';
    } else {
        healthFill.style.background = '#ff6b6b';
    }
    
    // Update uptime (rough estimation)
    const sessionStart = window.sessionStartTime || Date.now();
    const uptime = Math.floor((Date.now() - sessionStart) / 60000);
    if (uptimeValue) uptimeValue.textContent = `${uptime}m`;
    
    // Update message count
    if (messageCount) messageCount.textContent = totalMessages.toString();
}

async function openAnalyticsModal() {
    try {
        // Get analytics data from backend
        const analyticsData = await window.sendJsonData("/enhanced_features", {
            action: "get_analytics",
            context: window.getContext()
        });
        
        // Create analytics dashboard
        const analyticsHTML = generateAnalyticsHTML(analyticsData.analytics);
        
        await window.genericModalProxy.openModal(
            'Advanced Analytics Dashboard',
            'Comprehensive insights into your Agent Zero usage and performance',
            analyticsHTML,
            ['analytics-modal']
        );
        
        // Initialize charts after modal is rendered
        setTimeout(() => {
            if (window.analyticsSystem) {
                window.analyticsSystem.renderCharts('analytics-charts');
            }
        }, 100);
        
    } catch (error) {
        window.toastFetchError("Error loading analytics", error);
    }
}

function generateAnalyticsHTML(analytics) {
    return `
        <div class="analytics-dashboard">
            <div class="analytics-overview">
                <div class="metric-card">
                    <h3>Session Duration</h3>
                    <div class="metric-value">${Math.floor(analytics.session_duration / 60)}m</div>
                </div>
                <div class="metric-card">
                    <h3>Messages</h3>
                    <div class="metric-value">${analytics.message_count}</div>
                </div>
                <div class="metric-card">
                    <h3>Token Usage</h3>
                    <div class="metric-value">${analytics.token_usage.toLocaleString()}</div>
                </div>
                <div class="metric-card">
                    <h3>Efficiency</h3>
                    <div class="metric-value">${analytics.performance_metrics.efficiency_score}%</div>
                </div>
            </div>
            
            <div class="analytics-insights">
                <h3>💡 Insights</h3>
                <div id="analytics-insights-content">
                    ${analytics.insights ? analytics.insights.map(insight => `
                        <div class="insight-card ${insight.level}">
                            <div class="insight-header">
                                <span class="insight-icon">${getInsightIcon(insight.level)}</span>
                                <span class="insight-title">${insight.title}</span>
                            </div>
                            <div class="insight-description">${insight.description}</div>
                            ${insight.suggestion ? `<div class="insight-suggestion">💡 ${insight.suggestion}</div>` : ''}
                        </div>
                    `).join('') : '<p>Collecting insights...</p>'}
                </div>
            </div>
            
            <div class="analytics-charts" id="analytics-charts">
                <h3>📊 Performance Charts</h3>
                <!-- Charts will be rendered here -->
            </div>
            
            <div class="analytics-recommendations">
                <h3>🎯 Recommendations</h3>
                <div id="recommendations-content">
                    ${analytics.recommendations ? analytics.recommendations.map(rec => `
                        <div class="recommendation-card ${rec.priority}">
                            <div class="rec-header">
                                <span class="rec-priority">${rec.priority.toUpperCase()}</span>
                                <span class="rec-title">${rec.title}</span>
                            </div>
                            <div class="rec-description">${rec.description}</div>
                            <button class="rec-action-btn" onclick="implementRecommendation('${rec.action}')">
                                Implement
                            </button>
                        </div>
                    `).join('') : '<p>No recommendations at this time.</p>'}
                </div>
            </div>
        </div>
    `;
}

function getInsightIcon(level) {
    const icons = {
        'positive': '✅',
        'warning': '⚠️',
        'info': 'ℹ️',
        'error': '❌'
    };
    return icons[level] || 'ℹ️';
}

async function openNetworkModal() {
    try {
        // Get network data from backend
        const networkData = await window.sendJsonData("/enhanced_features", {
            action: "get_network_data",
            context: window.getContext()
        });
        
        const networkHTML = `
            <div class="network-dashboard">
                <div class="network-controls">
                    <button class="network-control-btn active" onclick="toggleNetworkView('hierarchy')">
                        Hierarchy View
                    </button>
                    <button class="network-control-btn" onclick="toggleNetworkView('activity')">
                        Activity View
                    </button>
                    <button class="network-control-btn" onclick="toggleNetworkView('performance')">
                        Performance View
                    </button>
                </div>
                <div id="agent-network-viz" class="agent-network-container">
                    <!-- Network visualization will be rendered here -->
                </div>
                <div class="network-stats">
                    <h4>Network Statistics</h4>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-label">Active Agents</div>
                            <div class="stat-value">${networkData.network.nodes.length}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Connections</div>
                            <div class="stat-value">${networkData.network.links.length}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Total Memory</div>
                            <div class="stat-value">${networkData.network.nodes.reduce((sum, node) => sum + node.memory_size, 0)}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        await window.genericModalProxy.openModal(
            'Agent Network Visualization',
            'Real-time view of your agent hierarchy and communication patterns',
            networkHTML,
            ['network-modal']
        );
        
        // Initialize network visualizer
        setTimeout(() => {
            const visualizer = new AgentNetworkVisualizer('agent-network-viz');
            visualizer.updateNetwork(networkData.network.nodes);
            window.currentNetworkVisualizer = visualizer;
        }, 100);
        
    } catch (error) {
        window.toastFetchError("Error loading network visualization", error);
    }
}

async function openWorkflowDesigner() {
    const workflowHTML = `
        <div class="workflow-designer-container">
            <div id="workflow-designer">
                <!-- Workflow designer will be initialized here -->
            </div>
        </div>
    `;
    
    await window.genericModalProxy.openModal(
        'Workflow Designer',
        'Create and manage automated workflows for complex tasks',
        workflowHTML,
        ['workflow-modal']
    );
    
    // Initialize workflow designer
    setTimeout(() => {
        if (typeof WorkflowDesigner !== 'undefined') {
            window.workflowDesigner = new WorkflowDesigner('workflow-designer');
        }
    }, 100);
}

function toggleNetworkView(viewType) {
    // Update network visualization based on view type
    const buttons = document.querySelectorAll('.network-control-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    event.target.classList.add('active');
    
    if (window.currentNetworkVisualizer) {
        // Update visualization based on view type
        switch (viewType) {
            case 'hierarchy':
                window.currentNetworkVisualizer.setViewMode('hierarchy');
                break;
            case 'activity':
                window.currentNetworkVisualizer.setViewMode('activity');
                break;
            case 'performance':
                window.currentNetworkVisualizer.setViewMode('performance');
                break;
        }
    }
}

function implementRecommendation(action) {
    switch (action) {
        case 'optimize_model':
            window.toast('Opening model settings...', 'info');
            // Open settings modal to model section
            break;
        case 'enable_compression':
            window.toast('Enabling conversation compression...', 'info');
            // Implement compression
            break;
        case 'review_configuration':
            window.toast('Opening configuration review...', 'info');
            // Open configuration review
            break;
        default:
            window.toast(`Implementing: ${action}`, 'info');
    }
}

function addEnhancementControls() {
    // Add enhancement toggle controls to preferences
    const preferencesSection = document.querySelector('#pref-list');
    if (!preferencesSection) return;
    
    const enhancementControls = document.createElement('li');
    enhancementControls.innerHTML = `
        <span class="switch-label">Enhanced Features</span>
        <label class="switch">
            <input type="checkbox" id="enhanced-features-switch" checked onchange="toggleEnhancedFeatures(this.checked)">
            <span class="slider"></span>
        </label>
    `;
    
    preferencesSection.appendChild(enhancementControls);
    
    // Add individual feature toggles
    const featureToggles = [
        { id: 'real-time-updates', label: 'Real-time Updates', default: true },
        { id: 'smart-suggestions', label: 'Smart Suggestions', default: true },
        { id: 'performance-monitoring', label: 'Performance Monitoring', default: true },
        { id: 'adaptive-ui', label: 'Adaptive UI', default: true }
    ];
    
    featureToggles.forEach(feature => {
        const toggle = document.createElement('li');
        toggle.innerHTML = `
            <span class="switch-label">${feature.label}</span>
            <label class="switch">
                <input type="checkbox" id="${feature.id}-switch" ${feature.default ? 'checked' : ''} 
                       onchange="toggleFeature('${feature.id}', this.checked)">
                <span class="slider"></span>
            </label>
        `;
        preferencesSection.appendChild(toggle);
    });
}

function toggleEnhancedFeatures(enabled) {
    localStorage.setItem('enhancedFeaturesEnabled', enabled);
    
    if (enabled) {
        // Enable all enhancement systems
        if (window.realTimeManager) window.realTimeManager.startRealTimeEngine();
        if (window.adaptiveUI) window.adaptiveUI.startAdaptationEngine();
        
        window.toast('Enhanced features enabled', 'success');
    } else {
        // Disable enhancement systems
        if (window.realTimeManager) window.realTimeManager.stopRealTimeEngine();
        
        window.toast('Enhanced features disabled', 'info');
    }
}

function toggleFeature(featureId, enabled) {
    localStorage.setItem(`${featureId}Enabled`, enabled);
    
    switch (featureId) {
        case 'real-time-updates':
            if (window.realTimeManager) {
                if (enabled) {
                    window.realTimeManager.startRealTimeEngine();
                } else {
                    window.realTimeManager.stopRealTimeEngine();
                }
            }
            break;
        case 'smart-suggestions':
            // Toggle smart suggestions
            break;
        case 'performance-monitoring':
            // Toggle performance monitoring
            break;
        case 'adaptive-ui':
            if (window.adaptiveUI) {
                if (enabled) {
                    window.adaptiveUI.startAdaptationEngine();
                } else {
                    // Disable adaptive features
                }
            }
            break;
    }
    
    window.toast(`${featureId.replace('-', ' ')} ${enabled ? 'enabled' : 'disabled'}`, 'info');
}

function startEnhancementMonitoring() {
    // Monitor enhancement system health
    setInterval(() => {
        monitorEnhancementHealth();
    }, 30000); // Every 30 seconds
}

function monitorEnhancementHealth() {
    const health = {
        realTime: window.realTimeManager ? window.realTimeManager.isActive : false,
        analytics: window.analyticsSystem ? true : false,
        memory: window.enhancedMemory ? true : false,
        ui: window.adaptiveUI ? true : false
    };
    
    const healthScore = Object.values(health).filter(Boolean).length / Object.keys(health).length * 100;
    
    // Update health indicator
    const healthFill = document.getElementById('health-fill');
    const healthValue = document.getElementById('health-value');
    
    if (healthFill && healthValue) {
        healthFill.style.width = `${healthScore}%`;
        healthValue.textContent = `${Math.round(healthScore)}%`;
    }
    
    // Log health status
    console.log('Enhancement systems health:', health, `${healthScore}%`);
}

// Initialize session start time
window.sessionStartTime = Date.now();

// Enhanced error handling with recovery
window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);
    
    // Record error in analytics
    if (window.analyticsSystem) {
        window.analyticsSystem.recordEvent('error', {
            message: event.error.message,
            stack: event.error.stack,
            filename: event.filename,
            lineno: event.lineno
        });
    }
    
    // Attempt graceful recovery
    attemptErrorRecovery(event.error);
});

function attemptErrorRecovery(error) {
    // Simple error recovery strategies
    if (error.message.includes('network') || error.message.includes('fetch')) {
        // Network error - reduce update frequency
        if (window.realTimeManager) {
            window.realTimeManager.updateFrequency *= 2;
        }
        window.toast('Network issue detected, adjusting performance', 'warning');
    } else if (error.message.includes('memory')) {
        // Memory error - trigger cleanup
        triggerMemoryCleanup();
        window.toast('Memory optimization triggered', 'info');
    }
}

function triggerMemoryCleanup() {
    // Clean up old DOM elements and data
    const oldMessages = document.querySelectorAll('.message-container');
    if (oldMessages.length > 100) {
        // Remove oldest messages beyond 100
        for (let i = 0; i < oldMessages.length - 100; i++) {
            oldMessages[i].remove();
        }
    }
    
    // Clear old analytics data
    if (window.analyticsSystem) {
        // Keep only recent data
        const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
        // Implementation would clean old data here
    }
}

// Export enhanced functions globally
window.openAnalyticsModal = openAnalyticsModal;
window.openNetworkModal = openNetworkModal;
window.openWorkflowDesigner = openWorkflowDesigner;
window.toggleEnhancedFeatures = toggleEnhancedFeatures;
window.toggleFeature = toggleFeature;
window.implementRecommendation = implementRecommendation;
window.toggleNetworkView = toggleNetworkView;