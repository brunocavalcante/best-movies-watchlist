$(document).ready(function() {
    $('table').hide();
    $('#aside').hide();
    $('#error').hide();
    
    var movieList = new Array();
    
    // Fetching Data from http://www.omdb.org/movie/top
    /*var url = "http://www.omdb.org/movie/top";
    var sanitizedUrl = sanitizeUrl(url);
    $.getJSON("http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fwww.omdb.org%2Fmovie%2Ftop%22%20and%20xpath%3D'%2F%2Ftable%5B%40id%3D%22filmography%22%5D%2F%2Ftr'&format=json&diagnostics=true&callback=?", function(data){
        if (!data.query) {
            showInitError();
        } else {
            var i = 0;
            $.each(data.query.results.tr, function(i,item){
                if (item.td) {
                    movie = new Array();
                    movie['ranking'] = ++i + '.';
                    movie['rating'] = item.td[2];
                    movie['title'] = item.td[1].a.content;
                    movie['id'] = item.td[1].a.href.replace('/movie/', '');
                    movie['url'] = "http://www.omdb.org/movie/" + movie['id'];
                    movie['year'] = '';
                    
                    movieList.push(movie)
                }
            });
            
            renderContent(movieList);
        } 
    });*/
    
    // Fetching Data from http://www.took.nl/250/compare/full
    var url = "http://www.took.nl/250/compare/full";
    var sanitizedUrl = sanitizeUrl(url);
    $.getJSON("http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22" + sanitizedUrl + "%22%20and%20xpath%3D'%2F%2Ftable%5B%40class%3D%22list-data%22%5D%2F%2Ftr'&format=json&diagnostics=true&callback=?", function(data){
        if (!data.query) {
            showInitError();
        } else {
            $.each(data.query.results.tr, function(i,item){
                if (item.td) {
                    movie = new Array();
                    movie['ranking'] = item.td[0].strong;
                    movie['rating'] = item.td[1];
                    movie['title'] = item.td[3].span.a.content;
                    movie['id'] = item.td[3].span.a.href.replace('/250/title/', '');
                    movie['url'] = "http://www.imdb.com/title/" + movie['id'];
                    movie['year'] = item.td[3].span.span.a.content;
                    
                    movieList.push(movie)
                }
            });
            
            renderContent(movieList);
        }
    });
    
    $('#list-source').attr('href', url);
    $('#list-source').text(url);
});

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
        id = movieList[i]['id'];
        url = movieList[i]['url'];
        year = movieList[i]['year'];
                    
        isWatched = (localStorage["imdbtop250." + id] == "true") ? true : false
        checked = (isWatched) ? 'checked="checked"' : '';
        markedClass = (isWatched) ? ' marked' : '';
        
        $('<tr class="' + markedClass + '"/>').html('<td><input type="checkbox" name="' + id + '" ' + checked + ' onchange="saveMovie(this, \'' + id + '\')" /></td><td class="position">' + ranking + '</td><td class="title"><a href="' + url + '" target="blank">' + title + '</a></td><td class="year">' + year + '</td></tr>').appendTo('#movie-list');
    }
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
    localStorage["imdbtop250." + id] = checkbox.checked;
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