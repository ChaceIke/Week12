// Here I set up the data class with an constructor for the name, and the favorite city. I'm also recieving the id from the api, so I set it to null initially.
class Data {
    constructor(name, favoriteCity, id = null) {
        this.id = id;
        this.name = name;
        this.favoritecity = favoriteCity;
    }

}

// The cityActions class is where I handle the requests to the api. The DOMManager class calls the methods in this class (which it can do because these methods are static)
class CityActions {
    // The cityActions class first sets up the url to the api.
    static url = 'https://64791901a455e257fa62eaa2.mockapi.io/favoritecities/Cities';

    // The getAllCities method returns every entry from the API.
    static getAllCities() {
        return $.get(this.url);
    }

    // The getCity method returns a specific entry. It takes an id and adds it to the url when sending the get request.
    static getCity(id) {
        return $.get(this.url + `/${id}`);
    }

    // The createCity method sends a POST request to the API. It takes in a data object and gives the full object to the database.
    static createCity(data) {
        return $.post(this.url, data);
    }

    // The updateCity method takes an object and sends a PUT request to the API. It specifies the data's id for the url and stringify's the object that it's sending since that's what the
    // API accepts.
    // If it successfully updates the entry, then the console logs a success string as well as whatever response the server sends back.
    // If it fails, it prints a bunch of info to the console as to why.
    static updateCity(data) {
        console.log('updateCity function called with data: ', data);
        return $.ajax({
            url: this.url + `/${data.id}`,
            dataType: 'json',
            data: JSON.stringify(data),
            contentType: 'application/json',
            type: 'PUT',        
        }).done(function(data) {
            console.log('Success', data);
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.log('HTTP Request Failed', jqXHR, textStatus, errorThrown);
        });
    }

    // The deleteCity method takes an object id and sends a DELETE request to the API.
    static deleteCity(id) {
        return $.ajax({
            url: this.url + `/${id}`,
            type: 'DELETE'
        });
    }
    
}

// The DOMManager class is for updating the side of the application that the user sees.
class DOMManager {
    static datas;

    // The getAllCitiesDOM calls the getAllCities method from the cityActions class, and then calls the render function (initialized below) and passes in the data it recieved.
    static getAllCitiesDOM() {
        CityActions.getAllCities().then(datas => this.render(datas));
    }

    // The createCityDOM takes a name and a favorite city and creates a new Data class and sends it to the createCity method from the CityActions class.
    // If that works, it calls the getAllCities method. And if that works, it renders all of the cities it recieved.
    static createCityDOM(name, favoriteCity) {
        CityActions.createCity(new Data(name, favoriteCity))
            .then(() => {
                return CityActions.getAllCities();
            })
            .then((cities) => this.render(cities));
    }

    // The deleteCityDOM takes an id and calls the deleteCity method with that id. If that works, it calls the getAllCities method and renders the pages with the outcome.
    static deleteCityDOM(id) {
        CityActions.deleteCity(id)
        .then(() => {
            return CityActions.getAllCities();
        })
        .then((datas) => this.render(datas));
    }

    // The updateCityDOM appears when a user selects the update button which is set up in the render method with each entry in the table.
    // It is a form that has an input for both a name and a favorite city as well as a submit button.
    // When the submit button is clicked, it prevents the page from loading.
    // It then sets up variables to store the input values
    // If both variables are storing something, it calls the updateCity method and passes in a new class to replace the old one.
    // If that works, getAllCities is called and the application is rendered with the new update included.
    static updateCityDOM(id) {
        $('#update-form').prepend(
            `<div>
                <label for="update-name" class="text text-danger">Update Name</label>
                <input type="text" class="form-control" placeholder="New Name" id="update-name">
            </div>
            <div>
                <label for="update-city-name" class="text text-danger">Update City</label>
                <input type="text" class="form-control" placeholder="New City Name" id="update-city-name">
            </div>
            <button type="submit" class="btn btn-primary" id="update-button">Submit</button>
            <br>
            `
        )
        $('#update-button').click((event) => {
            event.preventDefault();
            let newName = $('#update-name').val();
            let newCityName = $('#update-city-name').val();
            if (newName && newCityName) {
                CityActions.updateCity(new Data(newName, newCityName, id))
                .then(() => {
                    return CityActions.getAllCities();
                })
                .then((datas) => {
                    this.render(datas);
                    $('#update-form').remove();
                });
            }

        })
    }

    // The render method takes in the data it recieves and empties the area where it will place new rows.
    // Then for each entry within all of the entries it will prepend a new row with the corresponding information and buttons needed.
    static render(datas) {
        this.datas = datas;
        $('#new-rows-here').empty();
        for (let data of datas) {
            $('#new-rows-here').prepend(
                `<tr>
                    <td>${data.name}</td>
                    <td>${data.favoritecity}</td>
                    <td><button class='btn btn-primary' onclick="DOMManager.updateCityDOM('${data.id}')">Update</button></td>
                    <td><button class='btn btn-danger' onclick="DOMManager.deleteCityDOM('${data.id}')">Delete</button></td>
                </tr>
                `
            );
        }
    }
}

// When the form is submitted, the createCityDOM is called and the input values are reset.
$('#form-button').click(() => {
    DOMManager.createCityDOM($('#name').val(), $('#city-name').val());
    $('#name').val('');
    $('#city-name').val('');
})

// Finally, to start the application, the getAllCitiesDOM method is called which also calls the getAllCities method to request the entries.
DOMManager.getAllCitiesDOM();