/*

@author: Arpit Narechania
@email: arpitnarechania@gmail.com
@project: d3-kagi

Copyright 2017 Arpit Narechania

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
OR OTHER DEALINGS IN THE SOFTWARE.

*/

function KagiChart(data,chart_options){

    var inputData = data;
    var reversalType = chart_options["reversalType"];
    var reversalValue = chart_options["reversalValue"];
    var rallyThickness = chart_options["rallyThickness"];
    var declineThickness = chart_options["declineThickness"];
    var rallyThicknessOnHover = chart_options["rallyThicknessOnHover"];
    var declineThicknessOnHover = chart_options["declineThicknessOnHover"];
    var rallyColor = chart_options["rallyColor"];
    var declineColor = chart_options["declineColor"];
    var width = chart_options["width"];
    var height = chart_options["height"];
    var margin = chart_options["margin"];
    var caption = chart_options["caption"];
    var subCaption = chart_options["subCaption"];
    var unit = chart_options["unit"];
    var isPrecedingUnit = chart_options["isPrecedingUnit"];
    var showBreakPoints = chart_options["showBreakPoints"];
    var showBreakPointText = chart_options["showBreakPointText"];
    var breakPointRadius = chart_options["breakPointRadius"];
    var breakPointColor = chart_options["breakPointColor"];
    var breakPointRadiusOnHover = chart_options["breakPointRadiusOnHover"];
    var showBreakPointTooltips = chart_options["showBreakPointTooltips"];
    var showRangeTooltips = chart_options["showRangeTooltips"];
    var showLegend = chart_options["showLegend"];
    var chartTheme = chart_options["chartTheme"];
    var showAnimation = chart_options["showAnimation"];
    var animationDurationPerTrend = chart_options["animationDurationPerTrend"];
    var animationEase = chart_options["animationEase"];

    if(isNaN(reversalValue)){
    	throw new Error('reversalValue must be a numeric entity');
    }

    if(isNaN(rallyThickness)){
       throw new Error("rallyThickness must be a numeric entity");
    }

    if(isNaN(declineThickness)){
       throw new Error("declineThickness must be a numeric entity");
    }

    if(isNaN(width)){
       throw new Error("width must be a numeric entity");
    }

    if(isNaN(height)){
       throw new Error("height must be a numeric entity");
    }

    if(isNaN(animationDurationPerTrend)){
       throw new Error("animationDurationPerTrend must be a numeric entity");
    }

    if(reversalType.localeCompare("pct") != 0 && reversalType.localeCompare("diff") != 0){
       throw new Error("Valid reversalType are 'pct' and 'diff'");
    }

    if(Object.prototype.toString.call( inputData ) != '[object Array]') {
       throw new Error("inputData must be an array");
    }

    if(typeof(showAnimation) != "boolean"){
       throw new Error("showAnimation must be a boolean entity");
    }

    if(typeof(showLegend) != "boolean"){
       throw new Error("showLegend must be a boolean entity");
    }

    if(typeof(showRangeTooltips) != "boolean"){
       throw new Error("showRangeTooltips must be a boolean entity");
    }

    if(typeof(showBreakPointTooltips) != "boolean"){
       throw new Error("showBreakPointTooltips must be a boolean entity");
    }

    if(typeof(showBreakPointText) != "boolean"){
       throw new Error("showBreakPointText must be a boolean entity");
    }

    if(typeof(showBreakPoints) != "boolean"){
       throw new Error("showBreakPoints must be a boolean entity");
    }

    if(typeof(isPrecedingUnit) != "boolean"){
       throw new Error("isPrecedingUnit must be a boolean entity");
    }

    if(inputData[0] == []){
       throw new Error("inputData is empty.");
    }

    if(!('close' in inputData[0] && 'date' in inputData[0])){
       throw new Error("inputData array must contain objects with keys:- 'date' and 'close'");
    }

    // Preprocess the data and generate the initial set of coordinates which have to be plotted.
    var pre_processed_data = preprocess_data(inputData,reversalType,reversalValue);

    // Filter the preprocessed data to remove the points with same x coordinate except the min and max
    var filtered_data = filter_same_x_points_from_data(pre_processed_data);

    // Add additional points for formatting the yang-ying lines at the base and shoulders.
    var formatted_data = add_base_shoulder_points(filtered_data);

    // Group the lines into a set with its formatting based on break points computed in add_base_shoulder_points().
    var data_to_display = generate_yang_ying_lines(formatted_data,rallyThickness,declineThickness,rallyColor,declineColor);

    // Render the svg lines now
    render_yang_ying_lines(data_to_display,width,height,margin,caption,subCaption,unit,isPrecedingUnit,showBreakPoints,showBreakPointText,showBreakPointTooltips,showRangeTooltips,breakPointRadius,breakPointColor,breakPointRadiusOnHover,rallyThicknessOnHover,declineThicknessOnHover,showLegend,rallyColor,declineColor,chartTheme,showAnimation,animationDurationPerTrend,animationEase);
}

