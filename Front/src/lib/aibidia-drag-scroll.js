export class DragScroll {
    constructor(props = {}) {
        if (!props.element) {
            console.log('props.element is not defined')
            return
        }

        this.element = props.element
        this.dragScrolling = false
        this.dragMultiplierX = null
        this.dragMultiplierY = null
        this.dragBeginTop = null
        this.dragBeginLeft = null
        this.dragBeginScrollTop = null
        this.dragBeginScrollLeft = null

        ;(this.startDragScroll = event => {
            event.preventDefault()

            this.dragScrolling = true
            this.dragMultiplierX = 2
            this.dragMultiplierY =
                2 * (this.element.offsetHeight / this.element.offsetWidth)

            this.dragBeginTop = event.pageY - this.element.offsetTop
            this.dragBeginLeft = event.pageX - this.element.offsetLeft
            this.dragBeginScrollTop = this.element.scrollTop
            this.dragBeginScrollLeft = this.element.scrollLeft
        }),
        (this.stopDragScroll = event => {
            event.preventDefault()
            this.dragScrolling = false
        }),
        (this.dragScroll = event => {
            if (this.dragScrolling) {
                event.preventDefault()

                const x = event.pageX - this.element.offsetLeft
                const y = event.pageY - this.element.offsetTop
                const scrollLeft =
                        this.dragBeginScrollLeft -
                        (x - this.dragBeginLeft) * this.dragMultiplierX

                const scrollTop =
                        this.dragBeginScrollTop -
                        (y - this.dragBeginTop) * this.dragMultiplierY

                this.element.scrollTo(scrollLeft, scrollTop)
            }
        }),
        this.element.addEventListener('mousedown', this.startDragScroll)

        this.element.addEventListener('mouseup', this.stopDragScroll)
        this.element.addEventListener('mouseleave', this.stopDragScroll)
        this.element.addEventListener('mousemove', this.dragScroll)
    }

    destroy() {
        if (!this.element) {
            return
        }

        console.log('DragScroll destroyed')
        this.element.removeEventListener('mousedown', this.startDragScroll)
        this.element.removeEventListener('mouseup', this.stopDragScroll)
        this.element.removeEventListener('mouseleave', this.stopDragScroll)
        this.element.removeEventListener('mousemove', this.dragScroll)
    }
}
