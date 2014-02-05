var WPSDK = WPSDK || {};
// Initialize WPSDK object with some parameter and config setting
WPSDK = (function ($) {

    //we can  use master.json here master.json is the combination of the all template and jsons which is loaded at first time and 
    //then we can take corresponding template and json from them for single page web application.
    var options = {
        "config": 
		{		
		//"url": "scripts/master.json",		
		//"path": "/scripts/master.json",
		"locale": "en-US",
		"token": ""
        },        
        "templates": [/*A subset of pageNames*/],
        "screenWidth": "320",
        "screenHeight": "480",
        "debug": false,      
        "error": function () { },
        "complete": function () { }
    };

    // All pagesName entry which we want to show
    var pageNames = [
                        "accounts",						
						"appointment"
					];

    //Create object for model ,template,json etc.
    var pages = {};
    var json = {};
    var models = {};
    var views = {};
    var templates = {};
    var iCount = 0;
    var pageResult = [];
    var _demoContent = null;

    // Get allTemplate  for this project which is availbe on /templates folder on the basis of template name
    var TemplateManager = {
        length: 0,
        get: function (id, callback) {
            var template = WPSDK.templates[id];

            if (template) {
                callback(id, template);
            } else {
                var self = this;

                $.ajax("templates/" + id + ".html",
		  		{
		  		    responseType: "html",
		  		    complete: function (template) {
		  		        WPSDK.templates[id] = template;
		  		        self.length++;
		  		        callback(id, template);
		  		    }
		  		});
            }
        }
    };

// Get allJson  for this project which is availbe on /Script/stubs folder on the basis of json id name
    var JsonManager = {
        length: 0,
        get: function (id, callback) {
            var json = WPSDK.json[id];
            if (json) {
                callback(id, json);
            } else {
                var self = this;
                $.ajax("scripts/stubs/" + id + ".json",
				{
				    responseType: "json",
				    complete: function (json) {
				        WPSDK.json[id] = JSON.parse(json);
				        self.length++;
				        callback(id, json);
				    }
				});
            }
        }
    };

    // initalizeation of WPSDK js which is called at first time when index page loaded it take all JSON and Template 
    init = function (params) {
        log("[WPSDK][init]");
        // check params is not undefined
        if (typeof params !== 'undefined') {
            for (var param in params) {
                log('[WPSDK][init] WPSDK.options[' + param + ']: ' + params[param]);
                if (typeof params[param] !== 'undefined') {
                    WPSDK.options[param] = params[param];
                }
            }
            if (typeof params.templates !== 'undefined' && params.templates !== null && params.templates.length > 0 && !_.isEmpty(params.templates)) {
                log("[WPSDK][init] WPSDK.options.templates \t[" + WPSDK.options.templates.toString() + "]\n\t\toverriding with\t\t[" + params.templates.toString() + ']');
                WPSDK.pageNames = params.templates;
            }
        }

        var len = WPSDK.pageNames.length;
        // check pagename length which is defined on pageNames array list
        for (var i = 0; i < len; i++) {            
            // load [WPSDK][init] all json by pagenames id
            JsonManager.get(WPSDK.pageNames[i], function (id, json) {
                // load [WPSDK][init] all template by pagenames id                
                TemplateManager.get(id, function (id, template) {
                    //[WPSDK][init] compiling template id and set on pages array list by pagenames                    
                    WPSDK.pages[id] = _.template(template, WPSDK.json[id]);                   
                    if (TemplateManager.length == len) {                        
                        //[WPSDK][init] complete                        
                        WPSDK.options.complete();
                    }
                });
            });
        }
    };

    // get Subsection of every page
    getSubsection = function () {
        return WPSDK.pageResult[WPSDK.iCount++];
    };
    // check Subsection availble or not
    hasSubsection = function () {
        var len = WPSDK.pageResult.length;
        if (len > WPSDK.iCount) {
            return true;
        }
        else {
            return false;
        }
    };

    getPage = function (id, callback, error) {     
        WPSDK.pageResult = [];
        log("[WPSDK][getPage] find id: " + id);
        if (WPSDK.pages[id]) {
            log("[WPSDK][getPage] id: " + id + " :: matched (ajax not needed)."); // , WPSDK.pages[id], WPSDK.pages);
            WPSDK.pageResult[0] = WPSDK.pages[id];
            callback(id, WPSDK.pageResult[0]);
            return;
        }
  
    };

    log = function () {
        if (WPSDK.options.debug === true) {
            if (typeof console === 'undefined') {
                $("p.log-output").append(arguments[0] + "<br/>");
            } else if (typeof console.log === 'function') {
                console.log.apply(console, arguments);
            }
        }
    };
    return { init: init, getPage: getPage, getSubsection: getSubsection, hasSubsection: hasSubsection, iCount: iCount, options: options, pages: pages, log: log, pageNames: pageNames, json: json, templates: templates, pageResult: pageResult};

})(Scout);