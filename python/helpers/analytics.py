# Advanced Analytics System
import time
import json
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from collections import defaultdict, deque
from datetime import datetime, timedelta

@dataclass
class AnalyticsEvent:
    timestamp: float
    event_type: str
    data: Dict[str, Any]
    context_id: str
    agent_number: int = 0

@dataclass
class PerformanceMetrics:
    response_times: List[float] = field(default_factory=list)
    token_usage: List[int] = field(default_factory=list)
    memory_usage: List[float] = field(default_factory=list)
    error_rate: float = 0.0
    throughput: float = 0.0
    efficiency_score: float = 100.0

class AnalyticsCollector:
    def __init__(self, max_events: int = 10000):
        self.events: deque = deque(maxlen=max_events)
        self.metrics: Dict[str, PerformanceMetrics] = defaultdict(PerformanceMetrics)
        self.session_start = time.time()
        self.active_contexts: Dict[str, Dict[str, Any]] = {}

    def record_event(self, event_type: str, data: Dict[str, Any], context_id: str = "", agent_number: int = 0):
        """Record an analytics event"""
        event = AnalyticsEvent(
            timestamp=time.time(),
            event_type=event_type,
            data=data,
            context_id=context_id,
            agent_number=agent_number
        )
        
        self.events.append(event)
        self.update_metrics(event)

    def update_metrics(self, event: AnalyticsEvent):
        """Update performance metrics based on event"""
        context_metrics = self.metrics[event.context_id]
        
        if event.event_type == "response_time":
            context_metrics.response_times.append(event.data.get("duration", 0))
            if len(context_metrics.response_times) > 100:
                context_metrics.response_times.pop(0)
        
        elif event.event_type == "token_usage":
            context_metrics.token_usage.append(event.data.get("tokens", 0))
            if len(context_metrics.token_usage) > 100:
                context_metrics.token_usage.pop(0)
        
        elif event.event_type == "memory_usage":
            context_metrics.memory_usage.append(event.data.get("usage", 0))
            if len(context_metrics.memory_usage) > 100:
                context_metrics.memory_usage.pop(0)
        
        elif event.event_type == "error":
            # Calculate error rate
            recent_events = [e for e in self.events if e.timestamp > time.time() - 3600]  # Last hour
            error_events = [e for e in recent_events if e.event_type == "error"]
            context_metrics.error_rate = len(error_events) / max(len(recent_events), 1)

        # Update efficiency score
        self.calculate_efficiency_score(context_metrics)

    def calculate_efficiency_score(self, metrics: PerformanceMetrics):
        """Calculate overall efficiency score (0-100)"""
        score = 100.0
        
        # Response time penalty
        if metrics.response_times:
            avg_response = sum(metrics.response_times) / len(metrics.response_times)
            if avg_response > 10000:  # 10 seconds
                score -= 30
            elif avg_response > 5000:  # 5 seconds
                score -= 15
            elif avg_response > 2000:  # 2 seconds
                score -= 5
        
        # Error rate penalty
        score -= metrics.error_rate * 50
        
        # Memory efficiency
        if metrics.memory_usage:
            avg_memory = sum(metrics.memory_usage) / len(metrics.memory_usage)
            if avg_memory > 0.9:  # 90% memory usage
                score -= 20
            elif avg_memory > 0.7:  # 70% memory usage
                score -= 10
        
        metrics.efficiency_score = max(0, min(100, score))

    def get_analytics_summary(self, context_id: str = "", time_range: int = 3600) -> Dict[str, Any]:
        """Get comprehensive analytics summary"""
        cutoff_time = time.time() - time_range
        recent_events = [e for e in self.events if e.timestamp > cutoff_time]
        
        if context_id:
            recent_events = [e for e in recent_events if e.context_id == context_id]
        
        summary = {
            "session_duration": time.time() - self.session_start,
            "total_events": len(recent_events),
            "event_types": self.get_event_type_distribution(recent_events),
            "performance": self.get_performance_summary(context_id),
            "trends": self.get_trend_analysis(recent_events),
            "recommendations": self.generate_recommendations(context_id)
        }
        
        return summary

    def get_event_type_distribution(self, events: List[AnalyticsEvent]) -> Dict[str, int]:
        """Get distribution of event types"""
        distribution = defaultdict(int)
        for event in events:
            distribution[event.event_type] += 1
        return dict(distribution)

    def get_performance_summary(self, context_id: str = "") -> Dict[str, Any]:
        """Get performance metrics summary"""
        if context_id and context_id in self.metrics:
            metrics = self.metrics[context_id]
        else:
            # Aggregate across all contexts
            metrics = PerformanceMetrics()
            for ctx_metrics in self.metrics.values():
                metrics.response_times.extend(ctx_metrics.response_times)
                metrics.token_usage.extend(ctx_metrics.token_usage)
                metrics.memory_usage.extend(ctx_metrics.memory_usage)
                metrics.error_rate = max(metrics.error_rate, ctx_metrics.error_rate)
            
            if self.metrics:
                metrics.efficiency_score = sum(m.efficiency_score for m in self.metrics.values()) / len(self.metrics)

        return {
            "avg_response_time": sum(metrics.response_times) / len(metrics.response_times) if metrics.response_times else 0,
            "total_tokens": sum(metrics.token_usage),
            "avg_memory_usage": sum(metrics.memory_usage) / len(metrics.memory_usage) if metrics.memory_usage else 0,
            "error_rate": metrics.error_rate,
            "efficiency_score": metrics.efficiency_score,
            "throughput": self.calculate_throughput(context_id)
        }

    def calculate_throughput(self, context_id: str = "") -> float:
        """Calculate messages per minute"""
        hour_ago = time.time() - 3600
        recent_messages = [e for e in self.events 
                          if e.timestamp > hour_ago and e.event_type == "message_sent"]
        
        if context_id:
            recent_messages = [e for e in recent_messages if e.context_id == context_id]
        
        if not recent_messages:
            return 0.0
        
        time_span = time.time() - min(e.timestamp for e in recent_messages)
        return len(recent_messages) / (time_span / 60) if time_span > 0 else 0.0

    def get_trend_analysis(self, events: List[AnalyticsEvent]) -> Dict[str, Any]:
        """Analyze trends in the data"""
        if len(events) < 10:
            return {"insufficient_data": True}
        
        # Group events by hour
        hourly_counts = defaultdict(int)
        for event in events:
            hour_key = datetime.fromtimestamp(event.timestamp).strftime("%Y-%m-%d %H:00")
            hourly_counts[hour_key] += 1
        
        # Calculate trend
        hours = sorted(hourly_counts.keys())
        if len(hours) >= 2:
            recent_avg = sum(hourly_counts[h] for h in hours[-2:]) / 2
            earlier_avg = sum(hourly_counts[h] for h in hours[:-2]) / max(len(hours) - 2, 1)
            trend = "increasing" if recent_avg > earlier_avg else "decreasing"
        else:
            trend = "stable"
        
        return {
            "hourly_distribution": dict(hourly_counts),
            "trend": trend,
            "peak_hour": max(hourly_counts.items(), key=lambda x: x[1])[0] if hourly_counts else None,
            "activity_pattern": self.detect_activity_pattern(hourly_counts)
        }

    def detect_activity_pattern(self, hourly_counts: Dict[str, int]) -> str:
        """Detect user activity patterns"""
        if not hourly_counts:
            return "no_pattern"
        
        hours_list = list(hourly_counts.values())
        avg = sum(hours_list) / len(hours_list)
        
        high_activity_hours = sum(1 for count in hours_list if count > avg * 1.5)
        
        if high_activity_hours / len(hours_list) > 0.3:
            return "bursty"
        elif max(hours_list) / avg > 3:
            return "sporadic"
        else:
            return "consistent"

    def generate_recommendations(self, context_id: str = "") -> List[Dict[str, Any]]:
        """Generate performance and usage recommendations"""
        recommendations = []
        
        if context_id and context_id in self.metrics:
            metrics = self.metrics[context_id]
        else:
            return recommendations
        
        # Response time recommendations
        if metrics.response_times:
            avg_response = sum(metrics.response_times) / len(metrics.response_times)
            if avg_response > 5000:
                recommendations.append({
                    "type": "performance",
                    "priority": "high",
                    "title": "Slow Response Times",
                    "description": f"Average response time is {avg_response/1000:.1f}s. Consider using a faster model or reducing context size.",
                    "action": "optimize_model"
                })
        
        # Token usage recommendations
        if metrics.token_usage:
            total_tokens = sum(metrics.token_usage)
            if total_tokens > 500000:  # High token usage
                recommendations.append({
                    "type": "cost",
                    "priority": "medium",
                    "title": "High Token Usage",
                    "description": f"You've used {total_tokens:,} tokens. Consider enabling history compression.",
                    "action": "enable_compression"
                })
        
        # Error rate recommendations
        if metrics.error_rate > 0.1:  # 10% error rate
            recommendations.append({
                "type": "reliability",
                "priority": "high",
                "title": "High Error Rate",
                "description": f"Error rate is {metrics.error_rate*100:.1f}%. Review your prompts and tool configurations.",
                "action": "review_configuration"
            })
        
        # Memory recommendations
        if metrics.memory_usage:
            avg_memory = sum(metrics.memory_usage) / len(metrics.memory_usage)
            if avg_memory > 0.8:
                recommendations.append({
                    "type": "memory",
                    "priority": "medium",
                    "title": "High Memory Usage",
                    "description": f"Memory usage is {avg_memory*100:.1f}%. Consider clearing old conversations.",
                    "action": "clear_memory"
                })
        
        return recommendations

    def export_analytics(self, context_id: str = "", format: str = "json") -> str:
        """Export analytics data in various formats"""
        data = self.get_analytics_summary(context_id)
        
        if format == "json":
            return json.dumps(data, indent=2)
        elif format == "csv":
            return self.to_csv(data)
        elif format == "report":
            return self.generate_report(data)
        else:
            raise ValueError(f"Unsupported format: {format}")

    def to_csv(self, data: Dict[str, Any]) -> str:
        """Convert analytics data to CSV format"""
        import csv
        import io
        
        output = io.StringIO()
        
        # Write events data
        if self.events:
            writer = csv.writer(output)
            writer.writerow(["Timestamp", "Event Type", "Context ID", "Agent Number", "Data"])
            
            for event in self.events:
                writer.writerow([
                    datetime.fromtimestamp(event.timestamp).isoformat(),
                    event.event_type,
                    event.context_id,
                    event.agent_number,
                    json.dumps(event.data)
                ])
        
        return output.getvalue()

    def generate_report(self, data: Dict[str, Any]) -> str:
        """Generate a comprehensive analytics report"""
        report = f"""
# Agent Zero Analytics Report
Generated: {datetime.now().isoformat()}

## Session Overview
- Duration: {data['session_duration']:.0f} seconds ({data['session_duration']/3600:.1f} hours)
- Total Events: {data['total_events']}
- Performance Score: {data['performance']['efficiency_score']:.1f}/100

## Performance Metrics
- Average Response Time: {data['performance']['avg_response_time']:.0f}ms
- Total Tokens Used: {data['performance']['total_tokens']:,}
- Average Memory Usage: {data['performance']['avg_memory_usage']:.1f}%
- Error Rate: {data['performance']['error_rate']*100:.1f}%
- Throughput: {data['performance']['throughput']:.1f} messages/minute

## Event Distribution
"""
        
        for event_type, count in data['event_types'].items():
            report += f"- {event_type}: {count}\n"
        
        report += f"\n## Trends\n"
        if data['trends'].get('insufficient_data'):
            report += "- Insufficient data for trend analysis\n"
        else:
            report += f"- Activity Trend: {data['trends']['trend']}\n"
            report += f"- Activity Pattern: {data['trends']['activity_pattern']}\n"
            if data['trends']['peak_hour']:
                report += f"- Peak Activity: {data['trends']['peak_hour']}\n"
        
        report += f"\n## Recommendations\n"
        for rec in data['recommendations']:
            report += f"- **{rec['title']}** ({rec['priority']} priority): {rec['description']}\n"
        
        return report

# Global analytics collector
_analytics_collector = None

def get_analytics_collector() -> AnalyticsCollector:
    global _analytics_collector
    if not _analytics_collector:
        _analytics_collector = AnalyticsCollector()
    return _analytics_collector

def record_event(event_type: str, data: Dict[str, Any], context_id: str = "", agent_number: int = 0):
    """Convenience function to record analytics events"""
    collector = get_analytics_collector()
    collector.record_event(event_type, data, context_id, agent_number)

def get_analytics_summary(context_id: str = "", time_range: int = 3600) -> Dict[str, Any]:
    """Get analytics summary for a context"""
    collector = get_analytics_collector()
    return collector.get_analytics_summary(context_id, time_range)