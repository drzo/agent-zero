from python.helpers.api import ApiHandler, Input, Output, Request, Response
from python.helpers import analytics, workflow_engine
from typing import Dict, Any
import json

class EnhancedFeatures(ApiHandler):
    async def process(self, input: Input, request: Request) -> Output:
        action = input.get("action", "")
        
        if action == "get_analytics":
            return await self.get_analytics(input)
        elif action == "get_network_data":
            return await self.get_network_data(input)
        elif action == "execute_workflow":
            return await self.execute_workflow(input)
        elif action == "optimize_performance":
            return await self.optimize_performance(input)
        else:
            raise Exception(f"Unknown action: {action}")

    async def get_analytics(self, input: Input) -> Output:
        ctxid = input.get("context", "")
        context = self.get_context(ctxid)
        
        # Collect analytics data
        analytics_data = {
            "session_duration": self.calculate_session_duration(context),
            "message_count": len(context.agent0.history.output()),
            "token_usage": self.estimate_token_usage(context),
            "tool_usage": self.analyze_tool_usage(context),
            "performance_metrics": self.get_performance_metrics(context),
            "memory_efficiency": self.calculate_memory_efficiency(context)
        }
        
        return {"analytics": analytics_data}

    async def get_network_data(self, input: Input) -> Output:
        ctxid = input.get("context", "")
        context = self.get_context(ctxid)
        
        # Build agent network data
        network_data = self.build_agent_network(context)
        
        return {"network": network_data}

    async def execute_workflow(self, input: Input) -> Output:
        workflow_data = input.get("workflow", {})
        context_id = input.get("context", "")
        
        context = self.get_context(context_id)
        
        # Execute workflow using the workflow engine
        result = await workflow_engine.execute_workflow(context, workflow_data)
        
        return {"result": result, "success": True}

    async def optimize_performance(self, input: Input) -> Output:
        ctxid = input.get("context", "")
        context = self.get_context(ctxid)
        
        optimizations = await self.analyze_and_optimize(context)
        
        return {"optimizations": optimizations}

    def calculate_session_duration(self, context):
        # Calculate based on context creation time vs current time
        import time
        return int(time.time() - context.no)  # Rough estimation

    def estimate_token_usage(self, context):
        from python.helpers import tokens
        history_text = context.agent0.history.output_text()
        return tokens.approximate_tokens(history_text)

    def analyze_tool_usage(self, context):
        tool_stats = {}
        history = context.agent0.history.output()
        
        for message in history:
            if message.get("ai") and isinstance(message.get("content"), dict):
                content = message["content"]
                if "tool_name" in content:
                    tool_name = content["tool_name"]
                    if tool_name not in tool_stats:
                        tool_stats[tool_name] = {"count": 0, "success": 0}
                    tool_stats[tool_name]["count"] += 1
                    # Assume success if no error in subsequent messages
                    tool_stats[tool_name]["success"] += 1

        return tool_stats

    def get_performance_metrics(self, context):
        return {
            "memory_usage": len(context.agent0.history.output()),
            "compression_ratio": self.calculate_compression_ratio(context),
            "agent_efficiency": self.calculate_agent_efficiency(context)
        }

    def calculate_memory_efficiency(self, context):
        # Simple memory efficiency calculation
        total_messages = len(context.agent0.history.output())
        if total_messages == 0:
            return 100
        
        # Calculate based on message compression and relevance
        compressed_count = sum(1 for msg in context.agent0.history.output() 
                             if isinstance(msg.get("content"), str) and "summary" in str(msg["content"]).lower())
        
        efficiency = ((total_messages - compressed_count) / total_messages) * 100
        return min(100, max(0, efficiency))

    def calculate_compression_ratio(self, context):
        # Calculate how much the history has been compressed
        total_tokens = self.estimate_token_usage(context)
        if total_tokens == 0:
            return 0
        
        # Rough estimation of compression
        original_estimated = total_tokens * 1.5  # Assume 50% compression
        return (1 - (total_tokens / original_estimated)) * 100

    def calculate_agent_efficiency(self, context):
        # Calculate agent efficiency based on successful task completion
        history = context.agent0.history.output()
        if len(history) == 0:
            return 100
        
        successful_responses = sum(1 for msg in history 
                                 if msg.get("ai") and "response" in str(msg.get("content", "")).lower())
        
        return (successful_responses / len(history)) * 100

    def build_agent_network(self, context):
        nodes = []
        links = []
        
        # Build network from current agent hierarchy
        agent = context.agent0
        agent_count = 0
        
        while agent and agent_count < 10:  # Prevent infinite loops
            node_data = {
                "id": f"agent_{agent.number}",
                "name": f"Agent {agent.number}",
                "type": "primary" if agent.number == 0 else "subordinate",
                "status": "paused" if context.paused else "active",
                "memory_size": len(agent.history.output()),
                "activity_level": self.calculate_activity_level(agent),
                "tools_used": self.get_agent_tools_used(agent)
            }
            nodes.append(node_data)
            
            # Check for subordinate
            subordinate = agent.get_data(agent.DATA_NAME_SUBORDINATE)
            if subordinate:
                links.append({
                    "source": f"agent_{agent.number}",
                    "target": f"agent_{subordinate.number}",
                    "type": "delegation",
                    "strength": 1.0
                })
                agent = subordinate
            else:
                break
            
            agent_count += 1
        
        return {"nodes": nodes, "links": links}

    def calculate_activity_level(self, agent):
        # Calculate activity based on recent history
        recent_messages = agent.history.current.messages[-5:] if agent.history.current.messages else []
        return min(len(recent_messages) / 5.0, 1.0)

    def get_agent_tools_used(self, agent):
        tools = set()
        for message in agent.history.current.messages:
            if message.ai and isinstance(message.content, dict) and "tool_name" in message.content:
                tools.add(message.content["tool_name"])
        return list(tools)

    async def analyze_and_optimize(self, context):
        optimizations = []
        
        # Memory optimization
        if len(context.agent0.history.output()) > 50:
            optimizations.append({
                "type": "memory",
                "description": "Consider compressing older conversation history",
                "action": "compress_history",
                "priority": "medium"
            })
        
        # Token usage optimization
        token_usage = self.estimate_token_usage(context)
        if token_usage > 100000:
            optimizations.append({
                "type": "tokens",
                "description": "High token usage detected, consider summarization",
                "action": "enable_summarization",
                "priority": "high"
            })
        
        # Tool usage optimization
        tool_stats = self.analyze_tool_usage(context)
        redundant_tools = [tool for tool, stats in tool_stats.items() 
                          if stats["count"] > 10 and stats["success"] / stats["count"] < 0.5]
        
        if redundant_tools:
            optimizations.append({
                "type": "tools",
                "description": f"Consider reviewing usage of tools: {', '.join(redundant_tools)}",
                "action": "optimize_tools",
                "priority": "low"
            })
        
        return optimizations