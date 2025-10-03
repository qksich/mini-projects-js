const items = document.querySelectorAll('.item')
let imageURLs = [
    './image/p1.jpg',
    './image/p2.jpg',
    './image/p3.jpg',
    './image/p4.jpg',
    './image/p5.jpg',
]

let deviceType = ''
let events = {
    mouse: {
        start: 'mouseover',
        end: 'mouseout',
    },
    touch: {
        start: 'touchstart',
        end: 'touchend',
    }
}

const isTouchDevise = () => {
    try {
        document.createEvent('TouchEvent')
        deviceType = 'touch'
        return true
    } catch (e) {
        deviceType = 'mouse'
        return false
    }
}

isTouchDevise()

items.forEach((item, index) => {
    let img = document.createElement('img')
    img.setAttribute('src', imageURLs[index])
    img.style.width = '100%'
    img.style.height = '100%'
    img.style.objectFit = 'cover'
    item.appendChild(img)

    item.style.flex = '1'
    item.style.transition = 'flex 0.8s ease'

    item.addEventListener(events[deviceType].start, () => {
        item.style.flex = '9'
    })
    item.addEventListener(events[deviceType].end, () => {
        item.style.flex = '1'
    })
})


