export default function tween ( a, b, callback, options ) {
	options = options || {};
	options.duration = options.duration || 400;
	options.easing = options.easing || function ( x ) {
		return x;
	};

	const interpolator = interpolate( a, b );

	var t0 = window.performance.now();
	var stopped = false;

	function loop () {
		var t = window.performance.now();
		var elapsed = t - t0;
		var p = elapsed / options.duration;

		if ( p > 1 ) {
			p = 1;
			stopped = true;
		}

		if ( !stopped ) requestAnimationFrame( loop );

		var value = interpolator( options.easing( p ) );
		callback( value );
	}

	loop();

	return {
		stop: function () {
			stopped = true;
		}
	};
}

function type ( thing ) {
	return Object.prototype.toString.call( thing );
}

function interpolate ( a, b ) {
	if ( type( a ) !== type( b ) ) {
		return snapTo( b );
	}

	if ( typeof a === 'number' ) {
		return interpolateNumber( a, b );
	}

	if ( Array.isArray( a ) ) {
		return interpolateArray( a, b );
	}

	if ( typeof a === 'object' ) {
		return interpolateObject( a, b );
	}

	if ( typeof a === 'string' && a.match(/^#[0-9a-fA-F]{6}$/) ) {
		return interpolateColor( a, b );
	}

	return snapTo( b );
}

function snapTo ( value ) {
	return function () {
		return value;
	};
}

function interpolateNumber ( a, b ) {
	var d = b - a;
	return function ( t ) {
		return a + d * t;
	}
}

function interpolateArray ( a, b ) {
	var interpolators = b.map( function ( bi, i ) {
		return interpolate( a[i], bi );
	});

	return function ( t ) {
		return interpolators.map( function ( interpolator ) {
			return interpolator( t );
		});
	}
}

function interpolateObject ( a, b ) {
	var keys = Object.keys( b );

	var interpolators = {};

	keys.forEach( function ( key ) {
		interpolators[key] = interpolate( a[key], b[key] );
	});

	return function ( t ) {
		var obj = {};
		keys.forEach( function ( key ) {
			obj[key] = interpolators[key]( t );
		});
		return obj;
	}
}

function colorToArray ( color ) {
	var mo = color.match(/#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/);
	if (!mo) throw new Error("colorToArray: not a color: " + color);
	return [ parseInt(mo[1], 16), parseInt(mo[2], 16), parseInt(mo[3], 16) ];
}

function arrayToColor ( array ) {
	return "#" + ( (array[0] << 16) | (array[1] << 8) | array[2] ).toString(16);
}

function interpolateColor( a, b ) {
	var arrayInterpolator = interpolateArray( colorToArray(a), colorToArray(b) );

	return function ( t ) {
		return arrayToColor(arrayInterpolator(t));
	}
}
