tooknl = new Array();
tooknl['name'] = 'took.nl';
tooknl['url'] = 'http://www.took.nl/250/compare/full';
sources.push(tooknl);

function loadDataFromTookNl() {
    var movieList = new Array();
    
    // Fetching Data from http://www.took.nl/250/compare/full
    var url = "http://www.took.nl/250/compare/full";
    var sanitizedUrl = sanitizeUrl(url);
    $.getJSON("http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22" + sanitizedUrl + "%22%20and%20xpath%3D'%2F%2Ftable%5B%40class%3D%22list-data%22%5D%2F%2Ftr'&format=json&diagnostics=true&callback=?", function(data){
        if (!data.query || !data.query.results || !data.query.results.tr) {
            showInitError();
        } else {
            $.each(data.query.results.tr, function(i,item){
                if (item.td) {
                    movie = {
                        ranking: ++i, 
                        title: item.td[3].span.a.content, 
                        url: "http://www.imdb.com/title/" + item.td[3].span.a.href.replace('/250/title/', ''), 
                        rating: item.td[1],
                        year: item.td[3].span.span.a.content
                    }
                    
                    movieList.push(movie)
                }
            });
        }
    });
    
    return movieList;
}