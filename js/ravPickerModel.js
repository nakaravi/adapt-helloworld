define([
    'core/js/adapt'
], function (Adapt) {

    var RavPickerModel = Backbone.Model.extend({

        defaults: {
            _isEnabled: false,
            displayTitle: '',
            body: '',
            _ravs: []
        },

        trackedData: {
            components: [],
            blocks: []
        },

        locationId: null,

        initialize: function () {
            this.listenTo(Adapt.config, 'change:_activeRav', this.markRavAsSelected);
            this.listenTo(Adapt, 'app:dataLoaded', this.onDataLoaded);
        },

        getRavDetails: function (rav) {
            var _ravs = this.get('_ravs');
            return _.find(_ravs, function (item) {
                return (item._rav === rav);
            });
        },

        setRav: function (rav) {
            Adapt.config.set({
                '_activeRav': rav,
                '_defaultDirection': this.getRavDetails(rav)._direction
            });
        },

        markRavAsSelected: function(model, rav) {
            this.get('_ravs').forEach(function(item){
                item._isSelected = (item._rav === rav);
            });
        },

       onDataLoaded: function() {
            if (!this.get('_restoreStateOnRavChange')) {
                return;
            }
            _.defer(function() {
                this.locationId = Adapt.offlineStorage.get('location') || null;
                this.restoreState();
            }.bind(this));

        },

        restoreLocation: function() {
            if (!Adapt.mapById(this.locationId)) return;
            _.defer(function() {
                Adapt.navigateToElement('.' + this.locationId);
            }.bind(this));
        },

        /**
         * Restore course progress on rav change.
         */
        restoreState: function() {

            if (this.isTrackedDataEmpty()) return;

            if (this.trackedData.components) {
                this.trackedData.components.forEach(this.setTrackableState);
            }

            if (this.trackedData.blocks) {
                this.trackedData.blocks.forEach(this.setTrackableState);
            }
        },

        isTrackedDataEmpty: function() {
            return _.isEqual(this.trackedData, {
                components: [],
                blocks: []
            });
        },

        getTrackableState: function() {
            var components = this.getState(Adapt.components.models);
            var blocks = this.getState(Adapt.blocks.models);
            return {
                components: _.compact(components),
                blocks: _.compact(blocks)
            };
        },

        getState: function(models) {
            return models.map(function(model) {
                if (model.get('_isComplete')) {
                    return model.getTrackableState();
                }
            });
        },

        setTrackedData: function() {
            if (this.get('_restoreStateOnRavChange')) {
                this.listenToOnce(Adapt, 'menuView:ready', this.restoreLocation);
                this.trackedData = this.getTrackableState();
            }
        },

        setTrackableState: function(stateObject) {
            var restoreModel = Adapt.findById(stateObject._id);

            if (restoreModel) {
                restoreModel.setTrackableState(stateObject);
            } else {
                Adapt.log.warn('RavPicker unable to restore state for: ' + stateObject._id);
            }
        }

    });

    return RavPickerModel;

});
