function drawbar(leftbin, rightbin, count,datafile) {

    var zippedData = [];

    var varlabels = [];

    var dataset = null;

    var data1 = function (tsvFile) {

        d3.csv(tsvFile,

            function (d) {

                return {

                    labels: d.term,

                    left_values: +d.left_perc,

                    right_values: +d.right_perc,

                    left_bin: +d.left_bin,

                    right_bin: +d.right_bin

                };

            },

            function (error, data) {

                dataset = data;

                dataready();

            });

    };

 

    data1('./data/alldata/article left right/article left right/'+datafile);

 

    function dataready() {

       

        for (var i = 0; i < dataset.length; i++) {

            if (dataset[i].left_bin == leftbin && dataset[i].right_bin == rightbin) {

                zippedData.push(dataset[i].left_values);

                zippedData.push(dataset[i].right_values);

                varlabels.push(dataset[i].labels);

            }

        }

        console.log(varlabels);

        var chartWidth = 300,

            barHeight = 20,

            groupHeight = barHeight * 2,

            gapBetweenGroups = 10,

            spaceForLabels = 250,

            spaceForLegend = 150;

 

        // Color scale

        var color = ["#184dbe","#CF003E"];

        var chartHeight = count*50;

 

        var x = d3.scale.linear()

            .domain([0, d3.max(zippedData)])

            .range([0, chartWidth]);

 

        var y = d3.scale.linear()

            .range([chartHeight + gapBetweenGroups, 0]);

 

        var yAxis = d3.svg.axis()

            .scale(y)

            .tickFormat('')

            .tickSize(0)

            .orient("left");

 

        // Specify the chart area and dimensions

        var chart = d3.select(".barchart")

            .attr("width", spaceForLabels + chartWidth + spaceForLegend)

            .attr("height", chartHeight);

       

        chart.selectAll("*").remove();

 

        // Create bars

        var bar = chart.selectAll("g")

            .data(zippedData)

            .enter().append("g")

            .attr("transform", function (d, i) {

                return "translate(" + spaceForLabels + "," + (i * barHeight + gapBetweenGroups * (0.5 + Math.floor(i / 2))) + ")";

            });

 

        // Create rectangles of the correct width

        bar.append("rect")

            .attr("fill", function (d, i) { return color[i % 2]; })

            .attr("class", "bar")

            .attr("width", x)

            .attr("height", barHeight - 1);

 

        // Add text label in bar

        bar.append("text")

            .attr("x", function (d) { return x(d) - 3; })

            .attr("y", barHeight/2)

            .attr("fill", "red")

            .attr("dy", ".35em")

            .text(function (d) { return (d*100).toFixed(2)+"%"; });

 

        var iter = 0;

        // Draw labels

        bar.append("text")

            .attr("class", "label")

            .attr("x", function (d) { return - 10; })

            .attr("y", function(d,i){

                if(i==0){

                    iter = 20;

                    return iter;

                }

                else if(i%2 == 0){

                    iter += 25;

                    return iter;

                }

                else {

                    iter+=25;

                    return iter;

                }

               

            })

            .attr("dy", ".35em")

            .text(function (d, i) {

                //if (i % 2 === 0)

                    return varlabels[i];

                //else

                //    return "";

            });

 

        chart.append("g")

            .attr("class", "y axis")

            .attr("transform", "translate(" + spaceForLabels + ", " + -gapBetweenGroups / 2 + ")")

            .call(yAxis);

 

        // Draw legend

        var legendRectSize = 18,

            legendSpacing = 4;

        var legendlabel = [{ label: 'left' }, { label: 'right' }];

 

        var legend = chart.selectAll('.legend')

            .data(legendlabel)

            .enter()

            .append('g')

            .attr('transform', function (d, i) {

                var height = legendRectSize + legendSpacing;

                var offset = -gapBetweenGroups / 2;

                var horz = spaceForLabels + chartWidth + 40 - legendRectSize;

                var vert = i * height - offset;

                return 'translate(' + horz + ',' + vert + ')';

            });

 

        legend.append('rect')

            .attr('width', legendRectSize)

            .attr('height', legendRectSize)

            .style('fill', function (d, i) { return color[i%2]; })

            .style('stroke', function (d, i) { return color[i%2]; });

 

        legend.append('text')

            .attr('class', 'legend')

            .attr('x', legendRectSize + legendSpacing)

            .attr('y', legendRectSize - legendSpacing)

            .text(function (d) { return d.label; });

    }

}