
function UtcTime(timeString) {

	var d = new Date();
	
	var parts = timeString.split(':');
	
	d.setUTCHours(parts[0]);
	
	d.setUTCMinutes(parts[1]);
	
	var getPadded = function(f) {
		
		var intVal = f.call(d);
		
		return intVal < 10 ? '0' + intVal : intVal;
	};
	
	d.getFormattedTime = function() {
	
		return getPadded(d.getHours) + ':' + getPadded(d.getMinutes);
	};
	
	return d;
}


function Wait(expected) {

	this.expected = expected;

	this.waitms = expected - (new Date());
	
	var waitminraw = this.waitms / 60000;
	
	this.waitmin = Math.ceil(waitminraw, 0);

	this.toString = function() {
	
		return this.waitmin > 0 ? this.waitmin + ' min' : 'due'
	};
}

function Decay() {
	
	var start = new Date();
	
	this.getDiff = function() {
	
		return (new Date()) - start;
	};
	
	this.getAge = function() {
		
		var diff = this.getDiff();
		
		var age = 'new';
		
		switch(true)
		{
			case (diff < 20000):
				age = 'new';
				break;
			case (diff > 20000 && diff < 40000):
				age = 'mid';
				break;
			case (diff > 40000 && diff < 80000):
				age = 'old';
				break;
			case (diff > 80000):
				age = 'ancient';
				break;
		}
		
		return age;
	};	
}

function TimeHeader(i, arrival) {
	
	var header = $(document.createElement('h' + i));
	
	var expected = new UtcTime(arrival.scheduledTime);
	
	var age = new Decay();
	
	var _UpdateCountdown = function() {
	
		var wait = new Wait(expected);
		
		header.html('<div class="' + age.getAge() + '">' 
						+ wait.toString() 
						+ ' <span>(' + expected.getFormattedTime() + ')</span> \
					</div>');
	};
	
	_UpdateCountdown();
	
	setInterval(_UpdateCountdown, 1000);
	
	return {
		
		render : function(el) {
		
			el.append(header);
		}
	};	
}



function FetchLatest(container, callback) {
	
	$.get('http://localhost:9000', function(data) {
		
		container.html('');
		
		var response = JSON.parse(data);
		
		var shortestWait = 1000;
		
		$(response.arrivals).each(function(i, arrival) {
			
			(new TimeHeader(i+1, arrival)).render(container);
			
			if(arrival.estimatedWait === 'due') { shortestWait = 1; }
			
			if(parseInt(arrival.estimatedWait) < shortestWait) { shortestWait = parseInt(arrival.estimatedWait); }
		});
		
		callback(shortestWait);
	});
}


$(function() {
	
	var container = $('#countdown-container');
	
	var doFetch = function() { 
	
		FetchLatest(container, function(shortestWait) {  
			
			var nextRefresh = Math.round(shortestWait * 0.7 * 60000, 0);
			
			console.log('refreshing in ' + nextRefresh + 'ms');
			
			setTimeout(doFetch, nextRefresh);
		}) 
	};
	
	doFetch();
});

