const root = document.createElement('div')
root.id = 'root'
document.querySelector('body').appendChild(root)

const states = ['pan', 'draw']
const currentState = 0

root.innerHTML += `
    <div id="controls">
        <ul class="control-buttons">
            <div class="button ${currentState === 0 ? 'active' : ''}" data-type="pan">
                <i class="far fa-hand-paper"></i>
            </div>
            <div class="button ${currentState === 1 ? 'active' : ''}" data-type="draw">
                <i class="fas fa-pencil-alt"></i>
            </div>
        </ul>
    </div> 
`

function initControlsListeners() {
    const buttons = document.querySelectorAll('.button')
    buttons.forEach(el => {
        el.addEventListener('click', (event) => {
            const button = event.target.closest('.button')
            const buttons = document.querySelectorAll('.button');
            [].forEach.call(buttons, (el) => {
                el.classList.remove('active')
            })
            button.classList.add('active')

            const controlType = button.dataset.type
            WAMS.dispatch('set-control', controlType)
        })
    })

}


initControlsListeners()