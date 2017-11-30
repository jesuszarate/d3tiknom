/** Class implementing the tileChart. */
class Overview {

    /**
     * Initializes the svg elements required to lay the tiles
     * and to populate the legend.
     */
    constructor(data) {

        let divTiles = d3.select("#tiles").classed("content", true);
        this.margin = {top: 100, right: 100, bottom: 200, left: 100};
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

        let domain = [0, 100];
        let range = ["#860308", "#a50f15", "#de2d26", "#fb6a4a", "#fc9272", "#fcbba1", "#c6dbef", "#9ecae1", "#6baed6",
            "#3182bd", "#08519c", "#063e78"];

        this.colorScale = d3.scaleQuantile()
            .domain(domain)
            .range(range);

        this.tipWindowOpen = false;
        this.datapoints = ["successes", "failures", "total", "errors", "high", "low", "sum", "count", "avg", "min", "max"];
        this.getData(data);
    };

    getData(data) {
        this.data = new dataTable(data);
        this.tileData = [];
        Object.keys(this.data).forEach(function (d) {
            let labelArr = d.split(".");
            let label = labelArr[labelArr.length - 3];
            let path = "";
            labelArr.forEach(function (d, i) {
                if (i >= labelArr.length - 2) {
                    return;
                }
                path += d + ".";
            });
            path = path.substring(0, path.length - 1);

            let tileData = this.tileData;
            let index = 0;
            let point = this.tileData.find(function (d1, i) {
                let l = d.indexOf(d1["gubbin"]) > -1;
                index = i;
                return l;
            });

            if (point === undefined) {
                point = {
                    "gubbin": label,
                    "path": path,
                    "attr": {}
                };
                this.tileData.push(point);
            }

            this.datapoints.forEach(function (dataname) {
                if (d.indexOf("." + dataname) > -1) {
                    let datapoint = this.data[d];
                    this.tileData[index].attr[dataname] = datapoint[datapoint.length - 1][0]
                }
            }, this);

        }, this);
    }

    /**
     * Renders the HTML content for tool tip.
     *
     * @param tooltip_data information that needs to be populated in the tool tip
     * @return text HTML content for tool tip
     */
    tooltip_render(tooltip_data) {
        let text = "<h2 >" + tooltip_data.gubbin + "</h2>";
        text += "<ul>";

        // if (tooltip_data.attr.total !== undefined) {
        //     text += "<li>" + "Total" + ":\t\t" + tooltip_data.attr.total + "</li>";
        // }
        // if (tooltip_data.attr.successes !== undefined) {
        //     text += "<li>" + "Successes" + ":\t\t" + tooltip_data.attr.successes + "</li>";
        // }
        // if (tooltip_data.attr.failures !== undefined) {
        //     text += "<li>" + "Failures" + ":\t\t" + tooltip_data.attr.failures + "</li>";
        // }
        // if (tooltip_data.attr.errors !== undefined) {
        //     text += "<li>" + "Errors" + ":\t\t" + tooltip_data.attr.errors + "</li>";
        // }
        //
        // if (tooltip_data.attr.sum !== undefined) {
        //     text += "<li>" + "Sum" + ":\t\t" + tooltip_data.attr.sum + "</li>";
        // }
        //
        // if (tooltip_data.attr.high !== undefined) {
        //     text += "<li>" + "High" + ":\t\t" + tooltip_data.attr.high + "</li>";
        // }
        //
        // if (tooltip_data.attr.low !== undefined) {
        //     text += "<li>" + "low" + ":\t\t" + tooltip_data.attr.low + "</li>";
        // }

        this.datapoints.forEach(function (d) {
            if (tooltip_data.attr[d] !== undefined) {
                if(d === "successes") {
                    text += "<li class='successful'>" + d.toUpperCase() + ":\t\t" + tooltip_data.attr[d] + "</li>";
                }
                else if(d === "failures") {
                    text += "<li class='failure'>" + d.toUpperCase() + ":\t\t" + tooltip_data.attr[d] + "</li>";
                }
                else {
                    text += "<li>" + d.toUpperCase() + ":\t\t" + tooltip_data.attr[d] + "</li>";
                }
            }
        });

        text += "</ul>";

        if (this.tipWindowOpen) {
            text += "<form action=\"linechart.html\" method=\"GET\">" +
                "  <input type=\"hidden\" name=\"gubbin\" value=\"" + tooltip_data.path + "\" />" +
                "  <input type=\"submit\" value=\"View\"/>" +
                "</form>";
        }
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

        let tipMouseOver = d3.tip().attr('class', 'd3-tip')
            .direction('se')
            .offset(function () {
                return [0, 0];
            })
            .html((d) => {
                return this.tooltip_render(d);
            });

        this.svg.selectAll("g").remove();

        let reference = this;
        let tile = this.svg.selectAll("g")
            .data(this.tileData);

        tile.exit().remove();

        let ref = this;
        let tileEnter = tile.enter().append("g")
            .attr("transform", function (d, i) {
                return "translate(" + (i % 10) * width + "," + Math.floor(i / 10) * height + ")";
            }).attr("class", function (d) {
                return "tile";
            })
            .on("mouseover", function (d) {
                if (!ref.tipWindowOpen) {
                    tipMouseOver.show(d);
                }
            })
            .on("mouseleave", function (d) {
                if (!ref.tipWindowOpen) {
                    tipMouseOver.hide(d);
                }
            })
            .on("click", function (d) {
                ref.tipWindowOpen = true;
                tipMouseOver.show(d);
            })
            .on("dblclick", function (d) {
                tipMouseOver.hide();
                ref.tipWindowOpen = false;
            });

        tileEnter.call(tipMouseOver);

        this.drawTile(tileEnter, this.colorScale, height, width);
        tile.merge(tileEnter);
    };

    drawTile(tile, colorScale, height, width) {

        let reference = this;
        tile.append("rect")
            .attr("width", width)
            .style("fill", function (d) {
                let successes = d.attr["successes"];
                let failures = d.attr["failures"];
                let total = d.attr["total"];

                if (total === undefined) {
                    total = 1;
                }
                if (successes === undefined) {
                    successes = 0;
                }
                if (failures === undefined) {
                    failures = 0;
                }

                return (colorScale(((successes / total) * 100)));// - (failures/total)*100) ));
            })
            .attr("height", height);


        let label = tile.append("text");

        let midX = height / 2;
        let midY = width / 2;

        label.append("tspan")
            .attr("x", midX + 50)
            .attr("y", midY - 10)
            .style("font-size", function () {
                return (width * height) / 1400;
            })
            .text(function (d) {
                return d["gubbin"];
            })
            .attr("class", function (d) {
                return "tilestext";
            });
    }

}
