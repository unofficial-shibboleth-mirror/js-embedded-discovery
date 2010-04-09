/** @class IdP Selector UI */
function IdPSelectUI(){
    //
    // The following are parameters
    //
    this.dataSource = 'idp.json';
    this.defaultLanguage = 'en';
    this.preferredIdP = '';
    this.maxPreferredIdPs = 3;
    this.helpURL = '';
    this.samlIdPCookieTTL = 730; // days
    this.langBundles = {
    'en': {
        'fatal.divMissing': 'Supplied Div is not present in the DOM',
        'fatal.noXMLHttpRequest': 'Browser does not support XMLHttpRequest, unable to load IdP selection data',
        'error.noData': '',
        'error.noIdPSelectDiv': '',

        'idpPreferred.label': 'Use a preferred selection',
        
        'idpEntry.label': 'Or enter your organization\'s name',
        
        'idpList.label': 'Or select your organization from the list below',
        'idpList.defaultOptionLabel': 'Please select your organization...',
        'idpList.showList' : 'Allow me to pick from a list',
        'idpList.showSearch' : 'Allow me to specify the site',

        'submitButton.label': 'Continue',
        }
    };

    //
    // module locals
    //
    var spData;
    var idpData;
    var base64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    var lang;
    var defaultLang;
    var langBundle;
    var defaultLangBundle;

    var preferredIdP;
    var maxPreferredIdPs;
    var helpURL;
    var samlIdPCookieTTL;
    var userSelectedIdPs;
    //
    // Anchors used inside autofunctions
    //
    var idpEntryDiv;
    var idpListDiv;
    var idpSelect;

    // *************************************
    // Public functions
    // *************************************
    
    /**
       Draws the IdP Selector UI on the screen.  This is the main
       method for the IdPSelectUI class.
    */
    this.draw = function(){
        setupLocals(this);
        load(this.dataSource);
        
        var idpSelectDiv = document.getElementById('idpselect');
        if(!idpSelectDiv){
            fatal(getLocalizedMessage('fatal.divMissing'));
            return;
        }
        
        var idpSelector = buildIdPSelector();
        idpSelectDiv.appendChild(idpSelector);
        
        //TODO focus on IdP input
    }
    
    /**
       Switches displayed UI between the IdP Entry (text field) and IdP
       Drop Down List tiles.
    */
    this.switchIdPSelectionView = function(){
        //TODO
    }
    
    // *************************************
    // Private functions
    //
    // Data Manipulation
    //
    // *************************************

    /**
       Copies the "parameters" in the function into namesspace local
       variables.  This means most of the work is done outside the
       IdPSelectUI object
    */

    var setupLocals = function (parent) {
        //
        // Copy parameters in
        //
        preferredIdP = parent.preferredIdP;
        maxPreferredIdPs = parent.maxPreferredIdPs;
        helpURL = parent.helpURL;
        samlIdPCookieTTL = parent.samlIdPCookieTTL;

        lang = Navigator.userLanguage || parent.defaultLanguage;
        defaultLang = parent.defaultLanguage;
        langBundle = parent.langBundles[lang];
        defaultLangBundle = parent.langBundles[parent.defaultLanguage];

        //
        // Setup Language bundles
        //
        if (!defaultLangBundle) {
            fatal('No languages work');
            return;
        }
        if (!langBundle) {
            debug('No language support for ' + lang);
        }
    }
    
    /**
       Loads the data used by the IdP selection UI.  Data is loaded 
       from a JSON document fetched from the given url.
      
       @param {Function} failureCallback A function called if the JSON
       document can not be loaded from the source.  This function will
       passed the {@link XMLHttpRequest} used to request the JSON data.
    */
    var load = function(dataSource){
        var xhr = new XMLHttpRequest();
        if(xhr == null){
            //TODO
        }
        
        xhr.open('GET', dataSource, false);
        xhr.overrideMimeType('application/json');
        xhr.send();
        
        if(xhr.status == 200){
            var jsonData = xhr.responseText;
            if(jsonData == ''){
                //TODO error
            }

            var fre = JSON;
            idpData = JSON.parse(jsonData);

        }else{
            failureCallback(xhr);
        }
    }

    /**
       Returns the idp object with the given name.

       @param (String) the name we are interested in
       @return (Object) the IdP we care about
    */

    var getIdPFor = function(idpName) {

        for (var i = 0; i < idpData.idps.length; i++) {
            if (idpData.idps[i].id == idpName) {
                return idpData.idps[i];
            }
        }
        return null;
    }

    /**
       Returns a suitable image from the given IdP
       
       @param (Object) The IdP
       @return Object) a DOM object suitable for insertion
       
       TODO - rather more careful selection
    */

    var getImageForIdP = function(idp) {

        if (null == idp.logos || 0 == idp.logos.length) {
            return null;
        }
        var img = document.createElement('img');
        img.setAttribute('src', idp.logos[0].imgsrc);
        img.setAttribute('alt', idp.logos[0].alttxt);
        return img;
    }


    // *************************************
    // Private functions
    //
    // GUI Manipulation
    //
    // *************************************
    
    /**
       Builds the IdP selection UI.

       Three divs. PreferredIdPTime, EntryTile and DropdownTile
      
       @return {Element} IdP selector UI
    */
    var buildIdPSelector = function(){
        var containerDiv = buildDiv('container');
        containerDiv.appendChild(buildPreferredIdPTile());
        containerDiv.appendChild(buildIdPEntryTile());
        containerDiv.appendChild(buildIdPDropDownListTile());
        return containerDiv;
    }

    /**
      Builds a button for the provided IdP
        <div class="preferredIdP">
          <a href="XYX" onclock=setparm('ABCID')>
            XYX Text
            <img src="https:\\xyc.gif"> <!-- optional -->
          </a>
        </div>

      @param (Object) The Idp
      
      @return (Element) preselector for the IdP
    */
    var composePreferredIdPButton = function(idp) {
        //
        // Button looks line this
        //
        var div = buildDiv('preferredIdP','preferredIdPClass');
        var aval = document.createElement('a');
        var retString = idpData.returnIDParam + '=' + idp.id;
        var retVal = idpData['return'];
        var img = getImageForIdP(idp);
        if (retVal.indexOf('?') == -1) {
            retString = '?' + retString;
        } else {
            retString = '&' + retString;
        }
        aval.setAttribute('href', retVal + retString);
        aval.appendChild(document.createTextNode(getLocalizedName(idp)));
        aval.onclick = function () {selectIdP(idp.id);};
        if (img != null) {
            aval.appendChild(img);
        }
        div.appendChild(aval);
        
        return div;
    }
    
    /**
       Builds the preferred IdP selection UI (top half of the UI w/ the
       IdP buttons)

       <div id="preferredIdP">
          <div> [see comprosePreferredIdPButton </div>
          [repeated]
       </div>
      
       @return {Element} preferred IdP selection UI
    */
    var buildPreferredIdPTile = function(){
        var preferredIdPDIV = buildDiv('preferredIdP');

        var introTxt = document.createTextNode(getLocalizedMessage('idpPreferred.label')); 
        preferredIdPDIV.appendChild(introTxt);

        var preferredIdPs = getPreferredIdPs();
        for(var i = 0 ; i < maxPreferredIdPs && i < preferredIdPs.length; i++){
            if (preferredIdPs[i]) {
                var button = composePreferredIdPButton(preferredIdPs[i]);
                preferredIdPDIV.appendChild(button);
            }
        }

        return preferredIdPDIV
    }
    
    /**
       Build the manual IdP Entry tile (bottom half of UI with
       search-as-you-type field).
      
       @return {Element} IdP entry UI tile
    */
    var buildIdPEntryTile = function() {
        idpEntryDiv = buildDiv('idpEntry');

        var enterOrgLabel = buildLabel('idpEntry', getLocalizedMessage('idpEntry.label'));
        idpEntryDiv.appendChild(enterOrgLabel);
        
        var input = document.createElement('input');
        input.setAttribute('type', 'text');
        setID(input, 'idpInput');
        idpEntryDiv.appendChild(input);
        
        var selectOrSearchInput = document.createElement('input');
        setID(selectOrSearchInput, 'selectOrSearchHiddenInput');
        selectOrSearchInput.setAttribute('name', 'action');
        selectOrSearchInput.setAttribute('value', 'search');
        selectOrSearchInput.setAttribute('type', 'submit');
        idpEntryDiv.appendChild(selectOrSearchInput);

        var a = document.createElement('a');
        a.appendChild(document.createTextNode(getLocalizedMessage('idpList.showList')));
        a.setAttribute('href','#');
        a.onclick = function() { 
            idpEntryDiv.style.display='none';
            idpListDiv.style.display='inline';};
        idpEntryDiv.appendChild(a);
                                              

        
        //TODO link to switch to drop down list tile

        return idpEntryDiv
    }
    
    /**
       Builds the drop down list containing all the IdPs from which a
       user may choose.

       <div id="idplist">
          <label for="idplist">idpList.label</label>
          <form action="URL from IDP Data" method="GET">
          <select name="param from IdP data">
             <option value="EntityID">Localized Entity Name</option>
             [...]
          </select>
          <input type="submit/>
       </div>
        
       @return {Element} IdP drop down selection UI tile
    */
    var buildIdPDropDownListTile = function() {
        idpListDiv = buildDiv('idplist', 'display:none');
        
        var selectOrgLabel = buildLabel('idplist', getLocalizedMessage('idpList.label'));
        idpListDiv.appendChild(selectOrgLabel);
        
        idpSelect = document.createElement('select');
        setID(idpSelect, 'idpSelector');
        idpSelect.setAttribute('name', idpData.returnIDParam);
        idpListDiv.appendChild(idpSelect);
        
        var idpOption = buildSelectOption('-', getLocalizedMessage('idpList.defaultOptionLabel'));
        idpOption.setAttribute('selected', 'selected');
        //
        // TODO what to do if this 'IdP' is selected?
        //
        idpSelect.appendChild(idpOption);
    
        var idp;
        for(var i=0; i<idpData.idps.length; i++){
            idp = idpData.idps[i];
            idpOption = buildSelectOption(idp.id, getLocalizedName(idp));
            idpSelect.appendChild(idpOption);
        }

        var form = document.createElement('form');
        form.setAttribute('action',idpData['return']);
        form.setAttribute('method','GET');
        form.appendChild(idpSelect);
        form.appendChild(buildContinueButton());
        idpListDiv.appendChild(form);

        //
        // The switcher
        //
        var a = document.createElement('a');
        a.appendChild(document.createTextNode(getLocalizedMessage('idpList.showSearch')));
        a.setAttribute('href','#');
        a.onclick = function() { 
            idpEntryDiv.style.display='inline';
            idpListDiv.style.display='none';};
        idpListDiv.appendChild(a);
        
        return idpListDiv;
    }
    
    /**
       Builds the 'continue' button used to submit the IdP selection.
      
       @return {Element} HTML button used to submit the IdP selection
    */
    var buildContinueButton = function() {
        var button  = document.createElement('button');
        setID(button, 'button');
        button.setAttribute('type', 'submit');
        button.appendChild(document.createTextNode(getLocalizedMessage('submitButton.label')));
        button.onclick = function() {selectIdP(idpSelect.options[idpSelect.selectedIndex].value);}
        return button;
    }
    
    /**
       Creates a div element whose id attribute is set to the given ID.
      
       @param {String} id ID for the created div element
       @param {String} [style] style of the created div element
       @return {Element} DOM 'div' element with an 'id' attribute
    */
    var buildDiv = function(id, style){
        var div = document.createElement('div');
        div.setAttribute('id', id);
        if(style !== ''){
            div.setAttribute('style', style);
        }
        return div;
    }
    
    /**
       Builds an HTML select option element
      
       @param {String} value value of the option when selected
       @param {String} label displayed label of the option
    */
    var buildSelectOption = function(value, text){
        var option = document.createElement('option');
        option.setAttribute('value', value);
        option.appendChild(document.createTextNode(text));
        return option;
    }
    
    /**
       Builds an HTML label element.

       @param {String} target the id of the HTML element with which
       this label is associated
       @param {String} label the textual content of the label element

       @return {Element} the label element
    */
    var buildLabel = function(target, text) {
        var label = document.createElement('label');
        label.setAttribute('for', 'idpsel' + target);
        label.appendChild(document.createTextNode(text));
        return label;
    }

    /**
       Sets the attribute 'id' on the provided object
       We do it through this function so we have a single
       point where we can prepend a value
       
       @param (Object) The [DOM] Object we want to set the attribute on
       @param (String) The Id we want to set
    */

    var setID = function(obj, name) {

        obj.setAttribute('id', 'idpsel' + name);
    }

    /**
       Returns the DOM object with the specified id.  We abstract
       through a function to allow us to prepend to the name
       
       @param (String) the (unprepended) id we want
    */
    var locateElement = function(name) {
        return document.getElementById('idpsel'+name);
    }

    // *************************************
    // Private functions
    //
    // GUI actions.  Note that there is an element of closure going on
    // here since these names are invisible outside this module.
    // 
    //
    // *************************************

    /**
       Base helper function for when an IdP is selected
    */

    var selectIdP = function(idP) {

        updateSelectedIdPs(idP);
        saveUserSelectedIdPs(userSelectedIdPs);
    }

    /**
       Helper function for when the IdP is in a form
    */


    // *************************************
    // Private functions
    //
    // Localization handling
    //
    // *************************************

    /**
       Gets a localized string from the given language pack.  This
       method uses the {@link langBundles} given during construction
       time.

       @param {String} messageId ID of the message to retrieve

       @return (String) the message
    */
    var getLocalizedMessage = function(messageId){

        var message = langBundle[messageId];
        if(!message){
            message = defaultLangBundle[messageId];
        }
        if(!message){
            fatal('Missing message for ' + messageId);
        }
        
        return message;
    }

    /**
       Returns the localized name information for the provided idp

       @param (Object) an idp.  This should have an array 'names' with sub
        elements 'lang' and 'name'.

       @return (String) The localized name
    */

    var getLocalizedName = function(idp){

        for (i in idp.names) {
            if (idp.names[i].lang == lang) {
                return idp.names[i].name;
            }
        }
        for (i in idp.names) {
            if (idp.names[i].lang == defaultLang) {
                return idp.names[i].name;
            }
        }

        error('No Name in either language for ' + idp.id);
        return 'unknown';
    }

    
    // *************************************
    // Private functions
    //
    // Cookie and preferred IdP Handling
    //
    // *************************************

    /**
       Gets the preferred IdPs.  The first elements in the array will
       be the preselected preferred IdPs.  The following elements will
       be those past IdPs selected by a user.  The size of the array
       will be no larger than the maximum number of preferred IdPs.
    */
    var getPreferredIdPs = function(){
        var idps = new Array(maxPreferredIdPs);
        var offset = 0;
        
        // populate start of array with preselected IdPs
        if(preferredIdP){
            for(var i=0; i < preferredIdP.length && i < maxPreferredIdPs-1; i++){
                idps[i] = getIdPFor(preferredIdP[i]);
                offset++;
            }
        }

        userSelectedIdPs = retrieveUserSelectedIdPs();
        for (var i = offset, j=0; i < userSelectedIdPs.length && i < maxPreferredIdPs; i++, j++){
            idps[i] = getIdPFor(userSelectedIdPs[j]);
        }
        return idps;
    }

    /**
       Update the userSelectedIdPs list with the new value.

       @param (String) the newly selected IdP
    */
    var updateSelectedIdPs = function(newIdP) {

        var i = 0;
        for (i = 0; i < userSelectedIdPs.length; i++) {
            if (userSelectedIdPs[i] == newIdP) {
                break;
            }
        }
        if (userSelectedIdPs.length != i) {
            //
            // it was already there
            //

            var older = userSelectedIdPs.splice(i);
            //
            // older is everything to the 'right' of the idp
            // userSelectedIdPs is the up to and including
            //
            older.shift(); // get rid of the old one)
            userSelectedIdPs = userSelectedIdPs.concat(older); // strich them together
        }
        userSelectedIdPs.unshift(newIdP);
        return;
    }
    
    /**
       Gets the IdP previously selected by the user.
      
       @return {Array} user selected IdPs identified by their entity ID
    */
    var retrieveUserSelectedIdPs = function(){
        var userSelectedIdPs = new Array();
        
        var cookies = document.cookie.split( ';' );
        for (var i = 0; i < cookies.length; i++) {
            //
            // Do not use split '=' is valid in Base64 encoding!
            //
            var cookie = cookies[i];
            var splitPoint = cookie.indexOf( '=' );
            var cookieName = cookie.substring(0, splitPoint);
            var cookieValues = cookie.substring(splitPoint+1);
                                
            if ( '_saml_idp' == cookieName.replace(/^\s+|\s+$/g, '') ) {
                cookieValues = cookieValues.replace(/^\s+|\s+$/g, '').split('+');
                for(var i=0; i< cookieValues.length; i++){
                    userSelectedIdPs.push(base64Decode(cookieValues[i]));
                }
            }
        }

        return userSelectedIdPs;
    }
    
    /**
       Saves the IdPs selected by the user.
      
       @param {Array} idps idps selected by the user
    */
    function saveUserSelectedIdPs(idps){
        for(var i=0; i < idps.length; i++){
            idps[i] = base64Encode(idps[i]);
        }
        
        var expireDate = null;
        if(samlIdPCookieTTL){
            var now = new Date();
            cookieTTL = samlIdPCookieTTL * 24 * 60 * 60 * 1000;
            expireDate = new Date(now.getTime() + cookieTTL);
        }
        
        document.cookie='_saml_idp' + '=' + idps.join('+') +
            ((expireDate==null) ? '' : '; expires=' + expireDate.toUTCString());
    }
    
    /**
       Base64 encodes the given string.
      
       @param {String} input string to be encoded
      
       @return {String} base64 encoded string
    */
    var base64Encode = function(input) {
        var output = '', c1, c2, c3, e1, e2, e3, e4;

        for ( var i = 0; i < input.length; ) {
            c1 = input.charCodeAt(i++);
            c2 = input.charCodeAt(i++);
            c3 = input.charCodeAt(i++);
            e1 = c1 >> 2;
            e2 = ((c1 & 3) << 4) + (c2 >> 4);
            e3 = ((c2 & 15) << 2) + (c3 >> 6);
            e4 = c3 & 63;
            if (isNaN(c2)){
                e3 = e4 = 64;
            } else if (isNaN(c3)){
                e4 = 64;
            }
            output += base64chars.charAt(e1) 
                + base64chars.charAt(e2) 
                + base64chars.charAt(e3) 
                + base64chars.charAt(e4);
        }

        return output;
    }
    
    /**
       Base64 decodes the given string.
      
       @param {String} input string to be decoded
      
       @return {String} base64 decoded string
    */
    var base64Decode = function(input) {
        var output = '', chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        // Remove all characters that are not A-Z, a-z, 0-9, +, /, or =
        var base64test = /[^A-Za-z0-9\+\/\=]/g;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

        do {
            enc1 = base64chars.indexOf(input.charAt(i++));
            enc2 = base64chars.indexOf(input.charAt(i++));
            enc3 = base64chars.indexOf(input.charAt(i++));
            enc4 = base64chars.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

            chr1 = chr2 = chr3 = '';
            enc1 = enc2 = enc3 = enc4 = '';

        } while (i < input.length);

        return output;
    }

    // *************************************
    // Private functions
    //
    // Error Handling.  we'll keep it separate with a view to eventual
    //                  exbedding into log4js
    //
    // *************************************
    /**
       
    */

    var error = function(message) {
        alert('DISCO-UI: ' + message);
    }

    var fatal = function(message) {
        alert('FATAL - DISCO UI:' + message);
    }

    var debug = function() {
        //
        // Nothing
    }
}