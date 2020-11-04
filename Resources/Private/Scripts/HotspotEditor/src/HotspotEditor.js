import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import {TextInput} from '@neos-project/react-ui-components';

export default class HotspotEditor extends PureComponent {
    static propTypes = {
        value: PropTypes.string,
        commit: PropTypes.func.isRequired,
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
        this.props.commit(event.detail.Payload.pos[this.props.identifier]);

        // @todo: temporary hack until problem with apply button is solved
        setTimeout(function() {
			document.getElementById('neos-Inspector-Apply').click();
		}, 400);
    };

    render() {
        return (
            <div>
				<TextInput value={this.props.value} onChange={this.handleChangeCoordinates} />
            </div>
        );
    }
}
