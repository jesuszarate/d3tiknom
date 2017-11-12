d3.json("data/formatted_monkit_data.json", function (error, data) {
    let dashboard = new Dashboard(data);
    dashboard.update();
    d3.select("#loading-gif").remove();
});
