const axios = require("axios");
const fs = require("fs");
const path = require("path");

console.log("Fetching exchange rates...");
async function fetchAndSaveExchangeRates() {
  const apiKey = "66a319bb504bae163d286db3a8b807da"; // Replace with your actual API key
  const urls = {
    historical: `https://api.exchangeratesapi.io/2014-01-01?access_key=${apiKey}`,
    current: `https://api.exchangeratesapi.io/latest?access_key=${apiKey}`,
  };

  try {
    const [historicalRates, currentRates] = await Promise.all([
      axios.get(urls.historical),
      axios.get(urls.current),
    ]);

    // Convert historical rates to USD as base
    const convertedHistoricalRates = convertRatesToUSD(
      historicalRates.data.rates,
      historicalEURtoUSD
    );
    const currentEURtoUSD = 1 / currentRates.data.rates.USD; // Convert using the latest EUR to USD rate

    const data = {
      historical: {
        date: historicalRates.data.date,
        base: "USD",
        rates: convertedHistoricalRates,
      },
      current: {
        date: currentRates.data.date,
        base: "USD",
        rates: convertRatesToUSD(currentRates.data.rates, currentEURtoUSD),
      },
    };

    fs.writeFileSync(
      path.join(__dirname, "exchangeRatesData.json"),
      JSON.stringify(data, null, 2),
      "utf-8"
    );
    console.log("Exchange rates data saved successfully.");
  } catch (error) {
    console.error("Failed to fetch and save exchange rates:", error);
  }
}

function convertRatesToUSD(rates, conversionRate) {
  const usdRates = {};
  for (const currency in rates) {
    usdRates[currency] = rates[currency] * conversionRate;
  }
  return usdRates;
}

fetchAndSaveExchangeRates();
