class VisualScripting {
    constructor(params) {
        this.canvasContainer = params.canvas;
        this.mouseDownOnCanvas = false;
        this.mouseDownOnNodeTitle = -1;
        this.mouseLastDeplacement = {x:0,y:0};
        this.mouseDeplacement = {x:0,y:0};
        this.ctxScale = 1.01;
        this.nodeIds = params.Nodes;
        this.nodeList = {};
        this.nodeDeplacement = {x:0,y:0};
        this.globalPos = {x:0,y:0};
        this.draggedPinInfos = {type: ''};
        this.editionConnection = {};
        this.pinConnections = [];
        this.selectorBasePos = {x:0,y:0};
        this.mouseDownOnSelector = false

        this.canvas = document.createElement("div");
        this.canvas.className = "VSCanvas";
        this.ctx = document.createElement("div");
        this.canvas.appendChild(this.ctx);
        this.canvasContainer.appendChild(this.canvas);
        this.canvas.style.transform = `translate(-40%,-40%) scale(${this.ctxScale})`;
        this.ctx.innerHTML = `<div style="position: absolute"><svg style="pointer-events: none; position: absolute; overflow: visible !important;" id="NodesMultipleSelector"></svg><svg style="pointer-events: none; position: absolute; overflow: visible !important;" id="NodesLinks"></svg></div>`
        this.paths = document.getElementById('NodesLinks')

        this.selector = document.getElementById('NodesMultipleSelector')


        this.canvas.addEventListener('mousedown', (e) => {
            if (e.target === this.canvas) {
                if (e.button === 1) {
                    this.mouseDownOnCanvas = true;
                    this.mouseLastDeplacement = {x:e.offsetX,y:e.offsetY};
                } else if (e.button === 0) {
                    this.selector.innerHTML = `<path>`
                    this.selectorBasePos = {x:e.offsetX-this.globalPos.x,y:e.offsetY-this.globalPos.y};
                    this.mouseDownOnSelector = true
                    Object.keys(this.nodeList).forEach((e) => {this.nodeList[e].nodeRef.classList.remove('selectedNodeViaMultipleSelect')})
                }
            } else {
                this.mouseDownOnCanvas = false;
            }
        });

        this.canvas.addEventListener('mouseup', (e) => {

            this.selector.innerHTML = ``
            this.mouseDownOnSelector = false;
            let au = false

            this.pinConnections.forEach((elm) => {
                if (elm.output === e.target || elm.input === e.target) {
                    au = true;
                    return 0;
                }
            })

            if (this.draggedPinInfos.type === '') {
                return 0;
            }

            if (e.target.getAttribute('data-gnuvs-type') === "ipin" && e.target.getAttribute('data-gnuvs-pin-type') === this.draggedPinInfos.type && !au) {
                this.pinConnections.push({
                    output : this.draggedPinInfos.pinRef,
                    input: e.target
                })
            }
            this.updateConnections()

            this.draggedPinInfos.pathRef.remove();
            this.draggedPinInfos = {type: '', node : 0, pinRef: undefined, pathRef: undefined};
        });

        this.canvas.addEventListener('mouseleave', (e) => {
            if (this.draggedPinInfos.type === '') {
                return 0;
            }
            this.draggedPinInfos.pathRef.remove();
            this.draggedPinInfos = {type: '', node : 0, pinRef: undefined, pathRef: undefined};
        })

        this.canvas.addEventListener('mousemove', (e) => {

            if (this.draggedPinInfos.type !== '') {
                let xs= (this.draggedPinInfos.pinRef.getBoundingClientRect().x-this.ctx.getBoundingClientRect().x+this.draggedPinInfos.pinRef.getBoundingClientRect().width/2)/this.ctxScale;
                let ys= (this.draggedPinInfos.pinRef.getBoundingClientRect().y-this.ctx.getBoundingClientRect().y+this.draggedPinInfos.pinRef.getBoundingClientRect().height/2)/this.ctxScale;
                
                let xe= (e.x-this.ctx.getBoundingClientRect().x)/this.ctxScale;
                let ye= (e.y-this.ctx.getBoundingClientRect().y)/this.ctxScale;


                this.draggedPinInfos.pathRef.remove()
                let path =  document.createElementNS("http://www.w3.org/2000/svg",'path');
                path.setAttribute('d', this.generatePath(xs,ys,xe,ye));
                path.classList.add(this.draggedPinInfos.pinRef.getAttribute('data-gnuvs-path-class'))
                this.draggedPinInfos.pathRef = this.paths.appendChild(path)
            }
            if (e.buttons === 0) {
                this.mouseDownOnCanvas = false;
                this.mouseDownOnNodeTitle = -1;
            };
            if (this.mouseDownOnSelector) {
                let posX = e.offsetX-this.globalPos.x
                let posY = e.offsetY-this.globalPos.y
                if (e.target != this.canvas) {
                    posX = (e.target.getBoundingClientRect().x-this.canvas.getBoundingClientRect().x)/this.ctxScale+posX;
                    posY = (e.target.getBoundingClientRect().y-this.canvas.getBoundingClientRect().y)/this.ctxScale+posY;
                }

                this.selector.children[0].setAttribute('d', `M ${this.selectorBasePos.x} ${this.selectorBasePos.y}
                L ${posX} ${this.selectorBasePos.y}
                L ${posX} ${posY}
                L ${this.selectorBasePos.x} ${posY}
                L ${this.selectorBasePos.x} ${this.selectorBasePos.y}`)

                Object.keys(this.nodeList).forEach((e) => {
                    this.nodeList[e].nodeRef.classList.remove('selectedNodeViaMultipleSelect')

                    let ytop = this.nodeList[e].pos.y
                    let xtop = this.nodeList[e].pos.x
                    let ybttm = ytop+this.nodeList[e].nodeRef.getBoundingClientRect().height/this.ctxScale
                    let xbttm = xtop+this.nodeList[e].nodeRef.getBoundingClientRect().width/this.ctxScale
                    
                    if(
                    (   ((this.selectorBasePos.x <= xtop && xtop <= posX) || (this.selectorBasePos.x >= xbttm && xbttm >= posX))
                    &&  ((this.selectorBasePos.y <= ytop && ytop <= posY) || (this.selectorBasePos.y >= ybttm && ybttm >= posY))
                    )
                       ) {
                        this.nodeList[e].nodeRef.classList.add('selectedNodeViaMultipleSelect');
                    }
                })
            };
            if (this.mouseDownOnCanvas) {
                this.mouseDeplacement.x +=  e.offsetX - this.mouseLastDeplacement.x;
                this.mouseDeplacement.y +=  e.offsetY - this.mouseLastDeplacement.y;

                this.mouseLastDeplacement = {x:e.offsetX,y:e.offsetY};
                this.globalPos = this.mouseDeplacement
            } else if (this.mouseDownOnNodeTitle !== -1) {
                this.updateConnections()
                this.nodeDeplacement = {
                    x:(e.x-this.ctx.getBoundingClientRect().left)/this.ctxScale,
                    y:(e.y-this.ctx.getBoundingClientRect().top)/this.ctxScale
                };
                
                let offsetx = this.nodeList[this.mouseDownOnNodeTitle].pos.x - (this.nodeDeplacement.x - this.mouseLastDeplacement.x)
                let offsety = this.nodeList[this.mouseDownOnNodeTitle].pos.y - (this.nodeDeplacement.y - this.mouseLastDeplacement.y)


                this.nodeList[this.mouseDownOnNodeTitle].pos.x = this.nodeDeplacement.x - this.mouseLastDeplacement.x;
                this.nodeList[this.mouseDownOnNodeTitle].pos.y = this.nodeDeplacement.y - this.mouseLastDeplacement.y;


                this.nodeList[this.mouseDownOnNodeTitle].nodeRef.style.transform = `translate(${this.nodeList[this.mouseDownOnNodeTitle].pos.x}px, ${this.nodeList[this.mouseDownOnNodeTitle].pos.y}px)`;

                [...this.ctx.getElementsByClassName('selectedNodeViaMultipleSelect')].forEach((e) => {
                    if(this.nodeList[e.id].nodeRef == this.nodeList[this.mouseDownOnNodeTitle].nodeRef) {return 0}
                    this.nodeList[e.id].pos.x -= offsetx
                    this.nodeList[e.id].pos.y -= offsety
                    this.nodeList[e.id].nodeRef.style.transform = `translate(${this.nodeList[e.id].pos.x}px, ${this.nodeList[e.id].pos.y}px)`;
                })
            };
            
            this.ctx.style.transform = `translate(${this.globalPos.x}px, ${this.globalPos.y}px)`;
            this.canvas.style.backgroundPosition = `${this.globalPos.x}px ${this.globalPos.y}px`;
        });
        this.canvas.addEventListener('wheel', (e) => {
            if (e.deltaY > 0 && this.ctxScale < 3) {
                this.ctxScale += 0.101
            } else if (e.deltaY < 0 && this.ctxScale > 0.3) {
                this.ctxScale -= 0.101
            } else {
                return 0
            }
            this.canvas.style.transform = `translate(-40%,-40%) scale(${this.ctxScale})`;
        });
    };


