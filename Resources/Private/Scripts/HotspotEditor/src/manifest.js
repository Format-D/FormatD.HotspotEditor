import manifest from '@neos-project/neos-ui-extensibility';
import HotspotEditor from './HotspotEditor';

manifest('FormatD.HotspotEditor:HotspotEditor', {}, globalRegistry => {
    const editorsRegistry = globalRegistry.get('inspector').get('editors');
    editorsRegistry.set('FormatD.HotspotEditor/HotspotEditor', {
        component: HotspotEditor
    });
});
