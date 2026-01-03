const input = document.querySelector('#input')
const chatcontainer = document.querySelector('#chatcontainer')
const ask = document.querySelector('#ask')


const threadId = Date.now().toString(36) + Math.random().toString(36);


input?.addEventListener('keyup', handleenter)
ask.addEventListener('click',handleAsk)

const loading = document.createElement('div')
loading.className = 'my-6 animate-pulse '
loading.textContent = 'Thinking...'

async function handleenter(e) {
    if(e.key === 'Enter') {
        const text = input?.value.trim();
        if(!text) return
        generate(text)
    }
}

async function generate(text){
    //append message to ui
    //send it to the llm
    //append response to the ui

    const msg = document.createElement('div')
    msg.className = 'my-6 bg-neutral-800 p-3 rounded-xl ml-auto max-w-fit'
    msg.textContent = text
    chatcontainer?.appendChild(msg)
    input.value = '';   

    chatcontainer?.appendChild(loading)

    //Call the server
    const assistantmsg = await callServer(text)

    const msg2 = document.createElement('div')
    msg2.className = 'max-w-fit'
    msg2.textContent = assistantmsg[0].content

    loading.remove()
    chatcontainer?.appendChild(msg2)

}

async function callServer(inputText){
    const response = await fetch('http://localhost:3000/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({threadId: threadId, messages: inputText})
    })
    if(!response.ok) {
        throw new Error('Error generating the response')
    }
    const result = await response.json();
    return result.messages
}

function handleAsk() {
    const text = input?.value.trim();
    if(!text) return
    generate(text)
}