// The API endpoint from the problem statement
const COUNTRY_API_URL = 'https://restcountries.com/v3.1/all?fields=name,currencies';

/**
 * Fetches the list of countries, sorts them alphabetically, and populates the signup dropdown.
 * This is called when the user switches to the Signup form.
 */
async function populateCountriesDropdown() {
  const countrySelect = document.getElementById('signup-country');

  // Check if the dropdown is already populated to avoid unnecessary reloads
  // We check for length > 1 because the HTML already includes one disabled "Select..." option.
  if (countrySelect.options.length > 1) {
    return; // Already done
  }

  try {
    // 1. Fetch data from the API
    const response = await fetch(COUNTRY_API_URL);

    if (!response.ok) {
      throw new Error('Failed to fetch country data');
    }

    const countries = await response.json();

    // 2. Sort the array of countries alphabetically by common name (UX best practice)
    countries.sort((a, b) => a.name.common.localeCompare(b.name.common));

    // 3. Populate the dropdown with the sorted list
    countries.forEach(country => {
      const option = document.createElement('option');
      option.textContent = country.name.common;

      // Extract the currency code (the key of the 'currencies' object)
      const currencyCode = Object.keys(country.currencies)[0];
      option.value = currencyCode;

      countrySelect.appendChild(option);
    });

  } catch (error) {
    console.error("Error loading countries for signup:", error);
    // Display an error message directly in the dropdown if the API fails
    countrySelect.innerHTML = `<option value="" disabled selected>Error loading countries!</option>`;
  }
}
