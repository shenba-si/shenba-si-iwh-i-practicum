const express = require('express');
const axios = require('axios');
const app = express();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// * Please DO NOT INCLUDE the private app access token in your repo. Don't do this practicum in your normal account.
const PRIVATE_APP_ACCESS = '';
const OBJECT_TYPE = '2-170694834';

// TODO: ROUTE 1 - Create a new app.get route for the homepage to call your custom object data. Pass this data along to the front-end and create a new pug template in the views folder.

app.get("/", async (req, res) => {
  const url = `https://api.hubapi.com/crm/v3/objects/${OBJECT_TYPE}?properties=name,type,age`;

  const headers = {
    Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.get(url, { headers });
    const customObjects = response.data.results;

    res.render("homepage", {
      title: "Custom Objects | HubSpot Practicum",
      data: customObjects,
    });
  } catch (error) {
    console.error(
      "Error fetching custom objects:",
      error.response?.data || error.message
    );
    res.status(500).send("Error loading custom object data.");
  }
});

// TODO: ROUTE 2 - Create a new app.get route for the form to create or update new custom object data. Send this data along in the next route.

app.get("/update-cobj", async (req, res) => {
  const { id } = req.query;

  const headers = {
    Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
    "Content-Type": "application/json",
  };

  if (id) {
    try {
      const url = `https://api.hubapi.com/crm/v3/objects/${OBJECT_TYPE}/${id}?properties=name,type,age`;
      const response = await axios.get(url, { headers });

      const record = response.data;

      res.render("updates", {
        title: "Update Custom Object Form | Integrating With HubSpot I Practicum",
        data: {
          id: record.id,
          name: record.properties.name,
          type: record.properties.type,
          age: record.properties.age,
        },
      });
    } catch (error) {
      console.error(
        "Error fetching object:",
        error.response?.data || error.message
      );
      return res.status(500).send("Error loading object for editing.");
    }
  } else {
    res.render("updates", {
      title: "Create Custom Object | HubSpot Practicum",
      data: {},
    });
  }
});

// TODO: ROUTE 3 - Create a new app.post route for the custom objects form to create or update your custom object data. Once executed, redirect the user to the homepage.

app.post("/update-cobj", async (req, res) => {
  const { id, name, type, age } = req.body;

  const headers = {
    Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
    "Content-Type": "application/json",
  };

  const payload = {
    properties: {
      name: name,
      type: type,
      age: age,
    },
  };

  try {
    if (id) {
      // PATCH → update
      const url = `https://api.hubapi.com/crm/v3/objects/${OBJECT_TYPE}/${id}`;
      await axios.patch(url, payload, { headers });
    } else {
      // POST → create
      const url = `https://api.hubapi.com/crm/v3/objects/${OBJECT_TYPE}`;
      await axios.post(url, payload, { headers });
    }

    res.redirect("/");
  } catch (error) {
    console.error(
      "Failed to create/update record:",
      error.response?.data || error.message
    );
    res.status(500).send("Something went wrong.");
  }
});

// * Localhost
app.listen(3000, () => console.log("Listening on http://localhost:3000"));
