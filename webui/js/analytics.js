// Advanced Analytics Dashboard
class AnalyticsDashboard {
    constructor() {
        this.metrics = {
            tokenUsage: [],
            responseTime: [],
            toolUsage: {},
            sessionData: {},
            performanceMetrics: []
        };
        this.charts = {};
        this.isRecording = false;
        this.sessionStart = Date.now();
    }

    startRecording() {
        this.isRecording = true;
        this.sessionStart = Date.now();
        this.recordPerformanceMetrics();
    }

    recordPerformanceMetrics() {
        if (!this.isRecording) return;

        const metrics = {
            timestamp: Date.now(),
            memoryUsage: performance.memory ? {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            } : null,
            timing: performance.timing,
            navigation: performance.navigation
        };

        this.metrics.performanceMetrics.push(metrics);

        // Keep only last 100 entries
        if (this.metrics.performanceMetrics.length > 100) {
            this.metrics.performanceMetrics.shift();
        }

        setTimeout(() => this.recordPerformanceMetrics(), 5000);
    }

    recordTokenUsage(tokens, type = 'chat') {
        this.metrics.tokenUsage.push({
            timestamp: Date.now(),
            tokens: tokens,
            type: type
        });
    }

    recordResponseTime(duration, operation) {
        this.metrics.responseTime.push({
            timestamp: Date.now(),
            duration: duration,
            operation: operation
        });
    }

    recordToolUsage(toolName, success = true) {
        if (!this.metrics.toolUsage[toolName]) {
            this.metrics.toolUsage[toolName] = { count: 0, success: 0 };
        }
        this.metrics.toolUsage[toolName].count++;
        if (success) this.metrics.toolUsage[toolName].success++;
    }

    generateReport() {
        const sessionDuration = Date.now() - this.sessionStart;
        const totalTokens = this.metrics.tokenUsage.reduce((sum, entry) => sum + entry.tokens, 0);
        const avgResponseTime = this.metrics.responseTime.length > 0 
            ? this.metrics.responseTime.reduce((sum, entry) => sum + entry.duration, 0) / this.metrics.responseTime.length 
            : 0;

        return {
            sessionDuration: Math.round(sessionDuration / 1000),
            totalTokens: totalTokens,
            averageResponseTime: Math.round(avgResponseTime),
            toolUsageCount: Object.keys(this.metrics.toolUsage).length,
            mostUsedTool: this.getMostUsedTool(),
            performanceScore: this.calculatePerformanceScore()
        };
    }

    getMostUsedTool() {
        const tools = Object.entries(this.metrics.toolUsage);
        if (tools.length === 0) return 'None';
        
        return tools.reduce((max, [name, data]) => 
            data.count > max.count ? { name, count: data.count } : max,
            { name: 'None', count: 0 }
        ).name;
    }

    calculatePerformanceScore() {
        const avgResponse = this.metrics.responseTime.length > 0 
            ? this.metrics.responseTime.reduce((sum, entry) => sum + entry.duration, 0) / this.metrics.responseTime.length 
            : 0;
        
        // Score based on response time (lower is better)
        let score = 100;
        if (avgResponse > 5000) score -= 30;
        else if (avgResponse > 2000) score -= 15;
        else if (avgResponse > 1000) score -= 5;

        return Math.max(0, Math.min(100, score));
    }

    renderCharts(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = this.generateChartsHTML();
        this.initializeCharts();
    }

    generateChartsHTML() {
        const report = this.generateReport();
        
        return `
            <div class="analytics-grid">
                <div class="metric-card">
                    <h3>Session Duration</h3>
                    <div class="metric-value">${Math.floor(report.sessionDuration / 60)}m ${report.sessionDuration % 60}s</div>
                </div>
                <div class="metric-card">
                    <h3>Total Tokens</h3>
                    <div class="metric-value">${report.totalTokens.toLocaleString()}</div>
                </div>
                <div class="metric-card">
                    <h3>Avg Response Time</h3>
                    <div class="metric-value">${report.averageResponseTime}ms</div>
                </div>
                <div class="metric-card">
                    <h3>Performance Score</h3>
                    <div class="metric-value">${report.performanceScore}/100</div>
                </div>
                <div class="chart-container">
                    <h3>Token Usage Over Time</h3>
                    <canvas id="tokenChart" width="400" height="200"></canvas>
                </div>
                <div class="chart-container">
                    <h3>Tool Usage Distribution</h3>
                    <canvas id="toolChart" width="400" height="200"></canvas>
                </div>
            </div>
        `;
    }

    initializeCharts() {
        this.renderTokenChart();
        this.renderToolChart();
    }

    renderTokenChart() {
        const canvas = document.getElementById('tokenChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = this.metrics.tokenUsage.slice(-20); // Last 20 entries

        if (data.length === 0) return;

        // Simple line chart
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#4248f1';
        ctx.lineWidth = 2;
        ctx.beginPath();

        const maxTokens = Math.max(...data.map(d => d.tokens));
        const stepX = canvas.width / (data.length - 1);

        data.forEach((point, index) => {
            const x = index * stepX;
            const y = canvas.height - (point.tokens / maxTokens) * canvas.height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();
    }

    renderToolChart() {
        const canvas = document.getElementById('toolChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const tools = Object.entries(this.metrics.toolUsage);

        if (tools.length === 0) return;

        // Simple bar chart
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const maxCount = Math.max(...tools.map(([_, data]) => data.count));
        const barWidth = canvas.width / tools.length;

        tools.forEach(([name, data], index) => {
            const barHeight = (data.count / maxCount) * canvas.height;
            const x = index * barWidth;
            const y = canvas.height - barHeight;

            ctx.fillStyle = '#4248f1';
            ctx.fillRect(x, y, barWidth - 2, barHeight);

            // Tool name
            ctx.fillStyle = '#fff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(name.substring(0, 8), x + barWidth / 2, canvas.height - 5);
        });
    }
}

// Export for global use
window.AnalyticsDashboard = AnalyticsDashboard;