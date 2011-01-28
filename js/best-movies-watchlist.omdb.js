omdb = new Array();
omdb['name'] = 'omdb.org';
omdb['url'] = 'http://www.omdb.org/movie/top';
sources.push(omdb);

function loadDataFromOmdb() {
    var movieList = new Array();
    
    // Fetching Data from http://www.omdb.org/movie/top
    var url = "http://www.omdb.org/movie/top";
    var sanitizedUrl = sanitizeUrl(url);
    $.getJSON("http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22" + sanitizedUrl + "%22%20and%20xpath%3D'%2F%2Ftable%5B%40id%3D%22filmography%22%5D%2F%2Ftr'&format=json&diagnostics=true&callback=best-movies-watchlist-omdb", function(data){
        if (!data.query || data.query.results || data.query.results.tr) {
            showInitError();
        } else {
            var i = 0;
            $.each(data.query.results.tr, function(i,item){
                if (item.td) {
                    movie = {
                        ranking: ++i, 
                        title: item.td[1].a.content, 
                        url: "http://www.omdb.org" + item.td[1].a.href, 
                        rating: item.td[2],
                        year: ''
                    }
                    
                    movieList.push(movie)
                }
            });
        } 
    });
    
    return movieList;
}