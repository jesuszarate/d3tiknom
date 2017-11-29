/** Class implementing the tileChart. */
class TileChart {

    /**
     * Initializes the svg elements required to lay the tiles
     * and to populate the legend.
     */
    constructor(data) {

        let divTiles = d3.select("#tiles").classed("content", true);
        // this.margin = {top: 30, right: 20, bottom: 30, left: 50};
        this.margin = {top: 100, right: 100, bottom: 200, left: 100};
        //Gets access to the div element created for this chart and legend element from HTML
        let svgBounds = divTiles.node().getBoundingClientRect();
        this.svgWidth = svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = this.svgWidth / 2;
        let legendHeight = 150;
        //add the svg to the div
        let legend = d3.select("#legend").classed("content", true);

        //creates svg elements within the div
        this.legendSvg = legend.append("svg")
            .attr("width", this.svgWidth)
            .attr("height", legendHeight)
            .attr("transform", "translate(" + this.margin.left + ",0)");
        this.svg = divTiles.append("svg")
            .attr("width", this.svgWidth)
            .attr("height", this.svgHeight)
            .attr("transform", "translate(" + this.margin.left + ",0)");

        //Domain definition for global color scale
        let domain = [-60, -50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50, 60];

        //Color range for global color scale
        let range = ["#063e78", "#08519c", "#3182bd", "#6baed6", "#9ecae1", "#c6dbef", "#fcbba1", "#fc9272", "#fb6a4a",
            "#de2d26", "#a50f15", "#860308"];

        //ColorScale be used consistently by all the charts
        this.colorScale = d3.scaleQuantile()
            .domain(domain)
            .range(range);

        //new navigationTree(data);
        // this.dataTree = this.getData(data);
        this.getData(data);
    };

    getData(data) {
        this.data = new dataTable(data);
        this.tileData = [];
        Object.keys(this.data).forEach(function (d) {
            let labelArr = d.split(".");
            let label = labelArr[labelArr.length - 3];


            let tileData = this.tileData;
            let index = -1;
            let point = this.tileData.find(function (d1, i) {
                let l = d.indexOf(d1["gubbin"]) > -1;
                index = i;
                return l;
            });

            if (point === undefined) {
                point = {
                    "gubbin": label,
                    "attr": {}
                }
            }

            if (d.indexOf(".total") > -1) {
                let datapoint = this.data[d];

                // point.attr.push({'total': datapoint[datapoint.length - 1][0]});
                point.attr['total'] = datapoint[datapoint.length - 1][0];
                this.tileData.splice(index, 1, point)
            }

            if (d.indexOf(".successes") > -1) {
                let datapoint = this.data[d];
                point.attr['successes'] = datapoint[datapoint.length - 1][0];
                this.tileData.push(point);
            }
        }, this);
    }


    /**
     * Returns the class that needs to be assigned to an element.
     *
     * @param party an ID for the party that is being referred to.
     */
    chooseClass(party) {
        if (party == "R") {
            return "republican";
        }
        else if (party == "D") {
            return "democrat";
        }
        else if (party == "I") {
            return "independent";
        }
    }

    /**
     * Renders the HTML content for tool tip.
     *
     * @param tooltip_data information that needs to be populated in the tool tip
     * @return text HTML content for tool tip
     */
    tooltip_render(tooltip_data) {
        let text = "<h2 class =" + this.chooseClass(tooltip_data.winner) + " >" + tooltip_data.state + "</h2>";
        text += "Electoral Votes: " + tooltip_data.electoralVotes;
        text += "<ul>";
        tooltip_data.result.forEach((row) => {
            //text += "<li>" + row.nominee+":\t\t"+row.votecount+"("+row.percentage+"%)" + "</li>"
            text += "<li class = " + this.chooseClass(row.party) + ">" + row.nominee + ":\t\t" + row.votecount + "(" + row.percentage + "%)" + "</li>"
        });
        text += "</ul>";

        return text;
    }

    /**
     * Creates tiles and tool tip for each state, legend for encoding the color scale information.
     *
     * @param data election data for the year selected
     */
    update() {

        this.maxColumns = 10;
        this.maxRows = 10;

        let len = Object.keys(this.tileData).length;

        let width = this.svgWidth / this.maxColumns;
        let height = this.svgHeight / this.maxRows;

        this.svg.selectAll("g").remove();

        let reference = this;
        let tile = this.svg.selectAll("g")
            .data(this.tileData);

        tile.exit().remove();

        let tileEnter = tile.enter().append("g")
            .attr("transform", function (d, i) {
                console.log("width: " + width + ", i = " + i);
                let translate = "translate(" + (i % 10) * width + "," + Math.floor(i / 10) * height + ")";
                console.log(translate);
                return translate;
            }).attr("class", function (d) {
                return "tile";
            });

        this.drawTile(tileEnter, this.colorScale, height, width);
        tile.merge(tileEnter);
    };

    drawTile(tile, colorScale, height, width) {

        let reference = this;
        tile.append("rect")
            .attr("width", width)
            .style("fill", function (d) {
                let successes = d.attr["successes"];
                let total = d.attr["total"];

                if (total === undefined){
                    total = 0;
                }
                if (successes === undefined){
                    successes = 0;
                }
                return (colorScale(successes - total));
            })
            .attr("height", height);

        let label = tile.append("text");

        let midX = height / 2;
        let midY = width / 2;

        label.append("tspan")
            .attr("x", midX + 50)
            .attr("y", midY - 10)
            .style("font-size", function () {
                // console.log((width*height)/1565);
                return (width * height) / 1400;
            })
            .text(function (d) {
                let label = Object.keys(d)[0].split(".");
                return label[label.length - 3];
            })
            .attr("class", function (d) {
                return "tilestext";
            });

        // label.append("tspan")
        //     .attr("x", midX)
        //     .attr("y", midY + 24)
        //     .text(function (d) {
        //         return d["Total_EV"];
        //     })
        //     .attr("class", function (d) {
        //         return reference.chooseClass(d["Party"]) + " tilestext";
        //     });
    }

}
