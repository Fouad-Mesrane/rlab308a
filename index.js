import * as Carousel from "./Carousel.js";
import axios from "axios";

// setting default baseURL and api key
axios.defaults.baseURL = "https://api.thecatapi.com/v1";
axios.defaults.headers.common["x-api-key"] =
  "live_60fIwrvsfSd3CMqMLwStuWIS8ZuSbOG5TZk37un2sEFuwR7nKXMvQKXMC9kjzfLd";
// The breed selection input element.
const body = document.querySelector('body')
const breedSelect = document.getElementById("breedSelect");
// The information section div element.
const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progressBar = document.getElementById("progressBar");
// The get favourites button element.
const getFavouritesBtn = document.getElementById("getFavouritesBtn");

// Step 0: Store your API key here for reference and easy access.
const API_KEY =
  "live_60fIwrvsfSd3CMqMLwStuWIS8ZuSbOG5TZk37un2sEFuwR7nKXMvQKXMC9kjzfLd";

/**
 * 1. Create an async function "initialLoad" that does the following:
 * - Retrieve a list of breeds from the cat API using fetch().
 * - Create new <options> for each of these breeds, and append them to breedSelect.
 *  - Each option should have a value attribute equal to the id of the breed.
 *  - Each option should display text equal to the name of the breed.
 * This function should execute immediately.
 */

async function initialLoad() {
  try {
    const breedsData = await axios.get("/breeds?limit=10&page=0");

    breedsData.data.forEach((element) => {
      const option = document.createElement("option");
      option.textContent = element.name;
      option.value = element.id;
      breedSelect.append(option);
    });
  } catch (error) {
    console.error("Error fetching breed data", error);
  }
}

initialLoad();

/**
 * 2. Create an event handler for breedSelect that does the following:
 * - Retrieve information on the selected breed from the cat API using fetch().
 *  - Make sure your request is receiving multiple array items!
 *  - Check the API documentation if you're only getting a single object.
 * - For each object in the response array, create a new element for the carousel.
 *  - Append each of these new elements to the carousel.
 * - Use the other data you have been given to create an informational section within the infoDump element.
 *  - Be creative with how you create DOM elements and HTML.
 *  - Feel free to edit index.html and styles.css to suit your needs, but be careful!
 *  - Remember that functionality comes first, but user experience and design are important.
 * - Each new selection should clear, re-populate, and restart the Carousel.
 * - Add a call to this function to the end of your initialLoad function above to create the initial carousel.
 */

breedSelect.addEventListener("change", getBreedData);

async function getBreedData() {
  Carousel.clear();
  infoDump.textContent = "";
  const breed_id = breedSelect.value;

  if (breed_id === "default") {
    progressBar.style.width = `0%`;
    return; // Exit the function early, no request made
  }

  // geting the images data
  try {
    const imagesData = await axios.get(
      `/images/search?limit=10&breed_ids=${breed_id}`,
      {
        onDownloadProgress: updateProgress,
      }
    );

    imagesData.data.forEach((image) => {
      const element = Carousel.createCarouselItem(
        image.url,
        breed_id,
        image.id
      );

      Carousel.appendCarousel(element);
    });

    Carousel.start();

    const breedObj = imagesData.data[0].breeds[0];

    // adding elements to infoDump

    const breed = document.createElement("h2");
    const origins = document.createElement("p");
    const description = document.createElement("p");
    breed.textContent = `Breed : ${breedObj.name}`;
    origins.textContent = `Origin : ${breedObj.origin}`;
    description.textContent = breedObj.description;

    infoDump.appendChild(breed);
    infoDump.appendChild(origins);
    infoDump.appendChild(description);
  } catch (error) {
    console.error("Error fetching breed data", error);
  }
}

/**


/**
 * 5 / 6 / 7
 */

axios.interceptors.request.use((request) => {
  if (breedSelect.value === "default") {
    return;
  }
  progressBar.style.width = "0%";
  body.style.cursor = 'progress'
  console.log("begin request");
  request.metadata = {};
  request.metadata.startTime = new Date().getTime();

  return request;
});

axios.interceptors.response.use((response) => {
  response.config.metadata.endTime = new Date().getTime();
  body.style.cursor = 'default'

  console.log(
    `Request ended and it took ${
      response.config.metadata.endTime - response.config.metadata.startTime
    } ms`
  );
  return response;
});



function updateProgress(event) {
  const percentComplete = (event.loaded / event.total) * 100;
  progressBar.style.width = `${percentComplete}%`;
}


/**
 * 8. To practice posting data, we'll create a system to "favourite" certain images.
 * - The skeleton of this function has already been created for you.
 * - This function is used within Carousel.js to add the event listener as items are created.
 *  - This is why we use the export keyword for this function.
 * - Post to the cat API's favourites endpoint with the given ID.
 * - The API documentation gives examples of this functionality using fetch(); use Axios!
 * - Add additional logic to this function such that if the image is already favourited,
 *   you delete that favourite using the API, giving this function "toggle" functionality.
 * - You can call this function by clicking on the heart at the top right of any image.
 */
export async function favourite(imgId) {
  try {
    // Check if the image is already in the favourites
    const favData = await axios.get('/favourites', {
      params: { image_id: imgId },
    });


    if (favData.data.length > 0) {

      console.log(favData.data)
      const favItemId = favData.data[0].id;
      const deletedFav = await axios.delete(`/favourites/${favItemId}`);
      console.log(deletedFav.data, "this is deleted");
    } else {
      // If the image is not in the favourites, add it
      const addedFav = await axios.post("/favourites", {
        image_id: imgId
      });
      console.log(addedFav.data, "this is added to favourites");
    }
  } catch (error) {
    console.error('Error toggling favourite status', error);
  }
}


/**
 * 9. Test your favourite() function by creating a getFavourites() function.
 * - Use Axios to get all of your favourites from the cat API.
 * - Clear the carousel and display your favourites when the button is clicked.
 *  - You will have to bind this event listener to getFavouritesBtn yourself.
 *  - Hint: you already have all of the logic built for building a carousel.
 *    If that isn't in its own function, maybe it should be so you don't have to
 *    repeat yourself in this section.
 */
async function favorites() {
  Carousel.clear()
  infoDump.textContent = ""
    const favdata = await axios.get("https://api.thecatapi.com/v1/favourites");
    favdata.data.map(image => {
const url = image.image.url
     const element =  Carousel.createCarouselItem(url)
      Carousel.appendCarousel(element)
    })

}

getFavouritesBtn.addEventListener('click', favorites)
/**
 * 10. Test your site, thoroughly!
 * - What happens when you try to load the Malayan breed?
 *  - If this is working, good job! If not, look for the reason why and fix it!
 * - Test other breeds as well. Not every breed has the same data available, so
 *   your code should account for this.
 */