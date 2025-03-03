import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  FlatList,
  Image,
  ActivityIndicator,
  Modal,
  TouchableOpacity, // Import TouchableOpacity
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// API Key
const API_KEY = "44c1f81da55eda6af9ab0d0cbd2bfe31";

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);

  // Load recent searches from AsyncStorage when the app starts
  useEffect(() => {
    loadRecentSearches();
  }, []);

  // Function to load recent searches from AsyncStorage
  const loadRecentSearches = async () => {
    try {
      const savedSearches = await AsyncStorage.getItem("recentSearches");
      if (savedSearches) {
        setRecentSearches(JSON.parse(savedSearches));
      }
    } catch (error) {
      console.error("Failed to load recent searches:", error);
    }
  };

  // Function to save a city to AsyncStorage
  const saveCityToStorage = async (city) => {
    try {
      const updatedSearches = [city, ...recentSearches.slice(0, 4)]; // Keep only the last 5 searches
      setRecentSearches(updatedSearches);
      await AsyncStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
    } catch (error) {
      console.error("Failed to save recent searches:", error);
    }
  };

  // Function to fetch weather data from the API
  const getWeather = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      setWeather(data);
      setError(null); // Clear any previous errors
      saveCityToStorage(city);
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        setError(new Error(error.response.data.message));
      } else if (error.request) {
        // The request was made but no response was received
        setError(new Error("Network Error"));
      }
        // validiate input if city is empty
     
     
      else {
        // Something happened in setting up the request
        setError(error);
      }
      setWeather(null); // Clear weather data on error
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Function to clear weather data and input
  const clearData = () => {
    setWeather(null);
    setCity("");
    setError(null);
  };

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color="#0000ff" />}

      {/* App Title */}
      <Text style={styles.title}>Weather App</Text>
      <Text style={styles.subtitle}>Enter a city name to get the weather</Text>

      {/* City Input */}
      <TextInput
        style={styles.textInput}
        placeholder="City Name"
        value={city}
        onChangeText={setCity}
        onSubmitEditing={getWeather}
        returnKeyType="search" // Change the return key to "Search"

      />

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <Button onPress={clearData} title="Clear" />
        <Button onPress={getWeather} title="Get Weather" />
        <Button
          onPress={() => setShowRecentSearches(true)}
          title="Recent Searches"
        />
      </View>

      {/* Error Message */}
      {error && <Text style={styles.errorText}>{error.message}</Text>}

      {/* Weather Data */}
      {weather && (
        <View style={styles.weatherContainer}>
          <Text style={styles.cityText}>City: {weather.name}</Text>
          <Text style={styles.temperatureText}>{weather.main.temp}°C</Text>
          <Text style={styles.conditionText}>
            Condition: {weather.weather[0].main}
          </Text>
          <Text style={styles.descriptionText}>
            Description: {weather.weather[0].description}
          </Text>
          <Image
            style={styles.weatherIcon}
            source={{
              uri: `http://openweathermap.org/img/wn/${weather.weather[0].icon}.png`,
            }}
          />
          <Text style={styles.detailText}>
            Humidity: {weather.main.humidity}%
          </Text>
          <Text style={styles.detailText}>
            Wind Speed: {weather.wind.speed} m/s
          </Text>
        </View>
      )}

      {/* Recent Searches Modal */}
      <Modal
        visible={showRecentSearches}
        animationType="slide"
        onRequestClose={() => setShowRecentSearches(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Recent Searches</Text>
          <FlatList
            data={recentSearches}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.recentSearchItem}
                onPress={() => {
                  setCity(item);
                  setShowRecentSearches(false);
                  getWeather();
                }}
              >
                <Text style={styles.recentSearchText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
          <Button
            title="Close"
            onPress={() => setShowRecentSearches(false)}
          />
        </View>
      </Modal>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    width: "100%",
    padding: 10,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    marginBottom: 20,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    marginBottom: 20,
  },
  weatherContainer: {
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cityText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  temperatureText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  conditionText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  weatherIcon: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  detailText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  recentSearchItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  recentSearchText: {
    fontSize: 16,
    color: "#333",
  },
});