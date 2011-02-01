/* Variables */
var sources = new Array();

/* Init */

$(document).ready(function() {
    $('#error').hide();
    renderContent(getMovieList());
    renderSourcesOptions();
});

/* Movie List */

function getMovieList() {
    movieList = getLocalMovieList();
    if (!movieList) {
        movieList = getDefaultMovieList();
        loadData(getSource());
    } else {
        // Load data only once per day
        movieListDate = getMovieListDate();
		if (movieListDate && (movieListDate != getCurrentDate())) {
            loadData(getSource());
        }
    }
    
    return movieList;
}

function getSource() {
    return (localStorage['best-movies-watchlist.source']) ? localStorage['best-movies-watchlist.source'] : sources[0]['value'];
}

function getLocalMovieList() {
    return (localStorage["best-movies-watchlist.list"]) ? JSON.parse(localStorage["best-movies-watchlist.list"]) : null;
}

function getCurrentDate() {
    var currentTime = new Date();
    var month = currentTime.getMonth() + 1;
    var day = currentTime.getDate();
    var year = currentTime.getFullYear();
    
    return month + "/" + day + "/" + year;
}

function getMovieListDate() {
    return localStorage["best-movies-watchlist.list-date"];
}

function loadData(source) {
    showLoading();
    
    switch (source) {
        case 'www.omdb.org':
            loadDataFromOmdb();
            break;
        case 'www.tmdb.org': 
            loadDataFromTmdb();
            break;
    }
}

function setMovieList(movieList) {
    localStorage["best-movies-watchlist.list-date"] = getCurrentDate();
    localStorage["best-movies-watchlist.list"] = JSON.stringify(movieList);
}

function getDefaultMovieList() {
    movieList = new Array();
    movieList.push({ranking: 1, title: 'The Godfather', url: 'http://www.omdb.org/movie/238', rating: "8.15", year: ''});
    movieList.push({ranking: 2, title: 'The Godfather Part II', url: 'http://www.omdb.org/movie/240', rating: "8.14", year: ''});
    movieList.push({ranking: 3, title: 'The Silence of the Lambs', url: 'http://www.omdb.org/movie/274', rating: "8.07", year: ''});
    movieList.push({ranking: 4, title: 'Pulp Fiction', url: 'http://www.omdb.org/movie/680', rating: "8.06", year: ''});
    movieList.push({ranking: 5, title: 'Shawshank Redemption', url: 'http://www.omdb.org/movie/278', rating: "8.06", year: ''});
    movieList.push({ranking: 6, title: 'The Deer Hunter', url: 'http://www.omdb.org/movie/11778', rating: "8.06", year: ''});
    movieList.push({ranking: 7, title: 'Gladiator', url: 'http://www.omdb.org/movie/98', rating: "8.05", year: ''});
    movieList.push({ranking: 8, title: 'Titanic', url: 'http://www.omdb.org/movie/597', rating: "8.04", year: ''});
    movieList.push({ranking: 9, title: 'Se7en', url: 'http://www.omdb.org/movie/807', rating: "8.04", year: ''});
    movieList.push({ranking: 10, title: 'Fight Club', url: 'http://www.omdb.org/movie/550', rating: "8.04", year: ''});
    
    return movieList;
}

/* Render */

function renderContent(movieList) {
    $('table tbody tr').remove();    
    
    renderMovieList(movieList);
            
    $('#show-only-unchecked-movies').click(function() {
        updateTable();
    });
    
    $('#loading').hide();
    $('table').show('fast');
    
    updateApp();
}

function renderMovieList(movieList) {
    for (var i in movieList) {
        ranking = movieList[i]['ranking'];
        rating = movieList[i]['rating'];
        title = movieList[i]['title'];
        id = stringToSlug(title);
        url = movieList[i]['url'];
        year = movieList[i]['year'];
                    
        isWatched = getMovieStatus(id);
        checked = (isWatched) ? 'checked="checked"' : '';
        markedClass = (isWatched) ? ' marked' : '';
        
        rowHtml = '<td><input type="checkbox" name="' + id + '" ' + checked + ' onchange="saveMovie(this, \'' + id + '\')" /></td>' + 
                  '<td class="position">' + ranking + '.</td>' + 
                  '<td class="title"><a href="' + url + '" target="blank">' + title + '</a></td>' + 
                  '<td class="year">' + year + '</td>' + 
                  '<td class="rating">' + rating + '</td>' + 
                  '</tr>';
        
        
        
        $('<tr class="' + markedClass + '"/>').html(rowHtml).appendTo('#movie-list');
    }
}

function stringToSlug(str) {
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();
  
    // remove accents, swap ñ for n, etc
    var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
    var to   = "aaaaeeeeiiiioooouuuunc------";
    for (var i=0, l=from.length; i<l ; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 \n-]/g, '') // remove invalid chars
             .replace(/\s+/g, '-') // collapse whitespace and replace by -
             .replace(/-+/g, '-'); // collapse dashes

  return str;
}

