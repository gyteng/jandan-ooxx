const rp = require('request-promise');
const cheerio = require('cheerio');
const knex = require('./db').knex;

let maxPage = null;
let minPage = 1;
let getMaxPageTime = null;
let getPictureFromJandanTime = null;
const newImages = [];
const insertDbStatus = [];

const getMaxPage = () => {
  if(maxPage && getMaxPageTime && Date.now() - getMaxPageTime < 10 * 60 * 1000) {
    return Promise.resolve(maxPage);
  }
  return rp({
    uri: 'https://jandan.net/ooxx',
    transform: body => {
      return cheerio.load(body);
    }
  }).then($ => {
    maxPage = +($('.current-comment-page')[0].children[0].data.slice(1, -1));
    getMaxPageTime = Date.now();
    console.log(`最大页数: ${ maxPage }`);
    return maxPage;
  });
};

const getPicture = (maxPage, minPage = 2000) => {
  const page = +Math.random().toString().substr(2) % (maxPage - minPage) + minPage;
  return rp({
    uri: 'https://jandan.net/ooxx/page-' + page,
    transform: body => {
      return cheerio.load(body);
    }
  }).then($ => {
    const length = $('#comments ol li').length;
    const randomNumber = +Math.random().toString().substr(2) % length;
    console.log(`从煎蛋获取图片[${ minPage } < page < ${ maxPage }][${page}, ${randomNumber}]`);
    return $(`#comments ol li`)[randomNumber].children[1].children[1].children[3].children[1].children[2].attribs.src;
  });
};

const filterPic = (url, maxPage, minPage) => {
  if(url.substr(-4).toLowerCase() === '.gif') {
    console.log(`过滤gif图: ${ url }`);
    return getPicture(maxPage, minPage)
    .then(url => {
      return filterPic(url);
    });
  }
  if(url.indexOf('sinaimg.cn/') < 0) {
    console.log(`过滤非sina图: ${ url }`);
    return getPicture(maxPage, minPage)
    .then(url => {
      return filterPic(url);
    });
  }
  return Promise.resolve(url);
};

const getPictureFromJandan = (limit) => {
  // if(insertDbStatus.length >= 100) {
  //   const successRate = insertDbStatus.filter(f => f === 0).length / insertDbStatus.length;
  //   console.log(`Rate: ${ successRate }`);
  //   if(successRate < 0.6) {
  //     minPage--;
  //   };
  // }
  if(limit && getPictureFromJandanTime && Date.now() - getPictureFromJandanTime < 1000) {
    return Promise.resolve();
  }
  getPictureFromJandanTime = Date.now();
  return getMaxPage()
  .then(() => {
    return getPicture(maxPage, minPage);
  }).then(url => {
    return filterPic(url, maxPage, minPage);
  }).then(url => {
    knex('images').insert({ url }).then(success => {
      if(newImages.length < 60) { newImages.push({
        id: success[0],
        url,
      }); }
      console.log(`添加图片[${ success[0] }][${ url }]`);
    }).catch(() => {
    });
    return url;
  });
};

const getPictureAndSave = () => {
  return knex('images').count('url AS count')
  .then(count => {
    getPictureFromJandan(true).then();
    if(newImages.length) {
      const image = newImages.splice(0, 1)[0];
      return image;
    }
    return knex('images').orderByRaw('RANDOM()').limit(1).where({
      status: 0,
    })
    .then(success => {
      return {
        id: success[0].id,
        url: success[0].url,
      };
    });
  });
};

setInterval(() => {
  knex('images').count('url AS count')
  .then(count => {
    if(count[0].count < 10000) {
      getPictureFromJandan(true).then();
    }
  });
}, 5 * 1000);

exports.getPicture = getPictureAndSave;
