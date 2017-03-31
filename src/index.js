import App from './App.html';

// Anything the end user can configure in the settings panel must be in
// this object. The settings in template.yml reference these property names.
export var state = {
	color: "#4f24ff",
	opacity: 0.5
};

// Flourish puts the data in here
export var data = {};

var app;

// Initialise the graphic
export function draw() {
	app = new App({
		target: document.body,
		data: Object.assign( {}, state, data )
	});
	update();
}

// Redraw everything if the window is resized
window.addEventListener("resize", function() {
	app.destroy();
	draw();
});

// The update function is called when the user changes a state property in
// the settings panel or presentation editor. It updates elements to reflect
// the current state.
export function update() {
	if (state.opacity < 0 || state.opacity > 1) {
		throw new Error("Opacity must be between 0 and 1");
	}

	app.set( Object.assign( {}, state, data ) );
}
