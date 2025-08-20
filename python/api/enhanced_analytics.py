from python.helpers.api import ApiHandler, Input, Output, Request, Response
from python.helpers import analytics
import json

class EnhancedAnalytics(ApiHandler):
    async def process(self, input: Input, request: Request) -> Output:
        action = input.get("action", "get_summary")
        context_id = input.get("context", "")
        
        if action == "get_summary":
            return await self.get_analytics_summary(context_id)
        elif action == "record_event":
            return await self.record_analytics_event(input)
        elif action == "get_recommendations":
            return await self.get_recommendations(context_id)
        elif action == "export_data":
            return await self.export_analytics_data(input)
        else:
            raise Exception(f"Unknown analytics action: {action}")

    async def get_analytics_summary(self, context_id: str) -> Output:
        summary = analytics.get_analytics_summary(context_id)
        
        # Enhance with additional insights
        enhanced_summary = {
            **summary,
            "insights": self.generate_insights(summary),
            "comparative_analysis": self.get_comparative_analysis(context_id),
            "optimization_opportunities": self.identify_optimizations(summary)
        }
        
        return {"analytics": enhanced_summary}

    async def record_analytics_event(self, input: Input) -> Output:
        event_type = input.get("event_type", "")
        event_data = input.get("data", {})
        context_id = input.get("context", "")
        agent_number = input.get("agent_number", 0)
        
        analytics.record_event(event_type, event_data, context_id, agent_number)
        
        return {"status": "recorded", "event_type": event_type}

    async def get_recommendations(self, context_id: str) -> Output:
        collector = analytics.get_analytics_collector()
        recommendations = collector.generate_recommendations(context_id)
        
        # Add enhanced recommendations
        enhanced_recommendations = self.enhance_recommendations(recommendations, context_id)
        
        return {"recommendations": enhanced_recommendations}

    async def export_analytics_data(self, input: Input) -> Output:
        context_id = input.get("context", "")
        format_type = input.get("format", "json")
        
        collector = analytics.get_analytics_collector()
        exported_data = collector.export_analytics(context_id, format_type)
        
        return {
            "data": exported_data,
            "format": format_type,
            "timestamp": analytics.time.time()
        }

    def generate_insights(self, summary):
        """Generate intelligent insights from analytics data"""
        insights = []
        
        performance = summary.get("performance", {})
        
        # Response time insights
        avg_response = performance.get("avg_response_time", 0)
        if avg_response > 0:
            if avg_response < 1000:
                insights.append({
                    "type": "performance",
                    "level": "positive",
                    "title": "Excellent Response Times",
                    "description": f"Your average response time of {avg_response:.0f}ms is excellent for AI interactions."
                })
            elif avg_response > 5000:
                insights.append({
                    "type": "performance",
                    "level": "warning",
                    "title": "Slow Response Times",
                    "description": f"Average response time of {avg_response/1000:.1f}s could be improved.",
                    "suggestion": "Consider using a faster model or reducing context size."
                })
        
        # Token usage insights
        total_tokens = performance.get("total_tokens", 0)
        if total_tokens > 100000:
            insights.append({
                "type": "cost",
                "level": "info",
                "title": "High Token Usage",
                "description": f"You've used {total_tokens:,} tokens in this session.",
                "suggestion": "Enable automatic summarization to reduce token consumption."
            })
        
        # Efficiency insights
        efficiency = performance.get("efficiency_score", 100)
        if efficiency > 90:
            insights.append({
                "type": "efficiency",
                "level": "positive",
                "title": "High Efficiency",
                "description": f"Your workflow efficiency of {efficiency:.1f}% is excellent!"
            })
        elif efficiency < 70:
            insights.append({
                "type": "efficiency",
                "level": "warning",
                "title": "Efficiency Opportunity",
                "description": f"Efficiency score of {efficiency:.1f}% indicates room for improvement.",
                "suggestion": "Review error patterns and optimize your prompting strategy."
            })
        
        return insights

    def get_comparative_analysis(self, context_id: str):
        """Compare current session with historical averages"""
        collector = analytics.get_analytics_collector()
        current_metrics = collector.metrics.get(context_id)
        
        if not current_metrics:
            return {"insufficient_data": True}
        
        # Calculate historical averages
        all_metrics = list(collector.metrics.values())
        if len(all_metrics) < 2:
            return {"insufficient_data": True}
        
        historical_avg_response = sum(
            sum(m.response_times) / len(m.response_times) if m.response_times else 0 
            for m in all_metrics
        ) / len(all_metrics)
        
        current_avg_response = (
            sum(current_metrics.response_times) / len(current_metrics.response_times) 
            if current_metrics.response_times else 0
        )
        
        comparison = {
            "response_time": {
                "current": current_avg_response,
                "historical": historical_avg_response,
                "improvement": ((historical_avg_response - current_avg_response) / historical_avg_response * 100) 
                              if historical_avg_response > 0 else 0
            },
            "efficiency": {
                "current": current_metrics.efficiency_score,
                "historical": sum(m.efficiency_score for m in all_metrics) / len(all_metrics),
                "trend": "improving" if current_metrics.efficiency_score > 80 else "declining"
            }
        }
        
        return comparison

    def identify_optimizations(self, summary):
        """Identify specific optimization opportunities"""
        optimizations = []
        
        performance = summary.get("performance", {})
        trends = summary.get("trends", {})
        
        # Token optimization
        if performance.get("total_tokens", 0) > 50000:
            optimizations.append({
                "category": "cost",
                "priority": "medium",
                "title": "Token Usage Optimization",
                "description": "High token usage detected",
                "actions": [
                    "Enable conversation summarization",
                    "Use smaller utility models",
                    "Implement token-aware prompting"
                ],
                "potential_savings": "30-50% token reduction"
            })
        
        # Performance optimization
        if performance.get("avg_response_time", 0) > 3000:
            optimizations.append({
                "category": "performance",
                "priority": "high",
                "title": "Response Time Optimization",
                "description": "Slow response times affecting user experience",
                "actions": [
                    "Switch to faster model variants",
                    "Reduce context window size",
                    "Implement response streaming"
                ],
                "potential_improvement": "50-70% faster responses"
            })
        
        # Memory optimization
        error_rate = performance.get("error_rate", 0)
        if error_rate > 0.05:  # 5% error rate
            optimizations.append({
                "category": "reliability",
                "priority": "high",
                "title": "Error Rate Optimization",
                "description": f"Error rate of {error_rate*100:.1f}% is above optimal threshold",
                "actions": [
                    "Review and improve prompts",
                    "Add input validation",
                    "Implement error recovery mechanisms"
                ],
                "potential_improvement": "90%+ reduction in errors"
            })
        
        return optimizations

    def enhance_recommendations(self, base_recommendations, context_id: str):
        """Enhance basic recommendations with detailed analysis"""
        enhanced = []
        
        for rec in base_recommendations:
            enhanced_rec = {
                **rec,
                "implementation_steps": self.get_implementation_steps(rec),
                "expected_impact": self.calculate_expected_impact(rec),
                "difficulty": self.assess_implementation_difficulty(rec),
                "timeline": self.estimate_implementation_time(rec)
            }
            enhanced.append(enhanced_rec)
        
        # Add AI-generated recommendations
        ai_recommendations = self.generate_ai_recommendations(context_id)
        enhanced.extend(ai_recommendations)
        
        return enhanced

    def get_implementation_steps(self, recommendation):
        """Generate step-by-step implementation guide"""
        action = recommendation.get("action", "")
        
        steps_map = {
            "optimize_model": [
                "Open Settings panel",
                "Navigate to Chat Model section",
                "Select a faster model variant",
                "Test performance with sample queries",
                "Monitor improvement in analytics"
            ],
            "enable_compression": [
                "Access Memory settings",
                "Enable automatic summarization",
                "Set compression threshold",
                "Test with long conversations",
                "Monitor token savings"
            ],
            "review_configuration": [
                "Analyze error patterns in history",
                "Review prompt templates",
                "Check tool configurations",
                "Test with simplified prompts",
                "Monitor error reduction"
            ]
        }
        
        return steps_map.get(action, ["Review the recommendation", "Plan implementation", "Execute changes", "Monitor results"])

    def calculate_expected_impact(self, recommendation):
        """Calculate expected impact of implementing recommendation"""
        rec_type = recommendation.get("type", "")
        priority = recommendation.get("priority", "medium")
        
        impact_multipliers = {
            "performance": {"high": 0.7, "medium": 0.4, "low": 0.2},
            "cost": {"high": 0.6, "medium": 0.3, "low": 0.1},
            "reliability": {"high": 0.8, "medium": 0.5, "low": 0.2}
        }
        
        base_impact = impact_multipliers.get(rec_type, {"high": 0.5, "medium": 0.3, "low": 0.1})
        return base_impact.get(priority, 0.3)

    def assess_implementation_difficulty(self, recommendation):
        """Assess how difficult the recommendation is to implement"""
        action = recommendation.get("action", "")
        
        difficulty_map = {
            "optimize_model": "easy",
            "enable_compression": "medium",
            "review_configuration": "hard",
            "clear_memory": "easy"
        }
        
        return difficulty_map.get(action, "medium")

    def estimate_implementation_time(self, recommendation):
        """Estimate time required to implement recommendation"""
        difficulty = self.assess_implementation_difficulty(recommendation)
        
        time_estimates = {
            "easy": "2-5 minutes",
            "medium": "10-20 minutes", 
            "hard": "30-60 minutes"
        }
        
        return time_estimates.get(difficulty, "15-30 minutes")

    def generate_ai_recommendations(self, context_id: str):
        """Generate AI-powered recommendations based on usage patterns"""
        # This would use ML models in a full implementation
        # For now, return rule-based recommendations
        
        ai_recs = []
        
        # Analyze conversation patterns
        collector = analytics.get_analytics_collector()
        recent_events = [e for e in collector.events if e.timestamp > analytics.time.time() - 3600]
        
        # Tool usage patterns
        tool_events = [e for e in recent_events if e.event_type == "tool_usage"]
        if len(tool_events) > 10:
            ai_recs.append({
                "type": "workflow",
                "priority": "medium",
                "title": "Workflow Automation Opportunity",
                "description": "Your tool usage patterns suggest you could benefit from workflow automation.",
                "action": "create_workflow",
                "ai_confidence": 0.75,
                "implementation_steps": [
                    "Analyze your most common tool sequences",
                    "Create a workflow template",
                    "Test the automated workflow",
                    "Refine based on results"
                ]
            })
        
        return ai_recs