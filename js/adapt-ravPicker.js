define([
    'core/js/adapt',
    './ravPickerView',
    './ravPickerNavView',
    './ravPickerModel'
], function(Adapt, RavPickerView, RavPickerNavView, RavPickerModel) {

    var ravPickerModel;

    Adapt.once('configModel:dataLoaded', onConfigLoaded);

    /**
     * Once the Adapt config has loaded, check to see if the rav picker is enabled. If it is:
     * - stop the rest of the .json from loading
     * - set up the rav picker model
     * - register for events to allow us to display the rav picker icon in the navbar on pages and menus
     * - wait for offline storage to be ready so that we can check to see if there's a stored rav choice or not
     */
    function onConfigLoaded() {
        if (!Adapt.config.has('_ravPicker')) return;
        if (!Adapt.config.get('_ravPicker')._isEnabled) return;

        Adapt.config.set('_canLoadData', false);

        ravPickerModel = new RavPickerModel(Adapt.config.get('_ravPicker'));

        Adapt.on('router:menu router:page', setupNavigationView);

        if(Adapt.offlineStorage.ready) {// on the offchance that it may already be ready...
            onOfflineStorageReady();
        } else {
            Adapt.once('offlineStorage:ready', onOfflineStorageReady);
        }
    }

    /**
     * Once offline storage is ready, check to see if a rav was previously selected by the user
     * If it was, load it. If it wasn't, show the rav picker
     */
    function onOfflineStorageReady() {
        var storedRav = Adapt.offlineStorage.get('lang');

        if (storedRav) {
            ravPickerModel.setRav(storedRav);
        } else if (ravPickerModel.get('_showOnCourseLoad') === false) {
            ravPickerModel.setRav(Adapt.config.get('_defaultRav'));
        } else {
            showRavPickerView();
        }
    }

    function showRavPickerView () {
        var ravPickerView = new RavPickerView({
            model: ravPickerModel
        });

        ravPickerView.$el.appendTo('#wrapper');
    }

    function setupNavigationView () {
        /*
         * On the framework this isn't an issue, but courses built in the authoring tool before the ARIA label
         * was added will break unless the extension is removed then added again.
         */
        var courseGlobals = Adapt.course.get('_globals')._extensions;
        var navigationBarLabel = '';
        if (courseGlobals._ravPicker) {
            navigationBarLabel = courseGlobals._ravPicker.navigationBarLabel;
        }

        var ravPickerNavView = new RavPickerNavView({
            model: ravPickerModel,
            attributes:  {
                'aria-label': navigationBarLabel
            }
        });

        ravPickerNavView.$el.appendTo('.navigation-inner');
    }

});
