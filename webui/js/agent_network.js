// Real-time Agent Network Visualization
import * as d3 from 'https://cdn.skypack.dev/d3@7';

class AgentNetworkVisualizer {
    constructor(containerId) {
        this.container = d3.select(`#${containerId}`);
        this.width = 800;
        this.height = 600;
        this.nodes = [];
        this.links = [];
        this.simulation = null;
        this.svg = null;
        this.nodeGroup = null;
        this.linkGroup = null;
        this.init();
    }

    init() {
        this.svg = this.container
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('viewBox', `0 0 ${this.width} ${this.height}`)
            .style('background', 'var(--color-background)')
            .style('border-radius', '8px')
            .style('border', '1px solid var(--color-border)');

        // Add gradient definitions
        const defs = this.svg.append('defs');
        
        // Gradient for active connections
        const activeGradient = defs.append('linearGradient')
            .attr('id', 'activeConnection')
            .attr('gradientUnits', 'userSpaceOnUse');
        
        activeGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#4248f1')
            .attr('stop-opacity', 0.8);
            
        activeGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#00ff88')
            .attr('stop-opacity', 0.3);

        // Create groups for links and nodes
        this.linkGroup = this.svg.append('g').attr('class', 'links');
        this.nodeGroup = this.svg.append('g').attr('class', 'nodes');

        // Initialize simulation
        this.simulation = d3.forceSimulation()
            .force('link', d3.forceLink().id(d => d.id).distance(150))
            .force('charge', d3.forceManyBody().strength(-800))
            .force('center', d3.forceCenter(this.width / 2, this.height / 2))
            .force('collision', d3.forceCollide().radius(50));
    }

    updateNetwork(contexts) {
        // Convert contexts to nodes and links
        this.nodes = contexts.map(ctx => ({
            id: ctx.id,
            name: `Agent ${ctx.no}`,
            status: ctx.paused ? 'paused' : 'active',
            memory: ctx.log_length,
            type: ctx.no === 0 ? 'primary' : 'subordinate',
            activity: this.calculateActivity(ctx)
        }));

        // Create links between agents (hierarchical)
        this.links = [];
        for (let i = 1; i < this.nodes.length; i++) {
            this.links.push({
                source: this.nodes[0].id, // Agent 0 as root
                target: this.nodes[i].id,
                strength: Math.random() * 0.5 + 0.5
            });
        }

        this.render();
    }

    calculateActivity(ctx) {
        return Math.min(ctx.log_length / 10, 1);
    }

    render() {
        // Update links
        const link = this.linkGroup.selectAll('.link')
            .data(this.links);

        link.exit().remove();

        const linkEnter = link.enter()
            .append('line')
            .attr('class', 'link')
            .style('stroke', 'url(#activeConnection)')
            .style('stroke-width', 2)
            .style('opacity', 0.6);

        // Update nodes
        const node = this.nodeGroup.selectAll('.node')
            .data(this.nodes);

        node.exit().remove();

        const nodeEnter = node.enter()
            .append('g')
            .attr('class', 'node')
            .call(d3.drag()
                .on('start', this.dragStarted.bind(this))
                .on('drag', this.dragged.bind(this))
                .on('end', this.dragEnded.bind(this)));

        // Add circles to nodes
        nodeEnter.append('circle')
            .attr('r', d => d.type === 'primary' ? 30 : 20)
            .style('fill', d => this.getNodeColor(d))
            .style('stroke', '#fff')
            .style('stroke-width', 2);

        // Add labels
        nodeEnter.append('text')
            .attr('dy', 5)
            .attr('text-anchor', 'middle')
            .style('fill', '#fff')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .text(d => d.name);

        // Add activity rings
        nodeEnter.append('circle')
            .attr('class', 'activity-ring')
            .attr('r', d => d.type === 'primary' ? 35 : 25)
            .style('fill', 'none')
            .style('stroke', '#00ff88')
            .style('stroke-width', 2)
            .style('opacity', d => d.activity);

        // Update simulation
        this.simulation.nodes(this.nodes);
        this.simulation.force('link').links(this.links);
        this.simulation.alpha(0.3).restart();

        // Add tick handler
        this.simulation.on('tick', () => {
            this.linkGroup.selectAll('.link')
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            this.nodeGroup.selectAll('.node')
                .attr('transform', d => `translate(${d.x},${d.y})`);
        });
    }

    getNodeColor(d) {
        switch (d.status) {
            case 'active': return d.type === 'primary' ? '#4248f1' : '#00ff88';
            case 'paused': return '#ff6b6b';
            default: return '#666';
        }
    }

    dragStarted(event, d) {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    dragEnded(event, d) {
        if (!event.active) this.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}

// Export for global use
window.AgentNetworkVisualizer = AgentNetworkVisualizer;