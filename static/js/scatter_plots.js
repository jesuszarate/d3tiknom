class Plots {
    constructor(data, colorKeys, colorScale) {
        this.data = data;
        this.colorKeys = colorKeys;
        this.colorScale = colorScale;

        // initializes the svg elements required for this chart
        this.margin = {top: 20, right: 20, bottom: 200, left: 100};

        this.plotIds = ["#box-plot", "#stack-trace-plot", "#comparison-plot",
            "#dot-plot"];
    }

    update(selectedTargets) {
        let boxTargets = selectedTargets["#box-plot"];
        let stackTraceTargets = selectedTargets["#stack-trace-plot"];
        let comparisonTargets = selectedTargets["#comparison-plot"];
        let dotTargets = selectedTargets["#dot-plot"];

        let boxData = [];
        for (let i = 0; boxTargets && i < boxTargets.length; i++) {
            boxData.push({
                "target": boxTargets[i],
                "data":   this.data[boxTargets[i]]
            });
        }

        let stackTraceData = [];
        for (let i = 0; stackTraceTargets && i < stackTraceTargets.length; i++) {
            stackTraceData.push({
                "target": stackTraceTargets[i],
                "data":   this.data[stackTraceTargets[i]]
            });
        }

        let comparisonData = [];
        for (let i = 0; comparisonTargets && i < comparisonTargets.length; i++) {
            comparisonData.push({
                "target": comparisonTargets[i],
                "data":   this.data[comparisonTargets[i]]
            });
        }

        let dotData = [];
        for (let i = 0; dotTargets && i < dotTargets.length; i++) {
            dotData.push({
                "target": dotTargets[i],
                "data":   this.data[dotTargets[i]]
            });
        }

        console.log(dotData);

        this.clearPlots();
        this.buildBoxPlot(boxData);
        this.buildStackTracePlot(stackTraceData);
        this.buildComparisonPlot(comparisonData);
        this.buildDotPlot(dotData);
    }

    clearPlots() {
        this.plotIds.forEach(function(plotId) {
            let data = d3.select(plotId)
                .select(".data");
            data.selectAll("rect").remove();
            data.selectAll("circle").remove();
            data.selectAll("line").remove();
            data.selectAll("rect").remove();
            data.selectAll("polyline").remove();

            let xaxis = d3.select(plotId)
                .select(".x-axis");
            xaxis.selectAll("path").remove();
            xaxis.selectAll("g").remove();

            let yaxis = d3.select(plotId)
                .select(".y-axis");
            yaxis.selectAll("path").remove();
            yaxis.selectAll("g").remove();
        });
    }

    buildBoxPlot(targets) {
        if (targets.length == 0) {
            return;
        }

        let plot = this.initializeSvgPlot("#box-plot", targets);
        plot.svg.select(".data")
            .append("text")
            .text("TODO: not implemented");
    }

    buildStackTracePlot(targets) {
        if (targets.length == 0) {
            return;
        }

        let plot = this.initializeSvgPlot("#stack-trace-plot", targets);
        plot.svg.select(".data")
            .append("text")
            .text("TODO: not implemented");
    }

    buildComparisonPlot(targets) {
        if (targets.length == 0) {
            return;
        }

        let ref = this;
        let plot = this.initializeSvgPlot("#comparison-plot", targets);

        // create the axes
        plot.svg.select(".svg-plot").select(".x-axis")
            .attr("transform", "translate(0," + plot.height + ")")
            .call(d3.axisBottom(plot.xScale).tickFormat(function(i) {
                let date = new Date(i * 1000);
                return date.toGMTString();
            }))
          .selectAll("text")
            .attr("transform", "rotate(-15)")
            .attr("x", -5)
            .attr("y", 20)
            .attr("dy", 0)
            .attr("text-anchor", "end");

        plot.svg.select(".svg-plot").select(".y-axis")
            .call(d3.axisLeft(plot.yScale).ticks(10));

        targets.forEach(function(target, i) {
            let polylinePoints = "";
            target.data.forEach(function(d) {
                polylinePoints += plot.xScale(d[1]) + "," +
                    plot.yScale(d[0]) + " ";
            });

            let gubbin = gubbinFromTarget(target.target);

            // create the points
            let points = plot.svg.select(".data")
                .append("polyline")
                .attr("class", "gubbin-selected")
                .attr("stroke",
                    ref.colorScale(ref.colorKeys.data[gubbin]))
                .attr("points", polylinePoints);
        });
    }

    buildDotPlot(targets) {
        if (targets.length == 0) {
            return;
        }

        let plot = this.initializeSvgPlot("#dot-plot", targets);
        plot.svg.select(".data")
            .append("text")
            .text("TODO: not implemented");
    }

    initializeSvgPlot(plotId, targets) {
        let plotSvg = d3.select(plotId);
        let computedSize = plotSvg.node().getBoundingClientRect();
        let chartWidth = computedSize.width - this.margin.left -
            this.margin.right;
        let chartHeight = computedSize.height - this.margin.top -
            this.margin.bottom;

        plotSvg.select(".svg-plot").attr("transform", "translate(" +
            this.margin.left + "," + this.margin.top + ")");

        // create the x and y scales; make sure to leave room for the axes
        let xScale = d3.scaleLinear()
            .domain([d3.min(targets, d => d3.min(d.data, g => g[1])),
                    d3.max(targets, d => d3.max(d.data, g => g[1]))])
            .rangeRound([0, chartWidth]);

        let yScale = d3.scaleLinear()
            .domain([d3.max(targets, d => d3.max(d.data, g => g[0])),
                     d3.min(targets, d => d3.min(d.data, g => g[0]))])
            .rangeRound([0, chartHeight]);

        return {
            svg: plotSvg,
            width: chartWidth,
            height: chartHeight,
            xScale: xScale,
            yScale: yScale,
        };
    }
}
