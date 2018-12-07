function summary(datadetail){

var buildData = function (rawData1, karyotype) {
  var data = []
  var rawDataByChr1 = d3.nest().key(function (d) { return d.chr }).entries(rawData1)
  karyotype.forEach(function (chr) {
    var raw1 = rawDataByChr1.filter(function (d) { return d.key === chr.id })[0].values
      raw1.forEach(function (datum) {
        data.push({
          block_id: chr.id,
          start: parseInt(datum.start),
          end: parseInt(datum.end),
          value: parseInt(datum.value),
          label: datum.label
        })
      }) 
  })
  return data
}

var drawCircos = function (error, GRCh37, data1) {
  brushablechart(datadetail.unigram);
  var width = document.getElementsByClassName('mdl-card__supporting-text')[0].offsetWidth
  var circos = new Circos({
    container: '#histogramChart',
    width: width-50,
    height: width-230
  })

  circos
    .layout(
      GRCh37,
    {
      innerRadius: width / 2 - 250,
      outerRadius: width / 2 - 200,
      labels: {
        display: false
      },
      ticks: {
        display: false,
      },
      labels: {
        position: 'center',
        display: true,
        size: 14,
        color: '#000',
        radialOffset: 15
      },
      events: {
        'click.alert': function (datum, index, nodes, event) {
          // window.alert(datum.label)
          console.log(datum.label)
          $("#chart").html("");
          $(".brushable_title h3").html("PERCENTAGE DISTRIBUTION - "+datum.label);
          switch(datum.label){
            case 'UNIGRAMS':
              brushablechart(datadetail.unigram);
              if( typeof datadetail.word_heat_map != 'undefined'){
              heatmapChart(datadetail.word_heat_map,datadetail.word_dist);
              }
              break;
            case 'BIGRAMS':
              brushablechart(datadetail.bigram);
              if(typeof datadetail.bigram_heat_map != 'undefined'){
              heatmapChart(datadetail.bigram_heat_map,datadetail.bigram_dist);
              }
              break;
            case 'TRIGRAMS':
              brushablechart(datadetail.trigram);
              if(typeof datadetail.trigram_heat_map != 'undefined'){
              heatmapChart(datadetail.trigram_heat_map,datadetail.trigram_dist);
              }
              break;
            case 'PEOPLE':
              brushablechart(datadetail.people);
              if(typeof datadetail.people_heat_map != 'undefined'){
              heatmapChart(datadetail.people_heat_map, datadetail.people_dist);
              }
              break;
            case 'ORGANIZATION':
              brushablechart(datadetail.organization);
              if(typeof datadetail.organization_heat_map != 'undefined'){
              heatmapChart(datadetail.organization_heat_map, datadetail.organization_dist);
              }
              break;
            case 'THEME':
              brushablechart(datadetail.theme);
              if(typeof datadetail.theme_heat_map != 'undefined'){
                heatmapChart(datadetail.theme_heat_map, datadetail.theme_dist);
              }
              break;

            }
        }
      }
    }
    )
    .histogram('es', buildData(data1, GRCh37), {
      innerRadius: 1.01,
      outerRadius: 1.4,
      color: 'Oranges',
      tooltipContent: function(d) {
        return d.label
      }

    })
    .render()
}

d3.queue()
  .defer(d3.json, './data/GRCh37.json')
  .defer(d3.csv, './data/alldata/overall summary/overall summary/'+datadetail.overall)
  .await(drawCircos)
}

