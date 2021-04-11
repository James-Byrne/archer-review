import EmberRouter from '@ember/routing/router';
import config from 'archer-review/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function() {
  this.route('about');
});
