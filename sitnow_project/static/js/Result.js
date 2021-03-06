let infowindow, marker;

// Get the place info by POST /place/
async function getPlace({ name, building }, csrfmiddlewaretoken) {
  let place = await $.ajax({
    type: "POST",
    url: "/place/",
    data: {
      csrfmiddlewaretoken,
      name,
      building
    },
    success: async data => {
      return data;
    },
    dataType: "json"
  });
  return place;
}

// Get card template html from /static/card_template/
async function getCardTemplate(filename) {
  let html = await $.get("/static/card_template/" + filename, function(data) {
    return data;
  });
  return html;
}

// Add the place info
async function addPlaceCard(place, target_id) {
  const card = await getCardTemplate("result_place_card.html");
  let template = $.parseHTML(card);
  $(template)
    .find("#place_name")
    .text(place.name);
  window.place_name = place.name;
  $(template)
    .find("#place_building")
    .text("@ " + place.building);
  window.place_building = place.building;
  $(template)
    .find("#google_id")
    .text(place.google_id);
  window.google_id = place.google_id;
  $(template)
    .find("#place_img")
    .attr("src", place.image_url);
  $(template)
    .find("#hasTable")
    .html(
      place.hasTable
        ? `<i class="fa fa-check-square" aria-hidden="true"></i>`
        : `<i class="fa fa-minus-square" aria-hidden="true"></i>`
    );
  $(template)
    .find("#hasWifi")
    .html(
      place.hasWifi
        ? `<i class="fa fa-check-square" aria-hidden="true"></i>`
        : `<i class="fa fa-minus-square" aria-hidden="true"></i>`
    );
  $(template)
    .find("#capacity")
    .html(place.capacity);
  $(template)
    .find("#hasMicrowave")
    .html(
      place.hasMicrowave
        ? `<i class="fa fa-check-square" aria-hidden="true"></i>`
        : `<i class="fa fa-minus-square" aria-hidden="true"></i>`
    );
  $(template)
    .find("#hasSocket")
    .html(
      place.hasSocket
        ? `<i class="fa fa-check-square" aria-hidden="true"></i>`
        : `<i class="fa fa-minus-square" aria-hidden="true"></i>`
    );
  $(template)
    .find("#hasFood")
    .html(
      place.hasFood
        ? `<i class="fa fa-check-square" aria-hidden="true"></i>`
        : `<i class="fa fa-minus-square" aria-hidden="true"></i>`
    );
  $(template)
    .find("#hasCoffee")
    .html(
      place.hasCoffee
        ? `<i class="fa fa-check-square" aria-hidden="true"></i>`
        : `<i class="fa fa-minus-square" aria-hidden="true"></i>`
    );
  $(template)
    .find("#noEating")
    .html(
      place.noEating
        ? `<i class="fa fa-check-square" aria-hidden="true"></i>`
        : `<i class="fa fa-minus-square" aria-hidden="true"></i>`
    );
  $(template)
    .find("#hasComputer")
    .html(
      place.hasComputer
        ? `<i class="fa fa-check-square" aria-hidden="true"></i>`
        : `<i class="fa fa-minus-square" aria-hidden="true"></i>`
    );
  // $(template)
  //   .find("#permission")
  //   .text(place.permission === null ? "Not required." : place.permission);

  // For rating
  let starPercentage = (place.rate / 5) * 100;
  let starPercentageRounded = `${Math.round(starPercentage / 10) * 10}%`;
  $(template)
    .find(".stars-inner")
    .css("width", starPercentageRounded);
  // Add mini map
  initDirectionMap(template, target_id);

  // Add place info to the corresponding html div
  target_ids = ["#place1", "#place2", "#place3"];
  target_ids.forEach(id => {
    if ($(id).length !== 0) {
      $(id + "_card").empty();
      if (id === target_id) {
        $(id + "_card").append(template);
      }
    }
  });
}

// Initialize and add the map
async function initMap() {
  // The location of Glasgow University
  if ($("#place1").length !== 0) {
    var startLocation = {
      lat: parseFloat($("#place1").data().latitude),
      lng: parseFloat($("#place1").data().longitude)
    };
  } else {
    var startLocation = {
      lat: parseFloat($("#start").data().latitude),
      lng: parseFloat($("#start").data().longitude)
    };
  }

  // The map, centered at Glasgow University
  var map = new google.maps.Map(document.getElementById("map"), {
    zoom: 16,
    center: startLocation
  });

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function(position) {
        lat = position.coords.latitude;
        lng = position.coords.longitude;
        var pos = { lat, lng };
        $("#current_location").attr("data-lat", lat);
        $("#current_location").attr("data-lng", lng);

        // Fill current location
        fillLocation(pos);

        // Show the option of current location only when Google API can get the current location
        showCurrentLocation();
      },
      function() {
        handleLocationError(true, infoWindow, map.getCenter());
      }
    );
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }

  // Add markers of each result place
  place_targets = ["#place1", "#place2", "#place3"];
  place_targets.forEach(place_target => {
    if ($(place_target).length !== 0) {
      var marker = new google.maps.Marker({
        map,
        title: $(place_target).data().name,
        position: {
          lat: parseFloat($(place_target).data().latitude),
          lng: parseFloat($(place_target).data().longitude)
        }
      });

      // Add onClick event to show info window of each place
      marker.addListener("click", () => {
        if (infowindow) {
          infowindow.close();
        }
        var contentString =
          "<div>" +
          $(place_target).data().name +
          "</div>" +
          "<div>" +
          "@ " +
          $(place_target).data().building +
          "</div>";
        infowindow = new google.maps.InfoWindow({
          content: contentString
        });
        infowindow.open(map, marker);
      });
    }
  });
}