    updateConnections() {
        this.paths.innerHTML = '';

        this.pinConnections.forEach((element, i) => {
            if (!document.contains(element.output) || !document.contains(element.input)) {
                this.pinConnections.splice(i,1)
                return
            }
            
            let xs = (element.output.getBoundingClientRect().x-this.ctx.getBoundingClientRect().x+element.input.getBoundingClientRect().width/2)/this.ctxScale;
            let ys = (element.output.getBoundingClientRect().y-this.ctx.getBoundingClientRect().y+element.input.getBoundingClientRect().height/2)/this.ctxScale;
            
            let xe = (element.input.getBoundingClientRect().x-this.ctx.getBoundingClientRect().x+element.input.getBoundingClientRect().width/2)/this.ctxScale;
            let ye = (element.input.getBoundingClientRect().y-this.ctx.getBoundingClientRect().y+element.input.getBoundingClientRect().height/2)/this.ctxScale;
            this.paths.innerHTML += `<path d="${this.generatePath(xs,ys,xe,ye)}" class="${element.output.getAttribute('data-gnuvs-path-class')}">`
        })
    };

    getGraph() {
        let nodes = [];
        [...this.ctx.children].forEach((elm) => {
            if (elm.getAttribute('data-gnuvs-type') === 'node') {
                nodes.push(elm)
            }
        })
        return {connections : this.pinConnections, nodes : nodes}
    };

