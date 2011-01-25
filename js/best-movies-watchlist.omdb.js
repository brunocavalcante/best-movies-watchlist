function loadDataFromOmdb() {
    var movieList = new Array();
    
    // Fetching Data from http://www.omdb.org/movie/top
    var url = "http://www.omdb.org/movie/top";
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
    });
}