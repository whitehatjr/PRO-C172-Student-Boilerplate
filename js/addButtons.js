AFRAME.registerComponent("create-buttons", {
  init: function() {
    // 1. Create the Rating button
    var button1 = document.createElement("button");
    button1.innerHTML = "RATE DISH";
    button1.setAttribute("id", "rating-button");
    button1.setAttribute("class", "btn btn-warning ml-3 mr-3");

    // 2. Create the Order button
    var button2 = document.createElement("button");
    button2.innerHTML = "ORDER NOW";
    button2.setAttribute("id", "order-button");
    button2.setAttribute("class", "btn btn-warning mr-3");

    // 3. Create the Summary & Total Bill button
    var button3 = document.createElement("button");
    button3.innerHTML = "ORDER SUMMARY";
    button3.setAttribute("id", "order-summary-button");
    button3.setAttribute("class", "btn btn-warning ml-3");

    // 2. Append somewhere
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.appendChild(button3);
    buttonDiv.appendChild(button1);
    buttonDiv.appendChild(button2);
  }
});