// onClick event for place1
async function initMapPlace1() {
  if ($("#place1").length !== 0) {
    place = await getPlace($("#place1").data(), window.CSRF_TOKEN);
    addPlaceCard(place, "#place1");
  }
}

// onClick event for place2
async function initMapPlace2() {
  if ($("#place2").length !== 0) {
    place = await getPlace($("#place2").data(), window.CSRF_TOKEN);
    addPlaceCard(place, "#place2");
  }
}

// onClick event for place2
async function initMapPlace3() {
  if ($("#place3").length !== 0) {
    place = await getPlace($("#place3").data(), window.CSRF_TOKEN);
    addPlaceCard(place, "#place3");
  }
}

// Fill latitude and longitude of current location into form
function fillLocation({ lat, lng }) {
  $("#id_latitude").val(lat);
  $("#id_longitude").val(lng);
}

// Initialize map for the route from start location to the chosen place
function initDirectionMap(template, target_id) {
  $("#google_map").prop("hidden", "hidden");

  var directionsService = new google.maps.DirectionsService();
  var directionsRenderer = new google.maps.DirectionsRenderer();

  var startLocation = {
    lat: parseFloat($("#start").data().latitude),
    lng: parseFloat($("#start").data().longitude)
  };

  // The map, centered at Glasgow University
  var map = new google.maps.Map(
    $(template)
      .find("#mini_map")
      .get(0),
    {
      zoom: 16,
      center: startLocation
    }
  );
  directionsRenderer.setMap(map);
  calculateAndDisplayRoute(target_id, directionsService, directionsRenderer);
}

// Calculate route from Google Directions API
function calculateAndDisplayRoute(
  target_id,
  directionsService,
  directionsRenderer
) {
  directionsService.route(
    {
      origin: {
        lat: parseFloat($("#start").data().latitude),
        lng: parseFloat($("#start").data().longitude)
      },
      destination: {
        lat: parseFloat($(target_id).data().latitude),
        lng: parseFloat($(target_id).data().longitude)
      },
      travelMode: "WALKING"
    },
    function(response, status) {
      if (status === "OK") {
        directionsRenderer.setDirections(response);
      } else {
        window.alert("Directions request failed due to " + status);
      }
    }
  );
}

// Handle error (written by Google https://developers.google.com/maps/documentation/javascript/geolocation)
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
  hideCurrentLocation();
}

// Hide the option of current location
function hideCurrentLocation() {
  $("#current_location")
    .prop("hidden", true)
    .prop("disabled", true)
    .val("");
}

// Show the option of current location
function showCurrentLocation() {
  $("#current_location")
    .prop("hidden", false)
    .prop("disabled", false)
    .val("current_location");
}

$(document).ready(function() {
  // Add click event to the choice/filter button
  const idArray = [
    "hasTable",
    "hasWifi",
    "hasMicrowave",
    "hasSocket",
    "hasFood",
    "noEating",
    "hasCoffee",
    "hasComputer"
  ];
  idArray.forEach(id => {
    $("#id_" + id).val("None");
    $("#" + id).click(function() {
      let data = $("#id_" + id).val();
      if (data === "None") {
        $("#id_" + id).val("True");
        $(this)
          .removeClass("btn-light")
          .addClass("btn-primary");
      } else {
        $("#id_" + id).val("None");
        $(this)
          .removeClass("btn-primary")
          .addClass("btn-light");
      }
    });
  });

  // Add onClick event to each place to let user add places to favorite
  const place_ids = ["#place1", "#place2", "#place3"];
  place_ids.forEach(place_id => {
    if ($(place_id).length !== 0) {
      $(place_id + "_favorite").click(e => {
        add_favorite(e, $(place_id).data(), window.CSRF_TOKEN);
      });
    }
  });

  // If location info of dropdown choice changes, change the latitude and longitude value in the form
  $("select#location").change(function() {
    if (
      $(this)
        .children("option:selected")
        .val() === "current_location"
    ) {
      initMap();
    }
    let dataset = $(this)
      .children("option:selected")
      .data();
    $("#id_latitude").val(dataset.lat);
    $("#id_longitude").val(dataset.lng);
  });

  insert_stars();
});

// Convert 5 stars rating to percentage to each places
function insert_stars() {
  target_ids = ["#place1", "#place2", "#place3"];
  target_ids.forEach(id => {
    if ($(id).length !== 0) {
      let data = $(id).data();
      let starPercentage = (data.rate / 5) * 100;
      let starPercentageRounded = `${Math.round(starPercentage / 10) * 10}%`;
      $(id)
        .find(".stars-inner")
        .css("width", starPercentageRounded);
    }
  });
}

// POST request to /favorite/ to add/remove favorite to the place
async function add_favorite(event, { placeId }, csrfmiddlewaretoken) {
  await $.ajax({
    type: "POST",
    url: "/favorite/",
    data: {
      csrfmiddlewaretoken,
      placeId
    },
    success: data => {
      // console.log(data);
    },
    dataType: "json"
  });

  // Reverse the heart iconfont after clicking
  if (event.target.classList.contains("fa-heart")) {
    $(event.target)
      .removeClass("fa-heart")
      .addClass("fa-heart-o");
  } else {
    $(event.target)
      .removeClass("fa-heart-o")
      .addClass("fa-heart");
  }
}
