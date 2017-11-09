

d3.json("data/formatted_monkit_data.json", function (error, data) {
    //console.log(data); // this is your data
    let dashboard = new Dashboard(data);
    dashboard.update();
    console.log(data);
});