    deleteNode(nodeID) {
        delete this.nodeList[nodeID]
        document.getElementById(nodeID).remove();
        this.updateConnections()
    };

    unselectNodes() {
        this.mouseDownOnSelector = false;
        Object.keys(this.nodeList).forEach((e) => {this.nodeList[e].nodeRef.classList.remove('selectedNodeViaMultipleSelect')})
    };

    appendNode(x, y, nodeID, nodeHTML) {
        let node = document.createElement("div");
        node.id = nodeID
        node.dataset.gnuvsType = 'node';
        node.style.position = 'absolute';
        node.innerHTML = nodeHTML.replace('{nodeID}', nodeID)
        
        x = (x+this.canvasContainer.getBoundingClientRect().x-this.ctx.getBoundingClientRect().x)/this.ctxScale
        y = (y+this.canvasContainer.getBoundingClientRect().y-this.ctx.getBoundingClientRect().y)/this.ctxScale

        this.nodeList[nodeID] = {nodeRef: node, pos: {x, y}};
        node.style.transform = `translate(${x}px, ${y}px)`;
        this.ctx.appendChild(node)

        node.addEventListener('mouseenter', (e) => {this.mouseDownOnCanvas = false})
        node.addEventListener('mousedown', (e) => {

            [...this.ctx.children].forEach((nd) => {
                nd.style.zIndex = nd.style.zIndex-1
            })

            if (e.button == 0) {
                node.style.zIndex = this.ctx.childElementCount
                this.mouseDownOnNodeTitle = e.target.getAttribute('data-gnuvs-draggable') === 'true' ? node.id : -1;
                this.mouseLastDeplacement = {
                    x:e.offsetX,
                    y:e.offsetY
                };
            }
            
            if (e.target.getAttribute('data-gnuvs-type') === "opin") {

                let au = false
                this.pinConnections.forEach((elm) => {
                    if (elm.output === e.target) {
                        au = true;
                        return 0;
                    }
                })
                if (au) {
                    return 0;
                }

                let x = (e.target.getBoundingClientRect().x-this.ctx.getBoundingClientRect().x)/this.ctxScale;
                let y = (e.target.getBoundingClientRect().y-this.ctx.getBoundingClientRect().y)/this.ctxScale;

                let path =  document.createElementNS("http://www.w3.org/2000/svg",'path');
                path.setAttribute('d', this.generatePath(x,y,x,y));
                this.paths.appendChild(path)
                
                this.draggedPinInfos = {
                    type: e.target.getAttribute('data-gnuvs-pin-type'),
                    node : nodeID,
                    pinRef: e.target,
                    pathRef: path
                }
            } else if (e.target.getAttribute('data-gnuvs-type') === "ipin") {
                let out;
                this.pinConnections.forEach((elm, i) => {
                    if (e.target === elm.input) {
                        out = elm.output
                        this.pinConnections.splice(i,1)
                    }
                })

                
                let xs= (out.getBoundingClientRect().x-this.ctx.getBoundingClientRect().x+out.getBoundingClientRect().width/2)/this.ctxScale;
                let ys= (out.getBoundingClientRect().y-this.ctx.getBoundingClientRect().y+out.getBoundingClientRect().height/2)/this.ctxScale;
                
                let xe= (e.x-this.ctx.getBoundingClientRect().x)/this.ctxScale;
                let ye= (e.y-this.ctx.getBoundingClientRect().y)/this.ctxScale;

                let path =  document.createElementNS("http://www.w3.org/2000/svg",'path');
                path.setAttribute('d', this.generatePath(xs,ys,xe,ye));
                path.classList.add(e.target.getAttribute('data-gnuvs-path-class'))
                this.paths.appendChild(path)
                
                this.draggedPinInfos = {
                    type: out.getAttribute('data-gnuvs-pin-type'),
                    node : nodeID,
                    pinRef: out,
                    pathRef: path
                }

                this.updateConnections()
            }
        })
    };
    
    generatePath(x1,y1,x2,y2) {
        let x1d = x1-(-(Math.abs(x1-x2))*0.75)
        let x2d = x2+(-(Math.abs(x1-x2))*0.75)
        return `M ${x1} ${y1} C ${x1d} ${y1} ${x2d} ${y2} ${x2} ${y2}`
    };
}
