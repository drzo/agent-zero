// Real-time Features and Live Updates
class RealTimeManager {
    constructor() {
        this.connections = new Map();
        this.liveFeatures = new Map();
        this.updateFrequency = 100; // 100ms for smooth updates
        this.isActive = false;
        this.performanceOptimizer = new PerformanceOptimizer();
        this.init();
    }

    init() {
        this.setupRealTimeUpdates();
        this.setupLiveVisualizations();
        this.setupCollaborativeFeatures();
        this.startRealTimeEngine();
    }

    setupRealTimeUpdates() {
        // Override the existing poll function with enhanced real-time capabilities
        const originalPoll = window.poll || (() => {});
        
        window.enhancedPoll = async () => {
            const startTime = performance.now();
            
            try {
                const result = await originalPoll();
                
                // Record performance metrics
                const duration = performance.now() - startTime;
                this.recordPollPerformance(duration);
                
                // Trigger real-time updates
                if (result) {
                    this.triggerLiveUpdates();
                }
                
                return result;
            } catch (error) {
                this.handleRealTimeError(error);
                throw error;
            }
        };

        // Enhanced polling with adaptive frequency
        this.startAdaptivePolling();
    }

    startAdaptivePolling() {
        let pollCount = 0;
        let lastUpdateTime = 0;
        
        const adaptivePoll = async () => {
            const now = Date.now();
            const timeSinceLastUpdate = now - lastUpdateTime;
            
            // Adaptive frequency based on activity
            let frequency = this.updateFrequency;
            
            if (document.querySelector('.shiny-text')) {
                frequency = 50; // Faster when processing
            } else if (timeSinceLastUpdate > 10000) {
                frequency = 500; // Slower when inactive
            }
            
            try {
                const updated = await window.enhancedPoll();
                if (updated) {
                    lastUpdateTime = now;
                    this.performanceOptimizer.recordSuccessfulUpdate();
                }
            } catch (error) {
                console.error('Enhanced poll error:', error);
                this.performanceOptimizer.recordFailedUpdate();
            }
            
            pollCount++;
            setTimeout(adaptivePoll, frequency);
        };
        
        adaptivePoll();
    }

    setupLiveVisualizations() {
        // Real-time agent network updates
        this.setupLiveAgentNetwork();
        
        // Live performance charts
        this.setupLiveCharts();
        
        // Real-time memory visualization
        this.setupLiveMemoryViz();
    }

    setupLiveAgentNetwork() {
        // Create or update agent network visualizer
        if (!this.agentNetworkVisualizer) {
            const networkContainer = document.createElement('div');
            networkContainer.id = 'live-agent-network';
            networkContainer.className = 'agent-network-container';
            networkContainer.style.display = 'none';
            
            // Add to a modal or sidebar
            document.body.appendChild(networkContainer);
            
            this.agentNetworkVisualizer = new AgentNetworkVisualizer('live-agent-network');
        }

        // Register for live updates
        this.liveFeatures.set('agentNetwork', {
            update: (data) => this.updateAgentNetwork(data),
            isActive: false
        });
    }

    setupLiveCharts() {
        this.liveCharts = new LiveChartsManager();
        
        this.liveFeatures.set('charts', {
            update: (data) => this.liveCharts.updateCharts(data),
            isActive: false
        });
    }

    setupLiveMemoryViz() {
        this.memoryVizualizer = new LiveMemoryVisualizer();
        
        this.liveFeatures.set('memory', {
            update: (data) => this.memoryVizualizer.update(data),
            isActive: false
        });
    }

    setupCollaborativeFeatures() {
        // Setup for future multi-user collaboration
        this.collaborationManager = new CollaborationManager();
        
        // Simulated collaborative features for now
        this.setupPresenceIndicators();
        this.setupSharedCursors();
    }

    setupPresenceIndicators() {
        // Show online users (simulated for single-user now)
        const presenceIndicator = document.createElement('div');
        presenceIndicator.id = 'presence-indicator';
        presenceIndicator.className = 'presence-indicator';
        presenceIndicator.innerHTML = `
            <div class="user-presence active">
                <div class="presence-avatar">👤</div>
                <div class="presence-status">Active</div>
            </div>
        `;
        
        const timeDate = document.getElementById('time-date-container');
        if (timeDate) {
            timeDate.appendChild(presenceIndicator);
        }
    }

    setupSharedCursors() {
        // Visual indicators for collaborative editing (future feature)
        this.cursorManager = new SharedCursorManager();
    }

