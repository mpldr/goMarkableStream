// Send the OffscreenCanvas to the worker for initialization
streamWorker.postMessage({ 
	type: 'init', 
	width: width, 
	height: height,
	rate: rate,
	withColor: withColor
});


// Listen for updates from the worker
streamWorker.onmessage = (event) => {
	// To hide the message (e.g., when you start drawing in WebGL again)
	messageDiv.style.display = 'none';

	const data = event.data;

	switch (data.type) {
		case 'update':
			// Handle the update
			const data = event.data.data;
			updateTexture(data, portrait, 1);
			break;
		case 'error':
			console.error('Error from worker:', event.data.message);
			waiting(event.data.message)
			// Handle the error, maybe show a user-friendly message or take some corrective action
			break;
			// ... handle other message types as needed
	}
};


// Determine the WebSocket protocol based on the current window protocol
const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsURL = `${wsProtocol}//${window.location.host}/events`;
const wsGestureURL = `${wsProtocol}//${window.location.host}/gestures`;
// Send the OffscreenCanvas to the worker for initialization
eventWorker.postMessage({ 
	type: 'init', 
	width: width, 
	height: height, 
	portrait: portrait,
	wsURL: wsURL
});
gestureWorker.postMessage({ 
	type: 'init', 
	wsURL: wsGestureURL
});

gestureWorker.onmessage = (event) => {
	const data = event.data;

	switch (data.type) {
		case 'gesture':

			switch (event.data.value) {
				case 'left':
					document.getElementById('content').contentWindow.postMessage( JSON.stringify({ method: 'left' }), '*' );
					break;
				case 'right':
					document.getElementById('content').contentWindow.postMessage( JSON.stringify({ method: 'right' }), '*' );
					break;
				case 'topleft-to-bottomright':
					document.getElementById('content').contentWindow.postMessage( JSON.stringify({ method: 'right' }), '*' );
					break;
				case 'topright-to-bottomleft':
					document.getElementById('content').contentWindow.postMessage( JSON.stringify({ method: 'left' }), '*' );
					break;
				case 'bottomright-to-topleft':
					iFrame.style.zIndex = 1;
					break;
				case 'bottomleft-to-topright':
					iFrame.style.zIndex = 4;
					break;
				default:
					// Code to execute if none of the above cases match
			}
			break;
		case 'error':
			console.error('Error from worker:', event.data.message);
			break;
	}

}

let messageTimeout;

function clearLaser() {
	// Function to call when no message is received for 300 ms
	updateLaserPosition(-10,-10);
}
// Listen for updates from the worker
eventWorker.onmessage = (event) => {
	// Reset the timer every time a message is received
	clearTimeout(messageTimeout);
	messageTimeout = setTimeout(clearLaser, 300);

	// To hide the message (e.g., when you start drawing in WebGL again)
	messageDiv.style.display = 'none';

	const data = event.data;

	switch (data.type) {
		case 'clear':
			updateLaserPosition(-10,-10);
			//clearLaser();
			break;
		case 'update':
			// Handle the update
			const X = event.data.X;
			const Y = event.data.Y;
			updateLaserPosition(X,Y);
			break;
		case 'error':
			console.error('Error from worker:', event.data.message);
			waiting(event.data.message)
			// Handle the error, maybe show a user-friendly message or take some corrective action
			break;
			// ... handle other message types as needed
	}
};
