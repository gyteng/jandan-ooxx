const rp = require('request-promise');
const cheerio = require('cheerio');
const path = require('path');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

let visit = 0;
let maxPage = 2000;
const images = [];

const getMaxPage = () => {
  return rp({
    uri: 'https://jandan.net/ooxx',
    transform: body => {
      return cheerio.load(body);
    }
  }).then($ => {
    return +($('.current-comment-page')[0].children[0].data.slice(1, -1));
  });
};

const getRandomPicture = (maxPage) => {
  const page = maxPage - (+Math.random().toString().substr(2) % 300);
  return rp({
    uri: 'https://jandan.net/ooxx/page-' + page,
    transform: body => {
      return cheerio.load(body);
    }
  }).then($ => {
    const length = $('#comments ol li').length;
    const randomNumber = +Math.random().toString().substr(2) % length;
    return $(`#comments ol li`)[randomNumber].children[1].children[1].children[3].children[1].children[2].attribs.src;
  });
};

const filterGif = url => {
  if(url.substr(-4).toLowerCase() === '.gif') {
    return getRandomPicture(maxPage)
    .then(url => {
      return filterGif(url);
    });
  }
  return Promise.resolve(url);
};

const getPicture = () => {
  let retry = 0;
  const getPictureFromJandan = () => {
    return getMaxPage().then(success => {
      maxPage = success;
      return getRandomPicture(maxPage);
    }).then(url => {
      return filterGif(url);
    });
  };
  const pushImages = () => {
    if(images.length > 20) {
      return;
    }
    getPictureFromJandan().then(url => {
      images.push(url);
      pushImages();
    });
  };
  pushImages();
  if(images.length) {
    return Promise.resolve(images.pop());
  };
  return getPictureFromJandan().catch(err => {
    retry++;
    if(retry <= 5) {
      return getPictureFromJandan();
    }
    return Promise.reject(err);
  });
};

// getMaxPage().then(success => {
//   maxPage = success;
//   return getRandomPicture(maxPage);
// }).then(url => {
//   return filterGif(url);
// }).then(url => {
//   console.log(url);
// }).catch(console.log);

const express = require('express');
const app =  express();
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
app.set('views', path.resolve('./'));

app.get('*',
  (req, res, next) => {
    visit++;
    next();
  },
  (req, res) => {
    getPicture().then(url => {
      res.render('index', {
        url,
        visit
      });
    }).catch(err => {
      console.log(err);
      if (images.length) {
        return res.render('index', {
          url: images.pop(),
          visit
        });
      }
      res.send('error');
    });
  }
);

app.listen(56000, '0.0.0.0', function () {});
