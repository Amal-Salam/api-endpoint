const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;
const dotenv = require('dotenv');
dotenv.config();

app.get('/api/hello', async (req, res) => {
  const name = req.query.visitor_name;
  try {
    // Extracts location information based on the Ip address presented by router
    let clientIp;
    if (req.headers['x-forwarded-for']) {
      clientIp = req.headers['x-forwarded-for'].split(',')[0];
    } else {
      clientIp = req.socket.remoteAddress;
    }
    if (clientIp === '::1' || clientIp === '127.0.0.1') {
      clientIp = '8.8.4.4'; 
    }
    
   const token=process.env.TOKEN;
    const locationResponse = await axios.get(
      `https://ipinfo.io/${clientIp}/json?token=${token}`
    );
    
    const cityLocation=locationResponse.data;
    const city = cityLocation.city || 'unknown' ;
 
    const weatherApiKey = process.env.WEATHER_API_KEY;
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${weatherApiKey}`
    );
    const cityTemp = weatherResponse.data.main.temp;

    res.json({
      client_ip: `${clientIp}`,
      location: city,
      greeting: `Hello, ${name}!, the temperature is ${cityTemp} degrees Celcius in ${city}`,
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
