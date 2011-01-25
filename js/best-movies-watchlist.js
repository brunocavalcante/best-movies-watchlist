var sources = new Array();

$(document).ready(function() {
    var sourceUrl = getSource();
    loadData(sourceUrl);
    loadSourcesOptions();
});

function loadData(url) {
    showLoading();
    
    $('table tbody tr').remove();
    
    switch (url) {
        case "http://www.omdb.org/movie/top":
            loadDataFromOmdb();
            break;
        case "http://www.took.nl/250/compare/full":
            loadDataFromTookNl();
            break;
    }
    
    $('#list-source').attr('href', url);
    $('#list-source').text(url);
    
    setSource(url);
}

function showLoading() {
    $('#loading').show();
    $('table').hide();
    $('#aside').hide();
    $('#error').hide();
}

function loadSourcesOptions() {
    for (var i in sources) {
        $('#source').append('<option value="' + sources[i]['url'] + '">' + sources[i]['name'] + '</option>');
    }
    
    var selectedSource = getSource();
    $('#source').val(selectedSource);
    
    $('#source').change(function() {
        loadData($(this).val()); 
    });
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

function renderContent(movieList) {
    renderMovieList(movieList);
            
    $('#show-only-unchecked-movies').click(function() {
        updateTable();
    });
    
    $('#loading').hide();
    $('#aside').show('fast');
    $('table').show('fast');
    
    updateApp();
}

function updateApp() {
    updateTable();
    updateTotal();
    updateSuggestions();
}

function updateTable() {
    if ($('#show-only-unchecked-movies').attr('checked') == true) {
        $('table tr.marked').hide();
    } else {
        $('table tr').show();
    }
    
    paintTable();
}

function renderMovieList(movieList) {
    for (var i in movieList) {
        ranking = movieList[i]['ranking'];
        rating = movieList[i]['rating'];
        title = movieList[i]['title'];
        //id = movieList[i]['id'];
        id = stringToSlug(title);
        url = movieList[i]['url'];
        year = movieList[i]['year'];
                    
        isWatched = getMovieStatus(id); //(localStorage["best-movies-watchlist." + id] == "true") ? true : false
        checked = (isWatched) ? 'checked="checked"' : '';
        markedClass = (isWatched) ? ' marked' : '';
        
        $('<tr class="' + markedClass + '"/>').html('<td><input type="checkbox" name="' + id + '" ' + checked + ' onchange="saveMovie(this, \'' + id + '\')" /></td><td class="position">' + ranking + '</td><td class="title"><a href="' + url + '" target="blank">' + title + '</a></td><td class="year">' + year + '</td></tr>').appendTo('#movie-list');
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

function updateSuggestions() {
    var movieSuggestions = getSuggestions();
    var htmlSuggestions = '';
    for (var i = 0; i < movieSuggestions.length; i++) {
        htmlSuggestions += '<li><a href="' + movieSuggestions[i]['url'] + '" target="blank">' + movieSuggestions[i]['title'] + '</a></li>';
    }
    $('#suggestions').html(htmlSuggestions);
}

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

function saveMovie(checkbox, id) {
    setMovieStatus(id, checkbox.checked); //localStorage["best-movies-watchlist." + id] = checkbox.checked;
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

function paintTable() {
    $('table tbody tr:visible:even').addClass('even').removeClass('odd');
    $('table tbody tr:visible:odd').addClass('odd').removeClass('even');
}

// LocalStorage Accessors
function getSource() {
    return (localStorage["best-movies-watchlist.source"]) ? 
                localStorage["best-movies-watchlist.source"] : 
                "http://www.omdb.org/movie/top";
}

function setSource(url) {
    localStorage["best-movies-watchlist.source"] = url;
}

function getMovieStatus(movieId) {
    return (localStorage["best-movies-watchlist." + id] == "true") ? true : false;
}

function setMovieStatus(movieId, status) {
    localStorage["best-movies-watchlist." + movieId] = status;
}