function brushablechart(dataname) {
  console.log(dataname);
  var data = [],
        svg,
        defs,
        gBrush,
        brush,
        main_xScale,
        mini_xScale,
        main_yScale,
        mini_yScale,
        main_yZoom,
        main_xAxis,
        main_yAxis,
        mini_width,
        textScale,
        tip;
      i = -1;
      d3.csv('./data/alldata/overall summary/overall summary/'+dataname,function(data){
          i +=1 ;
          return {
              key: i,
              country: data.label,
              value: +data.perc
          };
  
      },
      function(error,dataset){
          console.log(dataset);
          data = dataset;
          init(data);
      })
  
  //   init();
  
    function init(data) {
      /////////////////////////////////////////////////////////////
      ///////////////// Set-up SVG and wrappers ///////////////////
      /////////////////////////////////////////////////////////////
  
      //Added only for the mouse wheel
      var zoomer = d3.behavior.zoom()
          .on("zoom", null);
  
      var main_margin = {top: 20, right: 5, bottom: 30, left: 330},
          main_width = 600 - main_margin.left - main_margin.right,
          main_height = 600 - main_margin.top - main_margin.bottom;
  
      var mini_margin = {top: 20, right: 10, bottom: 30, left: 10},
          mini_height = 600 - mini_margin.top - mini_margin.bottom;
      mini_width = 100 - mini_margin.left - mini_margin.right;
      console.log(main_height,mini_height)
  
      svg = d3.select("#chart").append("svg")
          .attr("class", "svgWrapper")
          .attr("width", main_width + main_margin.left + main_margin.right + mini_width + mini_margin.left + mini_margin.right)
          .attr("height", main_height + main_margin.top + main_margin.bottom)
          .call(zoomer)
          .on("wheel.zoom", scroll)
          //.on("mousewheel.zoom", scroll)
          //.on("DOMMouseScroll.zoom", scroll)
          //.on("MozMousePixelScroll.zoom", scroll)
          //Is this needed?
          .on("mousedown.zoom", null)
          .on("touchstart.zoom", null)
          .on("touchmove.zoom", null)
          .on("touchend.zoom", null);
  
      tip = d3.tip()
          .attr('class', 'd3-tip')
          .offset([-10, 0])
          .html(function(d) {
              return "<strong>Percentage:</strong> <span style='color:red'>" + d.value.toFixed(4) + "</span>";
          });
      svg.call(tip);
  
      var mainGroup = svg.append("g")
              .attr("class","mainGroupWrapper")
              .attr("transform","translate(" + main_margin.left + "," + main_margin.top + ")")
              .append("g") //another one for the clip path - due to not wanting to clip the labels
              .attr("clip-path", "url(#clip)")
              .style("clip-path", "url(#clip)")
              .attr("class","mainGroup")
  
      var miniGroup = svg.append("g")
              .attr("class","miniGroup")
              .attr("transform","translate(" + (main_margin.left + main_width + main_margin.right + mini_margin.left) + "," + mini_margin.top + ")");
  
      var brushGroup = svg.append("g")
              .attr("class","brushGroup")
              .attr("transform","translate(" + (main_margin.left + main_width + main_margin.right + mini_margin.left) + "," + mini_margin.top + ")");
  
      /////////////////////////////////////////////////////////////
      ////////////////////// Initiate scales //////////////////////
      /////////////////////////////////////////////////////////////
  
      main_xScale = d3.scale.linear().range([0, main_width]);
      mini_xScale = d3.scale.linear().range([0, mini_width]);
  
      main_yScale = d3.scale.ordinal().rangeBands([0, main_height], 0.5, 0);
      mini_yScale = d3.scale.ordinal().rangeBands([0, mini_height], 0.5, 0);
      console.log(main_yScale.range())
  
      //Based on the idea from: http://stackoverflow.com/questions/21485339/d3-brushing-on-grouped-bar-chart
      main_yZoom = d3.scale.linear()
          .range([0, main_height])
          .domain([0, main_height]);
  
      //Create x axis object
      main_xAxis = d3.svg.axis()
        .scale(main_xScale)
        .orient("bottom")
        .ticks(4)
        //.tickSize(0)
        .outerTickSize(0);
  
      //Add group for the x axis
      d3.select(".mainGroupWrapper").append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(" + 0 + "," + (main_height + 5) + ")");
  
      //Create y axis object
      main_yAxis = d3.svg.axis()
        .scale(main_yScale)
        .orient("left")
        .tickSize(0)
        .outerTickSize(0);
  
      //Add group for the y axis
      mainGroup.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(-5,0)");
   
      /////////////////////////////////////////////////////////////
      /////////////////////// Update scales ///////////////////////
      /////////////////////////////////////////////////////////////
  
      //Update the scales
      main_xScale.domain([0, d3.max(data, function(d) { return d.value; })]);
      mini_xScale.domain([0, d3.max(data, function(d) { return d.value; })]);
      main_yScale.domain(data.map(function(d) { return d.country; }));
      mini_yScale.domain(data.map(function(d) { return d.country; }));
      
      //Create the visual part of the y axis
      d3.select(".mainGroup").select(".y.axis").call(main_yAxis);
      d3.select(".mainGroupWrapper").select(".x.axis").call(main_xAxis);
  
      /////////////////////////////////////////////////////////////
      ///////////////////// Label axis scales /////////////////////
      /////////////////////////////////////////////////////////////
  
      textScale = d3.scale.linear()
        .domain([15,50])
        .range([12,6])
        .clamp(true);
      
      /////////////////////////////////////////////////////////////
      ///////////////////////// Create brush //////////////////////
      /////////////////////////////////////////////////////////////
  
      //What should the first extent of the brush become - a bit arbitrary this
      var brushExtent = Math.max( 1, Math.min( 20, Math.round(data.length*0.2) ) )+10;
  
      brush = d3.svg.brush()
          .y(mini_yScale)
          .extent([mini_yScale(data[0].country), mini_yScale(data[brushExtent].country)])
          .on("brush", brushmove)
          //.on("brushend", brushend);
  
      //Set up the visual part of the brush
      gBrush = d3.select(".brushGroup").append("g")
        .attr("class", "brush")
        .call(brush);
      
      gBrush.selectAll(".resize")
        .append("line")
        .attr("x2", mini_width);
  
      gBrush.selectAll(".resize")
        .append("path")
        .attr("d", d3.svg.symbol().type("triangle-up").size(20))
        .attr("transform", function(d,i) { 
          return i ? "translate(" + (mini_width/2) + "," + 4 + ") rotate(180)" : "translate(" + (mini_width/2) + "," + -4 + ") rotate(0)"; 
        });
  
      gBrush.selectAll("rect")
        .attr("width", mini_width);
  
      //On a click recenter the brush window
      gBrush.select(".background")
        .on("mousedown.brush", brushcenter)
        .on("touchstart.brush", brushcenter);
  
      ///////////////////////////////////////////////////////////////////////////
      /////////////////// Create a rainbow gradient - for fun ///////////////////
      ///////////////////////////////////////////////////////////////////////////
  
      defs = svg.append("defs")
  
      //Create two separate gradients for the main and mini bar - just because it looks fun
      createGradient("gradient-rainbow-main", "60%");
      createGradient("gradient-rainbow-mini", "13%");
  
      //Add the clip path for the main bar chart
      defs.append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("x", -main_margin.left)
        .attr("width", main_width + main_margin.left)
        .attr("height", main_height);
  
      /////////////////////////////////////////////////////////////
      /////////////// Set-up the mini bar chart ///////////////////
      /////////////////////////////////////////////////////////////
  
      //The mini brushable bar
      //DATA JOIN
      var mini_bar = d3.select(".miniGroup").selectAll(".bar")
        .data(data, function(d) { return d.key; });
  
      //UDPATE
      mini_bar
        .attr("width", function(d) { return mini_xScale(d.value); })
        .attr("y", function(d,i) { return mini_yScale(d.country); })
        .attr("height", mini_yScale.rangeBand());
  
      //ENTER
      mini_bar.enter().append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("width", function(d) { return mini_xScale(d.value); })
        .attr("y", function(d,i) { return mini_yScale(d.country); })
        .attr("height", mini_yScale.rangeBand())
        .style("fill", "url(#gradient-rainbow-mini)")
        .append("title");
  
      //EXIT
      mini_bar.exit()
        .remove();
  
      //Start the brush
      gBrush.call(brush.event);
  
    }//init
  
    //Function runs on a brush move - to update the big bar chart
    function update() {
  
      /////////////////////////////////////////////////////////////
      ////////// Update the bars of the main bar chart ////////////
      /////////////////////////////////////////////////////////////
  
      //DATA JOIN
      var bar = d3.select(".mainGroup").selectAll(".bar")
          .data(data, function(d) { return d.key; });
  
      //UPDATE
      bar
        .attr("x", 0)
        .attr("width", function(d) { return main_xScale(d.value); })
        .attr("y", function(d,i) { return main_yScale(d.country); })
        .attr("height", main_yScale.rangeBand());
  
      //ENTER
      bar.enter().append("rect")
        .attr("class", "bar")
        .style("fill", "url(#gradient-rainbow-main)")
        .attr("x", 0)
        .attr("width", function(d) { return main_xScale(d.value); })
        .attr("y", function(d,i) { return main_yScale(d.country); })
        .attr("height", main_yScale.rangeBand())
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);
  
      //EXIT
      bar.exit()
        .remove();
  
    }//update
  
    /////////////////////////////////////////////////////////////
    ////////////////////// Brush functions //////////////////////
    /////////////////////////////////////////////////////////////
  
    //First function that runs on a brush move
    function brushmove() {
  
      var extent = brush.extent();
  
      //Reset the part that is visible on the big chart
      var originalRange = main_yZoom.range();
      main_yZoom.domain( extent );
  
      /////////////////////////////////////////////////////////////
      ///////////////////// Update the axis ///////////////////////
      /////////////////////////////////////////////////////////////
  
      //Update the domain of the x & y scale of the big bar chart
      main_yScale.domain(data.map(function(d) { return d.country; }));
      main_yScale.rangeBands( [ main_yZoom(originalRange[0]), main_yZoom(originalRange[1]) ], 0.4, 0);
  
      //Update the y axis of the big chart
      d3.select(".mainGroup")
        .select(".y.axis")
        .call(main_yAxis);
  
      /////////////////////////////////////////////////////////////
      /////////////// Update the mini bar fills ///////////////////
      /////////////////////////////////////////////////////////////
  
      //Update the colors within the mini bar chart
      var selected = mini_yScale.domain()
        .filter(function(d) { return (extent[0] - mini_yScale.rangeBand() + 1e-2 <= mini_yScale(d)) && (mini_yScale(d) <= extent[1] - 1e-2); }); 
      //Update the colors of the mini chart - Make everything outside the brush grey
      d3.select(".miniGroup").selectAll(".bar")
        .style("fill", function(d, i) { return selected.indexOf(d.country) > -1 ? "url(#gradient-rainbow-mini)" : "#e0e0e0"; });
  
      //Update the label size
      d3.selectAll(".y.axis text")
        .style("font-size", textScale(selected.length));
      
      //Update the big bar chart
      update();
      
    }//brushmove
  
    /////////////////////////////////////////////////////////////
    ////////////////////// Click functions //////////////////////
    /////////////////////////////////////////////////////////////
  
    //Based on http://bl.ocks.org/mbostock/6498000
    //What to do when the user clicks on another location along the brushable bar chart
    function brushcenter() {
      var target = d3.event.target,
          extent = brush.extent(),
          size = extent[1] - extent[0],
          range = mini_yScale.range(),
          y0 = d3.min(range) + size / 2,
          y1 = d3.max(range) + mini_yScale.rangeBand() - size / 2,
          center = Math.max( y0, Math.min( y1, d3.mouse(target)[1] ) );
  
      d3.event.stopPropagation();
  
      gBrush
          .call(brush.extent([center - size / 2, center + size / 2]))
          .call(brush.event);
  
    }//brushcenter
  
    /////////////////////////////////////////////////////////////
    ///////////////////// Scroll functions //////////////////////
    /////////////////////////////////////////////////////////////
  
    function scroll() {
  
      //Mouse scroll on the mini chart
      var extent = brush.extent(),
        size = extent[1] - extent[0],
        range = mini_yScale.range(),
        y0 = d3.min(range),
        y1 = d3.max(range) + mini_yScale.rangeBand(),
        dy = d3.event.deltaY,
        topSection;
  
      if ( extent[0] - dy < y0 ) { topSection = y0; } 
      else if ( extent[1] - dy > y1 ) { topSection = y1 - size; } 
      else { topSection = extent[0] - dy; }
  
      //Make sure the page doesn't scroll as well
      d3.event.stopPropagation();
      d3.event.preventDefault();
  
      gBrush
          .call(brush.extent([ topSection, topSection + size ]))
          .call(brush.event);
  
    }//scroll
  
    /////////////////////////////////////////////////////////////
    ///////////////////// Helper functions //////////////////////
    /////////////////////////////////////////////////////////////
  
    //Create a gradient 
    function createGradient(idName, endPerc) {
  
      var coloursRainbow = ["#EFB605", "#E9A501", "#E48405", "#E34914", "#DE0D2B", "#CF003E", "#B90050", "#A30F65", "#8E297E", "#724097", "#4F54A8", "#296DA4", "#0C8B8C", "#0DA471", "#39B15E", "#7EB852"];
  
      defs.append("linearGradient")
        .attr("id", idName)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", endPerc).attr("y2", "0%")
        .selectAll("stop") 
        .data(coloursRainbow)                  
        .enter().append("stop") 
        .attr("offset", function(d,i) { return i/(coloursRainbow.length-1); })   
        .attr("stop-color", function(d) { return d; });
    }//createGradient
  }

  
