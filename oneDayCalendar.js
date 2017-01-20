function maxConflictsFunc(events, zones){
	var i, j;
	for(i = 0; i < events.length; i++){
		events[i].maxConflicts = 0;
	}
	for(i = 0; i < events.length; i++){
		for(j = 0; j<zones.length; j++){
			if(events[i].start <= zones[j].zoneStart && events[i].end >= zones[j].zoneEnd){
					events[i].maxConflicts = Math.max(events[i].maxConflicts, zones[j].zoneEvents.length);
			} 	
		}
	}
	return events;		
}

function createZoneTable(events){
	var i;
	var zones = [], tempArray = [];
	var tempSet = new Set(); //allows only unique values, so duplicates r ignored
	for(i =0; i < events.length; i++){
		tempSet.add(events[i].start);
		tempSet.add(events[i].end);
	}
	tempArray = [...tempSet]; //convert set to array for sorting

	tempArray.sort(function(a, b) {
  		return a - b;
	});

	i = 0;
	while(i < tempArray.length-1){
		var obj = {zoneId: i, zoneStart: tempArray[i], zoneEnd: tempArray[i+1]};
		zones.push(obj);
		i++;
	}

	for(var z =0; z < zones.length; z++){
		var arr = new Array();
		for(var e = 0; e<events.length; e++ ){
			if(events[e].start <= zones[z].zoneStart && events[e].end >= zones[z].zoneEnd){
				arr.push(events[e]);
			}
		}
		zones[z].zoneEvents = arr;
	}
	return zones;
}

function createConflictTable(events){
	var i, j;
	var conflictTable = new Array(events.length);
	for(i =0; i<events.length; i++){
		var arr = [];
		for(j =0; j<events.length; j++){
			if(j !== i && events[i].end > events[j].start && events[i].start < events[j].end){
				arr.push(events[j]);
			}
		}
		conflictTable[i] = arr;
	}
	return conflictTable;
}

function calculateOffset(events, conflictTable){
	var i,j;
	for(i = 0; i < events.length; i++){
		events[i].offset = 0;
	}

	for(i = 0; i < events.length; i++){
		if(events[i].maxConflicts === 1){
			events[i].offset = 0;
		}
		else{
			for(j = 0; j < conflictTable[i].length; j++){
				if(conflictTable[i][j].start <= events[i].start && conflictTable[i][j].offset === events[i].offset){
					events[i].offset = events[i].offset + 1;
				}
			}
		}
	}
	return events;
}

function layOutDay(events){
	var getCalendar = document.getElementById("calendarView");
	getCalendar.innerHTML = "";

	if(!events){
		getCalendar.style.fontWeight = "bold";
		getCalendar.style.color = "#00b386";
		getCalendar.innerHTML = "You have NO events today!";
	}
	else{
		var i;
		const MAX_WIDTH = 600;
		var height, width, marginTop, marginLeft;

		//if events are not passed in increasing order of start time, then sort them first
		events.sort(function(a,b) {return (a.start > b.start) ? 1 : ((b.start > a.start) ? -1 : 0);});
		var zones = createZoneTable(events);
		events = maxConflictsFunc(events, zones);
		var conflictTable = createConflictTable(events);
		events = calculateOffset(events, conflictTable);

		for(i = 0; i<events.length; i++){
			height = (events[i].end - events[i].start) - 5; //subtract 5 to adjust the 5px padding on top
			width = (MAX_WIDTH/events[i].maxConflicts);	
			marginLeft = events[i].offset * width;
			width = width -20; //subtract 20 to adjust the 10px padding on right + 5px border on left + 5px padding on left 

			var eventContainer = document.createElement("div");

			eventContainer.style.paddingLeft = "5px";
			eventContainer.style.paddingRight = "10px";
			eventContainer.style.paddingTop = "5px";
			eventContainer.style.width = width+"px";
			eventContainer.style.height = height+"px";	
			eventContainer.style.marginLeft = marginLeft+"px";

			eventContainer.style.background = "white";
			eventContainer.style.color = "#00b386";
			eventContainer.style.fontWeight = "bold";
			eventContainer.style.border = "1px solid #cccccc";
			eventContainer.style.borderLeft = "5px solid #00b386";
		
		if(i === 0){
				//1st event
				eventContainer.style.marginTop = events[i].start+"px";
			}
			else{
				//2nd element onward
				marginTop = events[i].start - events[i-1].end;
				eventContainer.style.marginTop = marginTop+"px";
			}
						
			eventContainer.innerHTML = "Event #" + (i+1);

			var innerDiv = document.createElement("div");
			innerDiv.style.color = "#cccccc";
			innerDiv.style.fontSize = "small";
			innerDiv.style.fontWeight = "normal";
			innerDiv.innerHTML = "Location" + (i+1);

			eventContainer.appendChild(innerDiv);						
			getCalendar.appendChild(eventContainer);
		}
	}
}
