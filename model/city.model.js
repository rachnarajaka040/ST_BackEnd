const mongoose = require("mongoose");

const cityData = mongoose.model(
  "cityData",
  new mongoose.Schema(
    {
      id: { type: String },
      code: { type: String },
      AirportCode: { type: String },
      name: { type: String },
      CityCode: { type: String },
      CountryCode: { type: String },
    },
    {
      timestamps: true,
    }
  )
);

const cityBusData = mongoose.model(
  "cityBusData",
  new mongoose.Schema({
    CityId: { type: String, required: true },
    CityName: { type: String, required: true },
  })
);

const newhotelCityCode = mongoose.model(
  "newhotelCityCode",
  new mongoose.Schema({
    cityid: { type: String },
    Destination: { type: String },
    stateprovince: { type: String },
    StateProvinceCode: { type: String },
    country: { type: String },
    countrycode: { type: String },
  })
);
module.exports = { cityData, cityBusData, newhotelCityCode };
