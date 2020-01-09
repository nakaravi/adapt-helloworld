define([
    'core/js/adapt'
], function(Adapt) {

    var RavPickerDrawerView = Backbone.View.extend({

        events: {
            'click button': 'onButtonClick'
        },

        initialize: function () {
            this.listenTo(Adapt, {
                remove: this.remove,
                'ravpicker:changerav:yes': this.onDoChangeRav,
                'ravpicker:changerav:no': this.onDontChangeRav
            });
            this.render();
        },

        render: function () {
            var data = this.model.toJSON();
            var template = Handlebars.templates[this.constructor.template];
            this.$el.html(template(data));
        },

        onButtonClick: function (event) {
            var newRav = $(event.target).attr('data-rav');
            this.model.set('newRav', newRav);
            var data = this.model.getRavDetails(newRav);

            var promptObject = {
                _classes: 'dir-ltr',
                title: data.warningTitle,
                body: data.warningMessage,
                _prompts:[
                    {
                        promptText: data._buttons.yes,
                        _callbackEvent: 'ravpicker:changerav:yes'
                    },
                    {
                        promptText: data._buttons.no,
                        _callbackEvent: 'ravpicker:changerav:no'
                    }
                ],
                _showIcon: true
            };

            if (data._direction === 'rtl') {
                promptObject._classes = 'dir-rtl';
            }

            //keep active element incase the user cancels - usually navigation bar icon
            //move drawer close focus to #focuser
            if ($.a11y) {
                // old a11y API (Framework v4.3.0 and earlier)
                this.$finishFocus = $.a11y.state.focusStack.pop();
                $.a11y.state.focusStack.push($('#focuser'));
            } else {
                this.$finishFocus = Adapt.a11y._popup._focusStack.pop();
                Adapt.a11y._popup._focusStack.push($('#a11y-focuser'));
            }

            Adapt.once('drawer:closed', function() {
                //wait for drawer to fully close
                _.delay(function(){
                    //show yes/no popup
                    Adapt.once('popup:opened', function() {
                        //move popup close focus to #focuser
                        if ($.a11y) {
                            // old a11y API (Framework v4.3.0 and earlier)
                            $.a11y.state.focusStack.pop();
                            $.a11y.state.focusStack.push($('#focuser'));
                            return;
                        }
                        Adapt.a11y._popup._focusStack.pop();
                        Adapt.a11y._popup._focusStack.push($('#a11y-focuser'));
                    });

                    Adapt.trigger('notify:prompt', promptObject);
                }, 250);
            });

            Adapt.trigger('drawer:closeDrawer');
        },

        onDoChangeRav: function () {
            // set default rav
            var newRav = this.model.get('newRav');
            this.model.setTrackedData();
            this.model.setRav(newRav);
            this.remove();
        },

        onDontChangeRav: function () {
            this.remove();

            //wait for notify to close fully
            _.delay(function(){
                //focus on navigation bar icon
                this.$finishFocus.a11y_focus();
            }.bind(this), 500);

        }

    }, {
        template: 'ravPickerDrawerView'
    });

    return RavPickerDrawerView;

});
