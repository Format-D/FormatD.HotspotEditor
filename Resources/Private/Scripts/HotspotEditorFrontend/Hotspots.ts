import { IVector2D } from '../Interfaces/IVector2D';

export default class Hotspots {
	private editable: boolean = true;
	private debug: boolean;
	private selectedElement: HTMLElement
	private readonly domSection: HTMLElement;
	private readonly hotspotNodeTypes: string[];
	private activeMouseDownListener: EventListener;
	private activeMouseMoveListener: EventListener;
	private activeMouseUpListener: EventListener;

	constructor(domSection: HTMLElement, hotspotNodeTypes: string[] = ['FormatD.HotspotEditor:Content.Hotspot']) {
		this.domSection = domSection;
		this.hotspotNodeTypes = hotspotNodeTypes ;

		// only initialize in backend
		if (document.querySelector('body').classList.contains('neos-backend')) {
			this.initialize();
		}
	}

	private setEditable(editable: boolean): void {
		if (!editable && this.selectedElement) {
			this.selectedElement.removeEventListener('mousedown', this.activeMouseDownListener);
			this.selectedElement.removeEventListener('mouseup', this.activeMouseUpListener);
			this.selectedElement.removeEventListener('mousemove', this.activeMouseMoveListener);
			this.selectedElement = null;
		}

		this.editable = editable;
	}

	private initialize(): void {
		window.parent.addEventListener('fd-hotspot-editor:hotspotInspectorValueChanged', (event: CustomEvent) => {
			this._hotspotValueChangeHandler(event);
		});

		document.addEventListener('Neos.NodeSelected', (event: CustomEvent) => {
			this.nodeSelectHandler(event);
		}, false);
	}

	private _hotspotValueChangeHandler(event: CustomEvent): void {
		const coordinateId: string = event.detail.coordinateId;
		if ((!coordinateId.includes('x') && !coordinateId.includes('y')) || !this.selectedElement) {
			return;
		}

		const coordinateValue: number = event.detail.coordinateValue;
		if (coordinateId.includes('x')) {
			this._moveElement(this.selectedElement, coordinateValue, undefined);
		}
		if (coordinateId.includes('y')) {
			this._moveElement(this.selectedElement, undefined, coordinateValue);
		}
	}

	private nodeSelectHandler(event: CustomEvent): void {
		const detail = event.detail;

		// event.detail === 1 >> only fire on single click
		if (this.hotspotNodeTypes.includes(event.detail.node.nodeType) && this.editable) {
			this.selectedElement = (detail.element as HTMLElement);
			const containerElement = this.selectedElement.parentElement.parentElement;

			const currentOffsetTop = event.detail.element.offsetTop;
			const currentOffsetLeft = event.detail.element.offsetLeft;

			let initialPosition: IVector2D = {x: 0, y: 0};
			let offsetPosition: IVector2D = {x: 0, y: 0};
			let currentPosition: IVector2D = {x: 0, y: 0};

			if (currentOffsetTop !== undefined && currentOffsetLeft !== undefined) {
				initialPosition.x = currentOffsetLeft;
				initialPosition.y = currentOffsetTop;
			}

			this.activeMouseUpListener = (mouseEvent: MouseEvent) => {
				mouseEvent.preventDefault();

				const containerElement = mouseEvent.composedPath().find((element: HTMLElement) => {
					return element.className === 'content-with-hotspots--container';
				});

				this._dispatchHotspotDraggedEvent({
					x: currentPosition.x + offsetPosition.x,
					y: currentPosition.y + offsetPosition.y
				}, containerElement as HTMLElement);

				initialPosition.x = currentPosition.x;
				initialPosition.y = currentPosition.y;

				containerElement.removeEventListener('mouseup', this.activeMouseUpListener);
				containerElement.removeEventListener('mousemove', this.activeMouseMoveListener);
				if (this.selectedElement) {
					this.selectedElement.removeEventListener('mousedown', this.activeMouseDownListener);
				}
			};

			this.activeMouseDownListener = (mouseEvent: MouseEvent) => {
				mouseEvent.preventDefault();

				containerElement.addEventListener('mouseup', this.activeMouseUpListener);
				containerElement.addEventListener('mousemove', this.activeMouseMoveListener);

				initialPosition.x = mouseEvent.clientX - offsetPosition.x;
				initialPosition.y = mouseEvent.clientY - offsetPosition.y;

				offsetPosition.x = this.selectedElement.getBoundingClientRect().left
					- this.selectedElement.parentElement.parentElement.getBoundingClientRect().left;
				offsetPosition.y = this.selectedElement.getBoundingClientRect().top
					- this.selectedElement.parentElement.parentElement.getBoundingClientRect().top;
			};

			this.activeMouseMoveListener = (mouseEvent: MouseEvent) => {
				mouseEvent.preventDefault();
				mouseEvent.stopPropagation();

				currentPosition.x = mouseEvent.clientX - initialPosition.x;
				currentPosition.y = mouseEvent.clientY - initialPosition.y;

				this._moveElement(this.selectedElement, (currentPosition.x + offsetPosition.x), (currentPosition.y + offsetPosition.y), 'px');
			};

			this.selectedElement.addEventListener('mousedown', this.activeMouseDownListener);
		} else if (this.selectedElement) {
			this.selectedElement.removeEventListener('mousedown', this.activeMouseDownListener);
			this.selectedElement.removeEventListener('mousedown', this.activeMouseUpListener);
			this.selectedElement.removeEventListener('mousedown', this.activeMouseMoveListener);
			this.selectedElement = null;
		}
	}

	private _dispatchHotspotDraggedEvent(position: IVector2D, parentElement?: HTMLElement) {
		if (parentElement) {
			position.x = position.x / parentElement.offsetWidth * 100;
			position.y = position.y / parentElement.offsetHeight * 100;
		}

		const dragEvent: CustomEvent = new CustomEvent(
			'fd-hotspot-editor:hotspotDragged',
			{
				detail: {
					Payload: {
						pos: {
							xPosition: position.x,
							yPosition: position.y
						}
					}
				}
			}
		);
		window.parent.dispatchEvent(dragEvent);
	}

	private _moveElement(element: HTMLElement, x?: number, y?: number, unit?: 'px' | '%') {
		unit = unit || '%';

		if (x) {
			element.style.left = String(x) + unit;
		}
		if (y) {
			element.style.top = String(y) + unit;
		}
	}

	/**
	 * Logs all provided arguments if debug is true
	 */
	private log() {
		if (this.debug) {
			console.log(...arguments);
		}
	}
}
