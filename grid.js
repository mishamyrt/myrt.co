let node
let offsetY = 0
let isVisible = false
node = document.querySelector('.debugGrid')
document.addEventListener('keydown', (e) => {
    const meta = navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey
    if (e.keyCode === 71 && meta) {
        e.preventDefault()
        if (isVisible) {
            node.style.display = 'none'
        } else {
            node.style.display = 'block'
        }
        isVisible = !isVisible
    } else if (isVisible && (e.keyCode === 40 || e.keyCode === 38)) {
        switch (e.keyCode) {
            case 40:
                offsetY++
                node.style.top = offsetY + 'px'
                break
            case 38:
                offsetY--
                node.style.top = offsetY + 'px'
                break
            default:
                break
        }
        e.preventDefault()
    }
})
