var nodenames = "MainClickSensor";
nodenames +=",StartButton,WelcomeScreen,EndScreen,IntroductionButton,Slide1,WelcomeScreenMaterial,NavigationCheckmark,SignsFoundCheckmark,BombFoundCheckmark,Achievments";
nodenames +=",ReportLevels0123,Level0Checkbox,Level1Checkbox,Level2Checkbox,Level3Checkbox,LevelHotspots,SphereHopper";
nodenames +=",ReportSignButton,SuspSigns,SignTrackers,SignsFoundText";
nodenames +=",Welcome,FullInstruction,Countdown,Click,Ambient,Correct,Wrong";

// NodeList object stores all my node references under NL.
var NL = new NodeList(nodenames);
var currentTextureNumber = -1;
var levelnr = 0;   // can be 0, 1, 2, 3 representing which checkbox is shown, only one at a time.
var lastSelectedSign = undefined;
var screenSlideNumber = 1;
var correctRatings = 0;

var achievments = {
	navigation: false,
	signsFound: () => {return correctRatings >= 3;},
	bombFound: false
}

function initialize()
{
	ChooseLevel(-1);
	NL.WelcomeScreenMaterial.GetFieldByName("DiffuseMap").value = NL.Slide1;
	NL.Welcome.on();
	NL.WelcomeScreen.on();
	NL.Ambient.on();
	NL.EndScreen.off();
}

function On_TimerTime()
{
	
}

function endScreen(event) {
	NL.EndScreen.on();
	if (achievments.navigation) {NL.NavigationCheckmark.on();}
	if (achievments.signsFound()) {
		NL.SignsFoundCheckmark.on();
	}
	if (achievments.bombFound) {NL.BombFoundCheckmark.on();}
	
	NL.SignsFoundText.set("Text", [correctRatings + " found"]);
	if (event == "evacuation") {
		eon.trace("Evac!");
	}

	if (event == "timeout") {
		eon.trace("Ran out of time");
	}
}

function ___________Inevents________________(){}

function On_KeyNameDown()
{
	var k = KeyNameDown.value;
	
	switch(k)
	{
		case "space" : NL.ReportLevels0123.on(); break;
		case "b" : NL.ReportLevels0123.off(); ChooseLevel(-1); break;
		case "n" : ChooseLevel(-1);
	}
}

function outOfTime() {
	if (NL.SuspSigns.isOn() == true) {
		NL.ReportSignButton.on();
		NL.SuspSigns.off();
		NL.Countdown.off();
		isReporting = false;
		Timer.remove(outOfTimeEvent);
	}
}

function On_TextureChanged() {
	outOfTime();
	hideTrackers();
	currentTextureNumber = NL.SphereHopper.get("TextureNrShowing") + 1;
	achievments.navigation = true;
}

var outOfTimeEvent = {};

function setTutorialScreen1() {
	NL.WelcomeScreenMaterial.GetFieldByName("DiffuseMap").value = eon.FindNode("InstructionSlide1");
}
function setTutorialScreen2() {
	NL.WelcomeScreenMaterial.GetFieldByName("DiffuseMap").value = eon.FindNode("InstructionSlide2");
}
function setTutorialScreen3() {
	NL.WelcomeScreenMaterial.GetFieldByName("DiffuseMap").value = eon.FindNode("InstructionSlide3");
}

function On_UIClick()
{
	NL.Click.off();
	var shape = NL.MainClickSensor.get("Target");
	if (typeof shape == "undefined") return;

	// clicking the "Report Sign Now" button
	if (IsAncestor(shape, NL.ReportSignButton))
	{
		if (NL.WelcomeScreen.isOn()) {
			return;
		}
		NL.Click.set("Play", true);
		NL.Welcome.off();
		NL.ReportSignButton.off();
		NL.SuspSigns.on();
		var trackTextureName = "TrackTexture" + currentTextureNumber;
		eon.FindNode(trackTextureName).GetFieldByName("Visible").value = true;
		NL.Countdown.on();
	
		outOfTimeEvent = Timer.eval("outOfTime()", 11.5);
	}

	// clicking on one of the suspicious signs
	if (IsAncestor(shape, NL.SuspSigns))
	{
		NL.Click.set("Play", true);
		lastSelectedSign = shape;
		NL.SuspSigns.off();
		NL.Countdown.off();
		NL.ReportLevels0123.on();
		hideTrackers();
	}

	// clicking on Level 0, 1, 2 or 3
	if (IsAncestor(shape, NL.LevelHotspots))
	{
		var nr = Number(eon.getNodeName(shape.getParentNode()).substring(5,6));
		ChooseLevel(nr);
	}

	// Interacting with welcome screen
	if (IsAncestor(shape, NL.WelcomeScreen)) {
		NL.Click.set("Play", true);

		// Pressed StartButton
		if (IsAncestor(shape, NL.StartButton)) {
			NL.WelcomeScreen.off();
			NL.FullInstruction.off();
			Timer.eval("endScreen('timeout')", 180);
		}

		// Start tutorial on screen
		if (IsAncestor(shape, NL.IntroductionButton)) {
			NL.Welcome.off();
			setTutorialScreen1();
			Timer.eval("setTutorialScreen2()", 15);
			Timer.eval("setTutorialScreen3()", 90);
			NL.FullInstruction.on();
			NL.IntroductionButton.off();
		}
	}
}