// This function applies the kagi algorithm to figure out the trends
function preprocess_data(data, reversalType, reversalValue){

    var trends = new Array();

    // Initialize the output data
    var output_data = [];

    var counter = 0;
    var trend;
    var j = 0;

    // Pushing the first data point as first day's close
    output_data.push({x:0,close:data[0].close,date:data[0].date});

    var broke_at = 0;

    // Make a copy of the data set to work upon.
    var temp_array = data.slice();

    // Figure out the "initial trend" in data to figure out the direction, thickness, color of line etc
    for(var k=1;k<temp_array.length;k++){
        var diff = temp_array[k].close - temp_array[k-1].close;
        if (diff>0){
            trend = '+';
            broke_at = k;
            break;
        }else if(diff<0){
            trend = '-';
            broke_at = k;
            break;
        }else{
            continue;
        }
    }

    // The first trend is initialized in the trends array based on the above iteration.
    trends[0] = trend;

    // We will slice the dataset from the value of the first change in trend above.
    var data = data.slice(broke_at-1);

    // Initializing the last_close variable to that of the dataset's first datapoint.
    var last_close = data[0].close;

    // Now the magic!
    for(var i=1; i<data.length; i++){
       var diff = data[i].close - last_close;

       if (diff>0){
            trend = '+'; // It is positive
       }else if(diff<0){
            trend = '-'; // It is negative
       }else if(diff==0){
            trend = trends[i-1]; // Values seem equal. Continue the previous trend.
       }

       // Set current trend to that of calculated above.
       trends[i] = trend;

       var value_to_compare = 0;
       if(reversalType.localeCompare("diff") == 0){
           value_to_compare = diff; // If reversalType is difference then just have to compare the change in value
       }else{
           value_to_compare = diff/last_close * 100; // If reversalType is pct then compute the change in value and compare
       }

       // If the absolute value of change (be it difference or percentage) is greater than the configured reversal_value
       if (Math.abs(value_to_compare) >= reversalValue){
           // means there is a change in trend. time to move along the x axis
           if(trends[i] != trends[i-1]){
               counter = counter+1;
               // Push the last_close at the new x position so a |_| or |-| kind of graph.
               output_data.push({x:counter,close:last_close,date:data[i].date});
               // Push the new close at the new x position
               output_data.push({x:counter,close:data[i].close,date:data[i].date});
           }
           // means there is no change in trend. time to move along the y axis (upward or downward)
           else{
                if(trends[i]=='+' && data[i].close>data[i-1].close){
                    output_data.push({x:counter,close:data[i].close,date:data[i].date});
                }
                else if(trends[i]=='-' && data[i].close < data[i-1].close){
                    output_data.push({x:counter,close:data[i].close,date:data[i].date});
                }
            }
           last_close = data[i].close;
           j=0;
       }else{
            if(trends[i]==trends[i-1]){
                // If the trend is the same and the last_close values are conforming to the trend, then
                // push to output_data in a way that it extends along the y axis on the same x axis point (counter).
                if(trends[i]=='+' && data[i].close>data[i-1].close){
                    output_data.push({x:counter,close:data[i].close,date:data[i].date});
                }
                else if(trends[i]=='-' && data[i].close < data[i-1].close){
                    output_data.push({x:counter,close:data[i].close,date:data[i].date});
                }
                // Safe to set the last_close here as it is an actual point added to output_data.
                last_close = data[i].close;
                // Reset the interim j variable to 0
                // Means the original dataset and output_data set are back in sync.
                j=0;
            }else{
                // This is to ignore minor variations in the stock values. We reset the last_close and current trend
                // every time this piece of code gets executed.
                // In Kagi charts, minor fluctuations are ignored while plotting.
                // The output_data set and the original dataset are out of sync till j != 0.
                last_close = data[i-1-j].close;
                trends[i] = trends[i-1-j];
                j+=1;
            }
        }
    }
    return output_data;
}