var margin = { top: 50, right: 0, bottom: 120, left: 70 },
width = 960 - margin.left - margin.right,
height = 430 - margin.top - margin.bottom,
gridSize = Math.floor(width / 25),
legendElementWidth = gridSize*1.5,
buckets = 9,
// colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"],
// colors = ["#440256","#450457","#450559","#3f4788","#3f4889","#3e4989","#3e4a89","#2f6b8e","#2f6c8e","#2e6d8e","#2e6e8e","#1f9f88","#1fa088","#1fa188","#1fa187"] // alternatively colorbrewer.YlGnBu[9]
colors = ["#660022","#781426","	#7A1F3D","	#990033","#C76475","#77B75B","#ABDB92"],
colors = ["#D98CA6","#CC6688","	#B24D6E","	#BF406A","	#8F3D58","	#993355","	#732640","#4D192A","	#471F2C"]
colors = ["#EFB605", "#E9A501", "#E48405", "#E34914", "#DE0D2B", "#CF003E", "#B90050", "#8e273c", "#8e2848"]
days = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
times = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];


var heatmapChart = function(tsvFile, distFile) {
  console.log()
  $("#heatchart").html("");
  var svg = d3.select("#heatchart").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom+300)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
  // var div = d3.select("body")
  // .append("div")
  // .attr("class", "tooltip")
  // .style("opacity", 0);
  
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

