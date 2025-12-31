const input = document.querySelector('#input')
const chatcontainer = document.querySelector('#chatcontainer')
const ask = document.querySelector('#ask')


input?.addEventListener('keyup', handleenter)
ask.addEventListener('click',handleAsk)

function handleenter(e) {
    if(e.key === 'Enter') {
        const text = input?.value.trim();
        if(!text) return
        generate(text)
    }
}

function generate(text){
    //append message to ui
    //send it to the llm
    //append response to the ui

    const msg = document.createElement('div')
    msg.className = 'my-6 bg-neutral-800 p-3 rounded-xl ml-auto max-w-fit'
    msg.textContent = text
    chatcontainer?.appendChild(msg)
    input.value = '';
}

function handleAsk() {
    const text = input?.value.trim();
    if(!text) return
    generate(text)
}