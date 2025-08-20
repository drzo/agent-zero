from python.helpers.tool import Tool, Response
from python.helpers.memory import Memory
from python.helpers import analytics
import json
from typing import Dict, Any, List

class EnhancedMemoryTool(Tool):
    """Enhanced memory tool with advanced search and relationship mapping"""

    async def execute(self, 
                     query: str = "", 
                     operation: str = "search",
                     threshold: float = 0.6,
                     limit: int = 10,
                     include_relations: bool = True,
                     time_filter: str = "",
                     concept_filter: str = "",
                     **kwargs) -> Response:
        
        # Record analytics
        analytics.record_event("enhanced_memory_usage", {
            "operation": operation,
            "query_length": len(query),
            "threshold": threshold,
            "limit": limit
        }, self.agent.context.id, self.agent.number)
        
        db = await Memory.get(self.agent)
        
        if operation == "search":
            return await self._enhanced_search(db, query, threshold, limit, include_relations, time_filter, concept_filter)
        elif operation == "analyze":
            return await self._analyze_memory_patterns(db, query)
        elif operation == "cluster":
            return await self._cluster_memories(db, query)
        elif operation == "timeline":
            return await self._generate_timeline(db, query)
        elif operation == "graph":
            return await self._generate_knowledge_graph(db, query)
        else:
            return Response(message=f"Unknown operation: {operation}", break_loop=False)

    async def _enhanced_search(self, db, query: str, threshold: float, limit: int, 
                              include_relations: bool, time_filter: str, concept_filter: str) -> Response:
        """Enhanced search with relationship mapping and filtering"""
        
        # Build filter string
        filter_parts = []
        if time_filter:
            filter_parts.append(f"timestamp >= '{time_filter}'")
        if concept_filter:
            filter_parts.append(f"area == '{concept_filter}'")
        
        filter_str = " and ".join(filter_parts) if filter_parts else ""
        
        # Primary search
        primary_results = await db.search_similarity_threshold(
            query=query,
            limit=limit,
            threshold=threshold,
            filter=filter_str
        )
        
        if not primary_results:
            return Response(message="No memories found matching your query.", break_loop=False)
        
        # Enhanced results with relationships
        enhanced_results = []
        
        for doc in primary_results:
            result_data = {
                "content": doc.page_content,
                "metadata": doc.metadata,
                "relevance_score": getattr(doc, 'relevance_score', 0),
                "concepts": self._extract_concepts(doc.page_content),
                "related_memories": []
            }
            
            # Find related memories if requested
            if include_relations:
                related = await self._find_related_memories(db, doc, threshold * 0.8, 3)
                result_data["related_memories"] = [
                    {
                        "content": r.page_content[:100] + "...",
                        "relevance": getattr(r, 'relevance_score', 0),
                        "relationship_type": self._determine_relationship_type(doc, r)
                    }
                    for r in related
                ]
            
            enhanced_results.append(result_data)
        
        # Format response
        response_text = self._format_enhanced_search_results(enhanced_results, query)
        
        return Response(message=response_text, break_loop=False)

    async def _find_related_memories(self, db, source_doc, threshold: float, limit: int):
        """Find memories related to the source document"""
        concepts = self._extract_concepts(source_doc.page_content)
        
        if not concepts:
            return []
        
        # Search for memories containing similar concepts
        concept_queries = [concept["value"] for concept in concepts[:3]]  # Top 3 concepts
        related_memories = []
        
        for concept in concept_queries:
            related = await db.search_similarity_threshold(
                query=concept,
                limit=limit,
                threshold=threshold,
                filter=f"id != '{source_doc.metadata.get('id', '')}'"
            )
            related_memories.extend(related)
        
        # Remove duplicates and limit results
        seen_ids = set()
        unique_related = []
        for memory in related_memories:
            memory_id = memory.metadata.get("id", "")
            if memory_id not in seen_ids:
                seen_ids.add(memory_id)
                unique_related.append(memory)
                if len(unique_related) >= limit:
                    break
        
        return unique_related

    def _extract_concepts(self, content: str) -> List[Dict[str, Any]]:
        """Extract key concepts from content"""
        concepts = []
        
        # Technical terms
        tech_terms = ['python', 'javascript', 'docker', 'api', 'database', 'algorithm', 'function', 'class', 'module']
        words = content.lower().split()
        
        for term in tech_terms:
            if term in words:
                concepts.append({"type": "technology", "value": term, "confidence": 0.9})
        
        # File paths
        import re
        paths = re.findall(r'/[\w/.-]+', content)
        for path in paths[:3]:  # Limit to 3 paths
            concepts.append({"type": "path", "value": path, "confidence": 0.8})
        
        # URLs
        urls = re.findall(r'https?://[^\s]+', content)
        for url in urls[:2]:  # Limit to 2 URLs
            concepts.append({"type": "url", "value": url, "confidence": 0.7})
        
        return concepts

    def _determine_relationship_type(self, doc1, doc2) -> str:
        """Determine the type of relationship between two documents"""
        concepts1 = set(c["value"] for c in self._extract_concepts(doc1.page_content))
        concepts2 = set(c["value"] for c in self._extract_concepts(doc2.page_content))
        
        overlap = len(concepts1.intersection(concepts2))
        
        if overlap >= 3:
            return "strongly_related"
        elif overlap >= 2:
            return "related"
        elif overlap >= 1:
            return "weakly_related"
        else:
            return "contextual"

    def _format_enhanced_search_results(self, results: List[Dict[str, Any]], query: str) -> str:
        """Format enhanced search results for display"""
        if not results:
            return "No memories found."
        
        response = f"# Enhanced Memory Search Results for: '{query}'\n\n"
        response += f"Found {len(results)} relevant memories:\n\n"
        
        for i, result in enumerate(results, 1):
            response += f"## Memory {i} (Relevance: {result['relevance_score']:.2f})\n"
            response += f"{result['content']}\n\n"
            
            # Add concepts
            if result['concepts']:
                concepts_text = ", ".join([f"{c['value']} ({c['type']})" for c in result['concepts'][:5]])
                response += f"**Key Concepts:** {concepts_text}\n\n"
            
            # Add related memories
            if result['related_memories']:
                response += "**Related Memories:**\n"
                for related in result['related_memories']:
                    response += f"- {related['content']} (Relationship: {related['relationship_type']})\n"
                response += "\n"
            
            response += "---\n\n"
        
        return response

    async def _analyze_memory_patterns(self, db, query: str) -> Response:
        """Analyze patterns in memory data"""
        
        # Get all memories for analysis
        all_memories = await db.search_similarity_threshold(
            query="",  # Empty query to get all
            limit=1000,
            threshold=0.0
        )
        
        if not all_memories:
            return Response(message="No memories available for analysis.", break_loop=False)
        
        # Analyze patterns
        patterns = {
            "total_memories": len(all_memories),
            "concept_distribution": self._analyze_concept_distribution(all_memories),
            "temporal_patterns": self._analyze_temporal_patterns(all_memories),
            "content_analysis": self._analyze_content_patterns(all_memories),
            "relationship_density": self._calculate_relationship_density(all_memories)
        }
        
        # Generate analysis report
        report = self._generate_pattern_analysis_report(patterns)
        
        return Response(message=report, break_loop=False)

    def _analyze_concept_distribution(self, memories) -> Dict[str, Any]:
        """Analyze distribution of concepts across memories"""
        concept_counts = {}
        
        for memory in memories:
            concepts = self._extract_concepts(memory.page_content)
            for concept in concepts:
                key = f"{concept['type']}:{concept['value']}"
                concept_counts[key] = concept_counts.get(key, 0) + 1
        
        # Get top concepts
        sorted_concepts = sorted(concept_counts.items(), key=lambda x: x[1], reverse=True)
        
        return {
            "total_unique_concepts": len(concept_counts),
            "top_concepts": sorted_concepts[:10],
            "concept_diversity": len(concept_counts) / len(memories) if memories else 0
        }

    def _analyze_temporal_patterns(self, memories) -> Dict[str, Any]:
        """Analyze temporal patterns in memory creation"""
        timestamps = []
        
        for memory in memories:
            timestamp_str = memory.metadata.get("timestamp", "")
            if timestamp_str:
                try:
                    from datetime import datetime
                    timestamp = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
                    timestamps.append(timestamp)
                except:
                    pass
        
        if not timestamps:
            return {"no_temporal_data": True}
        
        # Analyze patterns
        timestamps.sort()
        
        # Group by hour of day
        hourly_distribution = {}
        for ts in timestamps:
            hour = ts.hour
            hourly_distribution[hour] = hourly_distribution.get(hour, 0) + 1
        
        # Find peak hours
        peak_hour = max(hourly_distribution.items(), key=lambda x: x[1])[0] if hourly_distribution else 0
        
        return {
            "total_timespan": (timestamps[-1] - timestamps[0]).days if len(timestamps) > 1 else 0,
            "hourly_distribution": hourly_distribution,
            "peak_hour": peak_hour,
            "memory_frequency": len(timestamps) / max((timestamps[-1] - timestamps[0]).days, 1) if len(timestamps) > 1 else 0
        }

    def _analyze_content_patterns(self, memories) -> Dict[str, Any]:
        """Analyze patterns in memory content"""
        content_lengths = [len(memory.page_content) for memory in memories]
        
        # Analyze content types
        content_types = {
            "code_snippets": 0,
            "questions": 0,
            "solutions": 0,
            "explanations": 0,
            "data": 0
        }
        
        for memory in memories:
            content = memory.page_content.lower()
            
            if any(keyword in content for keyword in ['def ', 'function', 'class ', 'import ', '```']):
                content_types["code_snippets"] += 1
            elif content.strip().endswith('?'):
                content_types["questions"] += 1
            elif any(keyword in content for keyword in ['solution', 'fix', 'resolve', 'answer']):
                content_types["solutions"] += 1
            elif any(keyword in content for keyword in ['explain', 'because', 'reason', 'how to']):
                content_types["explanations"] += 1
            else:
                content_types["data"] += 1
        
        return {
            "avg_content_length": sum(content_lengths) / len(content_lengths) if content_lengths else 0,
            "content_type_distribution": content_types,
            "length_distribution": {
                "short": len([l for l in content_lengths if l < 100]),
                "medium": len([l for l in content_lengths if 100 <= l < 500]),
                "long": len([l for l in content_lengths if l >= 500])
            }
        }

    def _calculate_relationship_density(self, memories) -> float:
        """Calculate how interconnected the memories are"""
        if len(memories) < 2:
            return 0.0
        
        total_possible_relationships = len(memories) * (len(memories) - 1) / 2
        actual_relationships = 0
        
        # Calculate relationships based on shared concepts
        for i, mem1 in enumerate(memories):
            concepts1 = set(c["value"] for c in self._extract_concepts(mem1.page_content))
            
            for mem2 in memories[i+1:]:
                concepts2 = set(c["value"] for c in self._extract_concepts(mem2.page_content))
                
                if concepts1.intersection(concepts2):
                    actual_relationships += 1
        
        return actual_relationships / total_possible_relationships if total_possible_relationships > 0 else 0

    def _generate_pattern_analysis_report(self, patterns: Dict[str, Any]) -> str:
        """Generate a comprehensive pattern analysis report"""
        report = "# Memory Pattern Analysis Report\n\n"
        
        # Overview
        report += f"## Overview\n"
        report += f"- **Total Memories:** {patterns['total_memories']}\n"
        report += f"- **Relationship Density:** {patterns['relationship_density']:.2%}\n\n"
        
        # Concept Analysis
        concept_dist = patterns['concept_distribution']
        report += f"## Concept Analysis\n"
        report += f"- **Unique Concepts:** {concept_dist['total_unique_concepts']}\n"
        report += f"- **Concept Diversity:** {concept_dist['concept_diversity']:.2f}\n\n"
        
        if concept_dist['top_concepts']:
            report += "**Top Concepts:**\n"
            for concept, count in concept_dist['top_concepts'][:5]:
                report += f"- {concept}: {count} occurrences\n"
            report += "\n"
        
        # Temporal Analysis
        temporal = patterns['temporal_patterns']
        if not temporal.get('no_temporal_data'):
            report += f"## Temporal Patterns\n"
            report += f"- **Memory Span:** {temporal['total_timespan']} days\n"
            report += f"- **Peak Activity Hour:** {temporal['peak_hour']}:00\n"
            report += f"- **Memory Frequency:** {temporal['memory_frequency']:.2f} memories/day\n\n"
        
        # Content Analysis
        content = patterns['content_analysis']
        report += f"## Content Analysis\n"
        report += f"- **Average Length:** {content['avg_content_length']:.0f} characters\n\n"
        
        report += "**Content Type Distribution:**\n"
        for content_type, count in content['content_type_distribution'].items():
            percentage = (count / patterns['total_memories']) * 100
            report += f"- {content_type.replace('_', ' ').title()}: {count} ({percentage:.1f}%)\n"
        
        report += "\n**Length Distribution:**\n"
        length_dist = content['length_distribution']
        total = sum(length_dist.values())
        for length_type, count in length_dist.items():
            percentage = (count / total) * 100 if total > 0 else 0
            report += f"- {length_type.title()}: {count} ({percentage:.1f}%)\n"
        
        # Insights and Recommendations
        report += f"\n## Insights & Recommendations\n"
        report += self._generate_memory_insights(patterns)
        
        return report

    def _generate_memory_insights(self, patterns: Dict[str, Any]) -> str:
        """Generate insights and recommendations based on patterns"""
        insights = []
        
        # Concept diversity insights
        diversity = patterns['concept_distribution']['concept_diversity']
        if diversity > 2.0:
            insights.append("🎯 **High Concept Diversity**: Your memories cover a wide range of topics, indicating diverse learning.")
        elif diversity < 0.5:
            insights.append("📍 **Focused Learning**: Your memories are highly focused on specific topics.")
        
        # Relationship density insights
        density = patterns['relationship_density']
        if density > 0.3:
            insights.append("🔗 **Well-Connected Knowledge**: Your memories are highly interconnected, facilitating knowledge transfer.")
        elif density < 0.1:
            insights.append("🔗 **Isolated Memories**: Consider creating more connections between related concepts.")
        
        # Content type insights
        content_types = patterns['content_analysis']['content_type_distribution']
        max_type = max(content_types.items(), key=lambda x: x[1])
        insights.append(f"📊 **Primary Content Type**: {max_type[0].replace('_', ' ').title()} ({max_type[1]} memories)")
        
        # Temporal insights
        temporal = patterns['temporal_patterns']
        if not temporal.get('no_temporal_data'):
            if temporal['memory_frequency'] > 5:
                insights.append("⚡ **High Learning Rate**: You're creating memories frequently, indicating active learning.")
            elif temporal['memory_frequency'] < 1:
                insights.append("🐌 **Steady Learning**: You're building knowledge at a steady pace.")
        
        return "\n".join(f"- {insight}" for insight in insights)

    async def _cluster_memories(self, db, query: str) -> Response:
        """Cluster memories by similarity and concepts"""
        
        # Get memories to cluster
        memories = await db.search_similarity_threshold(
            query=query if query else "",
            limit=50,
            threshold=0.3 if query else 0.0
        )
        
        if not memories:
            return Response(message="No memories available for clustering.", break_loop=False)
        
        # Simple clustering based on shared concepts
        clusters = {}
        unclustered = []
        
        for memory in memories:
            concepts = self._extract_concepts(memory.page_content)
            
            if not concepts:
                unclustered.append(memory)
                continue
            
            # Find best cluster
            best_cluster = None
            best_score = 0
            
            for cluster_key, cluster_memories in clusters.items():
                score = self._calculate_cluster_similarity(concepts, cluster_key)
                if score > best_score and score > 0.3:
                    best_score = score
                    best_cluster = cluster_key
            
            if best_cluster:
                clusters[best_cluster].append(memory)
            else:
                # Create new cluster
                primary_concept = concepts[0]["value"] if concepts else "misc"
                clusters[primary_concept] = [memory]
        
        # Format clustering results
        response = f"# Memory Clustering Results\n\n"
        response += f"Found {len(clusters)} clusters from {len(memories)} memories:\n\n"
        
        for cluster_name, cluster_memories in clusters.items():
            response += f"## Cluster: {cluster_name.title()} ({len(cluster_memories)} memories)\n"
            for memory in cluster_memories[:3]:  # Show first 3
                response += f"- {memory.page_content[:100]}...\n"
            if len(cluster_memories) > 3:
                response += f"- ... and {len(cluster_memories) - 3} more\n"
            response += "\n"
        
        if unclustered:
            response += f"## Unclustered ({len(unclustered)} memories)\n"
            response += "These memories don't fit into clear concept clusters.\n\n"
        
        return Response(message=response, break_loop=False)

    def _calculate_cluster_similarity(self, concepts: List[Dict[str, Any]], cluster_key: str) -> float:
        """Calculate similarity between concepts and a cluster"""
        concept_values = [c["value"] for c in concepts]
        
        # Simple similarity based on shared terms
        if cluster_key in concept_values:
            return 1.0
        
        # Check for partial matches
        for concept_value in concept_values:
            if cluster_key in concept_value or concept_value in cluster_key:
                return 0.7
        
        return 0.0

    async def _generate_timeline(self, db, query: str) -> Response:
        """Generate a timeline view of memories"""
        
        # Get memories with timestamps
        memories = await db.search_similarity_threshold(
            query=query if query else "",
            limit=100,
            threshold=0.3 if query else 0.0
        )
        
        if not memories:
            return Response(message="No memories found for timeline generation.", break_loop=False)
        
        # Sort by timestamp
        timestamped_memories = []
        for memory in memories:
            timestamp_str = memory.metadata.get("timestamp", "")
            if timestamp_str:
                try:
                    from datetime import datetime
                    timestamp = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
                    timestamped_memories.append((timestamp, memory))
                except:
                    pass
        
        timestamped_memories.sort(key=lambda x: x[0])
        
        # Generate timeline
        timeline = f"# Memory Timeline\n\n"
        
        if query:
            timeline += f"Timeline for memories related to: '{query}'\n\n"
        
        current_date = None
        for timestamp, memory in timestamped_memories:
            date_str = timestamp.strftime("%Y-%m-%d")
            time_str = timestamp.strftime("%H:%M")
            
            if current_date != date_str:
                timeline += f"## {date_str}\n\n"
                current_date = date_str
            
            timeline += f"**{time_str}** - {memory.page_content[:100]}...\n"
            
            # Add concepts for context
            concepts = self._extract_concepts(memory.page_content)
            if concepts:
                concept_tags = " ".join([f"`{c['value']}`" for c in concepts[:3]])
                timeline += f"  *Tags: {concept_tags}*\n"
            
            timeline += "\n"
        
        return Response(message=timeline, break_loop=False)

    async def _generate_knowledge_graph(self, db, query: str) -> Response:
        """Generate a knowledge graph representation"""
        
        # Get relevant memories
        memories = await db.search_similarity_threshold(
            query=query if query else "",
            limit=30,
            threshold=0.4 if query else 0.0
        )
        
        if not memories:
            return Response(message="No memories found for knowledge graph generation.", break_loop=False)
        
        # Build graph structure
        nodes = {}
        edges = []
        
        # Create nodes for memories and concepts
        for i, memory in enumerate(memories):
            memory_id = f"memory_{i}"
            nodes[memory_id] = {
                "id": memory_id,
                "type": "memory",
                "label": memory.page_content[:50] + "...",
                "content": memory.page_content,
                "size": len(memory.page_content)
            }
            
            # Create concept nodes and edges
            concepts = self._extract_concepts(memory.page_content)
            for concept in concepts:
                concept_id = f"concept_{concept['value']}"
                
                if concept_id not in nodes:
                    nodes[concept_id] = {
                        "id": concept_id,
                        "type": "concept",
                        "label": concept['value'],
                        "concept_type": concept['type'],
                        "size": 1
                    }
                else:
                    nodes[concept_id]["size"] += 1
                
                # Create edge between memory and concept
                edges.append({
                    "source": memory_id,
                    "target": concept_id,
                    "type": "contains",
                    "weight": concept['confidence']
                })
        
        # Create edges between related memories
        for i, mem1 in enumerate(memories):
            for j, mem2 in enumerate(memories[i+1:], i+1):
                similarity = self._calculate_memory_similarity(mem1, mem2)
                if similarity > 0.5:
                    edges.append({
                        "source": f"memory_{i}",
                        "target": f"memory_{j}",
                        "type": "related",
                        "weight": similarity
                    })
        
        # Generate graph description
        graph_description = f"# Knowledge Graph\n\n"
        graph_description += f"Generated knowledge graph with {len(nodes)} nodes and {len(edges)} connections:\n\n"
        
        # Describe key concepts
        concept_nodes = [node for node in nodes.values() if node["type"] == "concept"]
        concept_nodes.sort(key=lambda x: x["size"], reverse=True)
        
        graph_description += "## Key Concepts:\n"
        for concept in concept_nodes[:10]:
            graph_description += f"- **{concept['label']}** ({concept['concept_type']}): Connected to {concept['size']} memories\n"
        
        graph_description += f"\n## Memory Clusters:\n"
        # Identify clusters (simplified)
        high_degree_memories = [node for node in nodes.values() if node["type"] == "memory"]
        memory_connections = {}
        
        for edge in edges:
            if edge["type"] == "related":
                memory_connections[edge["source"]] = memory_connections.get(edge["source"], 0) + 1
                memory_connections[edge["target"]] = memory_connections.get(edge["target"], 0) + 1
        
        highly_connected = sorted(memory_connections.items(), key=lambda x: x[1], reverse=True)[:5]
        
        for memory_id, connection_count in highly_connected:
            memory_node = nodes[memory_id]
            graph_description += f"- **Central Memory**: {memory_node['label']} ({connection_count} connections)\n"
        
        # Add graph data for potential visualization
        graph_description += f"\n## Graph Data (JSON)\n```json\n"
        graph_description += json.dumps({
            "nodes": list(nodes.values()),
            "edges": edges
        }, indent=2)
        graph_description += "\n```\n"
        
        return Response(message=graph_description, break_loop=False)

    def _calculate_memory_similarity(self, mem1, mem2) -> float:
        """Calculate similarity between two memories"""
        concepts1 = set(c["value"] for c in self._extract_concepts(mem1.page_content))
        concepts2 = set(c["value"] for c in self._extract_concepts(mem2.page_content))
        
        if not concepts1 or not concepts2:
            return 0.0
        
        intersection = concepts1.intersection(concepts2)
        union = concepts1.union(concepts2)
        
        return len(intersection) / len(union) if union else 0.0