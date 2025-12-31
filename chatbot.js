import 'dotenv/config';
import Groq from 'groq-sdk';
import { tavily } from '@tavily/core';
import readLine from 'node:readline/promises';

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generate(usermsg) {
  const rl = readLine.createInterface({input: process.stdin,output: process.stdout});
  const messages = [
      {
        role: 'system',
        content: `You are a smart personal assistant who answers questions. When you need current information, real-time data, or information you don\'t have access to, you MUST use the web_search tool to find the answer. Always search the web for  current events, latest news, or any information that requires up-to-date knowledge.
        current date and time: ${new Date().toUTCString()}`,


      },
      // {
      //   role: 'user',
      //   content: 'what is the best phone to buy?',
      // },
    ]

  while(true){
    messages.push({
      role: 'user',
      content: usermsg
    })
    while(true) {
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

  messages.push(completions.choices[0].message)

  const toolCalls = completions.choices[0].message.tool_calls;

  if(!toolCalls) {
    return completions.choices[0].message.content
    
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

}



async function webSearch({ query }) {
    console.log('Calling web search...');
    const response = await tvly.search(query)

    const searchResults = response.results.map((result => result.content)).join('\n\n')

    return searchResults;
}