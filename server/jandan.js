const rp = require('request-promise');
const cheerio = require('cheerio');
const knex = require('./db').knex;

let maxPage = null;
let minPage = 1;
let getMaxPageTime = null;
let getPictureFromJandanTime = null;
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
    return knex('images').where({ url }).then(success => {
      if(success.length) {
        return Promise.reject('url exists');
      }
      return url;
    });
  }).then(url => {
    const insert = { url };
    return knex('images').where({status: -1}).where('id', '>', 0).limit(1).then(success => {
      if(success.length) {
        insert.id = success[0].id;
        return knex('images').min('id AS min').then(success => {
          let id;
          if(success[0].min === 1) { id = -1; }
          else { id = success[0].min - 1; }
          console.log(`移动图片[${ insert.id } -> ${ id }]`);
          return knex('images').update({ id }).where({ id: insert.id});
        });
      }
      return;
    }).then(() => {
      return knex('images').insert(insert);
    }).then(success => {
      console.log(`添加图片[${ success[0] }]`);
      return;
    });
  });
};

const getPictureAndSave = () => {
  return knex('images').count('url AS count')
  .then(count => {
    getPictureFromJandan(true).then();
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
  knex('images').count('url AS count').where('status', '>=', 0)
  .then(count => {
    if(count[0].count < 55070) {
      getPictureFromJandan(true).then();
    }
  });
}, 5 * 1000);

exports.getPicture = getPictureAndSave;
