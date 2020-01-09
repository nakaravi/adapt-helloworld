define([
    'core/js/adapt',
    './ravPickerDrawerView'
], function(Adapt, RavPickerDrawerView) {

    var RavPickerNavView = Backbone.View.extend({

        tagName: 'button',

        className: function () {
            var classNames = 'ravpicker-icon base icon';
            var customClass = this.model.get('_ravPickerIconClass') || 'icon-rav-2';

            return classNames + ' ' + customClass;
        },

        events: {
            'click': 'onClick'
        },

        initialize: function () {
            this.listenTo(Adapt, 'remove', this.remove);
        },

        onClick: function (event) {
            Adapt.drawer.triggerCustomView(new RavPickerDrawerView({model: this.model}).$el, false);
        }

    });

    return RavPickerNavView;

});
