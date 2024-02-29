let vsCC = document.getElementById('VSCanvasContainer')
let targetedNodeChange;
let DefaultSelector = document.getElementById('DefaultSelector')
let DefaultSelectorContainer = document.getElementById('DefaultSelectorContainer')

let nodesList = {
    "Enter" : {id: "Enter",
        title: "Enter Execution",
        content : "",
        ipins: {},
        exepins: {
            execution : "exe"
        },
        opins: {},
        params: {},
        executionOrder : [],
        code: "",
    },
    "Add" : {id: "Add",
        title: "Add two things together",
        content : "",
        ipins: {
            execution : "exe",
            first: {type: "string", default:"'firstParam'"},
            second: {type: "string", default:"'secondParam'"}
        },
        exepins: {
            execution : "exe"
        },
        opins: {
            result: "string"
        },
        params: {},
        executionOrder : [],
        code: "{result: {= first =}+{= second =}}",
    },
    "Alert" : {id: "Alert",
        title: "Show Alert",
        content : "",
        ipins: {
            execution : "exe",
            title: {type: "string", default:"'Default Text'"}
        },
        exepins: {
            execution : "exe"
        },
        opins: {},
        params: {},
        code: "alert({= title =})",
    },
    "Prompt" : {id: "Prompt",
        title: "Show Prompt",
        content : "",
        ipins: {
            execution :"exe",
            title: {type: "string", default:"'Default Text'"}
        },
        exepins: {
            execution : "exe"
        },
        opins: {
            userPrompt: "string"
        },
        params: {},
        code: "{userPrompt: prompt({= title =})}"
    },
    "IfElse" : {id: "IfElse",
        title: "If Statment",
        content : "",
        ipins: {
            execution : "exe",
            statement: {type: "string", default:'false'}
        },
        exepins: {
            execution : "exe",
            if: "exe",
            else: "exe"
        },
        opins: {},
        params: {},
        code: "if ({= statement =}) {{! if !}} else {{! else !}}"
    }
}


let vScripting = new VisualScripting({canvas: vsCC})
vsCC.addEventListener('contextmenu', (e) => {e.preventDefault();})


let nodeId = Math.floor(Math.random()*100000000);
vScripting.appendNode(10, 100, nodeId, nodeGenerator(nodeId, nodesList.Enter))
nodeId = Math.floor(Math.random()*100000000);
vScripting.appendNode(300, 100, nodeId, nodeGenerator(nodeId, nodesList.Prompt))
nodeId = Math.floor(Math.random()*100000000);
vScripting.appendNode(500, 100, nodeId, nodeGenerator(nodeId, nodesList.Add))


function changeDefault() {
    targetedNodeChange.setAttribute('data-gnuvs-pin-default', DefaultSelector.value)
    targetedNodeChange.className += ' changed'
}

function resetToDefault() {
    targetedNodeChange.setAttribute('data-gnuvs-pin-default', nodesList[targetedNodeChange.offsetParent.offsetParent.children[0].getAttribute('data-node-id')].ipins[targetedNodeChange.getAttribute('data-pin-utility')].default)
    targetedNodeChange.className = targetedNodeChange.className.replaceAll(' changed', '')
    DefaultSelector.value = targetedNodeChange.getAttribute('data-gnuvs-pin-default')
}

let CurrentNode = 'Alert'
vsCC.addEventListener('mousedown', (e) => {e.preventDefault()
    if (e.target.getAttribute('data-gnuvs-type') == 'ipin' && e.target.getAttribute('data-gnuvs-pin-type') != 'exe' &&  e.button ===2) {
        DefaultSelectorContainer.style.display = 'block'
        DefaultSelectorContainer.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
        DefaultSelector.value = e.target.getAttribute('data-gnuvs-pin-default')
        targetedNodeChange = e.target

        return 0
    }
    DefaultSelectorContainer.style.display = 'none'


    if (e.button ===2) {
        let nodeId = Math.floor(Math.random()*100000000);
        vScripting.appendNode(e.layerX, e.layerY, nodeId, nodeGenerator(nodeId, nodesList[CurrentNode]))
    }
})