function On_UIHover()
{
	var shape = NL.MainClickSensor.get("Target");
	if (typeof shape == "undefined") return;
}

function hideTrackers() {
	for (var i = 0; i < NL.SignTrackers.GetFieldByName("TreeChildren").GetMFCount(); i++) {
		var child = NL.SignTrackers.GetFieldByName("TreeChildren").GetMFElement(i);
		child.GetFieldByName("Visible").value = false;
	}
}

function ChooseLevel(nr)
{

	eon.trace("lastSelectedSign" + lastSelectedSign);
	if (nr == levelnr) return; // exit if same as before.
	
	// turn off previous checkbox
	if (levelnr > -1) eval("NL.Level" + levelnr + "Checkbox.off()");
	
	// store the level chosen
	levelnr = nr;

	if (levelnr == -1) return;
	var currentTrackTextureNode = eon.findNode("TrackTexture" + currentTextureNumber);
	var correctLevelForCurrentSign = Number(eon.GetNodeName(lastSelectedSign.GetParentNode().GetParentNode().GetParentNode()).substring(5,6));
	eon.trace("CorrectLevelNumber: " + correctLevelForCurrentSign);
	eon.trace("Currrent chosen number" + levelnr);

	// If correct level chosen
	if (levelnr == correctLevelForCurrentSign) {
		NL.Correct.set("Play", true);
		correctRatings++;

		if (levelnr == 3) {
			achievments.bombFound = true;
			Timer.eval("endScreen('evacuation')", 4);
		}
	} else {
		NL.Wrong.set("Play", true);
	}

	// turn on new checkbox
	eval("NL.Level" + levelnr + "Checkbox.on()");
	
	// Play the relevant sound when a level is chosen
	switch(levelnr)
	{
		case 0:  break;
		case 1:  break;
		case 2:  break;
		case 3:  break;
	}
	
	// Stop another level from being triggered.
	NL.LevelHotspots.off();
		
	// reset the panel after a little time
	Timer.eval("ResetLevelPanel()", 6);
}

function ResetLevelPanel()
{
	// A little after a level is chosen we reset the panel and start again.
	hideTrackers();

	ChooseLevel(-1); // removes checkbox
	NL.ReportLevels0123.off(); // hides level panel
	NL.LevelHotspots.on(); // getting ready to allow levels to be triggered again
	
	NL.ReportSignButton.on();
}

function ___________Helper_Functions________________(){}

function IsAncestor(node, ancestor)
{
	return (eon.GetNodePath(node).indexOf(eon.GetNodePath(ancestor))==0)
}

function NodeList(nodenames)
{
	// define a root node as this script's parent node.
	var root = eonthis.GetParentNode().GetParentNode();
	
	// split string of nodenames into an array
	nodenames = nodenames.split(",")
	
	for (var i in nodenames) // loop through the list of nodenames
	{
		// search under the root node for eon nodes with a certain name.
		try { var node = eon.Find(nodenames[i], root).Item(0); }
		catch(e) {throw Error("Can't find a node called " + nodenames[i]); }
		
		// Add a property to 'this' NL object, where property name is nodename
		// and value is an eon node object of that name.
		this[nodenames[i]] = node;
	}
	
	// special way to find the simulation node
	this.SimNode = eon.FindNode(eon.GetNodePath(eonthis).split("\\")[0]);
	
	// All the property values of this object, NL, are node objects.
	// Enable on(), off(), get(), set() methods on all NL. type nodes.
	for (var i in this) AddOnOffGetSetMethodsToNode(this[i]);
	// ensure the above helper function is added to your script.
}

// These should be part of the core node methods like node.GetFieldByName
function AddOnOffGetSetMethodsToNode(node)
{
	node.on  = function(){this.GetFieldByName("SetRun").value=true};
	node.off = function(){this.GetFieldByName("SetRun").value=false};
	node.isOn = function(){return this.GetFieldByName("SetRun").value};
	node.get = function(fieldname)
	{ 
		try { var f = this.GetFieldByName(fieldname);}
		catch(e){ throw Error("The field '" + fieldname + "' doesn't exist on the '" + eon.GetNodeName(this) + "' node."); return;}
		return f.value;
	}
	node.set = function(fieldname, value)
	{
		try { var f = this.GetFieldByName(fieldname);}
		catch(e){ throw Error("The field '" + fieldname + "' doesn't exist on the '" + eon.GetNodeName(this) + "' node."); return;}
		f.value = value;
	}
	
	node.toggle = function(fieldname){if (fieldname == undefined) fieldname = "Enabled"; var f=this.GetFieldByName(fieldname); f.value=!f.value; return f.value};
}

// ssigns.js
// Last modified 2nd August, 2017.
// by Lloyd Churches for EON Reality.node.toggle = function(fn){ / fn=fieldname / if (!fn) fn="Enabled"; if (this.getIdOfName(fn)==-1) fn="SetRun"; 
