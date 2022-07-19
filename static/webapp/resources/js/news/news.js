// A lot of this code is from the original feedToJson function that was included with this project
// The new code allows for multiple feeds to be used but a bunch of variables and such have literally been copied and pasted into this code and some help from here: http://jsfiddle.net/BDK46/
// The original version can be found here: http://airshp.com/2011/jquery-plugin-feed-to-json/
let news = {
    feed: config.news.params.url || null,
    newsLocation: '.news',
    newsItems: [],
    seenNewsItem: [],
    // _cors_proxy: "https://cors-anywhere.herokuapp.com/",
    _cacheBuster: Math.floor((new Date().getTime()) / 1200 / 1000),
    _failedAttempts: 0,
    fetchInterval: config.news.fetchInterval || 2880 * 1000,
    updateInterval: config.news.interval || 30000,
    fadeInterval: config.news.fadeInterval || 2000,
    intervalId: null,
    fetchNewsIntervalId: null,
}

/**
 * Creates the query string that will be used to grab a converted RSS feed into a JSON object via JuHe
 * @param  {string} feed The original location of the RSS feed
 * @return {string}      The new location of the RSS feed provided by JuHe
 */
news.buildQueryString = function (feed) {
    // return this._cors_proxy + encodeURIComponent(feed);
    return feed;
}

/**
 * Fetches the news for each feed provided in the config file
 */
news.fetchNews = function () {
    // Reset the news feed
    this.newsItems = [];
    this.feed.forEach(function (_curr) {
        let url = this.buildQueryString(_curr);
        this.fetchFeed(url);
    }.bind(this));

}

/**
 * Runs a GET request to juhe service
 */
news.fetchFeed = function (url) {
    $.ajax({
        type: 'get',
        async: false,
        url: url,
        success: function (res) {
            let data = JSON.parse(res)
            if (data && data.reason && data.reason.search("success") !== -1) {
                this.parseFeed(data.result.data);
            } else {
                console.error('No feed results because server response fail for: ' + data);
            }

        }.bind(this),
        error: function (e) {
            // non-specific error message that should be updated
            console.error('No feed results because error for:');
            console.log(e);
        }
    });

}

/**
 * Parses each item in a single news feed
 * @param  {Object} data The news feed that was returned by JuHe
 * @return {boolean}      Confirms that the feed was parsed correctly
 */
news.parseFeed = function (data) {

    let _rssItems = [];
    for (let i = 0, count = data.length; i < count; i++) {
        _rssItems.push(data[i].title);
    }
    this.newsItems = this.newsItems.concat(_rssItems);
    return true;

};

/**
 * Loops through each available and unseen news feed after it has been retrieved from Yahoo and shows it on the screen
 * When all news titles have been exhausted, the list resets and randomly chooses from the original set of items
 * @return {boolean} Confirms that there is a list of news items to loop through and that one has been shown on the screen
 */
news.showNews = function () {

    // If all items have been seen, swap seen to unseen
    if (this.newsItems.length === 0 && this.seenNewsItem.length !== 0) {
        if (this._failedAttempts === 5) {
            console.error('Failed to show a news story 5 times, stopping any attempts');
            return false;
        }
        this._failedAttempts++;
        setTimeout(function () {
            this.showNews();
        }.bind(this), 3000);

    } else if (this.newsItems.length === 0 && this.seenNewsItem.length !== 0) {
        this.newsItems = this.seenNewsItem.splice(0);
    }

    let _location = Math.floor(Math.random() * this.newsItems.length);

    let _item = news.newsItems.splice(_location, 1)[0];

    this.seenNewsItem.push(_item);
    $(this.newsLocation).updateWithText(_item, this.fadeInterval);
    return true;

};
news.init = function () {
    if (this.feed === null || (this.feed instanceof Array === false && typeof this.feed !== 'string')) {
        return false;
    } else if (typeof this.feed === 'string') {
        this.feed = [this.feed];
    }
    this.fetchNews();
    this.showNews();
    this.fetchNewsIntervalId = setInterval(function () {
        this.fetchNews()
    }.bind(this), this.fetchInterval)
    this.intervalId = setInterval(function () {
        this.showNews();
    }.bind(this), this.updateInterval);

};
