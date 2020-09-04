const Koa = require("koa");
const send = require("koa-send");
const route = require("koa-route");
const koaBody = require("koa-body");
const cors = require("@koa/cors");
const app = new Koa();
const colors = require("colors");
const serve = require("koa-static");

const {
  getPlayers,
  addPlayer,
  updatePlayers,
  patchPlayers,
  delPlayer,
  getAvatarThemes,
  getAvatars,
  getSuggestions,
  getGrid,
  addGrid,
  updateGrid,
  postMessage,
  getMessages
} = require('./server/controller')
const events = require('./server/events.js')

app.use(cors());
app.use(koaBody());


// http://expressjs.com/en/starter/static-files.html
app.use(serve(__dirname + "/public"));


const handler = async (ctx, next) => {
  try {
    if (!ctx.is('json') && !ctx.accepts('text/event-stream') && !ctx.accepts('text/html')) {
      ctx.throw(406, 'Only Json-content POST or EventStream-accepting GET or Html-accepting GET')
    } 
    await next()
  } catch (err) {
    ctx.response.status = err.statusCode || err.status || 500
    ctx.response.message = err.message
    ctx.app.emit('error', err, ctx)
  }
}

app.use(handler)


app.use(route.get('/avatars', getAvatars))
app.use(route.get('/suggestions', getSuggestions))
app.use(route.get('/avatar-themes', getAvatarThemes))

app.use(route.get('/players', getPlayers))
app.use(route.post('/players', addPlayer))
app.use(route.put('/players', updatePlayers))
app.use(route.patch('/players', patchPlayers))
app.use(route.del('/players', delPlayer))

app.use(route.get('/grid', getGrid))
app.use(route.post('/grid', addGrid))
app.use(route.put('/grid', updateGrid))

app.use(route.get('/message', getMessages))
app.use(route.post('/message', postMessage))

app.use(route.get('/events', events.register))


app.on('error', function (err) {
  console.log('logging error ', err.message)
  console.log(err)
})

// this last middleware catches any request that isn't handled by
// koa-static or koa-router, ie your index.html in your example
app.use( async (ctx) => {
  await send(ctx, "app/index.html", {root: ''});
});


// listen for requests :)
var listener = app.listen(process.env.PORT || 9000, function() {
  const figuratives = [
    " patterns to be guessed ♟",
    " xylophones to chime 🎐",
    " mufflers to be tucked 🧣",
    " exactas to be nominated 🥉",
    " guesses to be interpreted 🧐"
  ];
  console.log(
    "Listening for ".blue.bold.underline +
      String(listener.address().port).bgBrightBlue.black.underline +
      figuratives[Math.floor(Math.random() * Math.floor(figuratives.length))]
        .blue.bold.underline
  );
});
