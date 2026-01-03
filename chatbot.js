import 'dotenv/config';
import Groq from 'groq-sdk';
import { tavily } from '@tavily/core';

import NodeCache from 'node-cache';

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const cache = new NodeCache({ stdTTL: 60 * 60 * 24 });//24 hours

export async function generate(usermsg, threadId) {
  const messages = [
      {
        role: 'system',
        content: `You are a smart personal assistant.

If you know the answer to a question, answer it directly in plain English.
If the answer requires real-time, local, or up-to-date information, or if you don\'t know the answer, use the available tools to find it.

You have access to the following tool:

web_search(query: string): Use this to search the internet for current or unknown information.

Decide when to use your own knowledge and when to use the tool.
Do not mention the tool unless needed.

Examples:

Q: What is the capital of France?
A: The capital of France is Paris.

Q: What is the weather in Mumbai right now?
A: (use the search tool to find the latest weather)

Q: Who is the Prime Minister of India?
A: The current Prime Minister of India is Narendra Modi.

Q: Tell me the latest IT news.
A: (use the search tool to get the latest news)

Current date and time: ${new Date().toUTCString()}
`,
      }
    ]
  
  const message = cache.get(threadId) ?? messages;

  messages.push({
    role: 'user',
    content: usermsg
  })
  const MAX_RETRIES = 10;
  let count = 0;

  while(true) {

    if(count > MAX_RETRIES) {
      throw new Error('Max retries exceeded');
    }
    count++;
    const completions = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      temperature: 0.2,
      messages: messages,
      tools:[
          {
        "type": "function",
        "function": {
          "name": "web_search",
          "description": "Search the web for information",
          "parameters": {
            "type": "object",
            "properties": {
              "query": {
                "type": "string",
                "description": "The search query"
              }
            },
            "required": ["query"]
          }
        }
      }
      ],
      tool_choice:'auto',
      parallel_tool_calls: false
    });

    const assistantMessage = completions.choices[0].message;
    messages.push(assistantMessage)

    const toolCalls = assistantMessage.tool_calls;

    if(!toolCalls) {
      //here we end the chatbot response
      cache.set(threadId, message);
      return assistantMessage.content;
    }

    for(const tool of toolCalls) {
      const functionName = tool.function.name;
      const functionparams = tool.function.arguments

      if(functionName === 'web_search') {
        const toolResult = await webSearch(JSON.parse(functionparams));

        messages.push({
          tool_call_id: tool.id,
          role: 'tool',
          name: functionName,
          content: toolResult
        })
      }
    }
  }
}



async function webSearch({ query }) {
    console.log('Calling web search...');
    const response = await tvly.search(query)

    const searchResults = response.results.map((result => result.content)).join('\n\n')

    return searchResults;
}