function filter_same_x_points_from_data(data){
    var filtered_data = [];

    // Push the first datapoint
    filtered_data.push(data[0]);

    // If there are multiple points with the same x coordinate then filter the dataset to
    // have only the first and the last x position (highest and lowest last_close position)
    // This will remove considerable no. of points
    for(var i=1; i<data.length; i++){
        if(data[i].x == data[i-1].x){
            // ignore these points. this was exactly the purpose of this filtering function.
        }else{
            filtered_data.push(data[i-1]);
            filtered_data.push(data[i]);
        }
    }

    // Push the last datapoint
    filtered_data.push(data[data.length-1]);
    return filtered_data;
}

// This function add the points which are at the shoulders and bases (useful only during change of trends).
function add_base_shoulder_points(data){
    var base;
    var shoulder;
    var uptrend;

    // Deciding the initial trend in dataset based on which the base and shoulders are decided.
    if(data[1].close >= data[0].close){
        base = data[0].close;
        shoulder = data[1].close;
        uptrend=true;
    }else{
        base = data[1].close;
        shoulder = data[0].close;
        uptrend=false;
    }

    var points_to_add=[]; // abstracted out so can be used if needed.
    var positions_to_add_to = []; // abstracted out so can be used if needed.

    for(var i=0; i<data.length;i++){

        if(uptrend && data[i].close < base){
            // to_break:true is an identifier that the lines need to change their formatting beyond this point.
            points_to_add.push({date:data[i].date,close:base,x:data[i].x,to_break:true});
            positions_to_add_to.push(i);
            uptrend = !uptrend;
        }
        else if(!uptrend && data[i].close > shoulder){
            // to_break:true is an identifier that the lines need to change their formatting beyond this point.
            points_to_add.push({date:data[i].date,close:shoulder,x:data[i].x,to_break:true});
            positions_to_add_to.push(i);
            uptrend = !uptrend;
        }

        // Update the base and the shoulders while traversing the array.
        if(i>0 && data[i].close > data[i-1].close){
            base = data[i-1].close;
            shoulder = data[i].close;

        }else if(i>0 && data[i].close < data[i-1].close){
            base = data[i].close;
            shoulder = data[i-1].close;
        }
    }

    // Based on the points generated above and their positions,
    // actually add these points into the dataset for final yang-ying generation
    for(var k=0; k<positions_to_add_to.length; k++){
        // the +k is to encounter dynamic increase in the dataset's size.
        // The points_to_add need to be added at the correct position in the data array.
        data.splice(positions_to_add_to[k]+k,0,points_to_add[k]);
    }

    return data;
}


