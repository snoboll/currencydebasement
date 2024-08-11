<template>
  <div v-if="loading">Loading currency data...</div>
  <div v-else-if="error">Error fetching currency data: {{ error }}</div>
  <div v-else>
    <select v-model="selectedCurrency" @change="updateMapData">
      <option v-for="(rate, code) in currentRates" :key="code" :value="code">
        {{ code }}
      </option>
    </select>
    <MapChart
      :countryData="countryData"
      highColor="#00ff00"
      lowColor="#ff0000"
      countryStrokeColor="#909090"
      defaultCountryFillColor="#dadada"
    />
  </div>
</template>

<script>
import axios from "axios";
import MapChart from "vue-map-chart";

export default {
  components: {
    MapChart,
  },
  name: "CurrencyMap",
  data() {
    return {
      countryData: {},
      loading: true,
      error: null,
      currentRates: {},
      historicalRates: {},
      countryCodes: [],
      currencyCodes: [],
      selectedCurrency: "USD", // Default selected currency
    };
  },
  async mounted() {
    await this.loadData();
  },
  methods: {
    async loadData() {
      try {
        const [currencyRates, countryCodes, currencyCodes] = await Promise.all([
          axios.get("/exchangeRatesData.json"),
          axios.get("/country-by-abbreviation.json"),
          axios.get("/country-by-currency-code.json"),
        ]);
        this.currentRates = currencyRates.data.current.rates;
        this.historicalRates = currencyRates.data.historical.rates;
        this.countryCodes = countryCodes.data;
        this.currencyCodes = currencyCodes.data;
        this.updateMapData();
        this.loading = false;
      } catch (error) {
        console.error("Error loading data:", error);
        this.error = error.message;
        this.loading = false;
      }
    },
    updateMapData() {
      this.countryData = this.processCurrencyData(
        this.historicalRates,
        this.currentRates,
        this.countryCodes,
        this.currencyCodes
      );
      console.log("countryData", this.countryData);
    },
    processCurrencyData(
      historicalRates,
      currentRates,
      countryCodes,
      currencyCodes
    ) {
      let currencyToCountryMap = {};
      currencyCodes.forEach((code) => {
        const country = countryCodes.find(
          (country) => country.country === code.country
        );
        console.log(code.currency_code, country);
        if (country) {
          console.log("found country", country.abbreviation);
          currencyToCountryMap[code.currency_code] = country.abbreviation;
        }
      });

      let gains = {};
      const selectedHistoricalRate = historicalRates[this.selectedCurrency];
      const selectedCurrentRate = currentRates[this.selectedCurrency];

      // console.log(
      //   "currentrates",
      //   currentRates,
      //   "historicalRates",
      //   historicalRates
      // );
      // log length of currentRates and historicalRates
      // console.log("currentRates", currentRates);

      Object.keys(currentRates).forEach((currencyCode) => {
        const historicalRate = historicalRates[currencyCode];
        const currentRate = currentRates[currencyCode];
        console.log(
          currencyCode,
          historicalRate,
          currentRate,
          selectedHistoricalRate,
          selectedCurrentRate
        );
        if (
          historicalRate &&
          currentRate &&
          selectedHistoricalRate &&
          selectedCurrentRate
        ) {
          console.log("calculating gain for", currencyCode);
          const normalizedHistoricalRate =
            historicalRate / selectedHistoricalRate;
          const normalizedCurrentRate = currentRate / selectedCurrentRate;
          const gain = (
            normalizedCurrentRate / normalizedHistoricalRate
          ).toFixed(2);
          if (currencyToCountryMap[currencyCode]) {
            const countryCode = currencyToCountryMap[currencyCode];
            var g = Math.round((100 / gain - 100) * 100) / 100;
            gains[countryCode] = g;
          }
        }
      });
      console.log(currencyToCountryMap);

      console.log("gains", gains);
      return gains;
    },
  },
};
</script>

<style scoped>
/* Add any specific styles for your component here */
</style>
