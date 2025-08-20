// Enhanced Memory System with Knowledge Graph
class EnhancedMemorySystem {
    constructor() {
        this.memoryGraph = new Map();
        this.semanticClusters = new Map();
        this.conceptRelations = new Map();
        this.temporalIndex = new Map();
    }

    addMemory(id, content, metadata = {}) {
        const memory = {
            id,
            content,
            metadata: {
                ...metadata,
                timestamp: Date.now(),
                accessCount: 0,
                lastAccess: Date.now()
            },
            concepts: this.extractConcepts(content),
            embeddings: null // Will be computed by backend
        };

        this.memoryGraph.set(id, memory);
        this.updateSemanticClusters(memory);
        this.updateTemporalIndex(memory);
        this.linkRelatedMemories(memory);

        return memory;
    }

    extractConcepts(content) {
        // Simple concept extraction (in production, use NLP)
        const concepts = [];
        const words = content.toLowerCase().split(/\W+/);
        
        // Technical terms
        const techTerms = ['python', 'javascript', 'docker', 'api', 'database', 'algorithm'];
        const foundTech = words.filter(word => techTerms.includes(word));
        concepts.push(...foundTech.map(term => ({ type: 'technology', value: term })));

        // File paths
        const pathRegex = /\/[\w\/.-]+/g;
        const paths = content.match(pathRegex) || [];
        concepts.push(...paths.map(path => ({ type: 'path', value: path })));

        // URLs
        const urlRegex = /https?:\/\/[^\s]+/g;
        const urls = content.match(urlRegex) || [];
        concepts.push(...urls.map(url => ({ type: 'url', value: url })));

        return concepts;
    }

    updateSemanticClusters(memory) {
        memory.concepts.forEach(concept => {
            if (!this.semanticClusters.has(concept.value)) {
                this.semanticClusters.set(concept.value, new Set());
            }
            this.semanticClusters.get(concept.value).add(memory.id);
        });
    }

    updateTemporalIndex(memory) {
        const timeKey = this.getTimeKey(memory.metadata.timestamp);
        if (!this.temporalIndex.has(timeKey)) {
            this.temporalIndex.set(timeKey, new Set());
        }
        this.temporalIndex.get(timeKey).add(memory.id);
    }

    getTimeKey(timestamp) {
        const date = new Date(timestamp);
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }

    linkRelatedMemories(newMemory) {
        // Find related memories based on shared concepts
        const relatedIds = new Set();
        
        newMemory.concepts.forEach(concept => {
            const cluster = this.semanticClusters.get(concept.value);
            if (cluster) {
                cluster.forEach(id => {
                    if (id !== newMemory.id) {
                        relatedIds.add(id);
                    }
                });
            }
        });

        // Create bidirectional links
        relatedIds.forEach(relatedId => {
            if (!this.conceptRelations.has(newMemory.id)) {
                this.conceptRelations.set(newMemory.id, new Set());
            }
            if (!this.conceptRelations.has(relatedId)) {
                this.conceptRelations.set(relatedId, new Set());
            }
            
            this.conceptRelations.get(newMemory.id).add(relatedId);
            this.conceptRelations.get(relatedId).add(newMemory.id);
        });
    }

    getRelatedMemories(memoryId, depth = 2) {
        const visited = new Set();
        const queue = [{ id: memoryId, depth: 0 }];
        const related = [];

        while (queue.length > 0) {
            const { id, depth: currentDepth } = queue.shift();
            
            if (visited.has(id) || currentDepth > depth) continue;
            visited.add(id);

            if (currentDepth > 0) {
                const memory = this.memoryGraph.get(id);
                if (memory) {
                    related.push({
                        ...memory,
                        relationDepth: currentDepth
                    });
                }
            }

            const relations = this.conceptRelations.get(id);
            if (relations && currentDepth < depth) {
                relations.forEach(relatedId => {
                    if (!visited.has(relatedId)) {
                        queue.push({ id: relatedId, depth: currentDepth + 1 });
                    }
                });
            }
        }

        return related.sort((a, b) => a.relationDepth - b.relationDepth);
    }