function getMovieStatus(movieId) {
    return (localStorage["best-movies-watchlist." + id] == "true") ? true : false;
}

function setMovieStatus(movieId, status) {
    localStorage["best-movies-watchlist." + movieId] = status;
}

function updateApp() {
    updateTable();
    updateTotal();
    updateSuggestions();
    updateActiveSource();
}

function updateTable() {
    if ($('#show-only-unchecked-movies').attr('checked') == true) {
        $('table tr.marked').hide();
    } else {
        $('table tr').show();
    }
    
    paintTable();
}

function paintTable() {
    $('table tbody tr:visible:even').addClass('even').removeClass('odd');
    $('table tbody tr:visible:odd').addClass('odd').removeClass('even');
}

/* Totals */

function updateTotal() {
    var totalMovies = getTotalOfMovies()
    var totalWatched = $('table tr.marked').size();
    var totalPercentage = Math.round((totalWatched * 100) / totalMovies) + '%';
    $('#total-watched').html(totalWatched);
    $('#total').html(totalMovies);
    $('#total-percentage').html(totalPercentage);
}

function getTotalOfMovies() {
    return $('tbody tr').size();
}

/* Suggestions */

function updateSuggestions() {
    var movieSuggestions = getSuggestions();
    var htmlSuggestions = '';
    if (movieSuggestions) {
        for (var i = 0; i < movieSuggestions.length; i++) {
            if (movieSuggestions[i]) {
                htmlSuggestions += '<li>' + 
                                   '<a href="' + movieSuggestions[i]['url'] + '" target="blank">' + 
                                   movieSuggestions[i]['title'] + 
                                   '</a>' + 
                                   '</li>';
            }
        }
        $('#suggestions').html(htmlSuggestions);
    }
}

function getSuggestions() {
    var averageYear = getAverageYear();
    var unwatchedMovies = $('tbody tr:not(.marked)');
    
    var unwatchedMoviesArray = new Array();
    $(unwatchedMovies).each(function() {
        movieYear = parseInt($(this).find('.year').text());
        moviePosition = parseInt($(this).find('.position').text());
        movieTitle = $(this).find('.title a').text();
        movieUrl = $(this).find('.title a').attr('href');
        
        movieSuggestion = new Array();
        movieSuggestion['year'] = movieYear;
        movieSuggestion['position'] = moviePosition;
        movieSuggestion['title'] = movieTitle;
        movieSuggestion['url'] = movieUrl;
        movieSuggestion['interest'] = (averageYear) ? moviePosition + (Math.abs(movieYear - averageYear) * 2) : moviePosition;
        
        unwatchedMoviesArray.push(movieSuggestion);
    });
    
    function sortByInterest(a, b) {
        return a['interest'] - b['interest'];
    }
    unwatchedMoviesArray.sort(sortByInterest);
    
    var movieSuggestions = new Array();
    for (var i=0; i < 5; i++) {
        movieSuggestions.push(unwatchedMoviesArray[i]);
    }
    
    return movieSuggestions;
}

function getAverageYear() {
    watchedMovies = $('tr.marked');
    totalWatchedMovies = $(watchedMovies).size();
    var totalYear = 0;
    $(watchedMovies).each(function() {
        totalYear += parseInt($(this).find('.year').text());
    });
    
    return Math.round(totalYear / totalWatchedMovies);
}

/* Sources */

function updateActiveSource() {
    source = getSource();
    
    $('#source').val(source);
    
    $('#list-source').attr('href', source);
    $('#list-source').text(source);
}

function setSource(source) {
    localStorage['best-movies-watchlist.source'] = source;
}

/* Loading */

function showLoading() {
    $('#loading').show();
    $('table').hide();
    $('#error').hide();
}

function sanitizeUrl(url) {
    url.replace(':', '%3A');
    url.replace('/', '%2F');
    
    return url;
}

function showInitError() {
    $('#loading').hide();
    $('#error').show();
}

/* Sources */
function renderSourcesOptions() {
    for (var i in sources) {
        $('#source').append('<option value="' + sources[i]['value'] + '">' + sources[i]['name'] + '</option>');
    }
    
    $('#source').val(getSource());
    
    $('#source').change(function() {
        loadData($(this).val());
    })
}

/* User Actions */

function saveMovie(checkbox, id) {
    setMovieStatus(id, checkbox.checked);
    if (checkbox.checked) {
        $(checkbox).parent().parent().addClass("marked");
    } else {
        $(checkbox).parent().parent().removeClass("marked");
    }
    
    updateApp();
}

function reset() {
    if (!confirm('Are you sure you want to reset the application? All your data will be lost...')) {
        return false;
    }
    
    localStorage.clear();
    $('table input:checked').attr('checked', false);
    $('table tr').removeClass('marked');
    
    updateApp();
}
