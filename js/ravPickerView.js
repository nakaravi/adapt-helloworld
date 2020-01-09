define([
    'core/js/adapt',
    './ravPickerNavigationView'
], function(Adapt, NavigationView) {

    var RavPickerView = Backbone.View.extend({

        events: {
            'click .ravpicker-ravs button': 'onRavClick'
        },

        className: 'ravpicker',

        initialize: function () {
            this.initializeNavigation();
            $('html').addClass('in-ravpicker');
            this.listenTo(Adapt, 'remove', this.remove);
            this.render();
        },

        render: function () {
            var data = this.model.toJSON();
            var template = Handlebars.templates[this.constructor.template];
            this.$el.html(template(data));
            this.$el.addClass(data._classes);

            document.title = this.model.get('title') || "";

            _.defer(this.postRender.bind(this));
        },

        postRender: function () {
            $('.loading').hide();
        },

        onRavClick: function (event) {
            this.destroyNavigation();
            this.model.setRav($(event.target).val());
        },

        initializeNavigation: function() {
            this.navigationView = new NavigationView({model:this.model});
        },

        destroyNavigation: function() {
            this.navigationView.remove();
        },

        remove: function() {
            $('html').removeClass('in-ravpicker');

            Backbone.View.prototype.remove.apply(this, arguments);
        }

    }, {
        template: 'ravPickerView'
    });

    return RavPickerView;

});
