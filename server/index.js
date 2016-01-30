const express = require('express');
const serverStatus = require('express-server-status');
const favicon = require('serve-favicon');
const request = require('request');
const morgan = require('morgan');
const path = require('path');
const _ = require('lodash');
const robots = require('robots.txt')
const config = require('config');

const apiUrl = url => {
  const withoutParams = config.apiUrl + (url.replace('/api/', ''));
  const hasParams = _.contains(url, '?');

  return withoutParams + (hasParams ? '&' : '?') + `api_key=${config.apiKey}`;
};

/**
 * Express app
 */
const app = express();

/**
 * Server status
 */
app.use('/status', serverStatus(app));

/**
 * Favicon
 */
app.use(favicon(__dirname + '/../static/images/favicon.ico.png'));

/**
 * Log
 */
app.use(morgan('dev'));

/**
 * Static folder
 */
app.use('/static', express.static(path.join(__dirname, '../static')));

/**
 * GET /robots.txt
 */
app.use(robots(path.join(__dirname, '../static/robots.txt')));

/**
 * Pipe the requests before the middlewares, the piping will only work with raw
 * data
 * More infos: https://github.com/request/request/issues/1664#issuecomment-117721025
 */

app.all('/api/*', (req, res) => {
  req
    .pipe(request(apiUrl(req.url)))
    .pipe(res);
});

/**
 * Ejs template engine
 */
app.set('views', __dirname + '/views');
app.set('view cache', config.viewCache);
app.set('view engine', 'ejs');

/**
 * Serve the SPA
 */

app.get(/^\/app(\/.*)?$/, (req, res) => {

  const meta = {
    url: 'https://opencollective.com',
    title: 'OpenCollective - create and fund your collective transparently',
    description: 'OpenCollective lets you crowdfund your association and manage its budget transparently',
    image: '/static/images/LogoLargeTransparent.png',
    twitter: '@OpenCollect',
  };
  const options = { showGA: false };

  return res.render('index', { meta, options });
});

/**
 * Server public page
 */

app.get('/:slug([A-Za-z0-9-]+)', (req, res, next) => {
  const options = {
    showGA: process.env.NODE_ENV === 'production'
  };

  request
    .get({
      url: apiUrl(`groups/${req.params.slug}/`),
      json: true
    }, (err, response, group) => {
      if (err) return next(err);
      if (response.statusCode !== 200) {
        return next(response.body.error);
      }

      const meta = {
        url: group.publicUrl,
        title: 'Join ' + group.name + '\'s open collective',
        description: group.name + ' is collecting funds to continue their activities. Chip in!',
        image: group.image || group.logo,
        twitter: '@'+group.twitterHandle,
      };

      res.render('index', { meta, options });
    });
});

/**
 * 404 route
 */

app.use((req, res, next) => {
  return next({
    code: 404,
    message: 'We can\'t find that page.'
  });
});

/**
 * Error handling
 */

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  res.render('error', {
    message: 'Error ' + err.code + ': ' + err.message,
    options: {
      showGA: process.env.NODE_ENV === 'production'
    }
  });
});

/**
 * Port config
 */

app.set('port', process.env.PORT || 3000);

if (!_.contains(['test', 'circleci'], app.set('env'))) {
  /**
   * Start server
   */
  app.listen(app.get('port'), () => {
    console.log('Express server listening on port ' + app.get('port'));
  });

}

module.exports = app;