function nodeGenerator(nodeId, node) {
    let exepinser = '';
    let ipinSer = '';
    let paramsSer = '';


    Object.keys(node.ipins).forEach(key => {
        let type = (node.ipins[key] == 'exe') ? node.ipins[key] : node.ipins[key].type;
        let def = (node.ipins[key] == 'exe') ? '' : 'data-gnuvs-pin-default="'+node.ipins[key].default+'"';
        ipinSer += `<div data-gnuvs-type="ipin" ${def} data-gnuvs-pin-type="${type}" data-pin-utility="${key}" class="pin ${type}"></div>`
    });
    Object.keys(node.exepins).forEach(key => {
        exepinser += `<div data-gnuvs-type="opin" data-gnuvs-path-class="${node.exepins[key]}" data-nodeid="${nodeId}" data-opin-id="${Math.floor(Math.random()*100000000)}" data-gnuvs-pin-type="${node.exepins[key]}" data-pin-utility="${key}" class="pin ${node.exepins[key]}"></div>`
    });
    Object.keys(node.opins).forEach(key => {
        exepinser += `<div data-gnuvs-type="opin" data-gnuvs-path-class="${node.opins[key]}" data-nodeid="${nodeId}" data-opin-id="${Math.floor(Math.random()*100000000)}" data-gnuvs-pin-type="${node.opins[key]}" data-pin-utility="${key}" class="pin ${node.opins[key]}"></div>`
    });
    Object.keys(node.params).forEach(key => {
        exepinser += ''
    });

    return `
    <header data-node-id="${node.id}">
        <div data-gnuvs-type="title" data-gnuvs-draggable="true" data-gnuvs-id="{nodeID}" style="background-color: green;">${node.title}
        <button onclick="vScripting.deleteNode(${nodeId})">X</button></div>
    </header>
    <article style="background-color: rgb(200, 200, 200);">
        <div class="inputs pins">
            ${ipinSer}
        </div>
        <div class="content">
            ${node.content}
            <div class="parmas">
                ${paramsSer}
            </div>
        </div>
        <div class="output pins">
            ${exepinser}
        </div>
    </article>
    `
}


function ProcessGraph(Graph) {
    let script = '';
    
    let nodesPins = {};

    Graph.nodes.forEach((e) => { 
        nodesPins[e.id] = {input : [], output: []}
    })
    Graph.connections.forEach((e) => {
        nodesPins[e.output.offsetParent.offsetParent.id].output.push({output: e.output, input: e.input})
        nodesPins[e.input.offsetParent.offsetParent.id].input.push({output: e.output, input: e.input})
    })

    let currentNode;
    Graph.nodes.forEach((e) => {
        if (e.children[0].getAttribute("data-node-id") == 'Enter') {
            currentNode = e;
        }
    })

    let LinkerId = Math.floor(Math.random()*100000000)

    return 'let VSLinksStorage'+LinkerId+'={};'+removeParams(nestedNode(Graph, currentNode, nodesPins, LinkerId))
}


function removeParams(string) {
    
    let arry = string   .replaceAll('{! ', '!*!*TO_DEL*!*!').replaceAll(' !}','!*!*TO_DEL*!*!')
                        .replaceAll('{= ', '!*!*TO_DEL*!*!').replaceAll(' =}','!*!*TO_DEL*!*!')
                        .replaceAll('{- ', '!*!*TO_DEL*!*!').replaceAll(' -}','!*!*TO_DEL*!*!')
                        .split('!*!*TO_DEL*!*!')
    

    arry.forEach((e, i) => {
        if (i % 2 != 0) {
            arry[i] = ''
        }
    })

    return arry.join('')
}

function nestedNode(Graph, currentNode, nodesPins, LinkerId) {
    let script = '';

    while (true) {
        let follow = false
        let currentNodeAttributes = nodesList[currentNode.children[0].getAttribute('data-node-id')]
        let codeLine = currentNodeAttributes.code
        let params = ''

        
        nodesPins[currentNode.id].input.forEach((e) => {
            codeLine = codeLine.replaceAll('{= '+e.input.getAttribute('data-pin-utility')+' =}', 'VSLinksStorage'+LinkerId+'['+e.output.getAttribute('data-nodeid')+']["'+e.output.getAttribute('data-pin-utility')+'"]')
        });

        
        [...currentNode.children[1].children[0].children].forEach((e) => {
            if (e.getAttribute('data-gnuvs-pin-type') != 'exe') {
                codeLine = codeLine.replaceAll('{= '+e.getAttribute('data-pin-utility')+' =}', e.getAttribute('data-gnuvs-pin-default'))
            }
        })

        nodesPins[currentNode.id].output.forEach((e) => {
            if (e.output.getAttribute('data-pin-utility') == 'execution') {
                currentNode = e.input.offsetParent.offsetParent
                follow = true
            } else if (e.output.getAttribute('data-gnuvs-pin-type') != 'exe') {
                params = 'VSLinksStorage'+LinkerId+`[${e.output.getAttribute('data-nodeid')}]=`
            }
            if (e.output.getAttribute('data-pin-utility') != 'execution' && e.output.getAttribute('data-gnuvs-pin-type') == 'exe') {
                codeLine = codeLine.replaceAll('{! '+e.output.getAttribute('data-pin-utility')+' !}', nestedNode(Graph, e.input.offsetParent.offsetParent, nodesPins, LinkerId))
            }
        })

        script += params+codeLine+';'
        if (!follow) {
            break
        }
    }


    return script
}



let ExecuteGraph = (Graph) => { eval(ProcessGraph(Graph)) }
