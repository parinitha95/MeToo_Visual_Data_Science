
var margin = { top: 50, right: 0, bottom: 100, left: 30 },
          width = 960 - margin.left - margin.right,
          height = 430 - margin.top - margin.bottom,
          gridSize = Math.floor(width / 30),
          legendElementWidth = gridSize*2,
          buckets = 9,
          // colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"],
          // colors = ["#440256","#450457","#450559","#3f4788","#3f4889","#3e4989","#3e4a89","#2f6b8e","#2f6c8e","#2e6d8e","#2e6e8e","#1f9f88","#1fa088","#1fa188","#1fa187"] // alternatively colorbrewer.YlGnBu[9]
          colors = ["#660022","#781426","	#7A1F3D","	#990033","#C76475","#77B75B","#ABDB92"],
          colors = ["#D98CA6","#CC6688","	#B24D6E","	#BF406A","	#8F3D58","	#993355","	#732640","#4D192A","	#471F2C"]
          days = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15" ],
          times = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15" ];
          datasets = ["metoo_left_right_heatmap.csv","metoo_left_right_bigram_heatmap.csv","metoo_left_right_people_heatmap.csv","metoo_left_right_organization_heatmap.csv","metoo_left_right_theme_heatmap.csv"];
          datasets_bar = ["metoo_left_right_word.csv","metoo_left_right_bigram.csv","metoo_left_right_people.csv","metoo_left_right_organization.csv","metoo_left_right_theme.csv"];

      var svg = d3.select("#chart1").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom+300)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      
      var div = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

      var dayLabels = svg.selectAll(".dayLabel")
          .data(days)
          .enter().append("text")
            .text(function (d) { return d; })
            .attr("x", 0)
            .attr("y", function (d, i) { return i * gridSize; })
            .style("text-anchor", "end")
            .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
            .attr("class", function (d, i) { return "dayLabel mono axis axis-workweek"; });

      var timeLabels = svg.selectAll(".timeLabel")
          .data(times)
          .enter().append("text")
            .text(function(d) { return d; })
            .attr("x", function(d, i) { return i * gridSize; })
            .attr("y", 0)
            .style("text-anchor", "middle")
            .attr("transform", "translate(" + gridSize / 2 + ", -6)")
            .attr("class", function(d, i) { return "timeLabel mono axis axis-worktime"; });

      var heatmapChart = function(tsvFile) {
        var barchart = d3.select(".chart");
        barchart.selectAll("*").remove();
        d3.csv(tsvFile,
        function(d) {
          return {
            day: +d.left_bin,
            hour: +d.right_bin,
            value: +d.count
          };
        },
        function(error, data) {
          var colorScale = d3.scale.quantile()
              .domain([0, buckets - 1, d3.max(data, function (d) { return d.value; })])
              .range(colors);

          var cards = svg.selectAll(".hour")
              .data(data, function(d) {return d.day+':'+d.hour;});

          cards.append("title");

          cards.enter().append("rect")
              .attr("x", function(d) { return (d.hour - 1) * gridSize+32; })
              .attr("y", function(d) { return (d.day - 1) * gridSize+33; })
              .attr("rx", 4)
              .attr("ry", 4)
              .attr("class", "hour bordered")
              .attr("width", gridSize)
              .attr("height", gridSize)
              .style("fill", colors[0])
              .on("mouseover", function(d) {
                        div.transition()
                            .duration(100)
                            .style("opacity", .9);
                        div.text("Count: "+d.value)
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY) + "px")
                            .style("font-size", "10px")
                            .style("font-weight","bold");
                    })
              .on("click",function(d){
                console.log("onclick");
                drawbar(d.day,d.hour,d.value,datasets_bar[option]);
              });

          cards.transition().duration(1000)
              .style("fill", function(d) { return colorScale(d.value); });

          cards.select("title").text(function(d) { return d.value; });
          
          cards.exit().remove();

          var legend = svg.selectAll(".legend")
              .data([0].concat(colorScale.quantiles()), function(d) { return d; });

          legend.enter().append("g")
              .attr("class", "legend");

          legend.append("rect")
            .attr("x", function(d, i) { return legendElementWidth * i; })
            .attr("y", height+250)
            .attr("width", legendElementWidth)
            .attr("height", gridSize / 2)
            .style("fill", function(d, i) { return colors[i]; });

          legend.append("text")
            .attr("class", "mono")
            .text(function(d) { return "≥ " + Math.round(d); })
            .attr("x", function(d, i) { return legendElementWidth * i +16; })
            .attr("y", height + gridSize+250);
			
			svg.append("text")
            .attr("text-anchor", "middle") 			// this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform","translate(-19,"+((height/2)+80)+")rotate(-90)")  
			.text("LEFT DISTRIBUTION (LOW TO HIGH)");
			
			svg.append("text")
            .attr("text-anchor", "middle") 
			.attr("transform","translate("+((width/4)-0)+",-20)")// this makes it easy to centre the text as the transform is applied to the anchor
            .text("RIGHT DISTRIBUTION (LOW TO HIGH)");


          legend.exit().remove();

        });  
      };