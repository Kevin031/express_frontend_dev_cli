/**
 * 配置要生成和压缩的页面
 * 如果页面全名是  xxx.html	  ,yyy.html
 * 则			   page:xxx   ,page:yyy
 * 后面的data是给page页面提供数据用的
 * data:{ title: 'index' }   在ejs模板里直接   <%= title %>
 */

module.exports = [
  { page: 'index', data: { title: 'Express' }}
]