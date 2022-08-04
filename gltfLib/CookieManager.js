class CookieManager {
  constructor() {}

  bakeCookie(name, value) {
    var cookie = [name, '=', JSON.stringify(value), ';secure; domain=.', window.location.host.toString(), '; max-age=31536000; path=/;'].join('');
    document.cookie = cookie;
  }

  readCookie(name) {
   var result = document.cookie.match(new RegExp(name + '=([^;]+)'));
   result && (result = JSON.parse(result[1]));
   return result;
  }

  deleteCookie(name) {
    document.cookie = [name, '=; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/; domain=.', window.location.host.toString()].join('');
  }
}

export {CookieManager}