var barchart = d3.select(".barchart");
barchart.selectAll("*").remove();
d3.csv('./data/alldata/article left right/article left right/'+tsvFile,
function(d) {
return {
  day: +d.left_bin,
  hour: +d.right_bin,
  value: +d.count
};
},
function(error, data) {

tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
      return "<strong>Count:</strong> <span style='color:red'>" + d.value + "</span>";
  });
svg.call(tip);
var colorScale = d3.scale.quantile()
    .domain([0, buckets - 1, d3.max(data, function (d) { return d.value; })])
    .range(colors);

var cards = svg.selectAll(".hour")
    .data(data, function(d) {return d.day+':'+d.hour;});

cards.append("title");

cards.enter().append("rect")
    .attr("x", function(d) { return (d.hour - 1) * gridSize+33; })
    .attr("y", function(d) { return (d.day - 1) * gridSize+33; })
    .attr("rx", 4)
    .attr("ry", 4)
    .attr("class", "hour bordered")
    .attr("width", gridSize)
    .attr("height", gridSize)
    .style("fill", colors[0])
    // .on("mouseover", function(d) {
    //           tip.transition()
    //               .duration(100)
    //               .style("opacity", .9);
    //           tip.style("left", (d3.event.pageX) + "px")
    //               .style("top", (d3.event.pageY) + "px")
    //               .style("font-size", "10px")
    //               .style("font-weight","bold");
    //       })
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide)
    .on("click",function(d){
      drawbar(d.day,d.hour,d.value,distFile);
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
  .text(function(d) { if(Math.round(d)==0){
    return ">0";
  }
  else {
    return ">= " + Math.round(d); 
  }})
  .attr("x", function(d, i) { return legendElementWidth * i +16; })
  .attr("y", height + gridSize+250);

  legend.append("text")
  .attr("x",150)
  .style("font-size",20)
  .attr("y", height + gridSize+200)
  .text(function(d,i){
    if(i==0){
      return "Legend for Count of words";
    }
    });

svg.append("text")
  .attr("text-anchor", "middle") 			// this makes it easy to centre the text as the transform is applied to the anchor
  .attr("transform","translate(-30,"+((height/2)+80)+")rotate(-90)")  
.text("LEFT WING ARTICLES - PERCENTILE WORD GROUPS");

svg.append("text")
  .attr("text-anchor", "middle") 
.attr("transform","translate("+((width/4)-0)+",-30)")// this makes it easy to centre the text as the transform is applied to the anchor
  .text("RIGHT WING ARTICLES - PERCENTILE WORD GROUPS");


legend.exit().remove();

});  
};