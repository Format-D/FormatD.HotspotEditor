import { IVector2D } from '../Interfaces/IVector2D';

interface NodeSelectedDetail {
	node?: { nodeTypeName?: string; nodeType?: string };
	element?: HTMLElement;
}

interface HotspotValueChangeDetail {
	coordinateId: string;
	coordinateValue: number;
}

export default class Hotspots {
	private static instances: Set<Hotspots> = new Set();
	private static sharedListenersAttached: boolean = false;
	private static nodeSelectedListener: EventListener;
	private static hotspotValueChangeListener: EventListener;

	public onExternalNodeSelected: ((element: HTMLElement | undefined) => void) | null = null;

	private editable: boolean = true;
	private selectedElement: HTMLElement | null = null;
	private readonly domSection: HTMLElement;
	private readonly hotspotNodeTypes: string[];
	private containerMousedownHandler!: EventListener;
	private cancelActiveDrag: (() => void) | null = null;

	constructor(domSection: HTMLElement, hotspotNodeTypes: string[] = ['FormatD.HotspotEditor:Content.Hotspot']) {
		this.domSection = domSection;
		this.hotspotNodeTypes = hotspotNodeTypes;

		if (document.body.classList.contains('neos-backend')) {
			Hotspots.register(this);
			this._initBackendDrag();
		}
	}

	public setEditable(editable: boolean): void {
		this.editable = editable;
		if (!editable) {
			this.cancelActiveDrag?.();
			this.selectedElement = null;
		}
	}

	public dispose(): void {
		this.cancelActiveDrag?.();
		this.domSection.removeEventListener('mousedown', this.containerMousedownHandler);
		this.selectedElement = null;
		Hotspots.unregister(this);
	}

	private static register(instance: Hotspots): void {
		Hotspots.instances.add(instance);
		if (!Hotspots.sharedListenersAttached) {
			Hotspots._attachSharedListeners();
		}
	}

	private static unregister(instance: Hotspots): void {
		Hotspots.instances.delete(instance);
		if (Hotspots.instances.size === 0) {
			Hotspots._detachSharedListeners();
		}
	}

	private static _attachSharedListeners(): void {
		Hotspots.nodeSelectedListener = (event: Event) => {
			const detail = (event as CustomEvent).detail as NodeSelectedDetail;
			Hotspots.instances.forEach((instance) => instance._handleNodeSelected(detail));
		};
		Hotspots.hotspotValueChangeListener = (event: Event) => {
			const detail = (event as CustomEvent).detail as HotspotValueChangeDetail;
			Hotspots.instances.forEach((instance) => instance._handleValueChange(detail));
		};

		document.addEventListener('Neos.NodeSelected', Hotspots.nodeSelectedListener, false);
		window.parent.addEventListener('fd-hotspot-editor:hotspotInspectorValueChanged', Hotspots.hotspotValueChangeListener);
		Hotspots.sharedListenersAttached = true;
	}

	private static _detachSharedListeners(): void {
		document.removeEventListener('Neos.NodeSelected', Hotspots.nodeSelectedListener);
		window.parent.removeEventListener('fd-hotspot-editor:hotspotInspectorValueChanged', Hotspots.hotspotValueChangeListener);
		Hotspots.sharedListenersAttached = false;
	}

	private _handleValueChange(detail: HotspotValueChangeDetail): void {
		if (!this.selectedElement) return;
		const { coordinateId, coordinateValue } = detail;
		if (coordinateId.includes('x')) {
			this._moveElement(this.selectedElement, coordinateValue, undefined);
		}
		if (coordinateId.includes('y')) {
			this._moveElement(this.selectedElement, undefined, coordinateValue);
		}
	}

	private _handleNodeSelected(detail: NodeSelectedDetail): void {
		const nodeTypeName = detail.node?.nodeTypeName || detail.node?.nodeType;
		const element = detail.element;
		const elementInArea = !!element && this.domSection.contains(element);
		const belongsToThisArea = !!nodeTypeName
			&& this.hotspotNodeTypes.includes(nodeTypeName)
			&& elementInArea;

		if (belongsToThisArea && this.editable) {
			this.selectedElement = element as HTMLElement;
			this.domSection.classList.add('has-selected-pin');
		} else {
			this.selectedElement = null;
			this.domSection.classList.remove('has-selected-pin');
		}

		this.onExternalNodeSelected?.(element);
	}

