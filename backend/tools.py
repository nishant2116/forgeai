"""
LangChain tools for WBS and SOP extraction.
Each tool takes raw document text and returns structured JSON.
"""

from langchain_core.tools import tool


@tool
def extract_wbs(document_text: str) -> str:
    """Extract structured Work Breakdown Structure (WBS) data from a manufacturing document.
    
    Takes the raw text of a WBS document and extracts tasks with their name, duration,
    responsible party, and dependencies.
    
    Args:
        document_text: The full text content of the WBS document.
    
    Returns:
        JSON string with extracted WBS data.
    """
    # This tool is a placeholder — actual extraction is done by the agent
    # using this tool's description to understand the schema
    return document_text


@tool
def extract_sop(document_text: str) -> str:
    """Extract structured Standard Operating Procedure (SOP) data from a manufacturing document.
    
    Takes the raw text of an SOP document and extracts each step with its sequence number,
    action description, responsible role, and whether it is safety-critical.
    
    Args:
        document_text: The full text content of the SOP document.
    
    Returns:
        JSON string with extracted SOP data.
    """
    return document_text
