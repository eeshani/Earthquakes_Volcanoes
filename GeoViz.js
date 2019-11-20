(function() {

	var slider = document.getElementById("myRange");
	var output = document.getElementById("demo");
	output.innerHTML = slider.value;

	slider.oninput = function() {
	  output.innerHTML = this.value;
	}

	var current;

	//year ticks dynamic adding
	function multiplyNodebar(node, count, deep) {
	    for (var i = 1919, copy; i < count - 1; i++) {
	        copy = node.cloneNode(deep);
	        copy.id = i;
	        
	        if(i%5==0)     copy.style.fontSize = 20;
	        else copy.style.fontSize = 10;

	        node.parentNode.insertBefore(copy, node);
	    }
	}
	multiplyNodebar(document.querySelector('.bar'), 2020, true);

	//year labels dynamic adding
	function multiplyNodehint(hintnode, count, deep) {
	    for (var i = 1919, hintcopy; i < count; i++) {

			if(i%5==0) {
			hintcopy = hintnode.cloneNode(deep);
			hintcopy.id = i;
			hintcopy.innerHTML = i;
			hintnode.parentNode.insertBefore(hintcopy, hintnode); }

	    }
	}
	multiplyNodehint(document.querySelector('.hint'), 2020, true); 

	//functions to activate or deactivate bar
	function activateBar(id){
			var bar = document.getElementById(id);
		    bar.classList.add("baractive");
		    bar.classList.remove("bar");
	}
	function deactivateBar(id){
			var bar = document.getElementById(id);
		    bar.classList.add("bar");
		    bar.classList.remove("baractive");
	}

	//svg details and creation
	var margin = { top: 50, left: 100, right:50, bottom:50},
		height = 650 - margin.top - margin.bottom,
		width = 925 - margin.left - margin.right;
	var svg = d3.select("#world-map")
			.append("svg")
			.attr("height",height + margin.top + margin.bottom)
			.attr("width",width + margin.left + margin.right)
			.append("g")
			.attr("transform","translate(" + margin.left + "," + margin.top + ")");

	//load topojson
	d3.queue()
	  .defer(d3.json,"world.topojson")
	  .await(ready)
	//create projection geoMercator
	var projection = d3.geoMercator()
	    .translate([width/2.1, height/1.5])
	    .scale(140);
	//create path using projection
	var path = d3.geoPath()
		.projection(projection)


	function ready (error, data) {		

		var countries = topojson.feature(data, data.objects.countries).features;

		svg.selectAll(".country")
		   .data(countries)
		   .enter().append("path")
		   .attr("class","country")
		   .attr("d", path)
		   .attr("fill", "#aaaaaa");

		var fresh = 2019;

		//adding click listener to bars
		var coll = document.getElementsByClassName("bar");
		for (var i = 0; i < coll.length; i++) {
		  //console.log(coll[i].id);
		  coll[i].addEventListener("click", function() {
		  	var activebar = document.getElementsByClassName("baractive");
		  	console.log(document.getElementById("2019"));
		  	if(activebar.length!=0)
		  		deactivateBar(activebar[0].id);
		    if ( this.classList.contains('bar') ){
				activateBar(this.id);
				current = this.id;
		    }
			update(this.id);
			output.innerHTML = fresh;
			document.getElementById("myRange").value = fresh;	
		  });
		}

		update(fresh);
		activateBar(fresh);


		slider.oninput = function() {
			  	
			  	output.innerHTML = this.value;
			  	fresh = this.value;
			  	update(fresh);
		}

		function isChecked(elementID) {
	    	return d3.select(elementID).property("checked");
	  	}
	  	addFillListener();

	  	var opt = 3;

	  	function addFillListener() {
	    	d3.selectAll('input[name="grouping"]')
		      .on("change", function() {
		      	if(isChecked("#earthquake"))
		      		opt = 1;
		      	else if(isChecked("#volcano"))
		      		opt = 2;
		      	else opt = 3;
		        update(fresh);
		      });
	  	}


	  	addBarYearListener();

		var year = 2019;

		function addBarYearListener() {
			var myRadio = d3.selectAll('.bar');
			var checkedValue;
			myRadio.on("click", function() {
				checkedValue = this.id;
				this.style.height = "21px";
				output.innerHTML = checkedValue;
				document.getElementById("myRange").value = 	checkedValue;
				fresh = checkedValue;
				update(fresh);
		      });
			
		}

   		document.onkeydown = function(e) {
		    e = e || window.event;
			switch(e.which) {
		        case 37: // left
		        if(fresh!=1919){		        
				deactivateBar(fresh);
		        fresh = fresh-1;
		        output.innerHTML = fresh;
				document.getElementById("myRange").value = fresh;
				activateBar(fresh);
		        update(fresh);}
		        break;

		        case 39: // right
		        if(fresh!=2019){		        
				deactivateBar(fresh);
		        fresh = parseInt(fresh)+1;
		        output.innerHTML = fresh;
				document.getElementById("myRange").value = fresh;				
				activateBar(fresh);
		        update(fresh);}
		        break;

		        default: return; // exit this handler for other keys
		    }

		    return false;
		}

		//data plotting for selected year
   		function update (year){

			svg.selectAll(".earthquake-circle").remove();
			svg.selectAll(".earthquake-label").remove();
			svg.selectAll(".volcano-circle").remove();
			svg.selectAll(".volcano-label").remove();

			fresh = year;

			var file = "Earthquakes/Earthquake_" + year + ".csv"
			d3.queue()
			  .defer(d3.csv,file)
			  .await(plot)

			//data plotting earthquake then volcano
			function plot (error, earthquake){

				var colorscal = d3.scaleSequential(d3.interpolateRainbow).domain([4.5,10]);

				//earthquake option check and data add
				if(opt==1 || opt ==3){		
					svg.selectAll(".earthquake-circle")
					   .data(earthquake)
					   .enter()
					   .append("circle")
					   .attr("class", "earthquake-circle")
					   .attr("r", function(d,i){ return d.mag*1.2;})
					   .attr("fill", function(d,i){ /**if(d.mag>=7.5) return "#632a0d";
													elsereturn "#ffa500";**/ 
													return colorscal(d.mag);})
					   .attr("opacity", 0.45)
					   .attr("cx", function(d){ 
					   		var coords = projection([d.longitude, d.latitude]);
					   		return coords[0];})
					   .attr("cy", function(d){ 
					   		var coords = projection([d.longitude, d.latitude]);
					   		return coords[1];});
				}//earthquake option check and data add

				//option check for volcano
				if(opt==2 || opt==3){

					d3.queue()
					  .defer(d3.tsv,"Volcano_Final.tsv")
					  .await(plot_v)

					function plot_v (error, volcano){

						//filter based on slider year 
				 		var filtered_volcano = volcano.filter(function(d,i){
							return d.Year == year;
						})

						var defs = svg.append("defs");
					    defs.selectAll(".vol")
					      .data(volcano)
					      .enter()
					        .append("pattern")
					        .attr("id", "hill")
					        .attr("class", "vol")
					        .attr("width", "100%")
					        .attr("height", "100%")
					        .attr("patternContentUnits", "objectBoundingBox")
					          .append("image")
					          .attr("width", 1)
					          .attr("height", 1)
					          // xMidYMid: center the image in the circle
					          // slice: scale the image to fill the circle
					          .attr("preserveAspectRatio", "xMidYMid slice")
					          .attr("xlink:href", "volcano6.svg");

						svg.selectAll(".volcano-circle")
						   .data(filtered_volcano)
						   .enter()
						   .append("circle")
						   .attr("class", "volcano-circle")
						   .attr("r", 13)
						   .style("stroke", "#777777")
          				   .style("stroke-width", 0.7)
						   .attr("fill", "url(#hill)")
						   .attr("cx", function(d){ 
						   		var coords = projection([d.Longitude, d.Latitude]);
						   		return coords[0];})
						   .attr("cy", function(d){ 
						   		var coords = projection([d.Longitude, d.Latitude]);
						   		return coords[1];})
						   .on('mouseover',function(d){
						   		//item name
								if(d.Name != "") d3.select('#name')._groups[0][0].innerHTML = "Name: " + d.Name; 
								else d3.select('#name')._groups[0][0].innerHTML = "Name: N/A";
								//item date
								if(d.Dy=="") d.Dy = "N/A"; if(d.Mo=="") d.Mo = "N/A"; if(d.Year=="") d.Year = "N/A";
								d3.select('#date')._groups[0][0].innerHTML = "Date: " + d.Dy + "-" + d.Mo + "-" + d.Year;
								//item location
								if(d.Location=="" && d.Country==""){
									d3.select('#location')._groups[0][0].innerHTML = "Location: N/A";
								}
								else {
									if(d.Location == d.Country){
										d3.select('#location')._groups[0][0].innerHTML ="Location: " +  d.Location;
									}
									else if(d.Location=="") d3.select('#location')._groups[0][0].innerHTML ="Location: " + d.Country;
									else if(d.Country=="") d3.select('#location')._groups[0][0].innerHTML ="Location: " + d.Location;
									else d3.select('#location')._groups[0][0].innerHTML ="Location: " + d.Location + ", " + d.Country;
								}
								//item volcano type
								if(d.Volcano_Type != "") d3.select('#type')._groups[0][0].innerHTML ="Volcano Type: " + d.Volcano_Type;
								else d3.select('#type')._groups[0][0].innerHTML = "Volcano Type: N/A";
								//item eruption vei
								if(d.Eruption_VEI != "") d3.select('#vei')._groups[0][0].innerHTML ="Eruption VEI: " + d.Eruption_VEI;
								else d3.select('#vei')._groups[0][0].innerHTML = "Eruption VEI: N/A";
								//item death
								if(d.Death_Num != "") d3.select('#death')._groups[0][0].innerHTML ="Death: " + d.Death_Num;
								else d3.select('#death')._groups[0][0].innerHTML = "Death: N/A";
								//item injuries
								if(d.Injuries_Num != "") d3.select('#injuries')._groups[0][0].innerHTML ="Injuries: " + d.Injuries_Num;
								else d3.select('#injuries')._groups[0][0].innerHTML = "Injuries: N/A";
								//item damage
								if(d.Damage_$Mill != "") d3.select('#damage')._groups[0][0].innerHTML ="Damage: $" + d.Damage_$Mill + " Million";
								else d3.select('#damage')._groups[0][0].innerHTML = "Damage: N/A";
								//tooltip visible
								d3.select('#tooltip')
									.style('left',(d3.event.pageX+20)+'px')
									.style('top',(d3.event.pageY-80)+'px')
									.style('display','block')
									.style('opacity',0.8)})
						   .on('mouseout',function(d){
						   		d3.select('#tooltip')
						   			.style('display','none');
						   });
			 		}//volcano addition
				}//option check for volcano

			}//data plotting earthquake then volcano

		}//data plotting for selected year

	}



})();