// This function makes the dataset which is fed to the d3.js library to render as svg
// Here, based on to_break metric, formatting options like thickness, colors are added.
function generate_yang_ying_lines(data,rallyThickness,declineThickness,rallyColor,declineColor){

    var output_array_of_lines = [];
    var start_position = 0;
    var break_position = 0;
    var uptrend;

    // Find the initial trend in data. In this case if its equal then I'm considering it as
    // positive.
    if(data[1].close >= data[0].close){
        uptrend = true;
    }else{
        uptrend = false;
    }

    // if the key "to_break" is true, then group the lines and add their formatting.
    for(var i=0;i<data.length;i++){
        if('to_break' in data[i]){
            var temp_array = data.slice();
            break_position = i;
            var lines = temp_array.splice(start_position,break_position-start_position+1);
            start_position = break_position;
            output_array_of_lines.push({uptrend:uptrend,p:lines,w:uptrend?rallyThickness:declineThickness,c:uptrend?rallyColor:declineColor});
            uptrend=!uptrend;
        }
    }

    // adding the last set of lines.
    var temp_array = data.slice();
    var final_section_after_break = temp_array.splice(start_position);
    output_array_of_lines.push({p:final_section_after_break,w:uptrend?rallyThickness:declineThickness,c:uptrend?rallyColor:declineColor});

    return output_array_of_lines;
}

