import manifest from '@neos-project/neos-ui-extensibility';
import { connect } from 'react-redux';
import { actions } from '@neos-project/neos-ui-redux-store';
import HotspotEditor from './HotspotEditor';

manifest('FormatD.HotspotEditor:HotspotEditor', {}, globalRegistry => {
    const ConnectedHotspotEditor = connect(
        null,
        { applyInspector: actions.UI.Inspector.apply }
    )(HotspotEditor);

    globalRegistry.get('inspector').get('editors')
        .set('FormatD.HotspotEditor/HotspotEditor', { component: ConnectedHotspotEditor });
});
