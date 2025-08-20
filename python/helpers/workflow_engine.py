# Advanced Workflow Execution Engine
import asyncio
import json
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from enum import Enum
from agent import Agent, AgentContext, UserMessage

class NodeType(Enum):
    INPUT = "input"
    AGENT = "agent"
    TOOL = "tool"
    CONDITION = "condition"
    OUTPUT = "output"
    LOOP = "loop"
    PARALLEL = "parallel"
    MERGE = "merge"

@dataclass
class WorkflowNode:
    id: str
    type: NodeType
    config: Dict[str, Any]
    data: Dict[str, Any]
    x: float
    y: float

@dataclass
class WorkflowConnection:
    id: str
    from_node: str
    from_output: int
    to_node: str
    to_input: int

@dataclass
class WorkflowExecution:
    id: str
    status: str
    current_node: Optional[str]
    variables: Dict[str, Any]
    execution_log: List[Dict[str, Any]]
    start_time: float
    end_time: Optional[float]

class WorkflowEngine:
    def __init__(self, context: AgentContext):
        self.context = context
        self.executions: Dict[str, WorkflowExecution] = {}
        self.node_handlers = self._initialize_node_handlers()

    def _initialize_node_handlers(self):
        return {
            NodeType.INPUT: self._execute_input_node,
            NodeType.AGENT: self._execute_agent_node,
            NodeType.TOOL: self._execute_tool_node,
            NodeType.CONDITION: self._execute_condition_node,
            NodeType.OUTPUT: self._execute_output_node,
            NodeType.LOOP: self._execute_loop_node,
            NodeType.PARALLEL: self._execute_parallel_node,
            NodeType.MERGE: self._execute_merge_node,
        }

    async def execute_workflow(self, workflow_data: Dict[str, Any], input_data: Any = None) -> Dict[str, Any]:
        import time
        
        execution_id = f"exec_{int(time.time())}"
        execution = WorkflowExecution(
            id=execution_id,
            status="running",
            current_node=None,
            variables={"input": input_data},
            execution_log=[],
            start_time=time.time(),
            end_time=None
        )
        
        self.executions[execution_id] = execution
        
        try:
            # Parse workflow
            nodes = [WorkflowNode(
                id=node["id"],
                type=NodeType(node["type"]),
                config=node.get("config", {}),
                data=node.get("data", {}),
                x=node.get("x", 0),
                y=node.get("y", 0)
            ) for node in workflow_data.get("nodes", [])]
            
            connections = [WorkflowConnection(
                id=conn["id"],
                from_node=conn["from"],
                from_output=conn["fromOutput"],
                to_node=conn["to"],
                to_input=conn["toInput"]
            ) for conn in workflow_data.get("connections", [])]
            
            # Execute workflow
            result = await self._execute_workflow_graph(execution, nodes, connections)
            
            execution.status = "completed"
            execution.end_time = time.time()
            
            return {
                "execution_id": execution_id,
                "result": result,
                "log": execution.execution_log,
                "duration": execution.end_time - execution.start_time
            }
            
        except Exception as e:
            execution.status = "failed"
            execution.end_time = time.time()
            execution.execution_log.append({
                "timestamp": time.time(),
                "level": "error",
                "message": str(e)
            })
            
            return {
                "execution_id": execution_id,
                "error": str(e),
                "log": execution.execution_log
            }

    async def _execute_workflow_graph(self, execution: WorkflowExecution, nodes: List[WorkflowNode], connections: List[WorkflowConnection]):
        # Find starting nodes (nodes with no inputs)
        node_map = {node.id: node for node in nodes}
        connection_map = self._build_connection_map(connections)
        
        start_nodes = [node for node in nodes 
                      if not any(conn.to_node == node.id for conn in connections)]
        
        if not start_nodes:
            raise Exception("No starting nodes found in workflow")
        
        # Execute nodes in topological order
        visited = set()
        results = {}
        
        async def execute_node(node: WorkflowNode):
            if node.id in visited:
                return results.get(node.id)
            
            # Execute prerequisite nodes
            prerequisites = [conn for conn in connections if conn.to_node == node.id]
            prerequisite_results = {}
            
            for prereq in prerequisites:
                prereq_node = node_map[prereq.from_node]
                prereq_result = await execute_node(prereq_node)
                prerequisite_results[f"input_{prereq.to_input}"] = prereq_result
            
            # Execute current node
            execution.current_node = node.id
            node_result = await self._execute_single_node(execution, node, prerequisite_results)
            
            visited.add(node.id)
            results[node.id] = node_result
            
            return node_result
        
        # Execute all nodes
        final_results = []
        for start_node in start_nodes:
            result = await execute_node(start_node)
            final_results.append(result)
        
        # Find output nodes
        output_nodes = [node for node in nodes if node.type == NodeType.OUTPUT]
        if output_nodes:
            return [results.get(node.id) for node in output_nodes]
        
        return final_results[0] if len(final_results) == 1 else final_results

    def _build_connection_map(self, connections: List[WorkflowConnection]) -> Dict[str, List[WorkflowConnection]]:
        connection_map = {}
        for conn in connections:
            if conn.from_node not in connection_map:
                connection_map[conn.from_node] = []
            connection_map[conn.from_node].append(conn)
        return connection_map

    async def _execute_single_node(self, execution: WorkflowExecution, node: WorkflowNode, inputs: Dict[str, Any]) -> Any:
        import time
        
        execution.execution_log.append({
            "timestamp": time.time(),
            "level": "info",
            "message": f"Executing node {node.id} ({node.type.value})",
            "node_id": node.id
        })
        
        handler = self.node_handlers.get(node.type)
        if not handler:
            raise Exception(f"No handler for node type: {node.type}")
        
        try:
            result = await handler(execution, node, inputs)
            
            execution.execution_log.append({
                "timestamp": time.time(),
                "level": "success",
                "message": f"Node {node.id} completed successfully",
                "node_id": node.id,
                "result": str(result)[:200]  # Truncate long results
            })
            
            return result
            
        except Exception as e:
            execution.execution_log.append({
                "timestamp": time.time(),
                "level": "error",
                "message": f"Node {node.id} failed: {str(e)}",
                "node_id": node.id
            })
            raise

    async def _execute_input_node(self, execution: WorkflowExecution, node: WorkflowNode, inputs: Dict[str, Any]) -> Any:
        # Return the input data or prompt for it
        if "input" in execution.variables:
            return execution.variables["input"]
        
        # If no input provided, use node configuration
        return node.data.get("default_value", "")

    async def _execute_agent_node(self, execution: WorkflowExecution, node: WorkflowNode, inputs: Dict[str, Any]) -> Any:
        # Create a message for the agent based on inputs and node configuration
        input_text = inputs.get("input_0", "")
        
        if isinstance(input_text, dict):
            input_text = json.dumps(input_text)
        elif not isinstance(input_text, str):
            input_text = str(input_text)
        
        # Enhance the message with node-specific instructions
        enhanced_message = f"{node.data.get('instructions', '')}\n\n{input_text}".strip()
        
        # Use the agent to process the message
        message = UserMessage(message=enhanced_message, attachments=[])
        task = self.context.communicate(message)
        result = await task.result()
        
        return result

    async def _execute_tool_node(self, execution: WorkflowExecution, node: WorkflowNode, inputs: Dict[str, Any]) -> Any:
        tool_name = node.data.get("tool_name", "knowledge_tool")
        tool_args = node.data.get("tool_args", {})
        
        # Merge inputs with tool args
        combined_args = {**tool_args}
        for key, value in inputs.items():
            if key.startswith("input_"):
                index = key.split("_")[1]
                param_name = node.data.get(f"input_param_{index}", "query")
                combined_args[param_name] = value
        
        # Execute tool via agent
        agent = self.context.streaming_agent or self.context.agent0
        tool = agent.get_tool(tool_name, combined_args, "Workflow tool execution")
        
        response = await tool.execute(**combined_args)
        return response.message

    async def _execute_condition_node(self, execution: WorkflowExecution, node: WorkflowNode, inputs: Dict[str, Any]) -> Any:
        condition = node.data.get("condition", "True")
        input_value = inputs.get("input_0", True)
        
        # Create evaluation context
        eval_context = {
            "input": input_value,
            "variables": execution.variables,
            **inputs
        }
        
        try:
            # Safely evaluate condition
            result = eval(condition, {"__builtins__": {}}, eval_context)
            return {"condition_result": bool(result), "value": input_value}
        except Exception as e:
            execution.execution_log.append({
                "timestamp": time.time(),
                "level": "warning",
                "message": f"Condition evaluation failed: {str(e)}, defaulting to True",
                "node_id": node.id
            })
            return {"condition_result": True, "value": input_value}

    async def _execute_output_node(self, execution: WorkflowExecution, node: WorkflowNode, inputs: Dict[str, Any]) -> Any:
        # Format and return the final output
        output_format = node.data.get("format", "raw")
        input_value = inputs.get("input_0", "")
        
        if output_format == "json":
            try:
                return json.loads(input_value) if isinstance(input_value, str) else input_value
            except:
                return {"output": input_value}
        elif output_format == "formatted":
            template = node.data.get("template", "{value}")
            return template.format(value=input_value)
        else:
            return input_value

    async def _execute_loop_node(self, execution: WorkflowExecution, node: WorkflowNode, inputs: Dict[str, Any]) -> Any:
        iterations = node.data.get("iterations", 1)
        input_value = inputs.get("input_0", "")
        results = []
        
        for i in range(iterations):
            # Update execution variables for this iteration
            execution.variables[f"loop_{node.id}_iteration"] = i
            execution.variables[f"loop_{node.id}_input"] = input_value
            
            # For now, just collect the input for each iteration
            # In a full implementation, this would execute connected nodes
            results.append({"iteration": i, "input": input_value, "result": input_value})
        
        return results

    async def _execute_parallel_node(self, execution: WorkflowExecution, node: WorkflowNode, inputs: Dict[str, Any]) -> Any:
        # Execute multiple branches in parallel
        parallel_inputs = [value for key, value in inputs.items() if key.startswith("input_")]
        
        if not parallel_inputs:
            return []
        
        # Execute all inputs in parallel
        tasks = []
        for i, input_value in enumerate(parallel_inputs):
            task = asyncio.create_task(self._process_parallel_input(execution, node, input_value, i))
            tasks.append(task)
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        return results

    async def _process_parallel_input(self, execution: WorkflowExecution, node: WorkflowNode, input_value: Any, index: int) -> Any:
        # Process a single parallel input
        processing_time = node.data.get("processing_time", 1.0)
        await asyncio.sleep(processing_time)  # Simulate processing
        
        return {
            "index": index,
            "input": input_value,
            "processed": f"Processed: {input_value}",
            "timestamp": time.time()
        }

    async def _execute_merge_node(self, execution: WorkflowExecution, node: WorkflowNode, inputs: Dict[str, Any]) -> Any:
        # Merge multiple inputs into a single output
        merge_strategy = node.data.get("strategy", "concatenate")
        input_values = [value for key, value in inputs.items() if key.startswith("input_")]
        
        if merge_strategy == "concatenate":
            return " ".join(str(value) for value in input_values)
        elif merge_strategy == "array":
            return input_values
        elif merge_strategy == "json":
            return {f"input_{i}": value for i, value in enumerate(input_values)}
        else:
            return input_values[0] if input_values else None

    def get_execution_status(self, execution_id: str) -> Optional[Dict[str, Any]]:
        execution = self.executions.get(execution_id)
        if not execution:
            return None
        
        return {
            "id": execution.id,
            "status": execution.status,
            "current_node": execution.current_node,
            "progress": len(execution.execution_log),
            "start_time": execution.start_time,
            "end_time": execution.end_time,
            "duration": (execution.end_time or time.time()) - execution.start_time
        }

    def stop_execution(self, execution_id: str) -> bool:
        execution = self.executions.get(execution_id)
        if execution and execution.status == "running":
            execution.status = "stopped"
            execution.end_time = time.time()
            return True
        return False

    async def validate_workflow(self, workflow_data: Dict[str, Any]) -> Dict[str, Any]:
        errors = []
        warnings = []
        
        nodes = workflow_data.get("nodes", [])
        connections = workflow_data.get("connections", [])
        
        # Check for required fields
        for node in nodes:
            if not node.get("id"):
                errors.append("Node missing required 'id' field")
            if not node.get("type"):
                errors.append(f"Node {node.get('id', 'unknown')} missing required 'type' field")
        
        for conn in connections:
            required_fields = ["id", "from", "to", "fromOutput", "toInput"]
            for field in required_fields:
                if field not in conn:
                    errors.append(f"Connection missing required '{field}' field")
        
        # Check for orphaned nodes
        node_ids = {node["id"] for node in nodes}
        connected_nodes = set()
        
        for conn in connections:
            if conn.get("from") not in node_ids:
                errors.append(f"Connection references non-existent source node: {conn.get('from')}")
            if conn.get("to") not in node_ids:
                errors.append(f"Connection references non-existent target node: {conn.get('to')}")
            
            connected_nodes.add(conn.get("from"))
            connected_nodes.add(conn.get("to"))
        
        # Check for orphaned nodes
        for node in nodes:
            if node["id"] not in connected_nodes and len(nodes) > 1:
                warnings.append(f"Node '{node.get('id')}' is not connected to the workflow")
        
        # Check for circular dependencies
        try:
            self._check_circular_dependencies(nodes, connections)
        except Exception as e:
            errors.append(str(e))
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
            "node_count": len(nodes),
            "connection_count": len(connections)
        }

    def _check_circular_dependencies(self, nodes: List[Dict], connections: List[Dict]):
        # Build adjacency list
        adj_list = {}
        for node in nodes:
            adj_list[node["id"]] = []
        
        for conn in connections:
            if conn.get("from") and conn.get("to"):
                adj_list[conn["from"]].append(conn["to"])
        
        # DFS to detect cycles
        visited = set()
        rec_stack = set()
        
        def has_cycle(node_id):
            if node_id in rec_stack:
                return True
            if node_id in visited:
                return False
            
            visited.add(node_id)
            rec_stack.add(node_id)
            
            for neighbor in adj_list.get(node_id, []):
                if has_cycle(neighbor):
                    return True
            
            rec_stack.remove(node_id)
            return False
        
        for node_id in adj_list:
            if node_id not in visited:
                if has_cycle(node_id):
                    raise Exception("Circular dependency detected in workflow")

    def export_workflow_template(self, workflow_data: Dict[str, Any]) -> str:
        """Export workflow as a reusable template"""
        template = {
            "name": workflow_data.get("metadata", {}).get("name", "Untitled Template"),
            "description": workflow_data.get("metadata", {}).get("description", ""),
            "version": "1.0",
            "template_type": "agent_zero_workflow",
            "nodes": workflow_data.get("nodes", []),
            "connections": workflow_data.get("connections", []),
            "variables": self._extract_template_variables(workflow_data),
            "documentation": self._generate_workflow_documentation(workflow_data)
        }
        
        return json.dumps(template, indent=2)

    def _extract_template_variables(self, workflow_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract configurable variables from workflow"""
        variables = []
        
        for node in workflow_data.get("nodes", []):
            node_data = node.get("data", {})
            
            # Look for common configurable fields
            if "instructions" in node_data:
                variables.append({
                    "name": f"{node['id']}_instructions",
                    "type": "text",
                    "description": f"Instructions for {node.get('config', {}).get('title', 'node')}",
                    "default": node_data["instructions"]
                })
            
            if "condition" in node_data:
                variables.append({
                    "name": f"{node['id']}_condition",
                    "type": "expression",
                    "description": f"Condition for {node.get('config', {}).get('title', 'node')}",
                    "default": node_data["condition"]
                })
        
        return variables

    def _generate_workflow_documentation(self, workflow_data: Dict[str, Any]) -> str:
        """Generate comprehensive workflow documentation"""
        doc = f"# {workflow_data.get('metadata', {}).get('name', 'Workflow')} Documentation\n\n"
        
        doc += f"## Overview\n"
        doc += f"{workflow_data.get('metadata', {}).get('description', 'No description provided')}\n\n"
        
        doc += f"## Nodes\n"
        for node in workflow_data.get("nodes", []):
            doc += f"### {node.get('config', {}).get('title', 'Untitled')} ({node.get('type', 'unknown')})\n"
            doc += f"- **ID**: {node.get('id')}\n"
            doc += f"- **Description**: {node.get('config', {}).get('description', 'No description')}\n"
            if node.get("data"):
                doc += f"- **Configuration**: {json.dumps(node['data'], indent=2)}\n"
            doc += "\n"
        
        doc += f"## Connections\n"
        for conn in workflow_data.get("connections", []):
            doc += f"- {conn.get('from')} → {conn.get('to')}\n"
        
        return doc

# Global workflow engine instance
_workflow_engine = None

async def get_workflow_engine(context: AgentContext) -> WorkflowEngine:
    global _workflow_engine
    if not _workflow_engine:
        _workflow_engine = WorkflowEngine(context)
    return _workflow_engine

async def execute_workflow(context: AgentContext, workflow_data: Dict[str, Any], input_data: Any = None) -> Dict[str, Any]:
    engine = await get_workflow_engine(context)
    return await engine.execute_workflow(workflow_data, input_data)

async def validate_workflow(context: AgentContext, workflow_data: Dict[str, Any]) -> Dict[str, Any]:
    engine = await get_workflow_engine(context)
    return await engine.validate_workflow(workflow_data)