const root = document.createElement('div')
root.id = 'root'
document.querySelector('body').appendChild(root)

let colors = {}
const states = ['pan', 'draw']
let currentState = 0


const CONTROLS = (color) => `
<div id="controls">
    <ul class="control-buttons">
        <div id="pan" class="button ${currentState === 0 ? 'active' : ''}" data-type="pan">
            <i class="far fa-hand-paper"></i>
        </div>
        <div id="draw" class="button ${currentState === 1 ? 'active' : ''}" data-type="draw">
            <i class="fas fa-pencil-alt"></i>
        </div>
        <div id="color" class="button ${color}" data-type="color">
            <i class="fas fa-circle"></i>
        </div>
        <div id="color-picker">
            ${Object.keys(colors).map(colorName => `
                <i class="fas fa-circle ${colorName}" data-color="${colorName}"></i>            
            `).join('')}
        </div>
    </ul>
</div>
`

function renderControls(colorName) {
    root.innerHTML = CONTROLS(colorName)
    initControlsListeners()
}

function initControlsListeners() {
    const buttons = document.querySelectorAll('.button')
    const panBtn = document.querySelector('#pan')
    const drawBtn = document.querySelector('#draw')
    const colorBtn = document.querySelector('#color')
    const colorPicker = document.querySelector('#color-picker')
    const colors = document.querySelectorAll('#color-picker > *')

    function chooseControlType(event) {
        const button = event.target.closest('.button')
        forEachEl(buttons, (el) => {
            el.classList.remove('active')
        })
        button.classList.add('active')

        const type = button.dataset.type
        currentState = states.indexOf(type)
        WAMS.dispatch('set-control', type)
    }

    addClickTouchListener(panBtn, event => {
        chooseControlType(event)
    })

    addClickTouchListener(drawBtn, event => {
        chooseControlType(event)
    })

    addClickTouchListener(colorBtn, event => {
        colorPicker.classList.toggle('show')
    })

    forEachEl(colors, el => {
        addClickTouchListener(el, event => {
            const color = event.target.dataset.color
            colorPicker.classList.remove('show')
            WAMS.dispatch('set-color', color)
            renderControls(color)
        })
    })

}

function forEachEl(elements, callback) {
    [].forEach.call(elements, callback)
}

function addClickTouchListener(el, callback) {
    el.addEventListener('click', callback)
    el.addEventListener('touch', callback)
}

WAMS.dispatch('init')

WAMS.on('init', ({ detail }) => {
    const { color, listOfColors } = detail
    colors = listOfColors
    renderControls(color)
})