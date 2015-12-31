angular.module('havas.services', [])

.factory('encodeURIService', function() {
	return {
		encode: function(string) {
			console.log(string);
			return encodeURIComponent(string).replace(/\"/g, "%22").replace(/\ /g, "%20").replace(/[!'()]/g, escape);
		}
	};
})

.factory('dateService', function($filter) {
	var currentDate = function() {
		var d = new Date();
		var date = $filter('date')(d, 'yyyy-MM-dd');
		return date;
	};

	var oneYearAgoDate = function() {
		var d = new Date(new Date().setDate(new Date().getDate() - 365));
		var date = $filter('date')(d, 'yyyy-MM-dd');
		return date;
	};

	return {
		currentDate: currentDate,
		oneYearAgoDate: oneYearAgoDate
	};

})

.factory('stockDataService', function($q, $http, encodeURIService) {

	var getDetailedPriceData = function(ticker) {
		var deferred = $q.defer();
		query = 'select * from yahoo.finance.quotes where symbol in ("' + ticker + '")';

		var url = 'https://query.yahooapis.com/v1/public/yql?q=' + encodeURIService.encode(query) +'&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=';
		console.log(url);

	  	$http.get(url)
      	.success(function(jsondata) {
        	// console.log("quote:  " + ticker);
        	// console.log("URL:  " + url);
        	// console.log(jsondata);
        	var stockjsondata = jsondata.query.results.quote;
	        deferred.resolve(stockjsondata);
	    })
	    .error(function(error)
    	{
	      	console.log("stockDataService Error:  " + error);
    	  	deferred.reject();
      	});
	    return deferred.promise;
	};

	var getPriceData = function(ticker)
	{
		var deferred = $q.defer();
		var url_406_error = "http://finance.yahoo.com/webservice/v1/symbols/" + ticker + "/quote?format=json&view=detail";

		var url = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22" + ticker + "%22)&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=";


	  	$http.get(url)
      	.success(function(jsondata) {
        	// console.log("quote:  " + ticker);
        	// console.log("URL:  " + url);
        	// console.log(jsondata);
        	var stockjsondata = jsondata.query.results.quote;
	        deferred.resolve(stockjsondata);
	    })
	    .error(function(error)
    	{
	      	console.log("stockDataService Error:  " + error);
    	  	deferred.reject();
      	});
	    return deferred.promise;
	};

	return {
	 	getPriceData:  getPriceData,
	  	getDetailedPriceData: getDetailedPriceData
	};

})

.factory('chartDataService', function ($q, $http, encodeURIService) {
		var getHistoricalData = function(ticker, startDate, endDate) {
			//  select * from yahoo.finance.historicaldata where symbol = "YHOO" and startDate = "2009-09-11" and endDate = "2010-03-10"
			var deferred = $q.defer();
			var query =  'select * from yahoo.finance.historicaldata where symbol = "' + ticker + '" and startDate = "' + startDate + '" and endDate = "' + endDate + '"';
			var url = 'https://query.yahooapis.com/v1/public/yql?q=' + encodeURIService.encode(query) +'&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=';

			$http.get(url)
			.success(function(json) {
				var jsondata = json.query.results.quote;
				console.log(jsondata);
				var priceData = [];
				var volumeData = [];

				jsondata.forEach(function(dayDataObject) {
					var dateString = dayDataObject.Date;
					var dateInMillis = Date.parse(dateString);
					var price = parseFloat(Math.round(dayDataObject.Close * 100) / 100).toFixed(3);
					var volume = dayDataObject.Volume;

					var volumeDatum = '[' + dateInMillis + ',' + volume + ']';
					var priceDatum = '[' + dateInMillis + ',' + price + ']';

					priceData.unshift(priceDatum);
					volumeData.unshift(volumeDatum);
				});

				var formattedChartData =
				'[{' +
				'"key":' + '"Volume",' +
				'"bar":' + 'true, ' +
				'"values":' + '[' + volumeData + ']' +
				'}, {' +
				'"key":' + '"' + ticker + '",' +
				'"values":' + '[' + priceData + ']' +
				'}]';
				console.log(formattedChartData);
				deferred.resolve(formattedChartData);
			})
			.error(function(error)
			{
				console.log("Chart Data Error: " + error);
				deferred.reject();
			});
			return deferred.promise;
		};

		return {
			getHistoricalData: getHistoricalData
		};

});
