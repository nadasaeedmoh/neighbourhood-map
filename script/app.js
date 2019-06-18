$('.fas').click(function () {
    'use strict';
    $('.filter').toggleClass('change_filter');
    $('#map').toggleClass('change_map');
    $('#filter_icon').toggleClass('change_fas');
});

var map;
var markers = [];
/*initial places*/
var places = [
        {name: 'Baron Empain Palace', lat: 30.08671339999999, lng: 31.33025900000007, type: 'Ancient Palace', address: 'El-Orouba, El-Montaza, Heliopolis, Cairo Governorate' },
        {name: 'Cairo Festival City', lat: 30.0319579, lng: 31.408473100000037, type: 'shopping and Resturants Area', address: 'Cairo Governorate'},
        {name: 'Abdeen Palace Museum', lat: 30.047530, lng: 31.248275, type: 'Museum', address: 'El-Gomhoreya Square, Rahbet Abdin, Abdeen, Cairo Governorate'},
        {name: 'Mosque of Muhammad Ali', lat: 30.0287015, lng: 31.259910600000012, type: 'Ancient Mosque', address: 'Al Abageyah, Qism El-Khalifa, Cairo Governorate'},
        {name: 'Al-Azhar Park', lat: 30.040206, lng: 31.265581, type: 'Garden', address: 'Salah Salem St, El-Darb El-Ahmar, Cairo Governorate'}
    ];

var InfoWindow;
var bounds;

var marker;
///*bind the place to the view*/
var viewModel = function() {
    var self = this;
    self.filterMarker = ko.observable();
    self.markplaces = ko.observableArray(places);
    
    self.query = ko.observable('');
    var filterResult;
      /* The computed observable responsible for filtering the list from https://www.codeproject.com/Articles/822879/Searching-filtering-and-sorting-with-KnockoutJS-in.*/
    self.filteredLocations = ko.computed(function () {
        if (!self.query()) {
            filterResult = self.markplaces();
        } else {
            filterResult = ko.utils.arrayFilter(self.markplaces(), function (place) {
                return (
                    (self.query().length === 0 || place.name.toLowerCase().indexOf(self.query().toLowerCase()) > -1)
                );
            });
        }
        
        self.filterMarker(filterResult);
        return filterResult;
    });
    
    /*show markers according o filtered input search*/
     self.filterMarker = function (filteredPlacesArray){
        for(let j=0; j<markers.length; j++){
            markers[j].setMap(null);
        }
        
        for(let i =0; i<filteredPlacesArray.length; i++){
            for(let j=0; j<markers.length; j++){
            if(filteredPlacesArray[i].name === markers[j].title){
                markers[j].setMap(map);
            }
                }
        }
        
    };
     /*show the window info when click on a place from the list*/
     self.windowInfo = function(location){
         for(let i=0; i<markers.length; i++){
             if(location.name === markers[i].title){
                 setMarker(markers[i]);
             }
         }
     };
};
    

 ko.applyBindings(new viewModel());   



/* function to set marker for the places and their info window*/
var setMarker = function (marker) {
    'use strict';
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        for (var i = 0; i < markers.length; i++) {
            var mark = markers[i];
            if (mark.getAnimation() !== null) {
                mark.setAnimation(null);
            }
        }
    }
        
    marker.setAnimation(google.maps.Animation.BOUNCE);
    
    var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';
    var wikiRequestTimeout = setTimeout(function() {
        InfoWindow.setContent("failed to get wikipedia resources"); }, 800);
    $.ajax({
        url: wikiUrl,
        dataType: 'jsonp'
    }).done(function(response) {
        var articleList = response[1];
        for (var i = 0; i < articleList.length; i++) {
            var article = articleList[i];
            var url = 'https://www.wikipedia.org/wiki/' + article;
            InfoWindow.setContent('<div><h2 style= " color:#C70039;">' + marker.title + '</h2><p style="color: #002447; font-weight:bold;">' +places[marker.id].type+'</p><p style=" color:#002447; font-weight:bold">'+places[mark.id].address+'</p><p>Wiki Info: <a href="' + url + '">' + article + '</a></p></div>');
        }
        clearTimeout(wikiRequestTimeout);
		});
    InfoWindow.open(map, marker);
    InfoWindow.addListener('closeclick', function() {
        InfoWindow.close();
        marker.setAnimation(null);
			});
    InfoWindow.setContent(marker.title);
    InfoWindow.open(map,marker);
    };

var bindMark = function (marker, i) {
     return setMarker.bind(setMarker, marker);
    };

/*Map details initalization function*/
function initMap() {
    var attr = {lat: 30.051447, lng: 31.236832};
    map = new google.maps.Map(document.getElementById('map'), {
        center: attr,
        zoom: 12,
        mapTypeId: 'roadmap',
        mapTypeControl: false
    });

    InfoWindow = new google.maps.InfoWindow();
    bounds = new google.maps.LatLngBounds();
    
    for(var i =0; i<places.length; i++) {
		// define the marker
         marker = new google.maps.Marker({
            map: map,
			position: new google.maps.LatLng(places[i].lat, places[i].lng),
			title: places[i].name,
			animation: google.maps.Animation.DROP,
            id: i
        }); 
        
        markers.push(marker);
        
        google.maps.event.addListener(marker, 'click', bindMark(marker, i));
        
    }
    }
/*function to handle scripts fail*/
function googleError(){
    alert('Error, the script fails to load');
}