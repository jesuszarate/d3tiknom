class Plots {
    constructor(plotIds, data) {
        this.data = data;

        // initializes the svg elements required for this chart
        this.margin = {top: 10, right: 20, bottom: 30, left: 50};

        //this.plotIds = plotIds;
        this.plotIds = ["#data-plot"];
    }

    update(selectedTargets) {
        let boxTargets = selectedTargets["#box-plot"];
        let stackTraceTargets = selectedTargets["#stack-trace-plot"];
        let comparisonTargets = selectedTargets["#comparison-plot"];
        let dotTargets = selectedTargets["#dot-plot"];
        let dataTargets = selectedTargets["#data-plot"];

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

        let dataData = [];
        for (let i = 0; dataTargets && i < dataTargets.length; i++) {
            dataData.push({
                "target": dataTargets[i],
                "data":   this.data[dataTargets[i]]
            });
        }

        this.clearPlots();
        //this.buildBoxPlot(boxData);
        //this.buildStackTracePlot(stackTraceData);
        //this.buildComparisonPlot(comparisonData);
        //this.buildDotPlot(dotData);
        this.buildDataPlot(dataData);
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

        let plot = this.initializeSvgPlot("#comparison-plot", targets);
        plot.svg.select(".data")
            .append("text")
            .text("TODO: not implemented");
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

    buildDataPlot(targets) {
        if (targets.length == 0) {
            return;
        }

        let plot = this.initializeSvgPlot("#data-plot", targets);
        let target = targets[0].data; // TODO(sam): support many

        let polylinePoints = "";
        target.forEach(function(d) {
            polylinePoints += plot.xScale(d[1]) + "," + plot.yScale(d[0]) + " ";
        });

        // create the points
        let points = plot.svg.select(".data")
            .append("polyline")
            .attr("points", polylinePoints)
            .attr("style", "fill:none;stroke:black;stroke-width:3");
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
            .domain([d3.max(targets, d => d3.max(d.data, g => g[1])),
                     d3.min(targets, d => d3.min(d.data, g => g[1]))])
            .rangeRound([0, chartWidth]);

        let yScale = d3.scaleLinear()
            .domain([d3.min(targets, d => d3.min(d.data, g => g[0])),
                     d3.max(targets, d => d3.max(d.data, g => g[0]))])
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
