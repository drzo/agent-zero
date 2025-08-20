// Advanced Workflow Designer
class WorkflowDesigner {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.workflow = {
            nodes: [],
            connections: [],
            metadata: {
                name: 'Untitled Workflow',
                description: '',
                created: Date.now(),
                modified: Date.now()
            }
        };
        this.selectedNode = null;
        this.isConnecting = false;
        this.connectionStart = null;
        this.nodeTypes = this.initializeNodeTypes();
        this.init();
    }

    initializeNodeTypes() {
        return {
            'input': {
                title: 'Input',
                icon: '📝',
                color: '#4248f1',
                inputs: 0,
                outputs: 1,
                description: 'Accepts user input or data'
            },
            'agent': {
                title: 'Agent',
                icon: '🤖',
                color: '#00ff88',
                inputs: 1,
                outputs: 2,
                description: 'AI agent that processes tasks'
            },
            'tool': {
                title: 'Tool',
                icon: '🔧',
                color: '#ff6b6b',
                inputs: 1,
                outputs: 1,
                description: 'Executes specific functions'
            },
            'condition': {
                title: 'Condition',
                icon: '🔀',
                color: '#ffa726',
                inputs: 1,
                outputs: 2,
                description: 'Conditional logic branching'
            },
            'output': {
                title: 'Output',
                icon: '📤',
                color: '#9c27b0',
                inputs: 1,
                outputs: 0,
                description: 'Final result or response'
            },
            'loop': {
                title: 'Loop',
                icon: '🔄',
                color: '#00bcd4',
                inputs: 1,
                outputs: 2,
                description: 'Iterative processing'
            }
        };
    }

    init() {
        this.setupCanvas();
        this.setupNodePalette();
        this.setupEventListeners();
        this.setupToolbar();
    }

    setupCanvas() {
        this.canvas = document.createElement('div');
        this.canvas.className = 'workflow-canvas';
        this.canvas.innerHTML = `
            <div class="workflow-background">
                <div class="grid-pattern"></div>
            </div>
            <div class="workflow-nodes"></div>
            <div class="workflow-connections"></div>
        `;
        
        this.container.appendChild(this.canvas);
        
        this.nodesContainer = this.canvas.querySelector('.workflow-nodes');
        this.connectionsContainer = this.canvas.querySelector('.workflow-connections');
    }

    setupNodePalette() {
        const palette = document.createElement('div');
        palette.className = 'node-palette';
        palette.innerHTML = `
            <h3>Workflow Components</h3>
            <div class="palette-grid">
                ${Object.entries(this.nodeTypes).map(([type, config]) => `
                    <div class="palette-item" data-node-type="${type}" 
                         draggable="true" style="--node-color: ${config.color}">
                        <div class="palette-icon">${config.icon}</div>
                        <div class="palette-title">${config.title}</div>
                        <div class="palette-description">${config.description}</div>
                    </div>
                `).join('')}
            </div>
        `;
        
        this.container.appendChild(palette);
    }

    setupToolbar() {
        const toolbar = document.createElement('div');
        toolbar.className = 'workflow-toolbar';
        toolbar.innerHTML = `
            <div class="toolbar-group">
                <button class="toolbar-btn" onclick="workflowDesigner.newWorkflow()">
                    <span>🆕</span> New
                </button>
                <button class="toolbar-btn" onclick="workflowDesigner.saveWorkflow()">
                    <span>💾</span> Save
                </button>
                <button class="toolbar-btn" onclick="workflowDesigner.loadWorkflow()">
                    <span>📁</span> Load
                </button>
            </div>
            <div class="toolbar-group">
                <button class="toolbar-btn" onclick="workflowDesigner.runWorkflow()">
                    <span>▶️</span> Run
                </button>
                <button class="toolbar-btn" onclick="workflowDesigner.validateWorkflow()">
                    <span>✅</span> Validate
                </button>
            </div>
            <div class="toolbar-group">
                <button class="toolbar-btn" onclick="workflowDesigner.exportWorkflow()">
                    <span>📤</span> Export
                </button>
                <button class="toolbar-btn" onclick="workflowDesigner.importWorkflow()">
                    <span>📥</span> Import
                </button>
            </div>
        `;
        
        this.container.insertBefore(toolbar, this.container.firstChild);
    }

    setupEventListeners() {
        // Drag and drop from palette
        this.container.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('palette-item')) {
                e.dataTransfer.setData('text/plain', e.target.dataset.nodeType);
            }
        });

        this.canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        this.canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            const nodeType = e.dataTransfer.getData('text/plain');
            if (nodeType) {
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                this.addNode(nodeType, x, y);
            }
        });

        // Node selection and connection
        this.canvas.addEventListener('click', (e) => {
            if (e.target.classList.contains('node-output')) {
                this.startConnection(e.target);
            } else if (e.target.classList.contains('node-input')) {
                this.completeConnection(e.target);
            } else if (e.target.closest('.workflow-node')) {
                this.selectNode(e.target.closest('.workflow-node'));
            } else {
                this.deselectNode();
            }
        });
    }

    addNode(type, x, y) {
        const config = this.nodeTypes[type];
        const node = {
            id: this.generateId(),
            type: type,
            x: x,
            y: y,
            config: { ...config },
            data: {}
        };

        this.workflow.nodes.push(node);
        this.renderNode(node);
        this.workflow.metadata.modified = Date.now();
    }

    renderNode(node) {
        const nodeElement = document.createElement('div');
        nodeElement.className = 'workflow-node';
        nodeElement.dataset.nodeId = node.id;
        nodeElement.style.left = `${node.x}px`;
        nodeElement.style.top = `${node.y}px`;
        nodeElement.style.setProperty('--node-color', node.config.color);

        nodeElement.innerHTML = `
            <div class="node-header">
                <div class="node-icon">${node.config.icon}</div>
                <div class="node-title">${node.config.title}</div>
            </div>
            <div class="node-content">
                <div class="node-inputs">
                    ${Array(node.config.inputs).fill(0).map((_, i) => 
                        `<div class="node-input" data-index="${i}"></div>`
                    ).join('')}
                </div>
                <div class="node-outputs">
                    ${Array(node.config.outputs).fill(0).map((_, i) => 
                        `<div class="node-output" data-index="${i}"></div>`
                    ).join('')}
                </div>
            </div>
            <div class="node-controls">
                <button class="node-edit-btn" onclick="workflowDesigner.editNode('${node.id}')">⚙️</button>
                <button class="node-delete-btn" onclick="workflowDesigner.deleteNode('${node.id}')">🗑️</button>
            </div>
        `;

        this.nodesContainer.appendChild(nodeElement);
        this.makeNodeDraggable(nodeElement);
    }

    makeNodeDraggable(nodeElement) {
        let isDragging = false;
        let startX, startY, startLeft, startTop;

        nodeElement.addEventListener('mousedown', (e) => {
            if (e.target.closest('.node-controls')) return;
            
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseInt(nodeElement.style.left) || 0;
            startTop = parseInt(nodeElement.style.top) || 0;
            
            nodeElement.style.zIndex = '1000';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            nodeElement.style.left = `${startLeft + deltaX}px`;
            nodeElement.style.top = `${startTop + deltaY}px`;
            
            // Update node data
            const node = this.workflow.nodes.find(n => n.id === nodeElement.dataset.nodeId);
            if (node) {
                node.x = startLeft + deltaX;
                node.y = startTop + deltaY;
            }
            
            this.updateConnections();
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                nodeElement.style.zIndex = '';
                this.workflow.metadata.modified = Date.now();
            }
        });
    }

    startConnection(outputElement) {
        this.isConnecting = true;
        this.connectionStart = {
            node: outputElement.closest('.workflow-node').dataset.nodeId,
            output: outputElement.dataset.index
        };
        
        outputElement.classList.add('connecting');
    }

    completeConnection(inputElement) {
        if (!this.isConnecting || !this.connectionStart) return;
        
        const connection = {
            id: this.generateId(),
            from: this.connectionStart.node,
            fromOutput: parseInt(this.connectionStart.output),
            to: inputElement.closest('.workflow-node').dataset.nodeId,
            toInput: parseInt(inputElement.dataset.index)
        };

        // Validate connection
        if (this.validateConnection(connection)) {
            this.workflow.connections.push(connection);
            this.renderConnection(connection);
            this.workflow.metadata.modified = Date.now();
        }

        this.cancelConnection();
    }

    validateConnection(connection) {
        // Prevent self-connections
        if (connection.from === connection.to) return false;
        
        // Prevent duplicate connections
        const exists = this.workflow.connections.some(conn => 
            conn.from === connection.from && 
            conn.fromOutput === connection.fromOutput &&
            conn.to === connection.to && 
            conn.toInput === connection.toInput
        );
        
        return !exists;
    }

    cancelConnection() {
        this.isConnecting = false;
        this.connectionStart = null;
        
        this.container.querySelectorAll('.connecting').forEach(el => {
            el.classList.remove('connecting');
        });
    }

    renderConnection(connection) {
        const fromNode = this.container.querySelector(`[data-node-id="${connection.from}"]`);
        const toNode = this.container.querySelector(`[data-node-id="${connection.to}"]`);
        
        if (!fromNode || !toNode) return;

        const connectionElement = document.createElement('div');
        connectionElement.className = 'workflow-connection';
        connectionElement.dataset.connectionId = connection.id;
        
        this.connectionsContainer.appendChild(connectionElement);
        this.updateConnectionPath(connectionElement, fromNode, toNode, connection);
    }

    updateConnections() {
        this.workflow.connections.forEach(connection => {
            const connectionElement = this.container.querySelector(`[data-connection-id="${connection.id}"]`);
            const fromNode = this.container.querySelector(`[data-node-id="${connection.from}"]`);
            const toNode = this.container.querySelector(`[data-node-id="${connection.to}"]`);
            
            if (connectionElement && fromNode && toNode) {
                this.updateConnectionPath(connectionElement, fromNode, toNode, connection);
            }
        });
    }

    updateConnectionPath(connectionElement, fromNode, toNode, connection) {
        const fromOutput = fromNode.querySelector(`[data-index="${connection.fromOutput}"]`);
        const toInput = toNode.querySelector(`[data-index="${connection.toInput}"]`);
        
        if (!fromOutput || !toInput) return;

        const fromRect = fromOutput.getBoundingClientRect();
        const toRect = toInput.getBoundingClientRect();
        const canvasRect = this.canvas.getBoundingClientRect();
        
        const startX = fromRect.left + fromRect.width / 2 - canvasRect.left;
        const startY = fromRect.top + fromRect.height / 2 - canvasRect.top;
        const endX = toRect.left + toRect.width / 2 - canvasRect.left;
        const endY = toRect.top + toRect.height / 2 - canvasRect.top;
        
        // Create SVG path
        const controlPointOffset = Math.abs(endX - startX) * 0.5;
        const path = `M ${startX} ${startY} C ${startX + controlPointOffset} ${startY} ${endX - controlPointOffset} ${endY} ${endX} ${endY}`;
        
        connectionElement.innerHTML = `
            <svg class="connection-svg">
                <path d="${path}" stroke="#4248f1" stroke-width="2" fill="none" 
                      marker-end="url(#arrowhead)" class="connection-path"/>
            </svg>
        `;
    }

    generateWorkflowCode() {
        const code = {
            python: this.generatePythonCode(),
            javascript: this.generateJavaScriptCode(),
            config: this.workflow
        };
        
        return code;
    }

    generatePythonCode() {
        let code = `# Generated workflow: ${this.workflow.metadata.name}\n`;
        code += `# Created: ${new Date(this.workflow.metadata.created).toISOString()}\n\n`;
        code += `import asyncio\nfrom agent import Agent, UserMessage\n\n`;
        code += `async def execute_workflow(agent, input_data):\n`;
        code += `    # Workflow execution logic\n`;
        
        // Generate node execution order
        const executionOrder = this.getExecutionOrder();
        
        executionOrder.forEach(nodeId => {
            const node = this.workflow.nodes.find(n => n.id === nodeId);
            code += `    # ${node.config.title} (${node.type})\n`;
            code += this.generateNodeCode(node);
        });
        
        code += `    return result\n`;
        return code;
    }

    generateJavaScriptCode() {
        let code = `// Generated workflow: ${this.workflow.metadata.name}\n`;
        code += `// Created: ${new Date(this.workflow.metadata.created).toISOString()}\n\n`;
        code += `async function executeWorkflow(agent, inputData) {\n`;
        code += `    // Workflow execution logic\n`;
        
        const executionOrder = this.getExecutionOrder();
        
        executionOrder.forEach(nodeId => {
            const node = this.workflow.nodes.find(n => n.id === nodeId);
            code += `    // ${node.config.title} (${node.type})\n`;
            code += this.generateNodeCodeJS(node);
        });
        
        code += `    return result;\n}\n`;
        return code;
    }

    getExecutionOrder() {
        // Topological sort of workflow nodes
        const visited = new Set();
        const tempVisited = new Set();
        const order = [];

        const visit = (nodeId) => {
            if (tempVisited.has(nodeId)) {
                throw new Error('Circular dependency detected in workflow');
            }
            if (visited.has(nodeId)) return;

            tempVisited.add(nodeId);
            
            // Visit all nodes that this node connects to
            this.workflow.connections
                .filter(conn => conn.from === nodeId)
                .forEach(conn => visit(conn.to));
            
            tempVisited.delete(nodeId);
            visited.add(nodeId);
            order.unshift(nodeId);
        };

        // Start with nodes that have no inputs
        const inputNodes = this.workflow.nodes.filter(node => 
            !this.workflow.connections.some(conn => conn.to === node.id)
        );

        inputNodes.forEach(node => visit(node.id));
        
        return order;
    }

    generateNodeCode(node) {
        switch (node.type) {
            case 'input':
                return `    input_value = input_data\n`;
            case 'agent':
                return `    result = await agent.monologue()\n`;
            case 'tool':
                return `    tool_result = await agent.use_tool('${node.data.toolName || 'unknown'}')\n`;
            case 'condition':
                return `    if ${node.data.condition || 'True'}:\n        # Branch A\n    else:\n        # Branch B\n`;
            case 'output':
                return `    return result\n`;
            case 'loop':
                return `    for i in range(${node.data.iterations || 1}):\n        # Loop body\n`;
            default:
                return `    # ${node.type} node\n`;
        }
    }

    generateNodeCodeJS(node) {
        switch (node.type) {
            case 'input':
                return `    let inputValue = inputData;\n`;
            case 'agent':
                return `    const result = await agent.monologue();\n`;
            case 'tool':
                return `    const toolResult = await agent.useTool('${node.data.toolName || 'unknown'}');\n`;
            case 'condition':
                return `    if (${node.data.condition || 'true'}) {\n        // Branch A\n    } else {\n        // Branch B\n    }\n`;
            case 'output':
                return `    return result;\n`;
            case 'loop':
                return `    for (let i = 0; i < ${node.data.iterations || 1}; i++) {\n        // Loop body\n    }\n`;
            default:
                return `    // ${node.type} node\n`;
        }
    }

    exportWorkflow() {
        const exportData = {
            workflow: this.workflow,
            generatedCode: this.generateWorkflowCode(),
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.workflow.metadata.name.replace(/\s+/g, '_')}_workflow.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    async runWorkflow() {
        const code = this.generateWorkflowCode();
        
        // Execute the workflow using Agent Zero's code execution
        const executionPrompt = `Execute this generated workflow:

\`\`\`python
${code.python}
\`\`\`

Please run this workflow with appropriate input data and return the results.`;

        // Add to chat input
        const chatInput = document.getElementById('chat-input');
        chatInput.value = executionPrompt;
        
        // Send automatically
        window.sendMessage();
    }

    validateWorkflow() {
        const errors = [];
        const warnings = [];

        // Check for orphaned nodes
        const connectedNodes = new Set();
        this.workflow.connections.forEach(conn => {
            connectedNodes.add(conn.from);
            connectedNodes.add(conn.to);
        });

        this.workflow.nodes.forEach(node => {
            if (!connectedNodes.has(node.id) && this.workflow.nodes.length > 1) {
                warnings.push(`Node "${node.config.title}" is not connected`);
            }
        });

        // Check for circular dependencies
        try {
            this.getExecutionOrder();
        } catch (e) {
            errors.push(e.message);
        }

        // Show validation results
        const result = {
            valid: errors.length === 0,
            errors: errors,
            warnings: warnings
        };

        this.showValidationResults(result);
        return result;
    }

    showValidationResults(result) {
        const content = `
            <div class="validation-results">
                <h3>${result.valid ? '✅ Workflow Valid' : '❌ Validation Failed'}</h3>
                
                ${result.errors.length > 0 ? `
                    <div class="validation-errors">
                        <h4>Errors:</h4>
                        <ul>
                            ${result.errors.map(error => `<li>${error}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${result.warnings.length > 0 ? `
                    <div class="validation-warnings">
                        <h4>Warnings:</h4>
                        <ul>
                            ${result.warnings.map(warning => `<li>${warning}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${result.valid && result.warnings.length === 0 ? `
                    <p>✨ Your workflow is perfectly configured and ready to run!</p>
                ` : ''}
            </div>
        `;
        
        window.genericModalProxy.openModal('Workflow Validation', '', content);
    }

    generateId() {
        return 'node_' + Math.random().toString(36).substr(2, 9);
    }

    selectNode(nodeElement) {
        // Deselect previous
        this.container.querySelectorAll('.workflow-node.selected').forEach(node => {
            node.classList.remove('selected');
        });
        
        // Select new
        nodeElement.classList.add('selected');
        this.selectedNode = nodeElement.dataset.nodeId;
    }

    deselectNode() {
        this.container.querySelectorAll('.workflow-node.selected').forEach(node => {
            node.classList.remove('selected');
        });
        this.selectedNode = null;
    }

    editNode(nodeId) {
        const node = this.workflow.nodes.find(n => n.id === nodeId);
        if (!node) return;

        const editContent = `
            <div class="node-editor">
                <div class="field">
                    <label>Node Name:</label>
                    <input type="text" value="${node.config.title}" id="node-name">
                </div>
                <div class="field">
                    <label>Description:</label>
                    <textarea id="node-description">${node.config.description}</textarea>
                </div>
                ${this.generateNodeSpecificFields(node)}
            </div>
        `;

        window.genericModalProxy.openModal(
            `Edit ${node.config.title}`, 
            '', 
            editContent
        ).then(result => {
            if (result === 'saved') {
                this.updateNodeFromEditor(node);
            }
        });
    }

    generateNodeSpecificFields(node) {
        switch (node.type) {
            case 'tool':
                return `
                    <div class="field">
                        <label>Tool Name:</label>
                        <input type="text" value="${node.data.toolName || ''}" id="tool-name">
                    </div>
                `;
            case 'condition':
                return `
                    <div class="field">
                        <label>Condition:</label>
                        <input type="text" value="${node.data.condition || ''}" id="condition-expr">
                    </div>
                `;
            case 'loop':
                return `
                    <div class="field">
                        <label>Iterations:</label>
                        <input type="number" value="${node.data.iterations || 1}" id="loop-iterations">
                    </div>
                `;
            default:
                return '';
        }
    }

    deleteNode(nodeId) {
        if (!confirm('Are you sure you want to delete this node?')) return;
        
        // Remove node
        this.workflow.nodes = this.workflow.nodes.filter(n => n.id !== nodeId);
        
        // Remove associated connections
        this.workflow.connections = this.workflow.connections.filter(conn => 
            conn.from !== nodeId && conn.to !== nodeId
        );
        
        // Remove from DOM
        const nodeElement = this.container.querySelector(`[data-node-id="${nodeId}"]`);
        if (nodeElement) nodeElement.remove();
        
        // Remove connection elements
        this.container.querySelectorAll('[data-connection-id]').forEach(connElement => {
            const connId = connElement.dataset.connectionId;
            const connection = this.workflow.connections.find(c => c.id === connId);
            if (!connection) connElement.remove();
        });
        
        this.workflow.metadata.modified = Date.now();
    }

    newWorkflow() {
        if (!confirm('Create a new workflow? Current workflow will be lost.')) return;
        
        this.workflow = {
            nodes: [],
            connections: [],
            metadata: {
                name: 'Untitled Workflow',
                description: '',
                created: Date.now(),
                modified: Date.now()
            }
        };
        
        this.nodesContainer.innerHTML = '';
        this.connectionsContainer.innerHTML = '';
    }

    saveWorkflow() {
        const workflowData = JSON.stringify(this.workflow, null, 2);
        const blob = new Blob([workflowData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.workflow.metadata.name.replace(/\s+/g, '_')}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    loadWorkflow() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const workflowData = JSON.parse(e.target.result);
                    this.loadWorkflowData(workflowData);
                } catch (error) {
                    window.toast('Invalid workflow file', 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    loadWorkflowData(workflowData) {
        this.workflow = workflowData;
        this.nodesContainer.innerHTML = '';
        this.connectionsContainer.innerHTML = '';
        
        // Render nodes
        this.workflow.nodes.forEach(node => {
            this.renderNode(node);
        });
        
        // Render connections
        setTimeout(() => {
            this.workflow.connections.forEach(connection => {
                this.renderConnection(connection);
            });
        }, 100);
    }
}

// Additional CSS for workflow designer
const workflowCSS = `
    .workflow-canvas {
        position: relative;
        width: 100%;
        height: 600px;
        background: var(--color-background);
        border: 1px solid var(--color-border);
        border-radius: 8px;
        overflow: hidden;
    }

    .workflow-background {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: 
            radial-gradient(circle at 20px 20px, var(--color-border) 1px, transparent 1px);
        background-size: 20px 20px;
        opacity: 0.3;
    }

    .workflow-nodes {
        position: relative;
        width: 100%;
        height: 100%;
    }

    .workflow-node {
        position: absolute;
        background: var(--color-panel);
        border: 2px solid var(--node-color, #4248f1);
        border-radius: 8px;
        min-width: 120px;
        cursor: move;
        transition: all 0.2s ease;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .workflow-node:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    .workflow-node.selected {
        border-color: #00ff88;
        box-shadow: 0 0 0 2px rgba(0, 255, 136, 0.3);
    }

    .node-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;
        background: var(--node-color, #4248f1);
        color: white;
        border-radius: 6px 6px 0 0;
    }

    .node-icon {
        font-size: 1.2rem;
    }

    .node-title {
        font-weight: bold;
        font-size: 0.9rem;
    }

    .node-content {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem;
        min-height: 40px;
    }

    .node-input, .node-output {
        width: 12px;
        height: 12px;
        border: 2px solid var(--node-color, #4248f1);
        border-radius: 50%;
        background: var(--color-background);
        cursor: pointer;
        margin: 2px 0;
        transition: all 0.2s ease;
    }

    .node-input:hover, .node-output:hover {
        background: var(--node-color, #4248f1);
        transform: scale(1.2);
    }

    .node-input {
        margin-left: -6px;
    }

    .node-output {
        margin-right: -6px;
    }

    .node-controls {
        display: flex;
        gap: 0.25rem;
        padding: 0.25rem;
        justify-content: center;
        border-top: 1px solid var(--color-border);
    }

    .node-edit-btn, .node-delete-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 3px;
        transition: background-color 0.2s ease;
    }

    .node-edit-btn:hover {
        background: rgba(66, 72, 241, 0.2);
    }

    .node-delete-btn:hover {
        background: rgba(255, 107, 107, 0.2);
    }

    .node-palette {
        background: var(--color-panel);
        border: 1px solid var(--color-border);
        border-radius: 8px;
        padding: 1rem;
        margin: 1rem 0;
    }

    .node-palette h3 {
        margin: 0 0 1rem 0;
        color: var(--color-primary);
    }

    .palette-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 0.5rem;
    }

    .palette-item {
        background: var(--color-background);
        border: 1px solid var(--node-color, #4248f1);
        border-radius: 6px;
        padding: 0.75rem;
        cursor: grab;
        transition: all 0.2s ease;
        text-align: center;
    }

    .palette-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(66, 72, 241, 0.2);
    }

    .palette-item:active {
        cursor: grabbing;
        transform: scale(0.95);
    }

    .palette-icon {
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
    }

    .palette-title {
        font-weight: bold;
        font-size: 0.9rem;
        margin-bottom: 0.25rem;
        color: var(--color-primary);
    }

    .palette-description {
        font-size: 0.75rem;
        opacity: 0.8;
    }

    .workflow-toolbar {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        background: var(--color-background);
        border: 1px solid var(--color-border);
        border-radius: 8px;
        margin-bottom: 1rem;
    }

    .toolbar-group {
        display: flex;
        gap: 0.5rem;
        padding-right: 1rem;
        border-right: 1px solid var(--color-border);
    }

    .toolbar-group:last-child {
        border-right: none;
    }

    .toolbar-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: var(--color-secondary);
        border: none;
        border-radius: 4px;
        color: var(--color-text);
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 0.9rem;
    }

    .toolbar-btn:hover {
        background: var(--color-primary);
        color: white;
    }

    .connection-svg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
    }

    .connection-path {
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    }

    .validation-results {
        padding: 1rem;
    }

    .validation-errors {
        background: rgba(255, 107, 107, 0.1);
        border: 1px solid #ff6b6b;
        border-radius: 4px;
        padding: 1rem;
        margin: 1rem 0;
    }

    .validation-warnings {
        background: rgba(255, 167, 38, 0.1);
        border: 1px solid #ffa726;
        border-radius: 4px;
        padding: 1rem;
        margin: 1rem 0;
    }

    .validation-errors h4,
    .validation-warnings h4 {
        margin: 0 0 0.5rem 0;
    }

    .validation-errors ul,
    .validation-warnings ul {
        margin: 0;
        padding-left: 1.5rem;
    }
`;

// Inject workflow CSS
const workflowStyleSheet = document.createElement('style');
workflowStyleSheet.textContent = workflowCSS;
document.head.appendChild(workflowStyleSheet);

// Export for global use
window.WorkflowDesigner = WorkflowDesigner;