// This runs on Netlify's servers, NOT in the browser.
// process.env.OPENWEATHER_API_KEY is set in the Netlify dashboard
// (Site settings > Environment variables) and is never exposed to visitors.

exports.handler = async function (event) {
  const city = event.queryStringParameters && event.queryStringParameters.city;

  if (!city) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing 'city' query parameter" }),
    };
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server is missing OPENWEATHER_API_KEY" }),
    };
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&units=metric&appid=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data.message || "Weather API error" }),
      };
    }

    // Only forward the fields the widget actually needs.
    const safePayload = {
      name: data.name,
      country: data.sys && data.sys.country,
      temp: data.main && data.main.temp,
      description: data.weather && data.weather[0] && data.weather[0].description,
    };

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(safePayload),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch weather data" }),
    };
  }
};