// This function draws the actual svg elements of the Kagi chart.
function render_yang_ying_lines(data,width=900,height=400,margin,caption="Caption",subCaption="Subcaption",unit="$",isPrecedingUnit=true,showBreakPoints=true,showBreakPointText=false,showBreakPointTooltips=true,showRangeTooltips=true,breakPointRadius=2,breakPointColor="#000",breakPointRadiusOnHover=4,rallyThicknessOnHover,declineThicknessOnHover,showLegend=true,rallyColor,declineColor,chartTheme,showAnimation=true,animationDurationPerTrend=500,animationEase="linear"){
    // Set the dimensions of the canvas
    width = width - margin.left - margin.right,
    height = height - margin.top - margin.bottom;

    // Set the ranges
    var	x = d3.scale.linear().range([0, width]);
    var	y = d3.scale.linear().range([height, 0]);

    // Define the axes
    var	xAxis = d3.svg.axis().scale(x)
        .orient("bottom").ticks(0);

    var	yAxis = d3.svg.axis().scale(y)
        .orient("left").ticks(10);

    // Define the line function.
    var	valueline = d3.svg.line()
        .x(function(d) { return x(d.x); })
        .y(function(d) { return y(d.close); });

    // Adds the svg canvas
    var	svg = d3.select("#kagiChart")
        .append("svg")
        .attr("class","kagiChartClass")
        .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
        .style("background",chartTheme=='light' ? "#ffffff" : "#000000")
        .attr("fill",chartTheme=='light' ? "#000000" : "#ffffff")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // This aspect of code takes care of the Responsive nature of the div.
    var aspect = (width + margin.right) / (height + margin.top + margin.bottom );
    $(window).on("resize", function() {
        var targetWidth = $("#kagiChart").width();

        // Otherwise the default settings of width and height will be compromised.
        if (targetWidth > width + margin.right) {
            return;
        }

        d3.select(".kagiChartClass")
            .attr("width", targetWidth - margin.right)
            .attr("height", Math.round(targetWidth / aspect));
    }).trigger("resize");

   // Get the maxima and minima of Y axis
    var yMax = d3.max(data, function(row) { return d3.max(row.p, function(d) { return d.close; }); });
    var yMin = d3.min(data, function(row) { return d3.min(row.p, function(d) { return d.close; }); });

    // Get the maxima and minima of X axis
    var xMax = d3.max(data, function(row) { return d3.max(row.p, function(d) { return d.x; }); });
    var xMin = d3.min(data, function(row) { return d3.min(row.p, function(d) { return d.x; }); });

    // Setting the Domain of the chart with a padding of 2 so the lines are not drawn at the edges.
    x.domain([xMin-2,xMax+2]);
    y.domain([yMin-2,yMax+2]);

    // Add the valueline path.
    var path  = svg.selectAll('path')
        .data(data)
        .enter()
        .append("path")
        .attr("class", "line")
        .attr("d", function(d){return valueline(d.p);}) // line group
        .style('stroke-width', function(d) { return d.w; }) //stroke-widths
        .style('stroke', function(d) { return d.c; }) // stroke-colors

    if(showAnimation){

      for(var i=0; i<path[0].length; i++){
          var totalLength = path[0][i].getTotalLength();
          d3.select(path[0][i])
          .attr("stroke-dasharray", totalLength + " " + totalLength )
          .attr("stroke-dashoffset", totalLength)
          .transition()
            .delay(animationDurationPerTrend*i)
            .duration(animationDurationPerTrend)
            .ease(animationEase)
            .attr("stroke-dashoffset", 0);

      }

    }

    if(showBreakPoints){
        var data_for_ticks = [];
        data.forEach(function(lines){
            data_for_ticks.push({x:lines.p[0].x,close:lines.p[0].close,date:lines.p[0].date});
            data_for_ticks.push({x:lines.p[lines.p.length-1].x,close:lines.p[lines.p.length-1].close,date:lines.p[lines.p.length-1].date});
        });

        if (showBreakPointText){

            var ticks_text = svg.selectAll('text')
                .data(data_for_ticks)
                .enter()
                .append("text")
                .attr("transform", function(d){return "translate(" + x(d.x) + "," + (height+15) + ") rotate(-45)";})
                .attr("text-anchor", "end")
                .attr("dy", 3)
                .attr("dx", 5)
                .text(function(d){return formatDateToString(new Date(d.date));})
        }
        var ticks = svg.selectAll('circle')
            .data(data_for_ticks)
            .enter()
            .append("circle")
            .attr("class","break_points")
            .attr("cx", function(d){return x(d.x);})
            .attr("cy", function(d){return y(d.close) ;})
            .attr("r", breakPointRadius)
            .style("fill", breakPointColor)

        if(showBreakPointTooltips){
            add_breakpoint_tooltips();
        }
        function add_breakpoint_tooltips(){

            // Adding a tooltip which on mouseover shows the date range and the last_close points range.
            var tooltip = d3.select("body")
                .append('div')
                .attr('class', 'tooltip');

                tooltip.append('div')
                .attr('class', 'tabular_div');

                svg.selectAll(".break_points")
                .on('mouseover', function(d) {

                    if(isPrecedingUnit){
                        var html = "<table><thead><tr><th>Close</th><th>Date</th></tr></thead><tbody><tr><td>" + unit + d.close + "</td><td>" + formatDateToString(new Date(d.date)) + "</td></tr></tbody></table>"
                        tooltip.select('.tabular_div').html(html);
                    }
                    else{
                        var html = "<table><thead><tr><th>Close</th><th>Date</th></tr></thead><tbody><tr><td>"  + d.close + unit + "</td><td>" + formatDateToString(new Date(d.date)) + "</td></tr></tbody></table>"
                        tooltip.select('.tabular_div').html(html);
                    }

                    d3.select(this).style("r", breakPointRadiusOnHover);
                    tooltip.style('display', 'block');
                    tooltip.style('opacity',2);

                })
                .on('mousemove', function(d) {
                    d3.select(this).style("r", breakPointRadiusOnHover);
                    tooltip.style('top', (d3.event.layerY + 10) + 'px')
                    .style('left', (d3.event.layerX - 25) + 'px');
                })
                .on('mouseout', function(d) {
                    d3.selectAll(".break_points").style("r", breakPointRadius);
                    tooltip.style('display', 'none');
                    tooltip.style('opacity',0);
                });

        }
    }

    // Add a caption to the chart.
    svg
      .append("text")
      .attr("x", width/2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text(subCaption);

    // Add a subCaption to the chart.
    svg
      .append("text")
      .attr("x", width/2)
      .attr("text-anchor", "middle")
      .attr("y", -40)
      .style("font-size", "16px")
      .text(caption);

    //  Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .attr("shape-rendering","geometricPrecision")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .attr("shape-rendering","geometricPrecision")
        .call(yAxis);

    if(showRangeTooltips){
        add_range_tooltips();
    }
    function add_range_tooltips(){

        // Adding a tooltip which on mouseover shows the date range and the last_close points range.
        var tooltip = d3.select("body")
            .append('div')
            .attr('class', 'tooltip');

            tooltip.append('div')
            .attr('class', 'tabular_div');

            svg.selectAll(".line")
            .on('mouseover', function(d) {

                if(isPrecedingUnit){
                    var html = "<table><thead><tr><th>Close</th><th>Date</th></tr></thead><tbody><tr><td>" + unit + d.p[0].close + "</td><td>" + formatDateToString(new Date(d.p[0].date)) + "</td></tr><tr><td>" + unit + d.p[d.p.length -1].close + "</td><td>" + formatDateToString(new Date(d.p[d.p.length -1].date)) + "</td></tr></tbody></table>"
                    tooltip.select('.tabular_div').html(html);
                }
                else{
                    var html = "<table><thead><tr><th>Close</th><th>Date</th></tr></thead><tbody><tr><td>" + d.p[0].close + unit + "</td><td>" + formatDateToString(new Date(d.p[0].date)) + "</td></tr><tr><td>" + d.p[d.p.length -1].close + unit + "</td><td>" + formatDateToString(new Date(d.p[d.p.length -1].date)) + "</td></tr></tbody></table>"
                    tooltip.select('.tabular_div').html(html);
                }

                d3.select(this).style("stroke-width", d.uptrend ? rallyThicknessOnHover : declineThicknessOnHover);
                tooltip.style('display', 'block');
                tooltip.style('opacity',2);

            })
            .on('mousemove', function(d) {
                d3.select(this).style("stroke-width", d.uptrend ? rallyThicknessOnHover : declineThicknessOnHover);
                tooltip.style('top', (d3.event.layerY + 10) + 'px')
                .style('left', (d3.event.layerX - 25) + 'px');
            })
            .on('mouseout', function(d) {
                d3.select(this).style("stroke-width", function(d){return d.w;});
                tooltip.style('display', 'none');
                tooltip.style('opacity',0);
            });

    }

    if(showLegend){

        var legendData = [];
        legendData.push({category:'Yang',color:rallyColor});
        legendData.push({category:'Ying',color:declineColor});
        legendData.push({category:'Breakout',color:breakPointColor});

        // add legend
        var legend = svg
        .selectAll(".legend")
        .data(legendData)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", "translate(0,0)");

        legend
          .append("rect")
          .attr("x", width - margin.right)
          .attr("y", function(d,i){return i*20 - margin.top + 15;})
          .attr("width", 15)
          .attr("height", 10)
          .style("fill", function(d) {
            return d.color;
          })

        legend
          .append("text")
          .attr("x", width-margin.right+20)
          .attr("y", function(d,i){return i*20 + 8 - margin.top + 15;})
          .text(function(d){return d.category});
    }

    function formatDateToString(date){
       // 01, 02, 03, ... 29, 30, 31
       var dd = (date.getDate() < 10 ? '0' : '') + date.getDate();
       // 01, 02, 03, ... 10, 11, 12
       var MM = ((date.getMonth() + 1) < 10 ? '0' : '') + (date.getMonth() + 1);
       // 1970, 1971, ... 2015, 2016, ...
       var yy = (date.getFullYear()).toString();
       // create the format you want
       return (dd + "-" + MM + "-" + yy.substr(-2,2));
    }

}