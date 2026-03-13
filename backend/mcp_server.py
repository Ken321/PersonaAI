"""
PersonaAI MCP Server
Cursor / Claude Desktop などのエージェントから呼び出されるMCPツール群。

起動方法:
  python mcp_server.py
"""

import asyncio
import openai
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp import types
from app.core.config import settings

server = Server("personaai")

MODEL = "gpt-4o-mini"


@server.list_tools()
async def list_tools() -> list[types.Tool]:
    return [
        types.Tool(
            name="persona_chat",
            description="指定したペルソナとして、ユーザーのメッセージに返答する",
            inputSchema={
                "type": "object",
                "properties": {
                    "persona_name": {"type": "string", "description": "ペルソナの名前"},
                    "persona_background": {"type": "string", "description": "ペルソナの背景・特性"},
                    "message": {"type": "string", "description": "ペルソナへの質問・メッセージ"},
                },
                "required": ["persona_name", "persona_background", "message"],
            },
        ),
        types.Tool(
            name="article_feedback",
            description="記事コンテンツに対して、指定ペルソナ視点のフィードバックを生成する",
            inputSchema={
                "type": "object",
                "properties": {
                    "article_content": {"type": "string", "description": "フィードバックしたい記事の本文"},
                    "persona_name": {"type": "string", "description": "ペルソナの名前"},
                    "persona_background": {"type": "string", "description": "ペルソナの背景・特性"},
                },
                "required": ["article_content", "persona_name", "persona_background"],
            },
        ),
    ]


@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[types.TextContent]:
    client = openai.OpenAI(api_key=settings.openai_api_key)

    if name == "persona_chat":
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        f"あなたは {arguments['persona_name']} というペルソナです。\n"
                        f"背景: {arguments['persona_background']}\n"
                        "このペルソナの視点から日本語で率直に答えてください。"
                    ),
                },
                {"role": "user", "content": arguments["message"]},
            ],
        )
        return [types.TextContent(type="text", text=response.choices[0].message.content)]

    if name == "article_feedback":
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        f"あなたは {arguments['persona_name']} というペルソナです。\n"
                        f"背景: {arguments['persona_background']}\n"
                        "以下の記事を読んで、このペルソナとしての率直なフィードバックを日本語で提供してください。\n"
                        "・記事の印象（刺さった点・刺さらなかった点）\n"
                        "・行動意欲への影響\n"
                        "・改善してほしい点"
                    ),
                },
                {"role": "user", "content": arguments["article_content"]},
            ],
        )
        return [types.TextContent(type="text", text=response.choices[0].message.content)]

    raise ValueError(f"Unknown tool: {name}")


async def main():
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())


if __name__ == "__main__":
    asyncio.run(main())
