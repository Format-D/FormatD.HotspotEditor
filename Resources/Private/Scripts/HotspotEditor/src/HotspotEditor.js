import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import {TextInput} from '@neos-project/react-ui-components';

export default class HotspotEditor extends PureComponent {
    static propTypes = {
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        identifier: PropTypes.string,
        commit: PropTypes.func.isRequired,
        applyInspector: PropTypes.func.isRequired,
    };

    componentDidMount() {
        window.addEventListener('fd-hotspot-editor:hotspotDragged', this.handleHotspotDragged);
    }

    componentWillUnmount() {
        window.removeEventListener('fd-hotspot-editor:hotspotDragged', this.handleHotspotDragged);
    }

    handleChangeCoordinates = coordinateValue => {
        this.props.commit(coordinateValue);
		const customEvent = new CustomEvent(
			'fd-hotspot-editor:hotspotInspectorValueChanged',
			{
				detail: {
					coordinateId: this.props.identifier,
					coordinateValue: coordinateValue
				}
			}
		);
		window.dispatchEvent(customEvent);
    };

    handleHotspotDragged = event => {
        const pos = event.detail?.Payload?.pos;
        if (!pos || pos[this.props.identifier] === undefined) {
            return;
        }
        this.props.commit(pos[this.props.identifier]);
        this.props.applyInspector();
    };

    render() {
        return (
            <div>
				<TextInput value={this.props.value} onChange={this.handleChangeCoordinates} />
            </div>
        );
    }
}
