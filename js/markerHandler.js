var tableNumber = null;

AFRAME.registerComponent("markerhandler", {
  init: async function () {

    if (tableNumber === null) {
      this.askTableNumber();
    }

    //Get the dishes collection
    var dishes = await this.getDishes();

    //makerFound Event
    this.el.addEventListener("markerFound", () => {
      if (tableNumber !== null) {
        var markerId = this.el.id;
        this.handleMarkerFound(dishes, markerId);
      }
    });
    //markerLost Event
    this.el.addEventListener("markerLost", () => {
      this.handleMarkerLost();
    });
  },
  askTableNumber: function () {
    var iconUrl = "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/hunger.png";
    swal({
      title: "Welcome to Hunger!!",
      icon: iconUrl,
      content: {
        element: "input",
        attributes: {
          placeholder: "Type your table number",
          type: "number",
          min: 1
        }
      },
      closeOnClickOutside: false,
    }).then(inputValue => {
      tableNumber = inputValue;
    });
  },

  handleMarkerFound: function (dishes, markerId) {
    // Getting today's day
    var todaysDate = new Date();
    var todaysDay = todaysDate.getDay();
    // Sunday - Saturday : 0 - 6
    var days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday"
    ];

    // Changing Model scale to initial scale
    var dish = dishes.filter(dish => dish.id === markerId)[0];

    //Update UI conent VISIBILITY of AR scene(MODEL , INGREDIENTS & PRICE)
    var model = document.querySelector(`#model-${dish.id}`);
    model.setAttribute("visible", true);

    var ingredientsContainer = document.querySelector(`#main-plane-${dish.id}`);
    ingredientsContainer.setAttribute("visible", true);

    var priceplane = document.querySelector(`#price-plane-${dish.id}`);
    priceplane.setAttribute("visible", true)

    //Check if the dish is available
    if (dish.unavailable_days.includes(days[todaysDay])) {
      swal({
        icon: "warning",
        title: dish.dish_name.toUpperCase(),
        text: "This dish is not available today!!!",
        timer: 2500,
        buttons: false
      });
    } else {
       //Changing Model scale to initial scale
      var model = document.querySelector(`#model-${dish.id}`);
      model.setAttribute("position", dish.model_geometry.position);
      model.setAttribute("rotation", dish.model_geometry.rotation);
      model.setAttribute("scale", dish.model_geometry.scale);

      // Changing button div visibility
      var buttonDiv = document.getElementById("button-div");
      buttonDiv.style.display = "flex";

      var ratingButton = document.getElementById("rating-button");
      var orderButtton = document.getElementById("order-button");
      var orderSummaryButtton = document.getElementById("order-summary-button");

      var payButton = document.getElementById("pay-button");

      // Handling Click Events
      ratingButton.addEventListener("click", function () {
        swal({
          icon: "warning",
          title: "Rate Dish",
          text: "Work In Progress"
        });
      });

      orderButtton.addEventListener("click", () => {
        var tNumber;
        tableNumber <= 9 ? (tNumber = `T0${tableNumber}`) : `T${tableNumber}`;
        this.handleOrder(tNumber, dish);

        swal({
          icon: "https://i.imgur.com/4NZ6uLY.jpg",
          title: "Thanks For Order !",
          text: "Your order will serve soon on your table!",
          timer: 2000,
          buttons: false
        });
      });

      orderSummaryButtton.addEventListener("click", () =>
        this.handleOrderSummary()
      );

      payButton.addEventListener("click", () => this.handlePayment());
    }
  },
 
  handleOrder: function (tNumber, dish) {
    //Reading current table order details
    firebase
      .firestore()
      .collection("tables")
      .doc(tNumber)
      .get()
      .then(doc => {
        var details = doc.data();

        if (details["current_orders"][dish.id]) {
          //Increasing Current Quantity
          details["current_orders"][dish.id]["quantity"] += 1;

          //Calculating Subtotal of item
          var currentQuantity = details["current_orders"][dish.id]["quantity"];

          details["current_orders"][dish.id]["subtotal"] =
            currentQuantity * dish.price;
        } else {
          details["current_orders"][dish.id] = {
            item: dish.dish_name,
            price: dish.price,
            quantity: 1,
            subtotal: dish.price * 1
          };
        }

        details.total_bill += dish.price;

        // Updating db
        firebase
          .firestore()
          .collection("tables")
          .doc(doc.id)
          .update(details);
      });
  },
  getDishes: async function () {
    return await firebase
      .firestore()
      .collection("dishes")
      .get()
      .then(snap => {
        return snap.docs.map(doc => doc.data());
      });
  },
  getOrderSummary: async function (tNumber) {
    return await firebase
      .firestore()
      .collection("tables")
      .doc(tNumber)
      .get()
      .then(doc => doc.data());
  },
  handleOrderSummary: async function () {   

    //Getting Table Number
    var tNumber;
    tableNumber <= 9 ? (tNumber = `T0${tableNumber}`) : `T${tableNumber}`;

    //Getting Order Summary from database
    var orderSummary = await this.getOrderSummary(tNumber);

    //Changing modal div visibility
    var modalDiv = document.getElementById("modal-div");
    modalDiv.style.display = "flex";

    //Get the table element
    var tableBodyTag = document.getElementById("bill-table-body");

    //Removing old tr(table row) data
    tableBodyTag.innerHTML = "";

    //Get the cuurent_orders key 
    var currentOrders = Object.keys(orderSummary.current_orders);

    currentOrders.map(i => {

      //Create table row
      var tr = document.createElement("tr");

      //Create table cells/columns for ITEM NAME, PRICE, QUANTITY & TOTAL PRICE
      var item = document.createElement("td");
      var price = document.createElement("td");
      var quantity = document.createElement("td");
      var subtotal = document.createElement("td");

      //Add HTML content 
      item.innerHTML = orderSummary.current_orders[i].item;

      price.innerHTML = "$" + orderSummary.current_orders[i].price;
      price.setAttribute("class", "text-center");

      quantity.innerHTML = orderSummary.current_orders[i].quantity;
      quantity.setAttribute("class", "text-center");

      subtotal.innerHTML = "$" + orderSummary.current_orders[i].subtotal;
      subtotal.setAttribute("class", "text-center");

      //Append cells to the row
      tr.appendChild(item);
      tr.appendChild(price);
      tr.appendChild(quantity);
      tr.appendChild(subtotal);

      //Append row to the table
      tableBodyTag.appendChild(tr);
    });

    //Create a table row to Total bill
    var totalTr = document.createElement("tr");

    //Create a empty cell (for not data)
    var td1 = document.createElement("td");
    td1.setAttribute("class", "no-line");

    //Create a empty cell (for not data)
    var td2 = document.createElement("td");
    td1.setAttribute("class", "no-line");

    //Create a cell for TOTAL
    var td3 = document.createElement("td");
    td1.setAttribute("class", "no-line text-center");

    //Create <strong> element to emphasize the text
    var strongTag = document.createElement("strong");
    strongTag.innerHTML = "Total";

    td3.appendChild(strongTag);

    //Create cell to show total bill amount
    var td4 = document.createElement("td");
    td1.setAttribute("class", "no-line text-right");
    td4.innerHTML = "$" + orderSummary.total_bill;

    //Append cells to the row
    totalTr.appendChild(td1);
    totalTr.appendChild(td2);
    totalTr.appendChild(td3);
    totalTr.appendChild(td4);

    //Append the row to the table
    tableBodyTag.appendChild(totalTr);
  },
  handlePayment: function () {
    // Close Modal
    document.getElementById("modal-div").style.display = "none";

    // Getting Table Number
    var tNumber;
    tableNumber <= 9 ? (tNumber = `T0${tableNumber}`) : `T${tableNumber}`;

    //Reseting current orders and total bill
    firebase
      .firestore()
      .collection("tables")
      .doc(tNumber)
      .update({
        current_orders: {},
        total_bill: 0
      })
      .then(() => {
        swal({
          icon: "success",
          title: "Thanks For Paying !",
          text: "We Hope You Enjoyed Your Food !!",
          timer: 2500,
          buttons: false
        });
      });
  },
  handleMarkerLost: function () {
    // Changing button div visibility
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "none";
  }
});