    startRealTimeEngine() {
        this.isActive = true;
        this.realTimeLoop();
    }

    stopRealTimeEngine() {
        this.isActive = false;
    }

    realTimeLoop() {
        if (!this.isActive) return;

        // Update all active live features
        this.liveFeatures.forEach((feature, name) => {
            if (feature.isActive) {
                try {
                    const data = this.collectLiveData(name);
                    feature.update(data);
                } catch (error) {
                    console.error(`Error updating live feature ${name}:`, error);
                }
            }
        });

        // Performance optimization
        this.performanceOptimizer.optimize();

        // Schedule next update
        requestAnimationFrame(() => this.realTimeLoop());
    }

    triggerLiveUpdates() {
        // Triggered when new data arrives
        this.liveFeatures.forEach((feature, name) => {
            if (feature.isActive) {
                const data = this.collectLiveData(name);
                feature.update(data);
            }
        });
    }

    collectLiveData(featureName) {
        switch (featureName) {
            case 'agentNetwork':
                return this.collectAgentNetworkData();
            case 'charts':
                return this.collectChartsData();
            case 'memory':
                return this.collectMemoryData();
            default:
                return {};
        }
    }

    collectAgentNetworkData() {
        // Collect current agent hierarchy and status
        const contexts = Array.from(document.querySelectorAll('[data-context-id]')).map(el => ({
            id: el.dataset.contextId,
            no: parseInt(el.dataset.contextNo) || 0,
            paused: el.dataset.paused === 'true',
            log_length: parseInt(el.dataset.logLength) || 0
        }));

        return contexts;
    }

    collectChartsData() {
        // Collect data for live charts
        const messages = document.querySelectorAll('.message-container');
        return {
            messageCount: messages.length,
            errorCount: document.querySelectorAll('.message-error').length,
            responseCount: document.querySelectorAll('.message-agent-response').length,
            timestamp: Date.now()
        };
    }

    collectMemoryData() {
        // Collect memory usage data
        return {
            conversationLength: document.querySelectorAll('.message-container').length,
            memoryUsage: performance.memory ? {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize
            } : null,
            timestamp: Date.now()
        };
    }

    updateAgentNetwork(data) {
        if (this.agentNetworkVisualizer && data.length > 0) {
            this.agentNetworkVisualizer.updateNetwork(data);
        }
    }

    recordPollPerformance(duration) {
        this.performanceOptimizer.recordPollTime(duration);
    }

    handleRealTimeError(error) {
        console.error('Real-time update error:', error);
        
        // Graceful degradation
        this.updateFrequency = Math.min(this.updateFrequency * 1.5, 1000);
        
        // Show user notification for persistent errors
        if (this.performanceOptimizer.getErrorRate() > 0.1) {
            window.toast('Connection unstable, reducing update frequency', 'warning');
        }
    }

    enableLiveFeature(featureName) {
        const feature = this.liveFeatures.get(featureName);
        if (feature) {
            feature.isActive = true;
            
            // Show the feature if it has a UI component
            this.showLiveFeatureUI(featureName);
        }
    }

    disableLiveFeature(featureName) {
        const feature = this.liveFeatures.get(featureName);
        if (feature) {
            feature.isActive = false;
            
            // Hide the feature UI
            this.hideLiveFeatureUI(featureName);
        }
    }

    showLiveFeatureUI(featureName) {
        switch (featureName) {
            case 'agentNetwork':
                const networkContainer = document.getElementById('live-agent-network');
                if (networkContainer) {
                    networkContainer.style.display = 'block';
                }
                break;
        }
    }

    hideLiveFeatureUI(featureName) {
        switch (featureName) {
            case 'agentNetwork':
                const networkContainer = document.getElementById('live-agent-network');
                if (networkContainer) {
                    networkContainer.style.display = 'none';
                }
                break;
        }
    }
}

class LiveChartsManager {
    constructor() {
        this.charts = new Map();
        this.chartData = new Map();
        this.maxDataPoints = 50;
    }

    updateCharts(data) {
        // Update all active charts with new data
        this.addDataPoint('messages', data.messageCount);
        this.addDataPoint('errors', data.errorCount);
        this.addDataPoint('responses', data.responseCount);
        
        // Render updated charts
        this.renderActiveCharts();
    }

