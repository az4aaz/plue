/**
 * Fetches the wind data from the API.
 *
 * @returns {Promise} Promise object represents the rain data
 * @async
 */
export async function fetchWindData() {
  try {
    const url =
      "https://api.open-meteo.com/v1/forecast?latitude=48.7326&longitude=-3.4566&hourly=wind_speed_10m&forecast_days=1";
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const windData = await response.json();
    return windData;
  } catch (error) {
    console.error("There was a problem fetching the wind data:", error);
  }
}
