import React, { useState, useEffect } from "react";
import './App.css';
import { MenuItem, FormControl, Select, Card, CardContent} from '@material-ui/core';
import Infobox from './Infobox';
import Map from './Map';
import Table from './Table';
import { prettyPrintStat, sortData } from './util';
import Linegraph from './Linegraph';
import numeral from 'numeral';
import 'leaflet/dist/leaflet.css';

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setInputCountry] = useState('Worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState('cases');

  
  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
    .then(response => response.json())
    .then(data => {
      setCountryInfo(data);
    });
  }, []);


  useEffect(() => {
    // async -> send a request, wait, do something with the info
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((response) => response.json())
      .then((data) => {
         const countries = data.map((country) => (
           {
             name: country.country,
             value: country.countryInfo.iso2
           }
         ));

         let sortedData = sortData(data);
         setCountries(countries);
         setMapCountries(data);
         setTableData(sortedData);
         
      });
    };

    getCountriesData();
  }, []);

  const onCountryChange = async (e) => {
      const countryCode = e.target.value;
      const url = countryCode === `Worldwide` ? `https:/disease.sh/v3/covid-19/all` :
       `https://disease.sh/v3/covid-19/countries/${countryCode}`;

      await fetch(url)
      .then((response) => response.json())
      .then((data) => {
          setInputCountry(countryCode);
          setCountryInfo(data);
          const mapObj = countryCode === "Worldwide" ? { lat: 34.80746, lng: -40.4796 } : { lat: data.countryInfo.lat, lng: data.countryInfo.long };
          setMapCenter(mapObj);
          setMapZoom(4);
      });
  };


  return (
    <div className= "app">
      <div className = 'app__left'> 
        <div className = 'app__header'>
          <h1>COVID-19 TRACKER</h1>
          <p>By Isaiah Rodriguez</p> 
          <FormControl className = 'app__dropdown'>
            <Select 
              onChange = {onCountryChange}
              variant = 'outlined'
              value = {country}
            >
                <MenuItem value = 'Worldwide'>Worldwide</MenuItem>           
              {countries.map((country) => (
                <MenuItem value = {country.value}>{country.name}</MenuItem>
              ))}

            </Select>
          </FormControl>
        </div>

        <div className = 'app__stats'>
          <Infobox 
            onClick = {(e) => setCasesType('cases')}
            title = 'Coronavirus Cases' 
            isRed
            active = {casesType === 'cases'}
            cases = {prettyPrintStat(countryInfo.todayCases)} 
            total = {numeral(prettyPrintStat(countryInfo.cases)).format('0.0a')}
          />

          <Infobox 
            active = {casesType === 'recovered'}
            onClick = {(e) => setCasesType('recovered')}
            title = 'Recovered' 
            cases = {prettyPrintStat(countryInfo.todayRecovered)} 
            total = {numeral(prettyPrintStat(countryInfo.recovered)).format('0.0a')}
          />

          <Infobox 
            active = {casesType === 'deaths'}
            onClick = {(e) => setCasesType('deaths')}
            title = 'Deaths' 
            isRed
            cases = {prettyPrintStat(countryInfo.todayDeaths)} 
            total = {numeral(prettyPrintStat(countryInfo.deaths)).format('0.0a')}
          />
        </div>
      
        <Map 
          casesType = {casesType}
          countries = {mapCountries}
          center = {mapCenter}
          zoom = {mapZoom}
        />
      </div> 
      <Card className = 'app__right'>
          <CardContent>
            <h3>Live Cases by Country</h3>
            <Table countries = {tableData} />
            <h3 className = 'app__graphTitle'>Worldwide new {casesType}</h3>
            <Linegraph className = 'app__graph' casesType = {casesType}/>
          </CardContent>
      </Card>

    </div>
  );
}

export default App;