	private _initBackendDrag(): void {
		const neosWrapper = this.domSection.closest<HTMLElement>('[data-__neos-node-contextpath]');
		if (neosWrapper) {
			neosWrapper.classList.add('neos-hotspot-drag-area');
		}

		const offsetPosition: IVector2D = { x: 0, y: 0 };
		const currentPosition: IVector2D = { x: 0, y: 0 };
		const lastClampedPosition: IVector2D = { x: 0, y: 0 };
		let initialPosition: IVector2D = { x: 0, y: 0 };
		let dragElement: HTMLElement | null = null;

		const endDrag = () => {
			document.removeEventListener('mouseup', mouseUpHandler, true);
			document.removeEventListener('mousemove', mouseMoveHandler);
			this.cancelActiveDrag = null;
		};

		const removeDragOverlay = () => {
			document.getElementById('neos-hotspot-drag-overlay')?.remove();
		};

		const mouseUpHandler = (event: MouseEvent) => {
			event.preventDefault();
			const el = dragElement;
			endDrag();
			dragElement = null;

			if (!el) return;

			const container = el.closest('.content-with-hotspots--container') as HTMLElement | null;
			if (container) {
				this._dispatchHotspotDraggedEvent({ x: lastClampedPosition.x, y: lastClampedPosition.y }, container);
			}

			setTimeout(() => {
				document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
				document.body.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
				el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
				el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
				requestAnimationFrame(removeDragOverlay);
			}, 0);
		};

		const mouseMoveHandler = (event: MouseEvent) => {
			event.preventDefault();
			event.stopPropagation();
			if (!dragElement) return;

			currentPosition.x = event.clientX - initialPosition.x;
			currentPosition.y = event.clientY - initialPosition.y;

			const rawX = currentPosition.x + offsetPosition.x;
			const rawY = currentPosition.y + offsetPosition.y;

			const container = dragElement.closest('.content-with-hotspots--container') as HTMLElement | null;
			if (container) {
				lastClampedPosition.x = Math.max(0, Math.min(rawX, container.offsetWidth - dragElement.offsetWidth));
				lastClampedPosition.y = Math.max(0, Math.min(rawY, container.offsetHeight - dragElement.offsetHeight));
			} else {
				lastClampedPosition.x = rawX;
				lastClampedPosition.y = rawY;
			}

			this._moveElement(dragElement, lastClampedPosition.x, lastClampedPosition.y, 'px');
		};

		this.containerMousedownHandler = (event: Event) => {
			if (!this.editable) return;

			const mEvent = event as MouseEvent;
			if (!mEvent.isTrusted) return;
			const hotspot = (mEvent.target as HTMLElement).closest('[data-hotspot-id]') as HTMLElement | null;
			if (!hotspot) return;
			if (mEvent.button !== 0) {
				return;
			}

			hotspot.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
			hotspot.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));

			mEvent.preventDefault();

			dragElement = hotspot;
			currentPosition.x = 0;
			currentPosition.y = 0;

			// Prevent quickbar flickering
			if (!document.getElementById('neos-hotspot-drag-overlay')) {
				const overlay = document.createElement('style');
				overlay.id = 'neos-hotspot-drag-overlay';
				overlay.textContent = '[data-__neos__inline-ui] { visibility: hidden !important; }';
				document.head.appendChild(overlay);
			}

			document.addEventListener('mouseup', mouseUpHandler, true);
			document.addEventListener('mousemove', mouseMoveHandler);

			this.cancelActiveDrag = () => {
				endDrag();
				removeDragOverlay();
				dragElement = null;
			};

			const container = hotspot.closest('.content-with-hotspots--container') as HTMLElement | null;
			if (container) {
				offsetPosition.x = hotspot.getBoundingClientRect().left - container.getBoundingClientRect().left;
				offsetPosition.y = hotspot.getBoundingClientRect().top - container.getBoundingClientRect().top;
				lastClampedPosition.x = offsetPosition.x;
				lastClampedPosition.y = offsetPosition.y;
			}

			initialPosition = {
				x: mEvent.clientX,
				y: mEvent.clientY,
			};
		};

		this.domSection.addEventListener('mousedown', this.containerMousedownHandler);
	}

	private _dispatchHotspotDraggedEvent(position: IVector2D, parentElement?: HTMLElement) {
		if (parentElement) {
			position.x = Math.round((position.x / parentElement.offsetWidth) * 100000) / 1000;
			position.y = Math.round((position.y / parentElement.offsetHeight) * 100000) / 1000;
		}

		const dragEvent = new CustomEvent(
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

	private _moveElement(element: HTMLElement, x?: number, y?: number, unit: 'px' | '%' = '%') {
		if (x !== undefined) {
			element.style.left = String(x) + unit;
		}
		if (y !== undefined) {
			element.style.top = String(y) + unit;
		}
	}
}
