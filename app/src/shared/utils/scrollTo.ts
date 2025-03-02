import scrollIntoView from 'smooth-scroll-into-view-if-needed'
export default (el: Element, ifNeeded = false): void => {
    if (el) {
        scrollIntoView(el, {
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest',
            scrollMode: ifNeeded ? 'if-needed' : 'always',
        })
    }
}
