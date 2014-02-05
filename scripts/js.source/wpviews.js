 
var WPViews = WPViews || {};

WPViews.params = {};
WPViews.vendor = "";


//WPViews initialize parameter 
WPViews.init = (function () {
    var Site = {
        Models: {},
        Collections: {},
        Views: {},
        Templates: {},
        model: {}
    };
    // intialize wpviews js when wpsdk load is completd with templates and json
    init = function (_debug) {

    //Intialize Backbone model here 
        Site.Models.Item = Backbone.Model.extend({});
        //Intialize Backbone Collection here 
        //In collection we can set multiple module
        Site.Collections.Items = Backbone.Collection.extend({
            model: Site.Models.Item,            
            url: "../newtestBackbon/scripts/stubs/accounts.json",
            initialize: function () {
                //Items initialize
            },
            //render mehtod which is call when collection.render is called
            render: function (model) {
                //$(this.el).append(_.template(Site.Templates.items, this.model.toJSON()));
                for (var i = 0; i < Site.Templates.items.length; i++) {
                 // we can add here multiple template here
                }
            }
        });        

        Site.Models.Item = Backbone.Model.extend();
        Site.model.Item = new Site.Models.Item(WPViews.json);        
        Site.Templates.items = WPViews.template;        
        // intialize backbon view to extend template and json in to your page
        Site.Views.Items = Backbone.View.extend({
        // here el is maincontainer which is availble on your page in which cooresponding template show
            el: "#mainContainer", 
            template: Site.Templates.items,
            initialize: function () {
                //Items initialized
            },
            //render mehtod which is call when view.render is called
            render: function (model) {
                //this.model.toJSON()  is checked which template and json is used to append
                $(this.el).append(_.template(Site.Templates.items, this.model.toJSON()));  
            }
        });

        Site.Router = Backbone.Router.extend({
            routes: {
                "": "defaultRoute"  //http://localhost:57313/index.html  //we can define defaultRoute here 
            },

            defaultRoute: function () {
                Site.items = new Site.Collections.Items();
                var test = new Site.Views.Items({ collection: Site.items }); //Add this line                
                //Site.items.fetch({ success: function () { test.render() } });
                var view = new Site.Views.Items({ model: Site.model.Item }); //Add this line for calling backbon view
                view.render();
                //we have to call view.render(); for rendering templates on our page
            }
        });

        var appRouter = new Site.Router();        
        try {
            Backbone.history.start();
        }
        catch (ex) {
            //Backbone.history before stop
            Backbone.history.stop();
            //Backbone.history after stop
        }

    };

    return init;
})();