    addDataPoint(chartId, value) {
        if (!this.chartData.has(chartId)) {
            this.chartData.set(chartId, []);
        }
        
        const data = this.chartData.get(chartId);
        data.push({
            timestamp: Date.now(),
            value: value
        });
        
        // Keep only recent data points
        if (data.length > this.maxDataPoints) {
            data.shift();
        }
    }

    renderActiveCharts() {
        this.charts.forEach((chart, chartId) => {
            if (chart.isActive) {
                const data = this.chartData.get(chartId) || [];
                chart.render(data);
            }
        });
    }

    createMiniChart(containerId, chartType = 'line') {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 80;
        canvas.className = 'mini-chart';
        
        container.appendChild(canvas);
        
        const chart = {
            canvas: canvas,
            context: canvas.getContext('2d'),
            type: chartType,
            isActive: true,
            render: (data) => this.renderMiniChart(canvas, data, chartType)
        };
        
        this.charts.set(containerId, chart);
        return chart;
    }

    renderMiniChart(canvas, data, type = 'line') {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        if (data.length < 2) return;
        
        const maxValue = Math.max(...data.map(d => d.value), 1);
        const minValue = Math.min(...data.map(d => d.value));
        const range = maxValue - minValue || 1;
        
        if (type === 'line') {
            ctx.strokeStyle = '#4248f1';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            data.forEach((point, index) => {
                const x = (index / (data.length - 1)) * width;
                const y = height - ((point.value - minValue) / range) * height;
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
            
            // Add gradient fill
            ctx.fillStyle = 'rgba(66, 72, 241, 0.1)';
            ctx.lineTo(width, height);
            ctx.lineTo(0, height);
            ctx.closePath();
            ctx.fill();
        }
    }
}

class LiveMemoryVisualizer {
    constructor() {
        this.memoryGraph = null;
        this.updateInterval = 1000; // 1 second
    }

    update(data) {
        if (!this.memoryGraph) {
            this.initializeMemoryGraph();
        }
        
        this.updateMemoryMetrics(data);
        this.renderMemoryFlow();
    }

    initializeMemoryGraph() {
        // Initialize memory flow visualization
        const container = document.createElement('div');
        container.id = 'live-memory-viz';
        container.className = 'memory-graph-container';
        container.style.display = 'none';
        
        document.body.appendChild(container);
        
        this.memoryGraph = container;
    }

    updateMemoryMetrics(data) {
        if (!data.memoryUsage) return;
        
        const usage = data.memoryUsage.used / data.memoryUsage.total;
        this.renderMemoryUsage(usage);
    }

    renderMemoryUsage(usage) {
        // Create or update memory usage indicator
        let indicator = document.getElementById('memory-usage-indicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'memory-usage-indicator';
            indicator.className = 'memory-usage-indicator';
            
            const statusSection = document.getElementById('status-section');
            if (statusSection) {
                statusSection.appendChild(indicator);
            }
        }
        
        const percentage = Math.round(usage * 100);
        const color = usage > 0.8 ? '#ff6b6b' : usage > 0.6 ? '#ffa726' : '#00ff88';
        
        indicator.innerHTML = `
            <div class="memory-label">Memory</div>
            <div class="memory-bar">
                <div class="memory-fill" style="width: ${percentage}%; background: ${color}"></div>
            </div>
            <div class="memory-value">${percentage}%</div>
        `;
    }

    renderMemoryFlow() {
        // Visualize memory access patterns
        if (this.memoryGraph && this.memoryGraph.style.display !== 'none') {
            // Add memory flow visualization logic here
            this.updateMemoryFlowVisualization();
        }
    }

    updateMemoryFlowVisualization() {
        // Create flowing particles to represent memory access
        const particles = this.memoryGraph.querySelectorAll('.memory-particle');
        
        // Remove old particles
        particles.forEach(particle => {
            if (particle.animationAge > 3000) {
                particle.remove();
            }
        });
        
        // Add new particles
        if (Math.random() > 0.7) {
            this.createMemoryParticle();
        }
    }

    createMemoryParticle() {
        const particle = document.createElement('div');
        particle.className = 'memory-particle';
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: #4248f1;
            border-radius: 50%;
            animation: memoryFlow 3s linear forwards;
            left: ${Math.random() * 100}%;
            top: 10px;
        `;
        
        particle.animationAge = 0;
        this.memoryGraph.appendChild(particle);
        
        // Track age
        const ageTracker = setInterval(() => {
            particle.animationAge += 100;
            if (particle.animationAge > 3000) {
                clearInterval(ageTracker);
            }
        }, 100);
    }
}

class PerformanceOptimizer {
    constructor() {
        this.pollTimes = [];
        this.updateSuccess = 0;
        this.updateFailures = 0;
        this.optimizations = new Map();
    }

    recordPollTime(duration) {
        this.pollTimes.push(duration);
        
        // Keep only recent times
        if (this.pollTimes.length > 100) {
            this.pollTimes.shift();
        }
    }

    recordSuccessfulUpdate() {
        this.updateSuccess++;
    }

    recordFailedUpdate() {
        this.updateFailures++;
    }

    getErrorRate() {
        const total = this.updateSuccess + this.updateFailures;
        return total > 0 ? this.updateFailures / total : 0;
    }

    optimize() {
        // Optimize based on performance metrics
        const avgPollTime = this.getAveragePollTime();
        
        if (avgPollTime > 1000) { // 1 second
            this.enablePerformanceOptimizations();
        } else if (avgPollTime < 100) { // 100ms
            this.increaseUpdateFrequency();
        }
    }

    getAveragePollTime() {
        if (this.pollTimes.length === 0) return 0;
        return this.pollTimes.reduce((sum, time) => sum + time, 0) / this.pollTimes.length;
    }

    enablePerformanceOptimizations() {
        // Reduce update frequency for slow connections
        if (!this.optimizations.has('reduced_frequency')) {
            console.log('Enabling performance optimizations due to slow polling');
            window.realTimeManager.updateFrequency *= 1.5;
            this.optimizations.set('reduced_frequency', true);
        }
    }

    increaseUpdateFrequency() {
        // Increase frequency for fast connections
        if (!this.optimizations.has('increased_frequency') && window.realTimeManager.updateFrequency > 50) {
            console.log('Increasing update frequency due to fast polling');
            window.realTimeManager.updateFrequency *= 0.8;
            this.optimizations.set('increased_frequency', true);
        }
    }
}

class CollaborationManager {
    constructor() {
        this.users = new Map();
        this.sharedState = new Map();
    }

    // Placeholder for future multi-user features
    addUser(userId, userData) {
        this.users.set(userId, userData);
    }

    removeUser(userId) {
        this.users.delete(userId);
    }

    updateSharedState(key, value) {
        this.sharedState.set(key, value);
    }
}

class SharedCursorManager {
    constructor() {
        this.cursors = new Map();
    }

    // Placeholder for shared cursor functionality
    updateCursor(userId, position) {
        // Future: Show other users' cursors in real-time
    }
}

// CSS for real-time features
const realTimeCSS = `
    .memory-usage-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;
        background: var(--color-background);
        border-radius: 6px;
        border: 1px solid var(--color-border);
        margin: 0.5rem 0;
    }

    .memory-label,
    .memory-value {
        font-size: 0.8rem;
        color: var(--color-text);
    }

    .memory-bar {
        flex: 1;
        height: 6px;
        background: var(--color-border);
        border-radius: 3px;
        overflow: hidden;
    }

    .memory-fill {
        height: 100%;
        border-radius: 3px;
        transition: width 0.5s ease;
    }

    .presence-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;
        background: var(--color-panel);
        border-radius: 20px;
        border: 1px solid var(--color-border);
    }

    .user-presence {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    .presence-avatar {
        width: 24px;
        height: 24px;
        background: #4248f1;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
    }

    .presence-status {
        font-size: 0.7rem;
        color: var(--color-text);
        opacity: 0.8;
    }

    .user-presence.active .presence-avatar {
        animation: presencePulse 2s infinite;
    }

    @keyframes presencePulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }

    @keyframes memoryFlow {
        0% {
            transform: translateY(0) scale(1);
            opacity: 1;
        }
        100% {
            transform: translateY(200px) scale(0.5);
            opacity: 0;
        }
    }

    .mini-chart {
        border-radius: 4px;
        border: 1px solid var(--color-border);
    }

    .live-indicator {
        position: relative;
    }

    .live-indicator::after {
        content: '🔴';
        position: absolute;
        top: -5px;
        right: -5px;
        font-size: 0.6rem;
        animation: liveBlink 1s infinite;
    }

    @keyframes liveBlink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0.3; }
    }
`;

// Inject real-time CSS
const realTimeStyleSheet = document.createElement('style');
realTimeStyleSheet.textContent = realTimeCSS;
document.head.appendChild(realTimeStyleSheet);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.realTimeManager = new RealTimeManager();
});

// Export for global use
window.RealTimeManager = RealTimeManager;