    searchMemories(query, options = {}) {
        const {
            maxResults = 10,
            timeRange = null,
            conceptFilter = null,
            sortBy = 'relevance'
        } = options;

        const queryLower = query.toLowerCase();
        const results = [];

        this.memoryGraph.forEach(memory => {
            let score = 0;

            // Content matching
            if (memory.content.toLowerCase().includes(queryLower)) {
                score += 10;
            }

            // Concept matching
            memory.concepts.forEach(concept => {
                if (concept.value.toLowerCase().includes(queryLower)) {
                    score += 5;
                }
            });

            // Recency boost
            const age = Date.now() - memory.metadata.timestamp;
            const recencyScore = Math.max(0, 5 - (age / (24 * 60 * 60 * 1000))); // Decay over days
            score += recencyScore;

            // Access frequency boost
            score += Math.min(memory.metadata.accessCount * 0.1, 2);

            if (score > 0) {
                // Apply filters
                if (timeRange && !this.isInTimeRange(memory.metadata.timestamp, timeRange)) {
                    return;
                }
                
                if (conceptFilter && !memory.concepts.some(c => c.type === conceptFilter)) {
                    return;
                }

                results.push({ ...memory, relevanceScore: score });
            }
        });

        // Sort results
        results.sort((a, b) => {
            switch (sortBy) {
                case 'relevance': return b.relevanceScore - a.relevanceScore;
                case 'recent': return b.metadata.timestamp - a.metadata.timestamp;
                case 'accessed': return b.metadata.accessCount - a.metadata.accessCount;
                default: return b.relevanceScore - a.relevanceScore;
            }
        });

        return results.slice(0, maxResults);
    }

    isInTimeRange(timestamp, range) {
        const now = Date.now();
        const age = now - timestamp;
        
        switch (range) {
            case 'hour': return age <= 60 * 60 * 1000;
            case 'day': return age <= 24 * 60 * 60 * 1000;
            case 'week': return age <= 7 * 24 * 60 * 60 * 1000;
            case 'month': return age <= 30 * 24 * 60 * 60 * 1000;
            default: return true;
        }
    }

    getMemoryStats() {
        return {
            totalMemories: this.memoryGraph.size,
            totalConcepts: this.semanticClusters.size,
            totalRelations: Array.from(this.conceptRelations.values())
                .reduce((sum, relations) => sum + relations.size, 0),
            averageConceptsPerMemory: this.memoryGraph.size > 0 
                ? Array.from(this.memoryGraph.values())
                    .reduce((sum, memory) => sum + memory.concepts.length, 0) / this.memoryGraph.size
                : 0,
            topConcepts: this.getTopConcepts(10)
        };
    }

    getTopConcepts(limit = 10) {
        return Array.from(this.semanticClusters.entries())
            .sort((a, b) => b[1].size - a[1].size)
            .slice(0, limit)
            .map(([concept, memories]) => ({
                concept,
                memoryCount: memories.size
            }));
    }

    exportGraph() {
        const nodes = Array.from(this.memoryGraph.values()).map(memory => ({
            id: memory.id,
            label: memory.content.substring(0, 50) + '...',
            concepts: memory.concepts,
            metadata: memory.metadata
        }));

        const links = [];
        this.conceptRelations.forEach((relations, sourceId) => {
            relations.forEach(targetId => {
                if (sourceId < targetId) { // Avoid duplicate edges
                    links.push({
                        source: sourceId,
                        target: targetId,
                        weight: this.calculateRelationWeight(sourceId, targetId)
                    });
                }
            });
        });

        return { nodes, links };
    }

    calculateRelationWeight(id1, id2) {
        const memory1 = this.memoryGraph.get(id1);
        const memory2 = this.memoryGraph.get(id2);
        
        if (!memory1 || !memory2) return 0;

        // Calculate shared concepts
        const concepts1 = new Set(memory1.concepts.map(c => c.value));
        const concepts2 = new Set(memory2.concepts.map(c => c.value));
        const intersection = new Set([...concepts1].filter(x => concepts2.has(x)));
        
        return intersection.size / Math.max(concepts1.size, concepts2.size);
    }
}

// Export for global use
window.EnhancedMemorySystem = EnhancedMemorySystem;