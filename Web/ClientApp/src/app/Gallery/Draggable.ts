class Vector
{
    constructor(
        public x: number,
        public y: number
        )
    {
    }

    Add(
        vector: Vector
        ): Vector
    {
        return new Vector(
            this.x + vector.x,
            this.y + vector.y);
    }

    Subtract(
        vector: Vector
        ): Vector
    {
        return new Vector(
            this.x - vector.x,
            this.y - vector.y);
    }
}

let dragElement: HTMLElement = null;
let dragElementOffset: Vector;

function MouseVector(
    ev: MouseEvent
    ): Vector
{
    return new Vector(
        ev.clientX + document.body.scrollLeft - document.body.clientLeft,
        ev.clientY + document.body.scrollTop - document.body.clientTop);
}

document.addEventListener(
    'mousemove',
    function(
        ev: MouseEvent
        )
    {
        if(dragElement)
        {
            let dragElementPosition = MouseVector(ev).Add(dragElementOffset);
            dragElement.style.left    = dragElementPosition.x + 'px';
            dragElement.style.top     = dragElementPosition.y + 'px';
            dragElement.style.opacity = '0.5';
        }

        return false;
    });

document.addEventListener(
    'mouseup',
    function(
        ev: MouseEvent
        )
    {
        if(dragElement)
            dragElement.style.opacity = '1';

        dragElement = null;
        return false;
    });

export function makeDraggable(
    element: HTMLElement,
    handle: HTMLElement = element
    )
{
    handle.style.cursor = 'move';
    handle.addEventListener(
        'mousedown',
        function(
            ev: MouseEvent
            )
        {
            dragElement = element;
            dragElement.style.position = 'absolute';
            let dragElementPosition = new Vector(
                element.offsetLeft,
                element.offsetTop)
            dragElementOffset = dragElementPosition.Subtract(MouseVector(ev));
            return false;
        });
}
