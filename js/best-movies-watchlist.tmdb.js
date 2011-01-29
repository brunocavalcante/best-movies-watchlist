sources.push({name: 'TMDB', value: 'www.tmdb.org'});

function loadDataFromTmdb() {
    var movieList = new Array();
    
    $.getJSON("http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D%22http%3A%2F%2Fapi.themoviedb.org%2F2.1%2FMovie.browse%2Fen-US%2Fxml%2Fbbec116f896807e3b8c75f070d90e835%3Forder_by%3Drating%26order%3Ddesc%26min_votes%3D50%26page%3D1%26per_page%3D100%22&format=json&diagnostics=true&callback=?", function(data){
        if (!data.query || !data.query.results) {
            showInitError();
        } else {
            $.each(data.query.results.OpenSearchDescription.movies.movie, function(i,item){
                if (item) {
                    var movie = {
                        ranking: ++i, 
                        title: item.name, 
                        url: item.url, 
                        rating: item.rating,
                        year: item.released.substring(0, 4)
                    }

                    movieList.push(movie)
                }
            });

            setMovieList(movieList);
            setSource('www.tmdb.org');
            renderContent(movieList);
        } 
    });
}