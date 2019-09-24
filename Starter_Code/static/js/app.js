// Use the D3 library to read in samples.json.
var samples

d3.json("samples.json").then( (data) => {
  samples = data; 

  // Dropdown
  var dropdown = d3.select("#selDataset")
  dropdown.append("option").text("Select Id").attr("disabled", true)
  samples.names.forEach((name) => {
    dropdown.append("option").text(name).attr("value", name);
  });
});

function optionChanged(id) {
  get_everything(filter_samples(id));
}

function filter_samples(id) {
  var data = samples.samples.filter((s) => id == s.id)[0];
  var meta_data = samples.metadata.filter((m) => id == m.id)[0];
  return {data, meta_data}
}

function get_everything({data, meta_data}) {
  var data_as_objs = []

  for (var i = 0; i < data.otu_ids.length; i++) {
    var belly = {};
    belly.id = data.id;
    belly.otu_id = data.otu_ids[i].toString();
    belly.sample_value = data.sample_values[i];
    belly.otu_label = data.otu_labels[i];
    data_as_objs.push(belly)
  };

  var highest_levels = data_as_objs.sort(function compareFunction(a, b) {
    return b.sample_value - a.sample_value;
  })

  var sliced_highest_levels = highest_levels.slice(0, 10).reverse();
  var sorted_sliced_sample_values = []
  var sorted_sliced_otu_ids = []
  var sorted_sliced_otu_labels = []

  for (var i = 0; i < sliced_highest_levels.length; i++) {
    sorted_sliced_sample_values.push(sliced_highest_levels[i].sample_value)
    sorted_sliced_otu_ids.push(sliced_highest_levels[i].otu_id)
    sorted_sliced_otu_labels.push(sliced_highest_levels[i].otu_label.replace(/;/g, " "))
  }

//Create a horizontal bar chart with a dropdown menu to display the top 10 OTUs found in that individual.
//* Use `sample_values` as the values for the bar chart.
//* Use `otu_ids` as the labels for the bar chart.
//* Use `otu_labels` as the hovertext for the chart.
  var trace1 = {
    x: sorted_sliced_sample_values,
    y: sorted_sliced_otu_ids,
    type: "bar",
    orientation: 'h',
    text: sorted_sliced_otu_labels,
  };

  var data = [trace1];

  var layout = {
    autosize: false,
      width: 500,
    title: "Top 10 OTUs",
    xaxis: { title: "Number of Samples" },
    yaxis: { title: "OTU ID", type: "category" }
  };

  Plotly.newPlot("bar", data, layout);

//Create a bubble chart that displays each sample.
//* Use `otu_ids` for the x values.
//* Use `sample_values` for the y values.
//* Use `sample_values` for the marker size.
//* Use `otu_ids` for the marker colors.
//* Use `otu_labels` for the text values.
  var trace2 = {
      x: sorted_sliced_otu_ids,
      y: sorted_sliced_sample_values,
      mode: 'markers',
      marker: {
          color: sorted_sliced_otu_ids,
          size: sorted_sliced_sample_values,
          text: sorted_sliced_otu_ids
      }
  };

  var data2 = [trace2];

  var layout = {
      showlegend: false,
      height: 600,
      width: 800
  };
  Plotly.newPlot('bubble', data2, layout);

//Display the sample metadata, i.e., an individual's demographic information.
//Display each key-value pair from the metadata JSON object somewhere on the page.
//Update all of the plots any time that a new sample is selected
  
  Object.entries(meta_data).forEach(([key, value]) => {
    d3.select("#sample-metadata").append("p").text(`${key}: ${value}`)
})
};