// Cloudflare Pages Function — becomes available at /weather
// env.OPENWEATHER_API_KEY is set in Cloudflare Pages > Settings > Environment variables

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const city = url.searchParams.get('city');

  if (!city) {
    return new Response(JSON.stringify({ error: "Missing 'city' query parameter" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Server is missing OPENWEATHER_API_KEY' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&units=metric&appid=${apiKey}`;

  try {
    const response = await fetch(weatherUrl);
    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.message || 'Weather API error' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const safePayload = {
      name: data.name,
      country: data.sys && data.sys.country,
      temp: data.main && data.main.temp,
      description: data.weather && data.weather[0] && data.weather[0].description,
    };

    return new Response(JSON.stringify(safePayload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch weather data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
