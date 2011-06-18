if (!org)
	var org = {};
if (!org.seanleblanc)
	org.seanleblanc = {};

org.seanleblanc.checkfox = function() {

	var pub = {};
	
	// Log messages to console for debugging. Set to false when published.
	function log(msg) {
		if (false) {
	  		var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
	                                 .getService(Components.interfaces.nsIConsoleService);
	  		consoleService.logStringMessage("CF:" + msg);
	  	}
	}
	
	//function qc_init() {
	pub.qc_init = function() {
		// Eventlistener for the contextmenu
		var menu = document.getElementById("contentAreaContextMenu");
		menu.addEventListener("popupshowing", qc_showMenu, false);
	}
	
	// Get content:
	function qc_getContent() {
		return content;
	}
	
	// get document:
	function qc_getDoc() {
		return qc_getContent().document;
	}
	
	// Get list of all checkboxes on a page:
	function qc_getCheckBoxes() {
		var doc = qc_getDoc();
		var checkBoxes = doc.evaluate("//input[translate(@type, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')='checkbox']", doc, null,
	      XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
	      null);
	    log("First eval # of checkBoxes: " + checkBoxes.snapshotLength);
	    var all = new Array(checkBoxes);
	
		log("About to check # of frames...");
	    if (qc_getContent().frames.length > 0) {
	    	log("Frames greater than zero: " + qc_getContent().frames.length);
		    for(var i=0; i < qc_getContent().frames.length; i++) {
		    	log("Adding checkboxes from frame #" + i);
		    	doc = qc_getContent().frames[i].document;
		        checkBoxes = doc.evaluate("//input[translate(@type, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')='checkbox']", doc, null,
		      		XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
		      	if (checkBoxes.snapshotLength > 0) {
		      		log("Checkbox snapshotLength=" + checkBoxes.snapshotLength);
		      		all = all.concat(checkBoxes);
		      	}
		    }
	    }
		return all;
	}
	
	// Get selection on current page:
	function qc_getSelection() {
		sel = window.content.getSelection();
	
		log("Selection len: " + sel.toString().length);
		if (sel.toString().length<=0) {
			log("No selection found at top level!");
	
			if (qc_getContent().frames.length > 0) {
				log("Checking other frames...");
	
				for (var i=0; i < qc_getContent().frames.length; i++) {
					log("Checking selection on frame #" + i);
	
					sel = qc_getContent().frames[i].getSelection();
					if (sel.toString().length>0) {
						break;
					}
				}
			}
		}
	
		return sel;
	}
	
	// Figure out what to show:
	function qc_showMenu(event) {
		var showCheck = false;
		var showUncheck = false;
		log("About to check for selected text.");
		var sel = qc_getSelection();
		if (sel && sel.toString().length > 0) {
			log("Text IS selected.");
			var all, aCheckBox, checkBoxes;
			all = qc_getCheckBoxes();
			for (var a = 0; a < all.length; a++) {
				log("Checking all # " + a);
				checkBoxes = all[a];
				for (var i = 0; i < checkBoxes.snapshotLength; i++) {
					log("Inspecting checkbox # " + i);
			    	aCheckBox = checkBoxes.snapshotItem(i);
			    	log("Checkbox: " + aCheckBox);
			    	if (sel.containsNode(aCheckBox, true)) {
			    		log("Checkbox " + i + " was in selection.");
			    		if (aCheckBox.checked) {
			    			showUncheck = true;
						}
						else {
							showCheck = true;
						}
			    	}
				}
			}
		}
	
		// Set menus visible/invisible as appropriate:
		if (showCheck) {
			document.getElementById("checkfox").hidden = false;
		}
		else {
			document.getElementById("checkfox").hidden = true;
		}
		if (showUncheck) {
			document.getElementById("checkfox2").hidden = false;
		}
		else {
			document.getElementById("checkfox2").hidden = true;
		}
	}
	
	//function qc(check){
	pub.qc = function(check) {	
		// Don't even bother if text isn't selected.
		// qc_showMenu should have taken care of this, but just in case.
		var sel = qc_getSelection();
		if (sel.toString().length > 0) {
			// Get all check boxes on page:
			var all, checkBoxes, aCheckBox;
			var clickList = new Array();
			all = qc_getCheckBoxes();
			
			// Iterate over checkboxes, see if they are selected:
			for (var a = 0; a < all.length; a++) {
				checkBoxes = all[a];
				for (var i = 0; i < checkBoxes.snapshotLength; i++) {
			    	aCheckBox = checkBoxes.snapshotItem(i);
			    	if (sel.containsNode(aCheckBox, true)) {
			    		// Set or unset as required:
			    		if ((aCheckBox.checked && !check) || (!aCheckBox.checked && check)) {
				    		clickList = clickList.concat(aCheckBox);
				    	}
			    	}
				}
			}
			for (var i=0; i < clickList.length; i++) {
				clickList[i].click();
			}
		}
	};
	
	return pub;
}();

// Initializing the extension when the browser is loaded.
window.addEventListener("load", org.seanleblanc.checkfox.qc_init, false);

